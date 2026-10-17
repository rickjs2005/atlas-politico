# Praça do Mural: diagnóstico, direção, primeira e segunda sessões

Reformulação do Atlas Político como aventura de investigação, feita em 17 de outubro de 2026 a pedido do responsável pelo projeto, depois de ele dizer que o jogo continuava chato mesmo com a missão de investigação (D-151). A segunda sessão, a da Câmara, foi feita no mesmo dia, na fase seguinte, a pedido dele ("vamos para próxima fase"): está na seção 9, e a decisão em D-154. Este documento tem o diagnóstico com evidência, a crítica de game design, as três alternativas e a escolhida, os primeiros cinco minutos, a direção de arte, as regras de integridade, o que foi implementado, o que foi validado (e como, e com que limite) e as três próximas prioridades. A decisão está registrada em [DECISIONS.md](DECISIONS.md), D-153; as tarefas, em [TAREFAS.md](TAREFAS.md).

Durante a tarefa nada foi enviado (sem commit, sem push, sem deploy), como pedido. O commit e o envio à `main` vieram depois, em 17 de outubro de 2026, a pedido do responsável, em mensagem separada depois do relatório da segunda sessão; um push na `main` publica no endereço provisório (D-147), e a revisão humana dos textos da praça continua pendente.

## 1. Diagnóstico da versão atual

### Como foi medido

Produção (`https://atlas-politico.vercel.app/`, `robots.txt` com `Disallow: /`) e a saída estática local foram comparadas no mesmo commit, `1b192aa` (edição 0.4.0): não havia divergência entre o que está no ar e o que está na árvore no momento da medição. As medidas foram tiradas da saída estática servida por `scripts/preview.mjs`, em um Chromium sem interface controlado pelo Playwright, com um roteiro descartável (`.claude/tmp/medir-experiencia.mjs`, fora do repositório) que conta palavras até o primeiro botão de ação, mede a altura dos painéis em telas de celular (390×844) e cruza as opções de cada pergunta do jogo com a explicação que vem antes dela. O WebGL desse Chromium é por software (SwiftShader): **os quadros por segundo abaixo descrevem essa máquina sem placa, e não a experiência de quem joga.** Não houve medição com pessoas.

### O que foi encontrado

| Problema | Evidência | Efeito | Gravidade | Proposta | Como verificar |
| --- | --- | --- | --- | --- | --- |
| A entrada da Cidade do Voto exige leitura antes de agir | 195 palavras antes de "Entrar na cidade" em `/mundo/`; em `/jogo/`, 73 (computador) e 61 (celular), com o botão na primeira tela | Quem chega à cidade lê um regulamento antes de andar | Alta na cidade, baixa no jogo | Entrada de uma frase e um botão; a explicação do que é ficção e documento fica abaixo do botão, dobrada | Contar as palavras até o botão: na praça são 37 |
| O painel da missão traz tudo de uma vez | 412 palavras e 4,1 telas de celular em um painel só; a fase da trajetória, 314 palavras e 3,0 telas | Ler, rolar e clicar: a "investigação" é um formulário comprido | Alta | Espalhar a informação por lugares e pessoas; cada janela com uma função | Nenhuma janela da praça passa de uma função; a mais longa (nota fixada) cabe em duas telas de celular |
| As perguntas do jogo são de memória e têm pista lexical | Em 19 perguntas, as palavras da opção certa aparecem 60% na explicação que vem antes, contra 22% nas erradas; 6 de 19 opções certas estão 100% cobertas; 5 de 19 repetem um trecho literal de 25 caracteres | Dá para acertar sem entender, comparando palavras | Alta | Trocar a pergunta de múltipla escolha por uma resposta montada com os campos do documento, que só existe depois de achá-lo e lê-lo | `tests/praca.test.ts`: a nota só aceita documento que a pessoa levou do arquivo; o erro fala do documento escolhido, não do certo |
| Os prédios da cidade são genéricos e sem função própria | Um `BoxGeometry` para todos, três alturas e oito cores; cada prédio abre o mesmo painel com dois programas | Nada a descobrir andando: o cenário é um menu em 3D | Média | Lugares reconhecíveis com funções diferentes (ler, ouvir, ver recortes, abrir gavetas, pegar um papel, porta trancada) | Capturas em `docs/capturas/praca/`; cada lugar da praça tem um `data-janela` distinto |
| Jogo e cidade são experiências separadas | No menu, "Jogo" e "Cidade do Voto" são entradas independentes; o único elo é "Prefiro a comparação com os nomes" | A pessoa escolhe entre dois protótipos em vez de entrar em um lugar | Média | Uma praça onde o documento (atlas), a conversa (Escrivão) e a exploração (cidade) acontecem no mesmo espaço | A praça usa as decisões do atlas como gavetas, os acontecimentos como recortes e o Escrivão como morador |
| Nada diz o que fazer a seguir | A cidade mostra "Temas visitados: n de 7" e "Ande até a porta de um prédio"; o jogo mostra a fase e o número dela | Sem objetivo, a liberdade vira indecisão | Média | Um cartão "Pauta de agora" sempre à vista, que muda com cada avanço, e um lugar trancado à vista como próximo objetivo | `[data-objetivo]` muda cinco vezes na jornada de `tests/e2e/praca.spec.ts` |
| Com o WebGL por software a cidade anda devagar | ~7 quadros por segundo no Chromium sem interface; 7,1 s até a primeira porta | Só diz respeito a máquinas sem aceleração; não é medida de usuário | Baixa (não medida em aparelho real) | Manter sombras e antialias desligados onde o ponteiro é grosseiro ou há até quatro núcleos; medir em aparelho | Pendente de aparelho real (T-24) |

### As seis hipóteses da análise anterior

| Hipótese | Veredito | Por quê |
| --- | --- | --- |
| A entrada exige leitura demais | **Confirmada para a cidade, contestada para o jogo** | 195 palavras em `/mundo/`; em `/jogo/` o botão está na primeira tela com 61 a 73 palavras |
| Os painéis concentram texto demais | **Confirmada** | 412 palavras e 4,1 telas no painel da missão |
| As perguntas premiam memória e dão pista lexical | **Confirmada** | 60% contra 22% de cobertura; 5 trechos literais |
| O cenário é genérico e sem função | **Confirmada** | Uma geometria, oito cores, um painel igual atrás de cada porta |
| As experiências não se ligam | **Confirmada** | Duas entradas no menu, um elo só |
| O desempenho é o problema | **Não sustentada** | O único número é de WebGL por software em máquina sem placa; sem medida em aparelho real, não dá para afirmar nem negar. A chatice se explica sem ele |

### Perguntas de design, respondidas

- **O que a pessoa faz a cada minuto?** Na cidade: anda até uma porta, lê dois blocos de frases, marca uma de cinco opções, repete sete vezes. Na missão: lê uma conversa, abre seis documentos, arrasta três fichas, confere um campo. Em nenhum dos dois ela descobre algo que não estivesse no painel que acabou de abrir.
- **Qual é a fantasia?** Não havia. "Visitante de uma praça com prédios" e "aprendiz do Escrivão" são papéis sem verbo próprio.
- **Por que explorar?** Não havia motivo: toda porta abre o mesmo painel, e nenhum lugar guarda algo que outro precise.
- **O que muda no mundo?** Uma bandeira sobe e um carimbo aparece. Nenhuma pessoa reage, nenhum lugar abre.
- **Onde está a decisão?** No quiz, entre opções já escritas; na missão, entre três fichas e seis documentos, com a resposta inferível pelo texto. Não há decisão que dependa de ter ido a algum lugar.
- **Por que é chato?** Porque ler e clicar é tudo o que há, e o cenário não paga a viagem.

## 2. Três alternativas, e a escolhida

| | A. Praça do Mural | B. Balcão de Checagem | C. Dossiê de dedução |
| --- | --- | --- | --- |
| Fantasia | Repórter nova da rádio comunitária de uma cidade pequena; os moradores pregam perguntas no mural e ninguém responde | Atendente de um balcão de checagem: chegam afirmações, e cada uma recebe um carimbo com base nos documentos (à la Papers, Please) | Investigador com um livro de registros a preencher por dedução, cruzando documentos até fechar cada linha (à la Return of the Obra Dinn) |
| Verbos | Ouvir, procurar, conferir | Ler, comparar, carimbar | Ler, cruzar, deduzir |
| Onde a exploração entra | Essencial: a pergunta está no mural, o "onde" com a Zefa, o "como ler" com o Escrivão, as datas na banca, a chave num bilhete no chão | Nenhuma: tudo acontece no balcão | Pouca: um gabinete com estantes |
| Risco editorial | Baixo: a resposta é o documento, com os campos dele; nada julga | Alto: carimbar "verdadeiro" ou "falso" em afirmação sobre pessoa real é juízo; e um placar de acertos vira nota | Médio: a dedução pede afirmações a confirmar, e escrevê-las sem julgamento é difícil |
| Reaproveita | O motor da Cidade do Voto (movimento, câmera, joystick, proximidade), o grafo de conversa, os campos do documento, o conteúdo do atlas inteiro | Os campos do documento e o conteúdo | Os campos e o conteúdo |
| Celular | Joystick já existente; janelas curtas | Bom: uma tela só | Ruim: tabela grande |
| Custo | Médio: cena nova, cinco lugares, três moradores | Baixo | Alto |

**Escolhida: A, a Praça do Mural.** É a única em que a exploração tem função (a informação está espalhada por lugares e pessoas, e nenhum lugar sozinho resolve a pauta), a única com fantasia que dá verbo a quem joga, e a que menos arrisca a regra de não julgar: a resposta a uma pergunta é sempre um documento publicado e os campos dele. B foi rejeitada porque o carimbo é um veredito sobre afirmação a respeito de pessoa real, e o placar natural desse formato é uma nota. C foi rejeitada porque é, de novo, uma mesa de leitura, exatamente o que o responsável chamou de chato, e porque uma tabela de dedução não cabe no celular.

### Definições

- **Fantasia e papel.** Você é a pessoa nova da rádio comunitária. A praça tem um mural onde os moradores pregam o que querem saber sobre o que os políticos decidiram. Quem responde precisa pregar o documento junto: senão o Teodoro arranca.
- **Objetivo da primeira sessão.** Responder as duas pautas de hoje, uma sobre cada pessoa retratada, e ver a corrente da Câmara cair.
- **O laço, em uma frase.** Ler uma pergunta no mural, ouvir quem sabe onde procurar, abrir a gaveta certa no arquivo e levar cópias, montar a nota com os campos do documento e fixá-la no mural.
- **Três verbos.** *Ouvir* (Zefa, Teodoro, o Escrivão: cada um sabe uma coisa e nenhum sabe tudo), *procurar* (gavetas por pessoa e por ano, recortes por data, um bilhete no chão), *conferir* (a nota só é aceita se o documento, a data e o que ele registra baterem; o erro diz, por campo, o que o documento escolhido registra).
- **Progressão.** Pautas publicadas abrem lugares: as duas de hoje abrem a Câmara, que é a segunda sessão (seção 9). Cada sessão tem um item que abre um lugar: a chave do Senado abre as gavetas do Senado; a credencial de imprensa abre a mesa da Câmara. Marcas de conversa mudam o que as pessoas dizem.
- **Recompensas.** O mural muda à vista (uma nota com carimbo por pauta); a Zefa fala diferente; a corrente da Câmara cai e a porta acende; as cópias ficam no caderno. Nada soma, nada dá nota, nada premia preferência por candidato.
- **Motivo para explorar.** A pergunta não diz onde está a resposta. A Zefa diz com quem procurar; o Escrivão diz como se lê um documento e que perdeu a chave; o bilhete no chão diz com quem ela está; o Teodoro explica por que há dois votos parecidos na mesma gaveta (dois turnos).
- **Relação com a cidade, as trajetórias, a investigação e o atlas.** As gavetas do arquivo são as decisões publicadas do atlas, por pessoa, instituição e ano (24 gavetas, 32 documentos, todos os que a edição tem); os recortes da banca são os 39 acontecimentos; a nota fixada mostra os campos e as fontes do documento como o cartão do atlas mostra; a Câmara aponta para a comparação. A Cidade do Voto e as salas do jogo continuam no ar e no menu, intactas; a praça não depende delas, e a recomendação é que o conteúdo da cidade (os programas às cegas) vire um lugar da praça em uma sessão futura.

### O que não foi mantido só porque existia

Sem mundo aberto de raio 15 com sete prédios iguais; sem passaporte; sem escolher uma pessoa na entrada (as duas pautas estão no mural, uma por pessoa, com a mesma mecânica); sem quiz de múltipla escolha; sem painel que concentre a missão inteira. O motor 3D ficou porque já estava escrito e porque a praça precisa de um espaço com lugares; a biblioteca e o motor são os mesmos (três.js, canvas), sem troca.

## 3. Os primeiros cinco minutos

Metas do pedido: ação em 20 s, primeira descoberta em até 90 s, missão em cerca de 5 min, motivo para a próxima. Os tempos abaixo são de projeto (distâncias e velocidade da cena), não medidos com pessoas; o roteiro das capturas percorre o caminho inteiro.

| Quando | O que acontece | Elemento |
| --- | --- | --- |
| 0:00 | Entrada: 37 palavras e o botão "Entrar na praça". Quem já jogou vê "Continuar de onde parou" | Entrada curta |
| 0:05 | A praça: coreto, calçada de pedra portuguesa, cinco lugares com placa e tapete. O cartão "Pauta de agora" diz "Vá ao mural". O mural está a 17 unidades, 3 s de caminhada na velocidade da cena | Ação em 20 s |
| 0:20 | Mural: duas perguntas, uma por pessoa, assinadas por moradores inventados. Aceitar a primeira muda a pauta. Tentar montar a nota sem cópias diz que o arquivo é o sobrado azul | Situação de curiosidade |
| 0:50 | Padaria: a Zefa, que responde pão de queijo e não pergunta de papel, diz que cartório é com o Escrivão, data de jornal é com o Teodoro, e recado perdido no chão é com ela | Personagem com personalidade; primeira descoberta antes de 90 s |
| 1:30 | Arquivo: o Escrivão ensina os cinco campos (se a pessoa perguntar) e avisa que as gavetas do Senado estão trancadas. As gavetas vão por pessoa e por ano; a de 2023 do Planalto tem dois documentos; cada um se lê em cinco campos, e a cópia vai para o caderno | Informação achada explorando |
| 3:00 | Mural: montar a nota com três campos (documento, quando, o que registra), só com as cópias levadas. Escolher o decreto de janeiro recebe: "Esse documento registra decreto, em 2023, sobre Decreto nº 11.377... Releia a pergunta". Escolher a data errada recebe: "O campo Data dele diz 30 de agosto de 2023". A nota certa fixa no mural os campos, a mensagem de veto, os dois dispositivos vetados e as fontes | Desafio de relacionar evidências; erro com retorno útil |
| 3:40 | O mural ganha uma nota com carimbo; a pauta muda para "Volte ao mural e abra a próxima pergunta" | Conclusão que muda o mundo |
| 4:00 | O bilhete perto do coreto: "Zefa, me devolve a chave das gavetas do Senado". A Zefa, que agora fala diferente, entrega a chave. O Escrivão reconhece a chave; as gavetas do Senado abrem. A segunda pauta pede dois votos em segundo turno, de 2023 e de 2024, em duas gavetas; o Teodoro explica os dois turnos | Relação muda; segunda pauta com dois documentos |
| ~5:30 | A segunda nota fixada; a corrente da Câmara cai, a porta acende, a Lourdes aparece na escadaria, e o cartão diz "A Câmara abriu, e o mural amanheceu com perguntas novas". Dentro, a Lourdes anuncia a sessão da Câmara (seção 9) | Motivo para a próxima |

Os seis elementos pedidos: situação de curiosidade (mural cheio de perguntas, gavetas trancadas, papel no chão); personagem com personalidade (Zefa, e também Teodoro e o Escrivão, cada um com fala própria e validada); pelo menos três elementos interativos com funções diferentes (mural: aceitar e montar; padaria: conversa e item; banca: conversa e recortes por data; arquivo: gavetas e cópias; bilhete: pegar; Câmara: porta trancada que abre); informação que só se descobre explorando (o bilhete diz com quem está a chave; o Teodoro diz por que há dois votos parecidos); desafio de relacionar evidências (a nota montada com os campos; a segunda pauta compara dois documentos de gavetas diferentes); erro com retorno útil (por campo, só com o que o documento escolhido registra, sem entregar o certo); conclusão que muda o mundo ou a relação (nota no mural, fala da Zefa, corrente da Câmara). Nenhuma interação é múltipla escolha de resposta pronta, e nenhum lugar é atalho para o mesmo painel.

## 4. Apresentação

**Direção de arte: maquete de papel de uma praça brasileira.** Sombreamento chapado (`MeshToonMaterial`), formas simples, nada baixado além do código. Lugares reconhecíveis: coreto octogonal com telhado de telha; calçada de pedra portuguesa com as ondas da orla, desenhada em canvas e repetida; banca de jornal de chapa verde com revistas na frente; padaria colonial baixa, pêssego, com platibanda, molduras azuis e toldo listrado; sobrado azul-claro de dois andares com molduras brancas, que é o arquivo; Câmara neoclássica, creme, com quatro colunas, frontão, escadaria e uma corrente na porta; ipês amarelos e roxos; casario colorido ao fundo; bancos de madeira e postes com globo. Nenhuma cor de partido: sem vermelho e sem a dupla verde-amarelo.

**Diferenciação.** Quem joga é a repórter: fone amarelo no pescoço, gravador na mão, colete verde-petróleo, mochila laranja. Os moradores têm roupa e adereço próprios (Zefa de avental e lenço; Teodoro de boné e jornal; o Escrivão de chapéu, óculos e pasta). O cenário de fundo não tem placa nem tapete; os lugares interativos têm os dois, e a placa tem tamanho fixo na tela. A interface (cartão da pauta, caderno, botão de ação, janelas) é a do atlas: papel, tinta, serifa nos títulos.

**Caminhos funcionais.** A praça é um retângulo de 26 por 21 unidades com o coreto no meio; os cinco lugares ficam nas bordas, a 11 a 17 unidades de quem começa. A colisão é por eixo (desliza pela parede), contra as fachadas, o coreto, os bancos, os postes e os canteiros. A câmera é de três quartos, mais perto do que na cidade. Com `prefers-reduced-motion`, a câmera e o giro são imediatos, e os moradores e o bilhete param de balançar.

**Diálogos curtos e contexto em camadas.** Cada fala tem uma ou duas frases; a mais longa é a da Zefa (37 palavras). O contexto editorial vem em camadas: a pergunta do morador, os cinco campos do documento, o detalhe que a pauta pede (os dispositivos vetados; ou o objeto votado com a etapa e o resultado), e as fontes, dobradas. A entrada tem um resumo dobrado do que é ficção e do que é documento.

## 5. Integridade do conteúdo

- **Fato, ficção e regra ficam separados** no código (`src/lib/praca/tipos.ts`, cabeçalho) e na tela: a praça, os moradores, o bilhete e as perguntas são ficção, e cada janela diz "personagem fictício" ou "morador fictício"; os documentos são as decisões publicadas, sem reescrita; as regras só manipulam identificadores.
- **As perguntas só perguntam o que um documento responde.** `tests/praca.test.ts` confere que todo ano escrito em uma pergunta está no documento apontado ou nos que ela manda comparar, que a pergunta não cita nome, partido nem sigla, e que o documento está na gaveta da pessoa certa.
- **Sem consequência inventada.** A nota fixada mostra o que o registro tem: os cinco campos, a mensagem de veto e os dispositivos vetados do ato (`dispositivosAlvo`), ou o objeto, a etapa e o resultado da votação. Nada diz o que a decisão "causou".
- **Tratamento igual.** Uma pauta por pessoa, a mesma mecânica (três campos), o mesmo retorno de erro, a mesma nota. A primeira pauta é sobre um ato (veto parcial da Lei Complementar 200/2023); a segunda, sobre dois votos em segundo turno (PEC 45/2019 em 2023, contra; PEC 45/2023 em 2024, a favor). O número de documentos a comparar é dois nas duas.
- **Sem nota, sem placar, sem preferência.** O jogo conta tentativas e as escreve na recusa ("Tentativas: 2"), e isso não vira nada. Não há ponto, estrela, tempo ou ranking. Nenhuma escolha de candidato existe.
- **As falas passam pela validação do Escrivão** (`validateDialog`, em `tests/praca.test.ts`): sem nome, partido, "governo", ano, juízo ou travessão. O Escrivão da praça é o mesmo guia do jogo.
- **Contexto sensível.** A gaveta do Planalto de 2023 contém o Decreto 11.377/2023 (intervenção no DF), que está em `REGISTROS_SENSIVEIS`. Na praça ele aparece como documento, sem fala de humor, e a mensagem de erro que o cita só repete o campo Ação e o identificador. Fica para a revisão humana decidir se a gaveta deve avisar o contexto como o jogo avisa.
- **A ata não compara posições** (segunda sessão, seção 9). A matéria da mesa é uma proposição que os dois documentos citam, e um teste confere isso e que a ementa é a mesma nos dois. A ata mostra cada documento inteiro na sua coluna, com as fontes; a única frase sobre os dois, fixa, diz que um voto no texto de um projeto e um veto a dispositivos da lei são atos diferentes, sobre textos diferentes da mesma matéria. Nenhuma frase diz que um foi "a favor" e o outro "contra" a mesma coisa.

## 6. O que foi implementado

Uma rota nova, `/praca/`, no menu como "Praça", sem mexer nas rotas que existiam.

| Parte | Arquivo | O que faz |
| --- | --- | --- |
| Contratos | `src/lib/praca/tipos.ts` | Lugares, moradores, itens, gavetas, recortes, sessões (com o portão: um item por sessão), pautas, matéria da mesa, nota, ata, progresso (formato 1) |
| Ficção | `src/lib/praca/praca.ts` | Os lugares, os quatro moradores, o bilhete, as duas sessões, as seis pautas, a matéria da mesa e as treze conversas (grafos) |
| Regras, puras | `src/lib/praca/regras.ts` | Sessões (aberta, concluída, de agora, fim da edição), pautas, itens, gavetas, cópias, conversa por situação, montagem e fixação da nota, lavratura da ata (erro por lado), erro por campo, Câmara, leitura do progresso salvo |
| Conteúdo | `src/lib/praca/conteudo.ts` | Monta gavetas e recortes a partir de `AtlasData`, no build, e filtra as pautas e as matérias pelos documentos publicados |
| Cena | `src/features/praca/scene.ts` | A praça em three.js, com o motor da cidade reaproveitado; expõe a posição no canvas (`data-posicao`); seis notas no mural, a Lourdes na escadaria e a ata no quadro da Câmara |
| Tela | `src/features/praca/PracaWorld.tsx` | Entrada, HUD, botão de ação, janelas (mural por sessão, padaria, banca, arquivo, bilhete, Câmara com a Lourdes e a mesa, caderno), lista sem WebGL, joystick, progresso em `localStorage` (`atlas-politico:praca`), retomada |
| Rota | `src/app/praca/page.tsx` | Página estática |
| Testes | `tests/praca.test.ts`, `tests/e2e/praca.spec.ts`, `tests/export/praca.capture.ts` | Regras e conteúdo (18 testes); jornadas (6); capturas (48) |

Reaproveitado sem cópia: `DialogGraph` e a validação de falas (`src/lib/game/escrivao`), `documentFields` (`src/lib/game/dossier`), `formatDate`, os rótulos do domínio, `seededRandom`. Copiados com mudança: o laço da cena e o joystick da cidade. Sem backend, sem multiplayer, sem serviço pago, sem troca de motor.

## 7. Validação

A validação abaixo é a da primeira sessão, como foi feita; a da segunda está na seção 9, com os números da árvore final.

**Verificado nesta máquina, na árvore da primeira sessão, em 17 de outubro de 2026:**

- `npm run typecheck` e `npm run lint`: sem erro.
- `npx vitest run`: 47 arquivos, 841 testes, todos passando (11 novos em `tests/praca.test.ts`).
- `tests/e2e/praca.spec.ts` sobre o servidor de desenvolvimento, Chromium sem interface com WebGL por software: 5 jornadas passando. (1) Sem WebGL, a jornada inteira pela lista: as duas pautas, o erro explicado por campo (documento errado, data errada, ação errada), a nota fixada com os dispositivos, o bilhete, a chave, as gavetas do Senado, a segunda pauta comparando dois votos, a Câmara aberta, recarregar e retomar, recomeçar. (2) Passar pela entrada e ir embora não apaga o progresso salvo (regressão encontrada e corrigida nesta sessão: o `pagehide` gravava o progresso vazio). (3) Com a cena, andar até o mural pelo teclado (esperando a posição, nunca um tempo), agir com E, fechar com Esc, o foco voltar ao botão de ação, e `data-movimento="reduzido"` com a preferência do sistema. (4) Sem a preferência, `data-movimento="normal"`. (5) Celular emulado (390×844, toque): o joystick leva ao bilhete, o toque o guarda, o caderno o mostra.
- `npm run build`, `npm run verify:export`, `npm run test:export`: passando. `tests/e2e/paginas.spec.ts`, `acabamento.spec.ts` e `mundo.spec.ts` continuam passando com o menu novo.
- Capturas em `docs/capturas/praca/`, 33 imagens da saída estática, percorrendo a praça de verdade (o personagem anda pelo teclado até cada lugar): computador 1440×900, celular emulado 390×844 e a lista sem WebGL. Todas foram abertas e conferidas.

**Limites, ditos como são:**

- **Nenhum aparelho real.** Celular é emulação do Chromium; o joystick foi movido pelo mouse e os botões pelo toque emulado. Sem toque real, sem Safari, sem Android.
- **Nenhum número de desempenho de usuário.** O que existe: a jornada de computador das capturas, com sombras e WebGL por software, levou 5,4 min para cerca de 130 unidades de caminhada e vinte telas; a emulação de celular, sem sombras, andou na velocidade de projeto. Isso descreve o Chromium sem placa desta máquina, e nada mais. Sem Lighthouse na praça.
- **Nenhuma pessoa jogou.** As metas de tempo dos cinco minutos são de projeto.
- **Sem revisão humana** dos textos novos (falas, perguntas, entrada), como em todo o resto do atlas ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)). A passagem de acessibilidade (`npm run audit:a11y`) não rodou nas telas da praça. Leitor de tela não foi testado; há `aria-live` para a proximidade e foco gerido nas janelas.
- **A Câmara anunciava uma sessão que não existia.** Resolvido na fase seguinte: a sessão da Câmara está na seção 9.
- **Gaveta sem pauta.** Das 24 gavetas, nove têm motivo depois da segunda sessão (pauta, matéria da mesa ou documento a comparar); as outras 15 abrem e mostram documentos reais, mas nada pede para visitá-las ainda.

## 8. Próximas três prioridades

Reescritas depois da segunda sessão (seção 9); a primeira versão desta lista pedia a sessão da Câmara, que foi feita.

1. **Gente e aparelho.** Três pessoas jogando as duas sessões, com os tempos anotados (a primeira tem meta de cinco minutos; a segunda, de projeto, de dez); um celular Android e um iPhone reais, com o joystick, as janelas e a ata em uma coluna; a revisão humana das falas, das perguntas e da matéria; a passagem de acessibilidade nas telas da praça (T-23, T-24, T-25).
2. **Juntar o que ficou separado.** Levar a Cidade do Voto para dentro da praça (um comitê onde os programas aparecem às cegas) ou tirá-la do menu; ligar a entrada do jogo à praça; e decidir o que fica das salas do jogo (T-26).
3. **A terceira sessão.** Mais três matérias que passaram pelas duas pessoas já estão nas gavetas (o regime fiscal de 2023, o IBS e a CBS de 2024 e 2025, o crime organizado de 2025 e 2026), e 15 gavetas ainda não têm motivo. Uma sessão com uma matéria por vez, escolhida pela pessoa na mesa, e pautas para as gavetas da Alerj e do Planalto de 2003 a 2010 (T-28).

## 9. A segunda sessão: a sessão da Câmara (D-154)

Feita em 17 de outubro de 2026, na fase seguinte à primeira sessão, a pedido do responsável ("vamos para próxima fase"), sobre a prioridade 1 de então (T-22): a sessão da Câmara com uma matéria que passou pelas duas pessoas, lado a lado; mais duas pautas por pessoa, tiradas de gavetas que a primeira sessão não visita; e o portão generalizado (um item por sessão, e o lugar que ele abre). Durante a tarefa, sem commit, sem push e sem deploy, como na primeira; o envio das duas sessões veio depois, a pedido (começo deste documento).

### O que é

- **A Câmara abre e tem alguém.** Quando as duas pautas da primeira sessão estão no mural, a corrente cai, a porta acende e a Lourdes, secretária da Câmara, aparece na escadaria (personagem fictícia, de blazer, coque e crachá). Dentro, duas abas: a conversa com ela e a mesa. O mural amanhece com quatro perguntas novas, agrupadas por sessão ("Sessão 2 · A sessão da Câmara" acima, "Sessão 1 · As pautas do mural" abaixo, respondidas).
- **A matéria da mesa.** O projeto de lei de 2022 que alterou a Lei de Execução Penal (monitoração eletrônica do preso e saída temporária): o senador votou no texto principal em 20 de fevereiro de 2024 (`senado-voto-6818-5894`, a favor); o presidente sancionou a Lei 14.843, de 11 de abril de 2024, com veto parcial (`planalto-lei-14843-2024-saidas-temporarias`). Os dois documentos citam a proposição `senado-pl-2253-2022`, e a ementa é a mesma nos dois, palavra por palavra: é por aí que a pessoa os reconhece como a mesma matéria (o Escrivão diz isso a quem pergunta).
- **A credencial.** A mesa de imprensa pede a credencial. A Lourdes diz que a da rádio chegou pelo correio, e que o correio desta cidade vai parar na banca; o Teodoro a entrega (ou guarda, se a pessoa preferir ver os recortes primeiro). É o portão da segunda sessão, como a chave foi o da primeira: `Sessao.portao` diz o item e o que ele abre, e o objetivo do cartão diz "A mesa pede a credencial de imprensa" enquanto ela falta.
- **A ata, lado a lado.** Na mesa, dois lados ("O voto no Senado · Flávio Bolsonaro", "O ato no Planalto · Lula"); em cada um, o documento e o que ele registra, só com as cópias levadas. Errar é explicado por lado, com o documento escolhido: "Esse documento registra voto a favor, em 2024, sobre texto principal da PEC 45/2023. A mesa pede o voto no Senado sobre a matéria da sessão." A ata certa mostra a matéria (identificação e ementa da proposição) e os dois documentos inteiros em duas colunas (uma só no celular): os cinco campos, o resultado da votação de um lado, a mensagem de veto e os dispositivos vetados do outro, e as fontes de cada um, dobradas. A ata vai para o quadro de avisos da fachada da Câmara, e a Lourdes fala diferente.
- **As quatro pautas novas,** duas por pessoa, com a mesma mecânica da primeira sessão, e todas com um documento a comparar que se distingue pelo campo Ação ou pela data:
  - Dona Cida, do posto de saúde: a medida provisória de 2003 que criou o Bolsa Família (`planalto-mpv-132-2003-bolsa-familia`, edição de medida provisória), e não a lei de 2004 em que ela virou; a gaveta de 2003 tem mais dois atos (a PEC 40 e a Lei 10.826).
  - Seu Arlindo, do sindicato: das duas leis de 2025 sobre tributos, a sancionada sem veto (`planalto-lei-15270-2025-imposto-de-renda`, sanção expressa) e não a Lei Complementar 214 (veto parcial), na mesma gaveta.
  - Dona Nair, da autoescola: das duas leis estaduais de autoria do deputado, de 2003 e de 2011, a promulgada pelo Legislativo (`alerj-lei-5938-2011-autoria`); a nota mostra a norma em que a autoria deu.
  - Seu Benedito, da oficina: dos dois votos de 2024, sobre o IBS e a CBS e sobre a Lei de Execução Penal, o contra (`senado-voto-6899-5894`); o outro é o voto da matéria da mesa, que a pessoa já leu.
- **O fim da edição.** Com a ata lavrada e as seis notas no mural, o cartão diz que as pautas desta edição acabaram e manda comparar as trajetórias no atlas; a Zefa e a Lourdes dizem o mesmo, cada uma do seu jeito. Nada soma, nada dá nota.

### O portão generalizado

`Sessao` (`src/lib/praca/tipos.ts`): `abreCom` (a sessão anterior, que precisa estar concluída), `abreLugar` (o lugar que fica trancado até esta sessão abrir), `pautas`, `materia` e `portao: { item, abre }`. As regras (`sessaoAberta`, `sessaoConcluida`, `sessaoDeAgora`, `pautasDisponiveis`, `fimDaEdicao`, `camaraAberta`, `objetivoDeAgora`, `conversaDe`) leem só isso: uma terceira sessão é escrever uma entrada em `SESSOES`, as pautas e a matéria, sem tocar na tela. O progresso ganhou `atas` (por matéria: situação, tentativas e a ata lavrada), no mesmo formato 1: um progresso gravado antes da segunda sessão, sem o campo, é lido como se o tivesse vazio (teste).

### Integridade

- Os dois documentos da matéria citam a mesma proposição e têm a mesma ementa; cada um está na gaveta da pessoa dita, e são de pessoas diferentes; os anos escritos na matéria e no objetivo estão nos documentos (`tests/praca.test.ts`).
- Cada pauta nova aponta um documento na gaveta da pessoa certa, com ao menos um documento a comparar da mesma pessoa; os anos da pergunta estão nos documentos apontados; a pergunta não cita nome, partido, sigla nem travessão; a resposta se distingue dos comparados pela ação ou pela data.
- As treze conversas passam pela validação do Escrivão (sem nome das pessoas retratadas, partido, "governo", ano, juízo ou travessão). As falas da Lourdes, do Teodoro e do Escrivão sobre a matéria falam da papelada ("um documento é de voto e o outro é de sanção"), e não do que cada pessoa fez: isso fica nos documentos, na mesa.
- A ata não compara posições (seção 5, último ponto). O aviso fixo está na tela, abaixo das duas colunas.
- Contexto sensível: nenhum dos documentos novos está em `REGISTROS_SENSIVEIS`.

### Validação

**Verificado nesta máquina, na árvore final, em 17 de outubro de 2026:**

- `npm run lint` e `npm run typecheck`: sem erro.
- `npx vitest run`: 47 arquivos, 848 testes, todos passando (18 em `tests/praca.test.ts`, 7 a mais que na primeira sessão: sessões, credencial, ata certa e errada por lado, ata lavrada, fim da edição, roteiro sem matéria, progresso com e sem `atas`).
- `tests/e2e/praca.spec.ts` no servidor de desenvolvimento e sobre a exportação (`--project=jornadas`): 6 jornadas passando nos dois. A nova, sem WebGL e com a primeira sessão semeada no `localStorage`: o mural com seis perguntas em duas sessões; a Lourdes anunciando a matéria e a credencial; a mesa pedindo a credencial e o objetivo dizendo isso; o Teodoro entregando a credencial; o Escrivão explicando a matéria; as cópias das duas gavetas; a ata recusada com o voto errado explicado por lado (sem o título certo) e nenhum erro no outro lado; a ata lavrada com a proposição, os dispositivos de um lado e o resultado do outro, e o aviso de que não compara posições; as quatro pautas novas, cada uma com a cópia da gaveta dela, até "a última pergunta desta edição"; a Zefa e a Lourdes no fim; recarregar com seis notas, a ata e a credencial. A jornada do teclado ganhou prazo de dois minutos: com sombras e WebGL por software, a caminhada até o mural passou de 30 segundos sobre a exportação (45 s); a espera continua sendo pela posição.
- `npm run build`, `npm run verify:export`, `npm run test:export` (38): passando.
- Capturas em `docs/capturas/praca/`: 48 imagens da saída estática (15 novas: 25 e 26 refeitas com a Lourdes; 28 a 36 da segunda sessão, com o personagem andando da Câmara à banca, ao arquivo, à Câmara e ao mural; 37 a 40 do fim da edição; 07 e 08 do celular com a ata). Todas foram abertas e conferidas; três foram refeitas depois de dois ajustes de texto vistos nelas ("o voto no senado" com a casa em minúscula; a frase de mudança repetindo "a ata está lavrada").

**Limites, os mesmos da primeira sessão:** nenhum aparelho real, ninguém jogou, nenhum número de desempenho de usuário, sem revisão humana das falas e das perguntas novas, sem passagem de acessibilidade nas telas da praça. A meta de tempo da segunda sessão (dez minutos) é de projeto: ela tem cinco tarefas e três idas ao arquivo. O caminho da credencial é único (só o Teodoro a tem), e o teste e as capturas o percorrem; se uma pessoa não falar com a Lourdes, o cartão diz que a mesa pede a credencial, mas não diz onde ela está: é uma escolha de desenho (a informação só se descobre explorando), a conferir com gente.
