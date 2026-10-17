# Estudo de referências (REA) para a missão "O documento diz o quê?"

Projeto: Atlas Político (Next 16, React 19, TypeScript, canvas 2D isométrico sem motor, three.js 0.180, site estático, progresso em localStorage).
Data do estudo: 17/10/2026.
Método: só materiais públicos (sites oficiais, Steam, Wikipedia, README e código nos repositórios, API do GitHub, artigos). Nada aqui vem de experiência de jogo. Quando uma fonte não pôde ser aberta, está marcado.

> **Como o estudo foi usado.** Ele foi feito por um agente de IA, só de leitura, antes da implementação, e a "Decisão sugerida" do fim é a dele. O que entrou na missão e o que ficou de fora, com o motivo, está em [MISSAO-INVESTIGACAO.md](MISSAO-INVESTIGACAO.md), seção "De onde veio cada mecânica", e na decisão D-151 ([DECISIONS.md](DECISIONS.md)). Três sugestões não foram adotadas: "nenhum documento sustenta" como resposta (exigiria fichas sem lastro, e o projeto não escreve afirmação errada sobre pessoa real), as gavetas liberadas por contagem de fichas (o jogo não segura nada) e a validação em trios (a missão pede o erro explicado). O InkJS não foi adotado, pelo motivo da seção 6.

Fontes que não abriram neste estudo (bloqueio HTTP, não erro de URL):
- papersplease.fandom.com (Inspection_mode, Citation, Rulebook, Discrepancies): HTTP 402. Os trechos dessas páginas citados abaixo vieram de resumos de busca (WebSearch), não de leitura direta, e estão marcados como tal.
- pentiment.fandom.com, obradinn.fandom.com, ashorthike.fandom.com: HTTP 402.
- forums.tigsource.com (devlog do Papers, Please): HTTP 403.
- gamebanshee.com (entrevista do Josh Sawyer sobre mistérios): HTTP 403; trecho citado via resumo de busca.
- giantbomb.com (Papers, Please): HTTP 403; trecho citado via resumo de busca.
- GDC Vault (A Short Hike): só a descrição pública da palestra; o vídeo é restrito a membros.
- Transcrição de palestra GDC do Lucas Pope sobre Obra Dinn: não encontrada.

---

## 1. Papers, Please (prioridade alta: inspeção de documentos)

### 1. Mecânica observada e fontes
- Site oficial https://papersplea.se/ : não descreve mecânicas. Traz o texto de abertura "Congratulations. The October Labor Lottery is complete. Your name was pulled.", prêmios ("Best Mechanics 2013", "Excellence in Design" e "Excellence in Narrative" no IGF 2014, "Innovation Award" GDCA 2014) e um minijogo de navegador, "LCD, Please", descrito como "handheld inspector training tool".
- Steam https://store.steampowered.com/app/239030/Papers_Please/ : você é inspetor de imigração e usa os documentos e "sistemas primitivos do Ministério" (inspeção, busca, impressões digitais) para decidir "who can enter Arstotzka and who will be turned away or arrested". Tags "Multiple Endings" e "Choices Matter".
- Wikipedia https://en.wikipedia.org/wiki/Papers,_Please : o jogador confere os papéis contra as regras do dia; pode interrogar, exigir documentos, comparar impressões digitais, ordenar revista. Violação de protocolo gera multa por fax: "a citation will be issued via in-game fax to the player's booth shortly after the entrant leaves". "The player ultimately must stamp the entrant's passport to accept or deny entry." Pagamento por pessoa processada corretamente, orçamento diário, dívida leva a game over; vinte finais; modo infinito "limitado apenas pela contagem de erros".
- Wiki da comunidade (papersplease.fandom.com, lido só por resumo de busca): discrepância é "lack of compatibility or similarity between two or more in-game facts"; no modo de inspeção o jogador "pairs two items" (destaca dois itens) e, se houver discrepância, "other options are enabled (depending on the discrepancy, sometimes), such as interrogation"; as duas primeiras citações do dia são só advertência, "the next two citations will result in a penalty of five credits"; antes do dia 18 pode negar sem inspeção, a partir do dia 18 "a reason stamp is required"; "Protocol is checked based on whether there are any discrepancies at the moment the entrant leaves the inspection booth". Giant Bomb (resumo de busca): "click any two items to check for discrepancy" e "two warnings before there are consequences each day".
- Game Developer, "Designing the bleak genius of Papers, Please" https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i- : tensão entre processar "as many travelers as they can in one day" e só admitir quem está em ordem; novas regras chegam pelo boletim diário; Pope diz que, quando alguém fala com o jogador de manhã, "the bulletin is basically ignored"; a agenda do jogo é tão acoplada que "adding even one little encounter or rule would blow out all the scheduling for the rest of the game"; ele chama o cronograma de "training the player's focus".
- Kill Screen https://www.killscreen.com/peek-behind-scenes-papers-please-reveals-baggage-search-and-gun-fights/ : recursos cortados (inspeção de bagagem, UV nos selos, tiroteios, luz do supervisor). Sobre a luz: "People were clicking it like a button".
- Artigo acadêmico (resumo) https://www.universityxp.com/research/2021/6/4/discrepancy-detected-operationalizing-immigration-and-borderzone-policy-in-papers-please : cada migrante é "admitted, rejected, or detained" sob "ever-changing rules".

### 2. Ação do jogador
Ler o boletim do dia, receber um viajante, arrastar e ler cada documento, abrir o livro de regras, entrar no modo de inspeção, clicar em dois itens (campo de um documento contra campo de outro, ou contra uma entrada do livro de regras, ou contra o balcão vazio quando falta documento), ver "discrepancy detected" ou não, interrogar, pedir documento, carimbar aprovado ou negado (com carimbo de motivo depois do dia 18), ou deter. Tudo contra o relógio do dia.

### 3. Estados e transições (reconstrução a partir das fontes)
- `Boletim` (regras do dia) -> `Aguardando` (chama próximo).
- `Aguardando` -> `Documentos na mesa` (viajante entrega papéis).
- `Documentos na mesa` -> `Inspeção` (jogador ativa o modo e marca item A).
- `Inspeção(A marcado)` -> `Inspeção(A, B marcados)` -> resultado: `Discrepância` ou `Sem discrepância` (volta a `Documentos na mesa`).
- `Discrepância` -> `Interrogatório` / `Pedir documento` / `Revista` / `Impressão digital` (opções liberadas conforme o tipo).
- `Documentos na mesa` ou `Discrepância` -> `Carimbo` (aprovar, negar com motivo, deter).
- `Carimbo` -> `Viajante sai` -> avaliação de protocolo no instante da saída -> `Citação` (fax: 1ª e 2ª do dia advertência, depois multa) ou `Pagamento`.
- `Fim do dia` -> `Orçamento` -> `Boletim` do dia seguinte (regras novas) ou `Game over` (dívida, prisão).

### 4. Feedback e recuperação após erro
O erro não é bloqueado na hora: o viajante vai embora e o fax chega "shortly after the entrant leaves", nomeando a regra violada. Duas advertências por dia sem custo, depois multa. Não há repetição do mesmo viajante; a recuperação é aprender a regra para o próximo. O modo de inspeção dá feedback imediato só sobre o par marcado ("discrepancy detected"), o que ensina sem entregar a resposta.

### 5. Adaptação para o Atlas
Copiar:
- O gesto de "marcar dois itens": no Atlas, o par é (trecho destacado da ficha) + (campo do documento). O resultado é "o campo sustenta" ou "o campo não bate". É exatamente a pergunta da missão.
- A citação como texto de erro que nomeia o campo: "A ficha diz 'em 2023'; o campo data do documento mostra 2021". Essa é a explicação pedida na missão.
- Balcão vazio = documento faltante: quando a ficha fala de algo que nenhum documento do dossiê sustenta, permitir que o jogador aponte "nenhum documento" como resposta válida (a ficha é falsa ou sem lastro). Isso vem do caso de "missing documents" do wiki.
- Livro de regras como referência consultável: um "manual do arquivo" do Escrivão com o significado de cada campo (data, instituição, cargo, objeto, ação), sempre aberto.
Descartar:
- Relógio, salário, orçamento, advertências com multa. O Atlas é exploração sem pressão (ver A Short Hike). Errar deve custar só uma releitura.
- Regras que mudam por dia e a agenda acoplada (Pope avisa que uma regra a mais estoura a programação).

### 6. Custo e compatibilidade
Baixo. É UI de seleção de dois alvos: um estado `selecionado: {ficha, trechoId} | {docId, campo}` e um comparador puro `sustenta(ficha, trecho, documento, campo): boolean`. Tudo em React e TS, sem motor. O canvas isométrico só precisa de um "balcão" onde o documento aberto vira uma camada DOM por cima (mais fácil de tornar acessível e selecionável do que desenhar texto no canvas).

---

## 2. Pentiment (diálogo, investigação, escolha com consequência)

### 1. Mecânica observada e fontes
- Site oficial https://pentiment.obsidian.net/ : "Conduct your own investigation to decide the fate of the community, but each decision will have lasting consequences"; "see the consequences of your choices play out over generations"; "Choose different academic and social backgrounds"; visual inspirado em "illuminated manuscripts and printed woodcuts"; o jogo usa "stylized fonts and writing effects that may be difficult for some readers" e oferece fonte de leitura fácil; "Gameplay doesn't require rapid button presses or timed inputs"; não há dublagem, o diálogo é texto; há "Instant Dialogue" e controle de velocidade.
- Wikipedia https://en.wikipedia.org/wiki/Pentiment_(video_game) : o jogador reúne provas e informações com os moradores e "deve acusar alguém, com base em quem acredita ser o culpado ou em quem mais merece punição"; IGN diz que nunca há tempo para seguir todas as pistas; Destructoid elogia a ausência de "golden route"; os antecedentes de Andreas mudam como os mistérios se resolvem; inspiração em Darklands; conclusões a partir de "rumor and innuendo".
- Entrevista TheGamer https://www.thegamer.com/interview-obsidian-josh-sawyer-pentiment/ : "I wouldn't say it's a detective game"; "There's not like a high burden of proof in this era."; "We want the player to ask themselves what they value."; "People will remember that you're the person who pinned the crime on a certain person."; "Each act of the game is a relatively tight period of time."; "On our side there's no canonical true killer."; "just because a dialogue option appears doesn't mean it's a good idea to pick it."
- GameBanshee (via resumo de busca, página bloqueada): havia um sistema de álibi em protótipo, removido porque "All it does is exclude [suspects], and we're not trying to find a singular suspect, we're trying to rule people in, not rule them out."

### 2. Ação do jogador
Conversar (árvores de diálogo, com opções condicionadas ao background escolhido), visitar lugares dentro de períodos limitados do dia, colher pistas e boatos, escolher quem acusar, viver as consequências em atos posteriores.

### 3. Estados e transições
- `Ato` -> `Período do dia` (tempo apertado, segundo Sawyer).
- `Período` -> `Visita a local/NPC` (consome o período) -> `Pista registrada` (sem gabarito).
- `Pistas` -> `Acusação` (escolha do jogador, sem validação de "certo").
- `Acusação` -> `Consequência` (punição do acusado; memória dos NPCs nos atos seguintes).
- `Background` (escolha inicial) altera opções de diálogo disponíveis em todos os estados.

### 4. Feedback e recuperação após erro
Não existe "erro" mecânico: o jogo não diz se você acertou ("no canonical true killer"). O feedback é social e tardio (NPCs lembram). Não há repetição.

### 5. Adaptação para o Atlas
Copiar:
- Estética de manuscrito para a sala de arquivo e para o dossiê: papel, carimbo, caligrafia do Escrivão. Com a lição de acessibilidade do próprio site: oferecer fonte legível e texto sem efeito.
- Diálogo sem dublagem, com "Instant Dialogue" (pular animação de texto) e opções que não são todas boas ideias (o Escrivão pode oferecer uma leitura apressada da ficha que leva a erro explicável).
- A ideia "rule people in" vira "rule documents in": o jogador não elimina documentos, ele encontra o que sustenta a ficha.
Descartar:
- Acusação sem gabarito e consequências de longo prazo. A missão do Atlas tem resposta verificável (o documento é real e o campo existe); ambiguidade aqui seria desinformação. Também descartar tempo limitado por período.

### 6. Custo e compatibilidade
Baixo para a estética (CSS, fontes, SVG de carimbos já existem no passaporte). O diálogo é um grafo pequeno em TS (ver seção The Intercept). Nada exige motor.

---

## 3. Return of the Obra Dinn (dedução validada em trios)

### 1. Mecânica observada e fontes
- Site oficial https://obradinn.com/ : "An Insurance Adventure with Minimal Colour"; você é "insurance investigator for the East India Company's London Office" e deve "find means to board the ship, and prepare an assessment of damages". Nada sobre regras.
- Wikipedia https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn : "effectively one large logic puzzle"; Memento Mortem é "a pocket watch that can be used on a corpse to hear the events that transpired in the seconds immediately before death"; o livro tem desenho de cada tripulante, lista da tripulação e planta do navio e "preenche automaticamente as informações básicas" ao confirmar uma morte; nomes deduzidos por eliminação; causa escolhida em catálogo, algumas mortes aceitam mais de uma solução; "to deter guesswork, correct fates are validated only in sets of three"; os últimos seis destinos validam em pares até 58 de 60; Pope usou planilhas para ligar personagens e destinos; dividiu a história em capítulos com dez eventos-gatilho; a seção Legacy diz que o mecanismo de exigir três respostas corretas antes de "travar" se tornou comum em jogos de dedução posteriores.
- Entrevistas (resumo de busca, Gamereactor/Gamasutra): Pope achou a estrutura da tripulação "extremely difficult", focou mais nas identidades do que nos meios de morte, cortou 80 para 60 tripulantes.
- Transcrição de GDC: não encontrada.

### 2. Ação do jogador
Explorar o navio, usar o relógio num cadáver, ver a cena congelada, abrir o livro, escolher nome, causa e autor de uma pessoa em menus, repetir; a cada três entradas corretas o livro "trava" aquelas três e avisa.

### 3. Estados e transições
- `Exploração` -> `Cadáver encontrado` -> `Memento Mortem` (áudio e cena congelada) -> `Entrada do livro aberta` (dados básicos preenchidos).
- `Entrada` -> `Nome escolhido` / `Causa escolhida` / `Autor escolhido` (campos editáveis, sem validação individual).
- Conjunto de entradas -> verificação silenciosa: quando existem 3 entradas completas e corretas não travadas -> `Travadas` (feedback positivo).
- Entradas erradas permanecem editáveis para sempre; perto do fim a validação passa a pares.

### 4. Feedback e recuperação após erro
Erro não é apontado. O jogador só sabe que acertou quando um trio trava; se nada trava, algo do trio está errado, sem dizer o quê. Recuperação é livre: editar qualquer campo a qualquer hora.

### 5. Adaptação para o Atlas
Copiar:
- Livro que "preenche o básico": ao abrir um documento na sala, o dossiê já registra data, instituição e cargo; o jogador só decide a relação ficha -> documento -> campo.
- Validação em lote como opção de dificuldade: no modo padrão o Atlas explica cada erro (missão pede isso); num "modo arquivista" opcional, validar fichas em trios, sem apontar qual errou. Vale só se houver ao menos 6 fichas.
- Catálogo fechado de "causas" vira catálogo fechado de campos (data, instituição, cargo, objeto, ação): escolha por menu, nunca texto livre.
Descartar:
- Silêncio total sobre erro: contradiz o requisito "erro explica o campo que não bate".
- Escala (60 pessoas): a missão é curta.

### 6. Custo e compatibilidade
Baixo. A verificação em trio é uma função sobre o array de respostas do dossiê. O "livro" é um componente React com estado salvo em localStorage (já é o padrão do projeto).

---

## 4. A Short Hike (prioridade alta: exploração compacta sem pressão)

### 1. Mecânica observada e fontes
- Steam https://store.steampowered.com/app/1055540/AShortHike/ : "Hike, climb, and soar through the peaceful mountainside landscapes of Hawk Peak Provincial Park"; "Explore the island any way you like"; "Hike at your own pace" e "there's no need to rush to the summit!"; "Chat with the other hikers you meet along your route."; tesouros escondidos ajudam a "reach new heights"; trilha sonora que "progresses dynamically as you explore the wilderness"; tag "Short"; lançamento 30/07/2019.
- Wikipedia https://en.wikipedia.org/wiki/A_Short_Hike : "Claire can collect Golden Feathers, which determine her stamina when running, climbing, or performing midair jumps."; penas também compradas com moedas; a rota estabelecida ao cume pede ao menos sete penas, mas dá para chegar com menos; paredes altas barram antes de certo número de penas; a barra recarrega com tempo ou na fonte termal; coletáveis "coins, sticks, and shells", pá e vara de pesca; NPCs pedem objetos perdidos, entregas e minijogos; feito em Unity por Adam Robinson-Yu quase sozinho; inspirações Breath of the Wild e Animal Crossing.
- GDC 2020, "Crafting A Tiny Open World: A Short Hike Postmortem" https://gdcvault.com/play/1026613/Independent-Games-Summit-Crafting-A (descrição pública): jogo pequeno em escopo e escala, feito em "4-month deadline", com foco em estilo visual, level design e escrita, e em "definir expectativas do jogador antes de ele começar". Resumos de terceiros da palestra (resultado de busca, podwise.ai) dizem que ele guia por "landmarks that spark curiosity" e usa "natural barriers to pace progression", com diálogo que busca conversa natural. Esses dois pontos não foram lidos na fonte primária.
- Devlog no itch https://adamgryu.itch.io/a-short-hike/devlog : só notas de versão (barco, idiomas, controles); nada de design das penas.

### 2. Ação do jogador
Andar, escalar enquanto a barra de penas dura, planar, conversar, coletar, trocar itens por penas, voltar a lugares antes inalcançáveis, chegar ao cume quando quiser.

### 3. Estados e transições
- `Explorando` -> `Escalando` (consome barra de penas) -> `Explorando` (barra recarrega com o tempo) ou `Queda` (sem punição além de posição).
- `Explorando` -> `Conversa com NPC` -> `Tarefa aberta` -> `Entrega` -> `Recompensa` (pena, item).
- `Coleta` (moeda, concha, pena) -> `Inventário` -> `Compra` -> `Barra maior` -> áreas antes bloqueadas por "barreira natural" ficam acessíveis.
- `Cume` é opcional e sem tempo.

### 4. Feedback e recuperação após erro
Não há erro: a barra acaba e a personagem desce; recarrega sozinha. Barreiras naturais sinalizam "ainda não" sem mensagem de falha.

### 5. Adaptação para o Atlas
Copiar:
- Sala de arquivo como espaço compacto com marcos visíveis (estantes, gavetas iluminadas, mesa do Escrivão) que puxam a curiosidade, sem seta obrigatória.
- Progressão por "barreira natural": gavetas de documentos mais difíceis só abrem depois de X fichas resolvidas, em vez de menu de níveis.
- Coleta sem pressão: documentos encontrados viram páginas do dossiê e carimbos no passaporte (o Atlas já tem passaporte e carimbos).
- NPCs opcionais: outros "arquivistas" com pedidos laterais (achar o documento de certa data) que rendem um carimbo extra.
Descartar:
- Verticalidade e física de voo, que não cabem no canvas 2D isométrico sem motor.
- Loja e moeda: desnecessário.

### 6. Custo e compatibilidade
Médio-baixo. A sala isométrica já existe como padrão no projeto; falta um mapa pequeno com pontos de interação (estantes) e um gate por contagem de fichas, tudo em TS. Sem física.

---

## 5. The Intercept, inkle (prioridade alta: diálogo e ramificação)

### 1. Mecânica observada e fontes
- README https://github.com/inkle/the-intercept : "A small demo game by inkle written in ink, and built with Unity"; Bletchley Park, 1942; feito em poucos dias para uma game jam; objetivo é mostrar como estruturar um projeto ink simples e usar o plugin de Unity. Estrutura: `Assets/Ink/TheIntercept.ink`, projeto Unity (`Assets`, `ProjectSettings`), Json.NET incluído (MIT).
- Script https://raw.githubusercontent.com/inkle/the-intercept/master/Assets/Ink/TheIntercept.ink (lido direto): knots como `start`, `missing_reel`, `harris_demands_component`, `claim_hooper_took_component`, `night_falls`, `make_your_peace`; stitches como `= waited`, `= try_the_door`; variáveis numéricas `forceful` e `evasive` e flags `teacup`, `gotcomponent`, `drugged`, `hooper_mentioned`, `losttemper`, `admitblackmail`, `notraitor`, `framedhooper`, `piecereturned`; constantes `NONE`, `STRAIGHT`, `CHESS`, `CROSSWORD`, `SHOE`, `BUCKET`; `VAR DEBUG = false` com atalhos de salto. Mecanismos: divert `-> start`; tunnel `-> missing_reel -> harris_demands_component` com retorno `->->`; só escolhas `*` (uma vez), aninhadas `* * [Yes]`; gathers `- (opts)`; texto condicional `{ teacup :I set the teacup down.|I wipe a hand across my forehead.}`; escolha condicionada `* { not drugged } [Lie]`; limiar `{ forceful > 2:I've cracked him a little.}`; contagem de visitas `{ not start.delay }`; funções `=== function raise(ref x)` chamadas como `~ raise(evasive)`; sem threads (`<-`); finais `live_on_the_run`, `ending_return_to_normal`, `go_to_where_component_is_hidden` dependem das flags.
- API de runtime (docs do ink) https://raw.githubusercontent.com/inkle/ink/master/Documentation/RunningYourInk.md : `new Story(json)`, `Continue()`, `canContinue`, `currentChoices`, `ChooseChoiceIndex(i)`, `state.ToJson()` / `state.LoadJson()`, `variablesState["x"]`, `ObserveVariable`, `BindExternalFunction`, `currentTags`, `TagsForContentAtPath`, `ChoosePathString("knot")`.
- Writing with Ink https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md : `*` uma vez, `+` reutilizável; gathers `-`; `VAR`; condições `{ not visit_paris }`; funções `=== function lerp(a, b, k) ===`.

### 2. Ação do jogador
Escolher falas num interrogatório; cada escolha ajusta `forceful`/`evasive` e liga flags; o texto reage a limiares e a visitas anteriores; o final sai das flags.

### 3. Estados e transições
- Estado = (knot atual, stitch, contadores de visita por knot, `forceful`, `evasive`, flags booleanas, constante escolhida).
- `Knot` -> texto -> `Escolhas disponíveis` (filtradas por condição e por "já escolhida") -> `Escolha` -> efeitos (`~ raise`, `~ flag = true`) -> divert ou tunnel -> `Knot` seguinte -> ... -> `END`.
- Tunnels funcionam como sub-rotinas com retorno; gathers reúnem ramos.

### 4. Feedback e recuperação após erro
Não há erro, só consequência: opções desaparecem (`*`), texto muda com limiares, finais diferentes. Não há repetição dentro da partida.

### 5. Adaptação para o Atlas
Copiar o modelo de dados, não a ferramenta: nós com id, texto, lista de escolhas com `condicao(estado)` e `efeito(estado)`, contador de visitas por nó, e "tunnel" como sub-grafo com retorno (útil para a explicação de erro: entra no nó "campo não bate", explica, volta ao nó do documento). O Escrivão precisa de: saudação, entrega de ficha, dica, explicação de erro por campo, parabéns. São poucos nós e condições simples (ficha resolvida, tentativas, documento aberto).
Descartar: Unity, plugin, formato .ink compilado.

### 6. Custo, licença, manutenção
- Último push: 2021-02-14 (API do GitHub). 26 commits, 241 stars. Criado em 2016-04-06.
- Licença do código: README diz MIT (copyright 2016 inkle Ltd); a API do GitHub não detecta licença (`license: null`), então o arquivo de licença não está no formato padrão. Licença dos recursos (arte, áudio do projeto Unity): não encontrada em separado; o README cobre o repositório sem distinguir.
- Dependências: Unity, plugin ink-unity, Json.NET (MIT).
- Veredito: só estudar (modelo de estado e ramificação). Nada a adotar diretamente num site Next estático.

---

## 6. InkJS

### 1. O que é e fontes
- README https://github.com/y-lohse/inkjs : port JavaScript do ink, "fully compatible with the original version", sem dependências, roda em navegador e Node. `npm install inkjs` ou CDN unpkg. `inkjs/dist/ink.js` é a versão maior e mais compatível com navegadores antigos. Quickstart: `new inkjs.Story(storyContent)`, `story.Continue()`, `story.currentChoices`. `variablesState` com Proxies ES2015 ou função `$`. `EvaluateFunction`. Compilador incluído: CLI `inkjs-compiler.js` (`npx inkjs`) e `new inkjs.Compiler(...).Compile()` via `inkjs/full`; diferenças em `docs/compiler-differences.md`. Tipos em `inkjs/types`; subcaminhos `inkjs/engine/Story`, `inkjs/compiler/Compiler`. Tabela de compatibilidade termina em inklecate 1.2.0 = inkjs 2.3.0 = JSON 21.
- package.json (raw): version 2.4.0, `main: dist/ink-full.js`, `types: ink.d.ts`, `exports` com `.` (import `./dist/ink.mjs`, default `./dist/ink.js`), `./full`, `./types`, `./engine/*`, `./compiler/*`; sem `dependencies`; devDeps typescript 5.4.4, rollup ^4.44.0, jest 29.7.0; license MIT.
- Tamanho: bundlephobia (API) para inkjs 2.4.0: 126.977 bytes minificado, 31.166 bytes gzip, 0 dependências, `hasJSModule: false`, `hasSideEffects: true`. unpkg (app.unpkg.com/inkjs@2.4.0/files/dist): ink.js 128 kB, ink.mjs 128 kB, ink-es2015.js 126 kB, ink-full.js 249 kB (com compilador), ink-full.mjs 248 kB.
- Manutenção: release v2.4.0 em 2026-02-17 (rollup atualizado por CVE, save/load no CLI player, "hide fallback choices after load"); último push 2026-09-01; 658 stars, 10 issues abertas; criado em 2016.

### 2. Ação do jogador / 3. Estados
Iguais ao ink: `Continue` até `canContinue` ser falso, mostrar `currentChoices`, `ChooseChoiceIndex`, repetir. Estado serializa com `state.ToJson()` (string) e volta com `LoadJson`, o que encaixa no localStorage do Atlas.

### 4. Feedback e recuperação
Nada próprio; é runtime.

### 5. Adaptação para o Atlas
Só faria sentido se houvesse muito texto ramificado escrito por alguém que não programa, usando a sintaxe .ink e o compilador num passo de build (o compilador não deve ir ao navegador: `ink-full` tem 249 kB). Para os diálogos curtos do Escrivão (saudação, ficha, erro por campo, parabéns), a API imperativa e o JSON compilado são peso sem ganho.

### 6. Custo, licença, veredito
- Compatível com Next 16/React 19/TS: sim (ESM `ink.mjs`, tipos inclusos, sem deps, só cliente). Custo: ~31 kB gzip no bundle do jogo mais um passo de compilação `.ink -> .json`. `hasSideEffects: true` atrapalha tree shaking.
- Licença do código: MIT. Recursos: não há arte no pacote.
- Veredito: estudar a API como referência de forma (Continue/escolhas/estado serializável); não adotar agora. Reavaliar se o roteiro passar de algumas dezenas de nós ou se outra pessoa for escrever diálogo.

---

## 7. Three.js (confirmação)

### Fontes
- README https://github.com/mrdoob/three.js : licença MIT; biblioteca "easy-to-use, lightweight, cross-browser, general-purpose"; builds com WebGL e WebGPU; recomenda `git clone --depth=1` (histórico ~2 GB). 116,5k stars.
- Releases (API): r186 em 2026-09-24, r185 em 2026-07-01, r184 em 2026-04-16, r183 em 2026-02-20. Em 2026 o ritmo observado é uma release a cada 2 a 3 meses (historicamente era mensal; o próprio projeto não publica um ciclo formal no README: não encontrado). O projeto está em 0.180 (r180), portanto seis releases atrás; sem urgência, mas vale ler o guia de migração antes de subir.
- Manual "How to dispose of Objects" https://threejs.org/manual/pages/how-to-dispose-of-objects.html : "It's important to highlight that these objects are not released automatically."; remover da cena não libera: "No, you have to explicitly dispose the geometry and material via dispose()."; buffers "are only deleted if you call BufferGeometry.dispose()"; "a shader program is only deleted if all related materials are disposed"; "The disposal of a material has no effect on textures."; texturas só com `Texture.dispose()`; render targets só com `WebGLRenderTarget.dispose()`; `ImageBitmap.close()` é responsabilidade do app; "Controls and renderers are an exception" e "can not be used after dispose() has been called"; use `renderer.info` para ver "how many textures, geometries and shader programs are internally stored"; quando chamar: "there is no definite recommendation for this", exemplo é a troca de nível percorrendo a cena antiga; descartar algo ainda em uso só custa "performance drop for a single frame".
- Fonte `src/renderers/WebGLRenderer.js` (raw, branch dev): `dispose()` tem JSDoc "Frees the GPU-related resources allocated by this instance." e remove os listeners `webglcontextlost`, `webglcontextrestored`, `webglcontextcreationerror`, depois chama `dispose()` de background, renderLists, renderStates, textures, properties, environments, objects, geometries, bindingStates, uniformsGroups, programCache e xr, e `animation.stop()`. `forceContextLoss()`: "Simulates a loss of the WebGL context.", exige extensão `WEBGL_lose_context`. `setAnimationLoop(callback)`: o JSDoc recomenda usar este método em vez de `requestAnimationFrame` manual; `null` para o loop. O handler de context lost faz `preventDefault()` e marca `_isContextLost`; o de restore reinicializa o contexto e restaura `shadowMap` e `info.autoReset`.

### Padrão recomendado para a Cidade do Voto (React 19)
No `useEffect` de montagem: criar renderer, `setAnimationLoop(fn)`; no cleanup: `setAnimationLoop(null)`, percorrer a cena com `traverse` descartando geometria, material e texturas do material, `renderer.dispose()`, e remover o canvas. Com Strict Mode do React 19 o efeito roda duas vezes em dev, então o cleanup precisa ser idempotente e o renderer recriado a cada montagem (não reutilizar após `dispose()`, conforme a FAQ). Em páginas estáticas de troca de rota, isso evita contexto WebGL vazando entre a cidade e a sala de arquivo (que é canvas 2D e não precisa de three).

### Veredito
Já adotado; só manter o padrão de dispose acima. Licença MIT para o código; three.js não traz arte.

---

## 8. BrowserQuest (Mozilla)

### 1. O que é e fontes
- README https://github.com/mozilla/BrowserQuest : "BrowserQuest is a HTML5/JavaScript multiplayer game experiment."; pastas `client`, `server`, `shared/js`, `tools/maps`, `bin`; código MPL 2.0, conteúdo CC-BY-SA 3.0; créditos a Franck e Guillaume Lecollinet (Little Workshop). O repositório está arquivado: "This repository was archived by the owner on Jan 19, 2024", descrição "DEPRECATED - A HTML5/JavaScript multiplayer game experiment".
- LICENSE (raw): "This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0." para o código; conteúdo e arte sob CC BY-SA 3.0, como item separado.
- API do GitHub: pushed_at 2023-07-14, criado 2011-09-30, archived true, 153 commits, 9,4k stars, licença não detectada (NOASSERTION, porque o arquivo mistura duas licenças).
- package.json: deps `underscore`, `log`, `bison`, `websocket`, `websocket-server`, `sanitizer`, `memcache`, todas com versão `>0` (sem pin). server/README: feito para Node 0.4.7. client/README: build com "RequireJS optimizer tool" via `bin/build.sh`, gera `client-build/`.
- `client/js/game.js` (raw): loop `tick()` com `requestAnimFrame(this.tick.bind(this))`, que por frame faz `this.updateCursorLogic(); this.updater.update(); this.renderer.renderFrame();`; `run()` usa `setInterval` de 100 ms só para esperar mapa e sprites carregarem; renderer criado com `new Renderer(this, canvas, background, foreground)` (três canvases: fundo estático, entidades, primeiro plano) e `renderStaticCanvases()` ao trocar de zona; sprites por lista de nomes e `new Sprite(name, 2|3)` conforme escala; animações `new Animation("idle_down", 4, 0, 16, 16)`; rede via `GameClient` com dispatcher, `sendHello`, handlers `onEntityMove`, `onSpawnCharacter`, `onChatMessage`.
- Sprites: `client/sprites/*.json`, exemplo `clotharmor.json`: `id`, `width: 32`, `height: 32`, `animations` com `{length, row}` por nome (`atk_right 5/0`, `walk_right 4/1`, `idle_right 2/2`, ..., `idle_down 2/8`), `offset {x: -8, y: -12}`.

### 2 e 3. Ação e estados
Cliente: `Carregando(mapa, sprites)` -> `Conectando` -> `Jogando(tick por frame: update -> render)`; entidades com animação por linha da spritesheet. Servidor autoritativo por WebSocket, mundos configuráveis, `/status` em JSON.

### 4. Feedback e erro
Não se aplica (ação/combate em tempo real).

### 5. Adaptação para o Atlas
Copiar duas ideias de implementação, não código: (a) separar canvases em camadas estáticas e dinâmicas para a sala de arquivo (fundo isométrico desenhado uma vez, só entidades redesenhadas por frame); (b) descrever animações em JSON `{nome: {length, row}}` com `offset`, caso o Escrivão ganhe sprites. O loop `rAF -> update -> render` é o que o projeto já faz.
Descartar: tudo de rede, RequireJS, Node 0.4, dependências sem pin.

### 6. Veredito
Está antigo (criado 2011, último push 2023, arquivado 2024, Node 0.4.7, deps `>0`). Só estudar. Licença: código MPL 2.0 (copyleft por arquivo, cuidado se copiar trechos), arte CC-BY-SA 3.0 (atribuição e share-alike; não usar a arte no Atlas, que tem identidade própria).

---

## 9. Phaser3 Simple RPG (pierpo)

### 1. O que é e fontes
- README https://github.com/pierpo/phaser3-simple-rpg : "exercício sem pretensões" em TypeScript e Phaser 3; o autor avisa que partes estão desatualizadas, que padrões que ele não conhecia melhorariam a legibilidade e que a versão do Phaser é antiga; pré-requisitos Node 10, yarn, Chrome 67 e Tiled para mapas; assets de ansimuz, pacote "Tiny RPG Forest" (OpenGameArt). Diálogo: não mencionado no README.
- API do GitHub: licença MIT (arquivo LICENSE), pushed_at 2022-12-10, criado 2018-06-09, 235 commits, 132 stars, não arquivado.
- package.json: `phaser 3.10.1`, `typescript 3.6.3`, `webpack 4.39.3`, `awesome-typescript-loader`, `jest 24`, scripts `start` (webpack-dev-server), `build` (`webpack -p`), `deploy` (gh-pages); sem campo `license` e sem `version`.
- `src/index.ts`: `type: Phaser.AUTO`, `width: 400`, `height: 250`, `zoom: 2.5`, física `arcade`, `pixelArt: true`, `scene: [Preloader, FirstLevel, SecondLevel, GameManager, HUD]`.
- `src/`: `constants`, `game-objects`, `geometry`, `scenes` (AbstractScene.ts, FirstLevel.ts, SecondLevel.ts, GameManager.ts, HUD.ts, Preloader.ts), `index.ts`, `index.html`.

### 2 e 3. Ação e estados
`Preloader` (carrega assets) -> `FirstLevel`/`SecondLevel` (herdam de `AbstractScene`, mapa Tiled) com `GameManager` e `HUD` como cenas paralelas. Transição de nível por cena.

### 4. Feedback e erro
Não se aplica.

### 5. Adaptação para o Atlas
A separação `AbstractScene` + níveis concretos + `HUD` como camada separada é um bom molde para a sala de arquivo em canvas puro: uma classe base de cena (load, update, draw, dispose), cenas concretas (sala, mesa do dossiê) e HUD em DOM/React por cima. Mapa em Tiled não é necessário: a sala é pequena e pode ser descrita em um array TS.
Descartar: Phaser (motor), webpack 4, TS 3.6.

### 6. Veredito
Antigo (Phaser 3.10.1 de 2018, último push 2022-12). Só estudar a organização de cenas. Licença do código: MIT. Licença dos assets (Tiny RPG Forest, ansimuz): não encontrada no repositório; teria de ser conferida na página do OpenGameArt antes de qualquer uso, e de todo modo não cabe no Atlas.

---

## Decisão sugerida

1. Núcleo da missão vem do Papers, Please: "marcar dois itens" (trecho destacado da ficha + campo do documento), com o resultado "sustenta" ou "não bate", e a "citação" convertida em explicação imediata que nomeia o campo e o valor divergente, com nova tentativa livre. Sem relógio, sem dinheiro, sem advertências.
2. Incluir "nenhum documento sustenta" como resposta válida (caso do balcão vazio), para fichas sem lastro.
3. Manual do arquivo sempre aberto (livro de regras) explicando os cinco campos.
4. Do Obra Dinn: o dossiê preenche sozinho os dados básicos do documento aberto; campos escolhidos por menu fechado; validação em trio só como modo opcional "arquivista", se houver 6 ou mais fichas.
5. Do A Short Hike: sala compacta com marcos visuais, gavetas que abrem por contagem de fichas resolvidas (barreira natural), coleta de documentos vira carimbo no passaporte, pedidos laterais opcionais de outros arquivistas.
6. Do Pentiment: estética de manuscrito com fonte legível opcional, diálogo em texto com "instant" e opções do Escrivão que nem sempre ajudam. Descartar acusação sem gabarito: a missão precisa de resposta verificável.
7. Diálogo: grafo pequeno em TypeScript (nó, texto, escolhas com condição e efeito, contador de visitas, sub-grafo com retorno no estilo tunnel), copiando o modelo de estado do The Intercept (contadores + flags).
8. InkJS não vale agora: ~31 kB gzip (127 kB min), `sideEffects: true`, compilador `.ink -> .json` em build, API imperativa (Continue/currentChoices/ChooseChoiceIndex) e estado como string JSON. É maduro (MIT, v2.4.0 fev/2026, push set/2026, sem deps), então fica como opção se o roteiro crescer ou se outra pessoa for escrever diálogo em .ink.
9. Three.js: manter 0.180, aplicar cleanup com `setAnimationLoop(null)`, dispose de geometria/material/textura e `renderer.dispose()` no unmount; renderer novo a cada montagem.
10. BrowserQuest e phaser3-simple-rpg: só estudar (camadas de canvas, JSON de animação, cena base + HUD). Nada de código nem arte deles entra no Atlas (MPL 2.0 e CC-BY-SA 3.0 no BrowserQuest; assets de terceiros sem licença declarada no RPG).
