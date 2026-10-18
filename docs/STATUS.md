# Status

Atualizado em 18 de outubro de 2026.

| Fase do plano | Situação |
| --- | --- |
| 1. Arquitetura e fundação | Concluída em 08/10/2026 |
| 2. Pesquisa e primeiro conjunto de conteúdo | Concluída em 08/10/2026, com revisão assistida por IA e pendências listadas abaixo |
| 3. Camada de dados e preparação do backend | Concluída em 08/10/2026 |
| 4. Experiência e direção visual | Concluída em 08/10/2026, com prévia navegável |
| 5. Aplicação e linha do tempo | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 6. Mapa sincronizado | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 7. Comparação, páginas e fontes | Concluída em 09/10/2026, com pendências e itens não verificados listados abaixo |
| 8. Acabamento visual e desempenho | Concluída em 09/10/2026, com medições de laboratório e pendências listadas abaixo |
| 9. Revisão editorial, testes e validação com pessoas | Parte editorial e técnica feita em 09/10/2026, com assistência de IA. **Validação com pessoas pendente** e revisão humana do conteúdo pendente |
| 10. Publicação e apresentação | Não concluída. O site responde em um endereço provisório desde 11/10/2026, sem indexação, por decisão do responsável pelo projeto, antes da revisão humana e da validação com pessoas (D-147); a primeira versão no ar foi a edição 0.2.1, e desde 12/10/2026 o endereço mostra a edição 0.3.0, publicada pelo push do commit `f2efc28`; no mesmo dia, o push do commit `fac621e` acrescentou ao jogo o Passaporte do Escrivão, sem mudar a edição. Domínio, canal de correção, indexação e licença por decidir |
| Jogo, etapa 1 (fora do plano de 10 fases) | Primeira versão jogável feita em 10/10/2026: dois capítulos de cada personagem, conferidos no build estático. Revisão humana e validação com pessoas continuam pendentes |
| Jogo, versão de lançamento (candidata) | Feita em 10/10/2026: onze capítulos sobre os 39 acontecimentos, quatro tipos de tarefa, ficha judicial, cinco ambientes novos e três figuras de cada personagem, conferidos no build estático. **Revisão humana, validação com pessoas, domínio e deploy pendentes**, e são o que decide o lançamento |
| Histórico de decisões e Escrivão, entrega P1 (investigação jogável) | Feita em 10 e 11/10/2026: salas Histórico, Economia e Segurança pública com progressão própria; tarefa de decisão em duas etapas (evidência e interpretação); o Escrivão com catálogo validado, três camadas e humor desligável; cartões de voto e ato e comparação por tema no atlas; edição 0.2.0 com a amostra de 12 decisões reais (6 votos do Senado, 6 atos do Planalto), `casa` nos mandatos e cobertura declarada. **Revisão humana e celular real pendentes** ([VOTOS-E-ESCRIVAO.md](VOTOS-E-ESCRIVAO.md), [HUMAN-REVIEW.md](HUMAN-REVIEW.md)) |
| Auditoria de QA de produção de 11/10/2026 | Correções de código e de testes feitas e verificadas em 11/10/2026, na `main` e no GitHub no mesmo dia (commit `0e98420`, com a verificação contínua verde): catálogo de fontes completo, humor que sai na hora, contexto sensível, progresso no formato 5, capturas conferíveis, cartões com a divergência e o texto de referência declarados, edição 0.2.1. **O que a auditoria pede a uma pessoa continua pendente** e decide a publicação (seção abaixo) |
| Trilha simples do jogo e edição 0.3.0 | Feita e verificada na máquina em 11/10/2026: nove fases curtas por pessoa, da origem à data de corte, com explicação, atividade e leitura sem o cenário; dois aprofundamentos por pessoa; resumo e propostas por área na comparação; cinco coleções novas no conteúdo. Antes do envio, uma revisão independente com assistência de IA, em três passagens e uma conferência curta das últimas correções, com as correções feitas (D-149). O responsável pelo projeto pediu o commit e o envio à `main` no mesmo dia. **Revisão humana, validação com pessoas e celular real pendentes** (seção abaixo) |
| Passaporte do Escrivão (recompensas simples no jogo) | Implementado em 12/10/2026: um carimbo por fase concluída, três selos, o progresso à vista no cartão da fase e a apresentação da fase seguinte, tudo calculado do progresso que o jogo já guardava (D-150). Revisão independente com assistência de IA, em duas passagens, com as correções feitas. **Na máquina, a verificação ficou incompleta:** as regras, o build e os testes de carregamento passaram sobre a árvore final, e as jornadas de navegador, sobre a árvore anterior às últimas correções; a rodada final foi interrompida por falta de memória, e a passagem de acessibilidade não rodou. O responsável pediu o commit e o envio à `main` no mesmo dia, com a verificação nesse estado: commit `fac621e`, publicado no endereço provisório às 9h11 de 12/10/2026. **A verificação contínua do GitHub desse commit passou inteira,** com as jornadas e a passagem de acessibilidade. As capturas do repositório não foram refeitas. Revisão humana dos textos novos, validação com pessoas e celular real pendentes (seção abaixo) |
| Histórico de decisões e Escrivão, entrega P0 (contratos e evidência) | Feita em 10/10/2026: seis coleções de decisões políticas no modelo e no pipeline, consulta comparativa discriminada, importador do Senado e da Câmara com capturas, tudo como rascunho ([VOTOS-E-ESCRIVAO.md](VOTOS-E-ESCRIVAO.md)) |
| Missão de investigação e Cidade do Voto (17 de outubro de 2026) | Feita e verificada na máquina em 17/10/2026: a missão "O documento diz o quê?" para as duas pessoas (D-151), as correções da Cidade do Voto e as duas escolhas novas (D-152), edição 0.4.0 sem registro novo. Commit `1b192aa`, enviado à `main` a pedido do responsável no mesmo dia, com a verificação do GitHub verde; no ar no endereço provisório. Revisão humana, validação com pessoas, celular real e a passagem de acessibilidade das telas novas pendentes (seção abaixo) |
| Praça do Mural (17 de outubro de 2026) | Feita e verificada na máquina em 17/10/2026, depois de o responsável dizer que o jogo continuava chato: diagnóstico com evidência, três alternativas, a praça escolhida e a primeira sessão jogável em `/praca/` (D-153, [PRACA.md](PRACA.md)). **Sem commit e sem envio durante a tarefa**, como pedido; commitada e enviada à `main` em 17/10/2026, à noite, a pedido do responsável, junto com a segunda sessão. No mesmo dia, na fase seguinte, a segunda sessão: a sessão da Câmara, com a Lourdes, a credencial, uma matéria lado a lado e quatro pautas novas (D-154). Nenhum aparelho real, ninguém jogou, sem revisão humana (seção abaixo) |
| Redesign do atlas e evolução da praça (18 de outubro de 2026) | Feita e verificada na máquina em 18/10/2026, a pedido do responsável (D-155): o palco escuro em volta da folha de papel, com os tokens de ação e destaque conferidos por contraste; o menu em quatro entradas (Explorar, Comparar, Jogar, Metodologia); a entrada com **Começar investigação** e a prévia leve da praça; o hub `/jogo/` com três caminhos; a comparação em três partes com os cartões identificados; na praça, o tutorial, as pautas de ordem e de natureza, o passo de agora, as descobertas e os selos, a hora azul, o modo leve e a lista por escolha. Sem envio durante a tarefa, como pedido; commitada e enviada à `main` no mesmo dia, a pedido do responsável, em mensagem separada depois do relatório (o push publica no endereço provisório). Nenhum aparelho real, ninguém jogou, sem revisão humana; as capturas da praça e a passagem de acessibilidade não rodaram na máquina (seção abaixo) |

O código e o conteúdo estão em repositório público no GitHub desde 10 de outubro de 2026: https://github.com/rickjs2005/atlas-politico. Tudo é versionado na `main`, sem ramos. Desde 11 de outubro de 2026 o site responde em um endereço provisório, `https://atlas-politico.vercel.app/`, sem indexação, por decisão do responsável pelo projeto e antes da revisão humana e da validação com pessoas; um push na `main` publica, o que foi observado duas vezes em 12 de outubro de 2026 ([DEPLOY.md](DEPLOY.md), D-147). O domínio definitivo, o canal de correção e a indexação continuam por decidir.

## Redesign do atlas e evolução da praça (18 de outubro de 2026)

O pedido do responsável, em 18 de outubro de 2026: um redesign marcante do atlas como documentário interativo com a aventura de investigação no centro, nas cores dadas, com o menu em quatro entradas, a comparação por tema com os registros identificados e a praça com uma missão completa que ensine a ação documentada antes da interpretação; a pilha mantida, a exportação estática preservada, e sem commit, push ou deploy. A decisão está em [DECISIONS.md](DECISIONS.md), D-155; a praça, em [PRACA.md](PRACA.md), seção 10; o sistema de design, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); a comparação, em [COMPARISON.md](COMPARISON.md); as tarefas abertas, em [TAREFAS.md](TAREFAS.md), T-25, T-26 e T-29 a T-31.

**Feito:** o palco escuro (`#111613`, superfície `#202823`, texto `#FAF8F2`) em volta da folha de papel (`#F4F0E7`, tinta `#1C241E`), com a cor de ação `#F0C66B` e o destaque `#B9AEDB` como tokens semânticos conferidos por contraste em `tests/design.test.ts`; Newsreader e Libre Franklin mantidas, com os títulos das entradas maiores. O menu Explorar, Comparar, Jogar e Metodologia; a rota `/explorar/`; a entrada com o convite curto, a prévia da praça em SVG, **Começar investigação** e **Comparar candidatos**; o hub `/jogo/` com **Investigar na Praça do Mural**, **Conhecer trajetórias** (`/jogo/trajetorias/`, a entrada antiga da trilha) e **Explorar propostas**; `/praca/` e `/mundo/` preservadas; a 404 com o caminho para a praça. A comparação em três partes pelo fragmento do endereço (Trajetória, Decisões, Propostas), com as abas, a nota de alcance dos filtros, os cartões expansíveis com pessoa, cargo, instituição, data, objeto, ação e fontes, e o aviso de natureza. Na praça: oito pautas em dois tipos novos (campo, o tutorial; ordem) mais os dois que havia (nota, natureza); o passo de agora no cartão e no caderno; as descobertas e oito selos sem ranking; a reação de quem perguntou; a hora azul; eventos tipados da cena; o modo leve por escolha ou em aparelho fraco; a lista por escolha; o descarte da cena ao sair; e a tela dividida por responsabilidade (`PracaWorld.tsx`, `useCena.ts`, `persistencia.ts`, `Hud.tsx`, `janelas/`).

**Verificado nesta máquina, na árvore final, em 18 de outubro de 2026:** `npm run check` sem erro (48 arquivos, 865 testes de regra; build com 60 páginas HTML e 360 arquivos; `verify:export`); `test:export` 38; 278 jornadas sobre a exportação, um arquivo por vez (praça 7, comparação 25, jogo 72, páginas 30, acabamento 31, prévia 28, investigação 5, cidade 2, linha do tempo 42, mapa 36), e a praça e a abertura também no servidor de desenvolvimento; 84 capturas do redesign nas quatro larguras, sem erro de console e sem rolagem lateral, todas abertas; as capturas de `docs/capturas/praca/` **não foram refeitas** e a passagem de acessibilidade **não rodou**: o Claude Code encerrou a cadeia por falta de memória na máquina, com o primeiro roteiro de capturas no meio (as 18 imagens parciais foram restauradas; as 48 da pasta são as de 17 de outubro, anteriores à hora azul). A verificação contínua do GitHub roda a passagem a cada push. Dois defeitos foram achados e corrigidos no caminho: um endereço de teste que ainda apontava `/jogo/` como a trilha, e as jornadas da abertura, que descreviam a entrada antiga.

**Não feito, e dito como é:** nenhum aparelho real; o 3D só com WebGL por software; ninguém jogou; sem revisão humana dos textos novos; a passagem de acessibilidade não entra na cena nem nas janelas além do mural em lista; `GameShell.tsx` da trilha não foi dividido; sem áudio e sem biblioteca nova, por decisão. Nada foi enviado durante a tarefa; o commit e o push à `main` vieram em 18 de outubro de 2026, a pedido do responsável, em mensagem separada depois do relatório. O push publica no endereço provisório (D-147); a verificação contínua do GitHub roda, a cada push, o que não rodou na máquina (a passagem de acessibilidade e as jornadas no servidor de desenvolvimento).

## Praça do Mural (17 de outubro de 2026)

Depois do envio da missão de investigação, o responsável disse que o jogo continuava chato. O pedido seguinte foi uma reformulação rigorosa, como diretor de jogo: investigar a versão atual com evidência, criticar, propor três direções e escolher uma, desenhar os cinco primeiros minutos, refazer a apresentação, preservar a integridade do conteúdo, implementar uma missão completa localmente e validar, sem commit, push ou deploy. Tudo isso está em [PRACA.md](PRACA.md); a decisão, em [DECISIONS.md](DECISIONS.md), D-153; as tarefas, em [TAREFAS.md](TAREFAS.md), T-22 a T-27.

**Feito:** a rota `/praca/` ("Praça" no menu): uma praça brasileira compacta em three.js (coreto, calçada de pedra portuguesa, padaria, banca, arquivo, Câmara), em que a pessoa é a repórter nova da rádio comunitária e responde as perguntas que os moradores pregam no mural achando, no arquivo, o documento que responde cada uma. Duas pautas, uma por pessoa, com a mesma mecânica: montar a nota com três campos do documento, só com as cópias levadas; o erro é explicado por campo; a nota certa muda o mural; a chave das gavetas do Senado vem de um bilhete no chão e da Zefa; as duas notas derrubam a corrente da Câmara, que é a próxima sessão. As gavetas são todas as decisões do atlas (24 gavetas, 32 documentos); os recortes da banca, os 39 acontecimentos. Progresso no navegador, retomada, lista sem WebGL, movimento reduzido. A Cidade do Voto e as salas do jogo ficaram como estavam.

**Verificado nesta máquina, na árvore final, em 17 de outubro de 2026:** lint e typecheck sem erro; 841 testes de regra em 47 arquivos (11 novos); `tests/e2e/praca.spec.ts`, 5 jornadas no servidor de desenvolvimento (a jornada inteira sem WebGL, a regressão da entrada, teclado e foco com a cena, movimento reduzido, joystick e toque no celular emulado); `paginas`, `acabamento` e `mundo` (63 jornadas) com o menu novo; build (58 páginas), `verify:export`, `test:export` 38; 33 capturas em `docs/capturas/praca/`, todas abertas. Uma regressão foi encontrada e corrigida antes de fechar: o `pagehide` da entrada apagava o progresso salvo de quem passava pela entrada e ia embora.

**Não feito, e dito como é:** nenhum aparelho real (celular é emulação do Chromium); nenhuma pessoa jogou (as metas dos cinco minutos são de projeto); nenhum número de desempenho de usuário (o único tempo é o do Chromium sem placa, com WebGL por software: 5,4 min para a jornada de capturas em computador com sombras); sem revisão humana das falas e das perguntas; a passagem de acessibilidade não rodou na praça; a Câmara anunciava uma sessão que ainda não existia (feita na fase seguinte, abaixo); 22 gavetas sem pauta (15 depois da segunda sessão). As três próximas prioridades estão em [PRACA.md](PRACA.md), seção 8.

**A segunda sessão (17 de outubro de 2026, D-154).** A pedido do responsável ("vamos para próxima fase"), a prioridade 1 de então foi feita no mesmo dia: a sessão da Câmara. Concluir a primeira sessão abre a Câmara, onde a Lourdes (secretária fictícia) põe na mesa uma matéria que passou pelas duas pessoas, o projeto de lei de 2022 sobre a Lei de Execução Penal: o voto do senador no Senado e o ato do presidente no Planalto, ambos de 2024, que citam a mesma proposição. A mesa pede a credencial de imprensa, que o Teodoro recebe pelo correio (o portão da sessão, como a chave foi o da primeira; `Sessao` agora diz o item e o lugar que ele abre). A pessoa leva os dois documentos e lavra a ata por lado, só com as cópias; o erro é explicado por lado; a ata certa mostra os dois documentos inteiros, lado a lado, com as fontes, e sem frase que compare posições; ela vai para o quadro de avisos da Câmara. O mural ganha quatro pautas novas, duas por pessoa, de gavetas que a primeira sessão não visita (a medida provisória do Bolsa Família de 2003; a lei de 2025 sancionada sem veto; a lei estadual de 2011 promulgada pelo Legislativo; o voto contra de 2024 sobre o IBS e a CBS). O fim da edição é dito pelo cartão, pela Zefa e pela Lourdes. **Verificado nesta máquina, na árvore final:** lint e typecheck sem erro; 848 testes de regra em 47 arquivos (18 na praça); `tests/e2e/praca.spec.ts` com 6 jornadas, no servidor de desenvolvimento e sobre a exportação; build, `verify:export` e `test:export` (38); 48 capturas em `docs/capturas/praca/` (15 novas), todas abertas. **Não feito:** o mesmo da primeira sessão (aparelho real, pessoas, desempenho de usuário, revisão humana, acessibilidade). As duas sessões foram commitadas e enviadas à `main` em 17/10/2026, à noite, a pedido do responsável, em mensagem separada depois do relatório; o push publica no endereço provisório (D-147), com a revisão humana pendente. Detalhes em [PRACA.md](PRACA.md), seção 9.

## Missão de investigação e Cidade do Voto (17 de outubro de 2026)

Em 17 de outubro de 2026 o responsável pelo projeto pediu que o jogo evoluísse para exploração e investigação, com a evolução na jogabilidade, a partir de um estudo de jogos de referência e da investigação de seis pistas de uma análise anterior. O que foi feito, por quê e de onde veio cada mecânica está em [MISSAO-INVESTIGACAO.md](MISSAO-INVESTIGACAO.md); o estudo, em [REFERENCIAS-JOGOS.md](REFERENCIAS-JOGOS.md); as tarefas, com estado, em [TAREFAS.md](TAREFAS.md); as decisões, em [DECISIONS.md](DECISIONS.md), D-151 e D-152.

**Antes de tudo:** a `main` local estava em `fac621e`, e o remoto tinha quatro commits a mais (segurança do token da CI, README em inglês, política de segurança e o protótipo da Cidade do Voto, `52d7d2f`, de 13 de outubro, feito fora destas sessões). A `main` local foi avançada para o remoto sem perder os três documentos sem commit (DEPLOY, QA e STATUS); o `three` entrou em `node_modules` pelo `npm install`.

**Feito:**

- **A missão "O documento diz o quê?"** (D-151): sala `investigacao`, atividade `dossie`, uma fase por pessoa (Lula: três atos do Executivo; Flávio Bolsonaro: três votos no Senado), seis documentos na gaveta de cada uma, três fichas, conversa ramificada com o Escrivão, quatro objetos na sala, dossiê guardado no progresso, erro explicado pelos campos, campo apontado, carimbo, resumo, leitura sem o cenário e texto sem JavaScript. Edição 0.4.0, sem registro factual novo e sem fonte nova.
- **Os seis achados investigados:** A (aviso "sem edição"), B (ciclo de vida do canvas da cidade), C (instrução na lista) e F (escolhas "partes dos dois" e "ainda não sei") corrigidos ou feitos; D (filtros da comparação) não reproduzido como defeito, porque as duas seções já dizem que não seguem o recorte; E (a trilha só lê e responde) respondido com a missão, e a trilha ficou como estava. O defeito B foi **reproduzido** no código anterior antes da correção: ao voltar da revelação, o canvas novo ficava com 300 por 150 (em branco), e o laço antigo continuava desenhando fora da tela.
- **Documentação:** GAMEPLAY, EDITORIAL (regra 13), DATA_MODEL, ARCHITECTURE, MUNDO, QA, README (nos dois idiomas), capturas e os três documentos novos acima; GAME-COVERAGE e HUMAN-REVIEW regenerados.

**Verificado nesta máquina, na árvore final, em 17 de outubro de 2026:**

| O quê | Resultado |
| --- | --- |
| `npm run lint` e `npm run typecheck` | Sem erro |
| `npm run test` (regras) | 830 testes em 46 arquivos, todos passando (12 novos em `tests/game-dossier.test.ts`, mais os das fases, do mundo e do catálogo) |
| `npm run data:validate` | Conteúdo válido: 0 erros, as 6 pendências de rascunho de sempre |
| `npm run build` e `npm run verify:export` | 57 páginas HTML (as duas da missão a mais), 340 arquivos |
| `npm run test:export` | 38 testes, todos passando |
| Jornadas sobre a exportação (`npm run test:journeys`, em três rodadas, por causa da memória) | 271 testes, todos passando: 5 da missão, 2 da cidade, 72 do jogo, 83 de prévia, páginas e comparação, 109 de acabamento, linha do tempo e mapa |
| Jornadas no servidor de desenvolvimento (`npm run test:e2e`, só as do jogo, da missão e da cidade) | 79 testes, todos passando; as jornadas do atlas em desenvolvimento não rodaram aqui (rodam na verificação contínua) |
| Capturas | 29 imagens em `docs/capturas/jogo-missao/`, olhadas uma a uma |
| `npm run verify:release` | Continua recusando, de propósito: registros sem revisão humana, domínio e canal pendentes |
| `npm run audit:a11y` e `npm run measure:game` | **Não rodados** nesta rodada; a passagem de acessibilidade ainda não cobre as telas da missão ([TAREFAS.md](TAREFAS.md), T-11 e T-17) |

**Não feito, e dito como tal:** nenhum aparelho real, nenhum leitor de tela, nenhuma pessoa jogou a missão; a duração de 5 a 10 minutos é hipótese; a revisão humana das fichas e das explicações está pendente, como a de todo o conteúdo. Nada foi commitado nem enviado: a árvore de trabalho tem todas as mudanças, e o push publica no endereço provisório.

## Passaporte do Escrivão (12 de outubro de 2026)

Em 12 de outubro de 2026 o responsável pelo projeto pediu recompensas simples para estimular a continuidade do jogo, mantendo o caráter educativo e o tratamento igual das duas pessoas: uma caderneta de carimbos, o progresso à vista durante a partida e uma apresentação da fase seguinte. As regras em vigor estão em [GAMEPLAY.md](GAMEPLAY.md), seção Passaporte do Escrivão; a decisão, em [DECISIONS.md](DECISIONS.md), D-150; o modo de verificar, em [QA.md](QA.md).

**Situação desta entrega:** implementada na máquina, com assistência de IA, em 12 de outubro de 2026, e **verificada só em parte na máquina** (abaixo, Verificações feitas e O que não rodou); depois do envio, a verificação contínua do GitHub passou inteira (abaixo, Envio, publicação e verificação contínua). O pedido deixava a publicação para a etapa de lançamento. No mesmo dia, depois de receber o relato da entrega, o responsável pelo projeto pediu o commit e o envio à `main`, informado de que a verificação final tinha sido interrompida e de que o push publica no endereço provisório (D-147). **O passaporte foi ao ar com o commit `fac621e`,** junto com a correção do roteiro de acessibilidade descrita na seção da trilha, em Depois do envio. O que aconteceu depois desse envio, a publicação e a verificação contínua do GitHub, não está naquele commit: está em Envio, publicação e verificação contínua, mais abaixo, escrito depois. Nenhuma pessoa revisou os textos novos, nenhuma pessoa jogou e nenhum aparelho real foi usado.

### O que o pedido listou e como ficou

| Item do pedido | Situação | O que foi feito |
| --- | --- | --- |
| Reutilizar a arquitetura e calcular os totais dos dados | Feito | As regras ficam em um módulo puro, `src/lib/game/passport.ts`, ao lado das da trilha. O único número escrito no código é o três do primeiro selo, que é a regra do pedido; os totais saem das fases publicadas |
| Caderneta com um espaço por fase de cada trajetória | Feito | A janela **Passaporte do Escrivão**: uma página por pessoa, com as mesmas peças, um espaço por fase da trajetória e, à parte, os dos aprofundamentos |
| Ao concluir: carimbo com o título, animação breve, confirmação curta, progresso na hora e Continuar sem fechar janela | Feito | O carimbo aparece na própria fase, com o número, o período e o título, bate uma vez em 0,42 segundo (parado com movimento reduzido), ao lado de uma confirmação como "Primeiro marco registrado."; a contagem do cartão muda na hora, e **Continuar** fica logo abaixo, na mesma janela |
| Um carimbo por fase; abrir não basta; "Ver a explicação e continuar" vale o mesmo | Feito | O carimbo é a própria conclusão que o progresso registra: não há lista de carimbos guardada. Recarregar, voltar à fase ou revê-la não repete nada. Abrir pelo cenário, pela lista, pela caderneta ou pelo endereço não dá carimbo, e errar também não |
| Conquistas derivadas do progresso, sem segunda fonte de verdade | Feito | Três selos, por contagem: Primeiros passos (três fases concluídas), Trajetória percorrida e Duas trajetórias |
| Progresso à vista: concluídas, faltam, marcadores e o botão Meu passaporte; fase aberta diferente de concluída | Feito | A faixa **Meu passaporte** no cartão da fase e no alto da leitura sem o cenário: "Concluídas: 3 de 9 · faltam 6", um marcador por fase, cheio para a concluída e com anel para a aberta |
| A caderneta deixa rever as fases, com as regras de navegação | Feito | Cada espaço abre a fase. É navegação: não conclui nem apaga nada |
| Depois da explicação da resposta, a fase seguinte, com uma frase tirada do roteiro | Feito | O bloco **A seguir**: posição, período, título e "Na próxima fase, você vai" seguido do objetivo que o conteúdo publicado escreve para a fase. Nenhuma frase nova sobre as pessoas foi escrita |
| No fim de uma trajetória, o convite para a outra; com as duas, a comparação e os aprofundamentos | Feito | Na última fase e no resumo. Com fases por concluir, a tela diz quantas faltam, sem cobrar |
| Falas comemorativas do Escrivão, com as condições e a rotação do catálogo; fase sensível com confirmação sóbria | Feito | Sete falas no evento `carimbo`: quatro instruções e três de humor, sobre carimbo, tinta e caderneta. Com o humor desligado, só a instrução. Em fase de contexto sensível, só a instrução, e a confirmação é a linha sóbria |
| Mesmas regras, recompensas e destaque visual para as duas trajetórias | Feito, com uma diferença declarada | As regras, os selos, o desenho, a batida e a cor são os mesmos. A regra de contexto sensível, que já era do jogo, pega três fases da trajetória de Lula, um aprofundamento dele e uma fase da trajetória de Flávio Bolsonaro: nelas mudam o texto da confirmação e o humor (limitações, abaixo) |
| Selos reconhecem exploração e conclusão | Feito em parte | Os três selos pedidos saem da contagem de fases concluídas, e o primeiro conta qualquer sala, inclusive os aprofundamentos. Não há selo para os registros opcionais de "Explorar este período": o progresso não guarda quais foram abertos, e um selo assim pediria um dado novo |
| Conteúdo e fontes acessíveis independentemente das recompensas | Feito | Nada fica atrás de carimbo ou de selo, e nenhuma fase segura a seguinte, como antes |
| Exportação estática, progresso local, sem serviço, com CSS leve | Feito | Nenhuma dependência nova, nenhuma imagem, nenhum pedido a outro domínio, nenhuma chave nova no navegador |
| Computador e telas de 360 a 390 pixels, sem encobrir personagens, textos ou controles | Feito em emulação | A faixa fica dentro do cartão da fase, em uma linha. A jornada que confere a cena inteira entre o cartão e o botão principal passou em 360×640 e em 390×844, e as telas foram olhadas. Aparelho real: não usado |
| Teclado, foco, rótulos, alternativa textual aos carimbos, movimento reduzido, conquistas anunciadas uma vez | Feito, sem leitor de tela | O carimbo é desenho, e cada espaço da caderneta tem o nome por extenso. O carimbo novo tem uma linha de aviso própria, que recebe o texto uma vez. A estrutura foi conferida por teste, e nenhum leitor de tela foi usado. A passagem de acessibilidade com as telas novas não rodou na máquina: rodou na verificação contínua do GitHub, depois do envio, sem falha |
| As oito verificações do item 8 | Feito, com a ressalva da rodada final na máquina | Há jornada de navegador para cada uma. Na máquina, todas passaram sobre a exportação da árvore anterior às últimas correções, e a rodada sobre a árvore final foi interrompida (abaixo). Sobre a árvore final, passaram na verificação contínua do GitHub, depois do envio |
| A publicação fica para a etapa de lançamento | Mudou por decisão do responsável | A entrega não publicou nada. Depois do relato dela, em 12 de outubro de 2026, o responsável pediu o commit e o envio à `main`, informado de que o push publica (D-147) e de que a verificação não tinha terminado. O envio, às 9h08 do mesmo dia, no commit `fac621e`, publicou o passaporte no endereço provisório, e a publicação ficou pronta às 9h11 (abaixo, Envio, publicação e verificação contínua) |

### O que mudou, por parte

- **Regras.** `src/lib/game/passport.ts`, novo e puro: os carimbos, a contagem, os selos, a confirmação, a linha de aviso, a vez da fala do Escrivão e a frase da fase seguinte. `src/lib/game/content.ts` monta, no build, as páginas da caderneta, com o título e o período das fases das duas pessoas.
- **Tela.** `src/features/game/ui/Passport.tsx`, novo: o carimbo, a faixa, o aviso do carimbo, o bloco A seguir, o fim da trajetória e a janela da caderneta. A casca (`GameShell.tsx`) percebe o carimbo comparando o progresso antes e depois de cada ação. A fase (`ui/PhaseContent.tsx`), o cartão (`ui/Hud.tsx`), as janelas (`ui/dialogs.tsx`), as falas (`ui/EscrivaoSays.tsx`), a entrada (`CharacterSelect.tsx`) e a página (`GamePage.tsx`) receberam as peças. `ui/status.ts`, novo, reúne o texto da situação de uma fase.
- **Progresso.** O formato salvo não mudou. `hooks.ts` ganhou a leitura, só para consulta, do progresso da outra pessoa.
- **Escrivão.** O evento `carimbo` no catálogo, com a validação das outras falas. Uma fala antiga de erro, que ligava carimbo a acerto e hoje não é dita, foi reescrita.
- **Uma mudança no ciclo da trilha (D-150).** Depois de um erro, o botão de seguir levava à fase seguinte no mesmo toque. Passou a ser **Ver a explicação e continuar**, o mesmo de antes de responder: conclui a fase e a deixa na tela, com a opção certa marcada, o carimbo e **Continuar**. É um toque a mais para quem errou.
- **Testes.** `tests/game-passport.test.ts`, novo, com 24 testes de regra; 20 jornadas novas no bloco do passaporte de `tests/e2e/jogo.spec.ts`, e cinco jornadas antigas ajustadas; `tests/e2e/jogo-apoio.ts` com a semente de progresso e a fala que a tela escolhe; o teste do HTML do build.
- **Roteiros.** O da passagem de acessibilidade ganhou três telas (28 no total), e o de capturas, dezessete. Na máquina, o da passagem de acessibilidade não rodou depois disso: rodou na verificação contínua do GitHub, depois do envio. Do de capturas rodou só o teste do passaporte, para uma pasta de trabalho fora do repositório; o comando inteiro, que refaz a pasta do repositório, não rodou (abaixo).
- **Documentos.** GAMEPLAY, DECISIONS (D-150), QA, UX, ARCHITECTURE, USER-VALIDATION, DEPLOY, os dois README e este.

### Revisão independente da entrega

A árvore passou por uma revisão só de leitura, com assistência de IA: três leitores, um para cada recorte (regras e casca; tela, acessibilidade e texto; testes e documentos), e um segundo leitor para tentar refutar cada apontamento. Não é revisão humana. Foram 29 apontamentos, 27 confirmados e 2 refutados; alguns são o mesmo ponto visto por dois ou três leitores. Nenhum trata de fato sobre as pessoas. O primeiro leitor classificou 9 como importantes e 20 como menores, e nenhum como impeditivo; entre os 27 confirmados, o segundo leitor manteve 8 como importantes.

| O que a revisão achou | O que foi feito |
| --- | --- |
| Quem errava e seguia recebia o carimbo sem confirmação, sem a fase seguinte e sem o aviso do selo, porque a fase saía da tela no mesmo toque (visto pelos três leitores) | O botão de depois do erro passou a ser **Ver a explicação e continuar**, que conclui e deixa a fase na tela (D-150). Nenhum caminho conclui uma fase tirando-a da tela |
| A caderneta dizia que "ler a explicação" vale carimbo e, logo abaixo, mostrava fases "sem carimbo · explicação lida" | O texto passou a nomear a ação ("usar Ver a explicação e continuar"), e o espaço vazio diz "aberta, ainda não concluída" |
| A confirmação do carimbo ficava em uma região de aviso que nasce já preenchida, com outra região dentro e com um botão dentro | O carimbo tem uma linha de aviso própria, que já está na fase, vazia, e recebe o texto uma vez; o texto ao lado do desenho saiu da árvore de acessibilidade, e o botão, das regiões de aviso |
| Em fase de contexto sensível o carimbo aparecia parado, e a regra pega mais fases de uma trajetória que da outra | O desenho e a batida passaram a ser os mesmos em toda fase; a sobriedade ficou no texto (D-150) |
| O marcador da faixa batia de novo ao trocar entre o cenário e a leitura, e batia em fase sensível | A batida do marcador saiu: ele só muda de cor |
| A fala de humor do primeiro carimbo dizia "Mais um carimbo", e os aprofundamentos repetiam sempre a mesma | A vez da fala passou a ser a ordem do carimbo entre os da pessoa, em todas as salas, e "Mais um" ficou para o terceiro |
| A instrução do carimbo nos aprofundamentos falava em um botão Continuar que eles não têm | Reescrita: "O botão abaixo leva à fase seguinte deste aprofundamento ou, no fim dele, ao resumo" |
| A jornada "o carimbo é um só" só voltava à fase depois de recarregar, quando não havia mais estado que pudesse repetir a comemoração | A volta é feita antes, na mesma visita, e repetida na fase que trouxe o selo |
| Nenhum teste conferia a linha de aviso nas vias comuns, nem o nome do espaço carimbado | As jornadas conferem as duas coisas |
| O teste da frase da fase seguinte aceitava qualquer palavra terminada em ar, er, ir ou or | Lista fechada dos cinco verbos em uso |
| Documentos: a seção de resultados que ainda não existia, as capturas descritas antes de tiradas, "para as duas pessoas" onde só uma jornada roda para as duas, e as fichas do roteiro de validação com "1 a 19" | Esta seção; os documentos passaram a dizer que as capturas não foram tiradas; o alcance das jornadas dito como é; as fichas com "1 a 20" |

Ficou como está, declarado: duas frases de **A seguir** da trajetória de Flávio Bolsonaro usam pronome ("os últimos anos dele na Alerj", "como ele votou") onde as de Lula trazem o nome. É o objetivo publicado das fases, que a tela já mostrava no cabeçalho de cada fase e no resumo; trocar o pronome pelo nome é edição de conteúdo. E, em tela estreita, a faixa recebe o foco do teclado antes dos três caminhos que aparecem acima dela, porque o cartão vem antes deles no documento. Os dois refutados: uma fala de erro antiga que ligava carimbo a acerto, que hoje nunca é dita (foi reescrita mesmo assim), e a palavra "Agora" no fim das duas trajetórias, que podia sugerir conteúdo bloqueado (trocada por "Você pode").

**Segunda passagem, só sobre as correções.** Dois leitores de IA, um para a tela e as regras e um para os testes e os roteiros, de novo com um segundo leitor para refutar. Foram 7 apontamentos, 6 confirmados e 1 refutado, nenhum impeditivo; dois pares são o mesmo ponto visto pelos dois leitores. Um era visível na tela: depois de pedir a explicação, a resposta errada continuava marcada ao lado da certa, sem dizer que era a escolha da pessoa, e na ordenação os itens continuavam numerados na ordem errada. A escolha passou a sair quando a fase é concluída pela leitura. Os outros eram de teste e de comentário: nenhuma jornada conferia qual fala de humor a tela escolhe, nem que só uma região de aviso fala do carimbo, e dois comentários ainda descreviam o que o código não faz mais. A vez da fala virou regra pura, com teste, e as jornadas ganharam as duas conferências. O refutado pedia a frase exata em uma asserção que outra jornada já confere. **Não houve terceira passagem,** e três das quatro jornadas que ganharam asserções nesta rodada não chegaram a rodar em navegador na máquina (abaixo); rodaram na verificação contínua do GitHub, depois do envio, e passaram.

### Achados durante a construção

- **A assinatura de uma ordenação depende da ordem das chaves dos dados.** A página lê os dados gerados, gravados com as chaves em ordem alfabética, e a assinatura resume as datas dos registros como objetos. Um progresso montado pelo teste com os dados lidos direto das fontes era aceito em sete de oito fases, e a conclusão da ordenação era descartada. Não é defeito do jogo: quem joga recebe a assinatura da própria página. O apoio dos testes passou a tirar as assinaturas como o build as tira.
- **Os marcadores da faixa quebravam em duas linhas** no cartão mais estreito do computador, o da fase concluída. Apareceu olhando a captura. Ficaram com um tamanho só.
- **A caderneta abria rolada.** Com as páginas na ordem dos perfis, quem jogava a segunda via a própria página no alto, e o texto que explica o carimbo e a página da outra pessoa ficavam escondidos acima, enquanto quem jogava a primeira via as duas. A página de quem está em jogo passou a vir primeiro, para as duas pessoas, e a rolagem automática saiu.
- **O período quebrava no meio dentro do carimbo,** em 360 pixels ("1945 a" em uma linha, "1956" na outra). Passou a quebrar inteiro.

### Verificações feitas

Todas na máquina, em 12 de outubro de 2026, um comando pesado de cada vez. A coluna do meio diz sobre qual árvore: a **final**, ou a **anterior**, que é a de antes das correções da segunda passagem da revisão. A diferença entre as duas é pequena e está na lista de baixo.

| Verificação | Árvore | Resultado |
| --- | --- | --- |
| `npm run lint`, `npm run typecheck` | final | limpos |
| `npm run test` (Vitest) | final | 44 arquivos, 808 testes verdes (eram 43 e 784) |
| `npm run data:validate` | final | 0 erros, 6 pendências (os rascunhos), 0 avisos; a edição continua a 0.3.0, porque o conteúdo não mudou |
| `npm run build` e `npm run verify:export` | final | 54 páginas HTML, 324 arquivos conferidos, como antes: o passaporte não cria rota |
| `npm run test:export` | final | 38 de 38 |
| `npm run capturas:verificar`, `npm run game:coverage -- --check`, `npm run review:human -- --check` | final | 7 capturas íntegras; a matriz de cobertura e a lista de revisão em dia |
| Mutação à mão nas regras do passaporte | final | Onze regras quebradas de propósito, uma por vez (abrir vale carimbo, a contagem conta fase só aberta, o primeiro selo com duas fases, o selo das duas trajetórias com uma, o selo dito a cada carimbo, a confirmação sóbria, os selos fora da linha de aviso, a vez da fala, "Mais um" em primeiro, uma fala com o nome de uma das pessoas, "explicação lida" no espaço vazio): os testes de regra reprovam as onze |
| Jornadas sobre a exportação (`npm run test:journeys`, em três partes) | anterior | 264 de 264: 72 do jogo e 192 do atlas |
| Jornadas do jogo no servidor de desenvolvimento | anterior | 72 de 72 |
| Jornadas do jogo sobre a exportação | final | **Interrompida.** 18 passaram, entre elas, no bloco do ciclo de uma fase, a do ciclo com erro para as duas pessoas e a de ler a explicação no lugar de responder, que também pede a explicação depois de errar uma ordenação. O navegador de teste caiu por falta de memória, duas jornadas se perderam com ele, e 52 não rodaram. O Claude Code encerrou o comando em seguida, pelo mesmo motivo |
| Telas do passaporte, olhadas uma a uma | anterior | As dezessete do roteiro de capturas, tiradas para uma pasta de trabalho fora do repositório, em computador, em 390×844 e em 360×640, mais dezessete de uma sonda: a leitura sem o cenário em computador e em 360×640, o caminho de depois do erro, um aprofundamento em celular, o fim de uma trajetória incompleta, a ajuda e a entrada |
| Peso das páginas, pelo HTML e pelos arquivos de script e de estilo que ele cita, sem compressão | anterior | Página de uma trajetória (a de Lula): HTML de 289,1 para 296,4 kB e scripts de 715,8 para 733,5 kB, cerca de 2,5% a mais em cada; estilos de 61,7 para 63,2 kB. Página de um aprofundamento: HTML de 65,7 para 71,9 kB. Entrada do jogo: praticamente igual. É a saída local contra o endereço público, que estava no commit `f2efc28` quando foi medido, antes do envio desta entrega; não é medição de tempo de carregamento |
| Links relativos dos documentos | final | 41 documentos, 390 links, nenhum sem arquivo |
| Dados pessoais nos arquivos alterados | final | Busca por CPF, título de eleitor, e-mail e telefone nos 34 arquivos de texto alterados ou novos: nenhum dado pessoal. As únicas linhas que casam com os padrões são as duas deste documento que relatam as buscas. Nenhuma imagem mudou |

**O que mudou entre a árvore anterior e a final:** pedir a explicação passou a limpar a escolha feita na atividade; a vez da fala do carimbo saiu da casca para uma função pura, com o mesmo valor; dois comentários de código; quatro jornadas ganharam asserções (três do bloco do passaporte e, no bloco do ciclo de uma fase, a de ler a explicação no lugar de responder), e o teste de regras, um teste. Nenhuma peça de tela nova.

### O que não rodou

A verificação final foi interrompida em 12 de outubro de 2026, perto das 8h45: a memória da máquina, de 8 GB, acabou durante as jornadas do jogo sobre a exportação. O navegador de teste caiu, como o registro da rodada mostra, e o Claude Code encerrou o comando, com o aviso de que a memória estava crítica. Pela regra dele, a rodada só é retomada a pedido do responsável. A lista abaixo é a do que ficou por rodar na máquina. **Depois do envio, as jornadas e a passagem de acessibilidade rodaram no GitHub e passaram** (Envio, publicação e verificação contínua, abaixo); as capturas e `npm run measure:game` continuam sem rodar. Na máquina, ficou por rodar:

- **As jornadas de navegador sobre a árvore final:** as 54 do jogo que não completaram e as 192 do atlas, sobre a exportação, e as 285 no servidor de desenvolvimento. As asserções escritas na segunda passagem da revisão (a fala de humor que a tela escolhe, uma só região de aviso para o carimbo, a resposta errada que deixa de ficar marcada na pergunta) não rodaram em navegador na máquina.
- **`npm run audit:a11y`.** Na máquina, não rodou nenhuma vez desde o passaporte, e as três telas novas do roteiro não foram executadas ali: nem a medição de contraste e de alvos, nem a passagem de teclado, nem o próprio passo que percorre as duas trajetórias. A primeira execução foi a da verificação contínua do GitHub.
- **`npm run capture:game`.** As 114 imagens de `docs/capturas/jogo-trilha/` são anteriores ao passaporte, e o [README delas](capturas/README.md) diz isso.
- **As jornadas do atlas no servidor de desenvolvimento,** que, na máquina, não rodaram em nenhuma das duas árvores. As mesmas jornadas passaram sobre a exportação da árvore anterior.
- **`npm run measure:game`.** Não foi refeito. O passaporte não mexe no palco, mas o cartão da fase ficou mais alto.

A verificação contínua do GitHub, cujo resultado não era conhecido quando o texto que o commit `fac621e` traz foi escrito, rodou depois do envio e passou nos dois trabalhos (Envio, publicação e verificação contínua, abaixo). É ela que roda as suítes de navegador e a passagem de acessibilidade que aqui não terminaram; as capturas, ela não refaz.

Além disso, como em toda entrega do jogo: ninguém jogou; nenhum leitor de tela foi usado (a linha de aviso do carimbo, o nome de cada espaço e o que fica fora da árvore de acessibilidade foram conferidos por teste, e nada foi ouvido); nenhum aparelho real, Firefox ou Safari. O roteiro de validação ganhou a pergunta 20 e o passo 16 de celular real ([USER-VALIDATION.md](USER-VALIDATION.md)).

### Envio, publicação e verificação contínua

O commit `fac621e` foi enviado à `main` em 12 de outubro de 2026, às 9h08, a pedido do responsável pelo projeto. O que está abaixo foi conferido na mesma manhã, com assistência de IA, e escrito depois do envio: não faz parte daquele commit.

| O que aconteceu | Como foi conferido |
| --- | --- |
| O push publicou no endereço provisório, em pouco mais de três minutos | Consulta ao projeto na Vercel: a publicação de produção ligada a `https://atlas-politico.vercel.app/` veio do Git, do ramo `main` e do commit `fac621e`; foi criada às 9h10, dois minutos e meio depois do push, e ficou pronta às 9h11. Pedidos HTTP: às 9h08 e às 9h09, a página da trajetória de Lula ainda não trazia a faixa **Meu passaporte**; às 9h11, trazia |
| O que está no ar tem o passaporte, e continua sem indexação | Pedidos HTTP às 9h20: a entrada, a entrada do jogo, as duas trajetórias, um aprofundamento de cada pessoa, a comparação, a metodologia e as páginas das duas pessoas responderam 200, e um endereço que não existe, 404. Todas levam `noindex`, e o `robots.txt`, `Disallow: /`. As duas trajetórias e os dois aprofundamentos trazem a faixa; a entrada do jogo traz o passo do passaporte em Como funciona; a página da trajetória de Lula traz a frase do rodapé e, como o HTML do build, nenhuma contagem; a metodologia continua com a edição 0.3.0. Foi conferido só o HTML: nenhuma captura do endereço público foi tirada depois deste envio |
| A verificação contínua do GitHub passou nos dois trabalhos | Execução 38247124589, do commit `fac621e`. Regras, build e exportação, terminada às 9h25: 808 testes de regra, build e conferência da saída com 54 páginas, 38 testes de carregamento, 264 jornadas sobre a exportação, a passagem de acessibilidade, a matriz de cobertura e a lista de revisão em dia e 7 capturas íntegras. Jornadas no servidor de desenvolvimento, terminada às 9h20: 285 de 285 |
| As três jornadas do passaporte que ganharam asserções na segunda passagem da revisão rodaram com elas em navegador pela primeira vez, e passaram | Estão entre as 264 e as 285 da linha de cima, nos dois trabalhos, e contam como quatro em cada um, porque a de concluir pela resposta roda uma vez para cada pessoa. A quarta jornada que ganhou asserções é de fora do bloco do passaporte: a do ciclo de uma fase em que ler a explicação no lugar de responder libera a fase seguinte. Essa já tinha passado na máquina, na rodada interrompida. É a primeira rodada completa das suítes de navegador sobre a árvore final |
| A passagem de acessibilidade rodou pela primeira vez com as telas do passaporte, sem falha | Registro da execução: 112 telas (28 em 4 larguras) e 28 passagens de teclado sem falha, com 1.142 paradas de teclado, todas com foco visível. As três telas novas, nas quatro larguras: nenhum contraste abaixo do mínimo (o menor é 7,55:1), nenhuma rolagem lateral, nenhum alvo abaixo de 24 pixels, nenhum erro de console; 23, 10 e 21 paradas de teclado. O menor contraste da passagem inteira é 5,24:1, e os alvos abaixo de 24 pixels somam 15, todos em telas do atlas: são os números da última passagem feita na máquina antes do passaporte |
| O que continua sem rodar | As capturas de `docs/capturas/jogo-trilha/`, que são as 114 anteriores ao passaporte, e `npm run measure:game`. Na máquina, a rodada de navegador sobre a árvore final não terminou: a evidência dela é a do GitHub |

### Limitações conhecidas

- **Quem jogou antes da trilha não recebe carimbo pelo que tinha feito.** O progresso dos formatos 1 a 5 migra com a marca "período visto na versão anterior", e a fase nova não é dada como concluída (D-135). A caderneta diz isso no espaço da fase. Quem concluiu fases no formato 6, o da trilha, encontra os carimbos delas sem fazer nada.
- **Uma fase reaberta por correção do conteúdo perde o carimbo** até ser concluída de novo, e um selo que dependia dela sai junto (D-130).
- **A confirmação sóbria aparece em três fases da trajetória de Lula, no aprofundamento de Segurança pública dele e em uma fase da trajetória de Flávio Bolsonaro,** porque é isso que a lista de contexto sensível pega (D-142). Nelas o texto diz "Fase registrada no seu passaporte" no lugar de "Marco registrado", e não há humor. O carimbo, a batida e os selos são os mesmos. Reduzir ou ampliar a lista é decisão do responsável.
- **Duas frases de A seguir da trajetória de Flávio Bolsonaro usam pronome** onde as de Lula trazem o nome (acima). Pede uma edição de conteúdo.
- **Não há selo de exploração dos registros opcionais,** porque o progresso não guarda quais foram abertos.
- **Depois de um erro, seguir custa um toque a mais** do que antes (D-150).
- **Em celular, o botão Continuar fica mais longe depois de concluir.** A confirmação do carimbo e o bloco A seguir entram entre a explicação da resposta e o botão, que já ficava abaixo da primeira tela da janela. O foco do teclado vai para ele.
- **Sem armazenamento, os carimbos valem enquanto a página estiver aberta.** A caderneta avisa.
- **A caderneta lê o progresso da outra pessoa uma vez, ao abrir a página.** Com duas abas, o que uma concluiu só aparece na outra depois de recarregar.
- **Em 360 pixels, um título longo quebra em três linhas dentro do carimbo,** na caderneta de duas colunas.
- **Em tela estreita, a ordem do teclado não segue a da tela no alto da cena:** a faixa vem antes dos três caminhos que aparecem acima dela. A inversão já existia nos casos em que o cartão tinha um controle, e passou a valer sempre.
- **O laranja do atlas, antes reservado ao que pede ação, é também a tinta do carimbo** e dos marcadores cheios. É escolha de desenho, igual para as duas pessoas.
- **Os nomes dos selos, as confirmações e as falas novas foram escritos com assistência de IA.** Nenhuma pessoa os aprovou.

### Pendências

1. **Refazer as capturas.** A verificação contínua do GitHub passou para o commit `fac621e` (Envio, publicação e verificação contínua), e é a primeira rodada completa das jornadas e da passagem de acessibilidade sobre a árvore final. Falta o que ela não faz: refazer as capturas de `docs/capturas/jogo-trilha/` (`npm run capture:game`), na máquina, a pedido do responsável e com os outros programas fechados, olhar as que mudaram e acertar o [README delas](capturas/README.md). `npm run measure:game` também não foi refeito.
2. **De uma pessoa:** ler e aprovar os nomes dos selos, as confirmações e as sete falas do carimbo; jogar em celular real (passo 16 de [USER-VALIDATION.md](USER-VALIDATION.md)); e, na validação com três pessoas, a pergunta 20.
3. **Decisões do responsável pelo projeto:** manter ou desfazer o toque a mais depois de um erro; e a lista de contexto sensível, que decide onde a confirmação é a sóbria.
4. **Para uma edição de conteúdo:** o nome no lugar do pronome nos objetivos de duas fases da trajetória de Flávio Bolsonaro.
## Trilha simples do jogo e edição 0.3.0 (11 de outubro de 2026)

Em 11 de outubro de 2026 o responsável pelo projeto trouxe uma análise do site com um pedido: trocar o jogo de exploração por uma trilha educativa simples, para as duas pessoas, que quem conhece pouco de política consiga seguir sozinho. O que mudou e por quê está em [GAME-TRAIL.md](GAME-TRAIL.md); as regras em vigor, em [GAMEPLAY.md](GAMEPLAY.md); as decisões, em [DECISIONS.md](DECISIONS.md), D-133 a D-149; a pesquisa do conteúdo novo, em [../research/trilha-2026-10.md](../research/trilha-2026-10.md).

**Situação desta entrega:** implementada e verificada na máquina, com assistência de IA, em 11 de outubro de 2026. No mesmo dia, o responsável pelo projeto pediu o commit e o envio à `main`, informado de que o push pode publicar no endereço provisório (D-147, [DEPLOY.md](DEPLOY.md)). Antes do envio, a árvore passou por uma revisão independente em três passagens e uma conferência curta das últimas correções, em 11 e 12 de outubro, também com assistência de IA, e o que elas confirmaram como erro foi corrigido (seção Revisão independente antes do envio, D-149). O envio foi feito na madrugada de 12 de outubro de 2026 (commit `f2efc28`), e o push publicou: a publicação ficou pronta na Vercel em menos de um minuto, e o endereço provisório, que mostrava a edição 0.2.1, passou a mostrar a edição 0.3.0 e a trilha, ainda sem indexação. A verificação contínua desse commit terminou vermelha em um passo, a passagem de acessibilidade, por um defeito do roteiro de medição, e não do site (seção Depois do envio). Nenhuma pessoa revisou o conteúdo novo, nenhuma pessoa jogou em sessão de validação e nenhum aparelho real foi usado.

### O que o pedido listou e como ficou

| Item do pedido | Situação | O que foi feito |
| --- | --- | --- |
| A trajetória começava em 1975 e em 2002, sem a origem | Feito | Cada trajetória tem nove fases e começa pela origem: 1945, para Lula, e 1981, para Flávio Bolsonaro. São 14 fatos biográficos, só de documento oficial ou de agência pública, com as divergências entre documentos escritas (o nascimento de Lula fica no mês) |
| O relato de "entrar em 2025" | Investigado | Não se reproduz em partida nova. Dois caminhos do jogo anterior levavam a 2025 sem defeito: o botão de uma sala temática, na entrada, e a volta com progresso salvo. A trilha apresenta as salas como aprofundamento, diz a fase e o ano em cada botão e avisa quem cai onde tinha parado. Um defeito da própria trilha, achado na construção e corrigido antes de qualquer publicação, fazia "Ver desde o início" abrir a fase da retomada ([GAME-TRAIL.md](GAME-TRAIL.md), D-139) |
| A porta continuava fechada depois de "Tarefa concluída" | Feito | Não há coleta nem saída. Responder a atividade, ou ler a explicação dela, libera **Continuar**; os outros registros ficam em "Explorar este período" e não seguram nada. Nenhuma fase é bloqueada (D-133) |
| Faltava a atuação nos primeiros governos de Lula e nos mandatos estaduais de Flávio Bolsonaro | Feito, como amostra declarada | Onze atos de 2003 a 2010; oito leis estaduais de autoria individual e uma relatoria no Congresso, em um tipo novo de registro, a atuação legislativa (D-136, D-143). Cada parte tem a regra de escolha escrita, e o registro da pesquisa diz o que não comprova |
| O jogador precisava aprender a andar, alcançar e recolher | Feito | Ninguém dirige o boneco. As pastas são botões da página; tocar no marco faz o boneco andar até ele, por enfeite, e abre a explicação (D-137) |
| Os conceitos precisavam vir antes das perguntas | Feito em parte | 26 termos, cada um com a definição simples, o aviso do que ela simplifica e o texto oficial que a sustenta, definidos na fase em que aparecem pela primeira vez; cinco termos ficaram sem definição ou aparecem antes dela, e estão nas limitações. A pergunta só usa o que a explicação acabou de dizer, e um teste confere |
| Seis entradas com o mesmo peso | Feito | Duas escolhas iguais, com o caminho antes da prévia do cenário; os aprofundamentos ficam abaixo, com os anos (D-145) |
| A comparação era longa, sem uma síntese | Feito | O resumo por cargo e por área, que diz o tipo de registro e nunca a quantidade, com as sete áreas à vista e as propostas por área (D-141) |
| "Ler sem o cenário", com os mesmos fatos | Feito | A trilha inteira sem o palco, que é também o caminho quando o canvas falha; sem JavaScript, as fases vão no HTML, em texto (D-146) |
| Fim com o que foi aprendido, as lacunas e os caminhos, sem troféu | Feito | O resumo de cada sala |
| Economia e Segurança pública como aprofundamento, com a volta ao início da vida | Feito | Uma fase por pessoa e tema, apresentada pelo assunto e pelos anos, com **Ir para o início da vida** |
| Matriz de cobertura, com o motivo da seleção | Feito em parte | A matriz é gerada dos dados ([GAME-COVERAGE.md](GAME-COVERAGE.md)) e separa "acessível no jogo" de "obrigatório para avançar". O motivo das amostras está na nota de pesquisa. O motivo da escolha de cada marco não foi registrado: os marcos foram escolhidos na redação das fases |
| Propostas oficiais, só com o documento do TSE aberto | Feito | 42 frases, três por área de cada documento registrado, com a página (D-138). Onde não há proposta, a tela diz "Ainda não pesquisado nesta edição" |
| Título compreensível antes do número técnico da norma | Feito em parte | O título de cada fase é o título compreensível, e vem antes de qualquer número. Em sete das 22 fases o marco é um ato do Executivo ou uma votação, e a caixa do marco mostra o nome oficial da norma ou da votação; a explicação logo abaixo diz o que ela é. Um rótulo simples para cada ato e cada votação é texto novo sobre as duas pessoas e pede uma edição de conteúdo |
| Escrivão com uma instrução curta e, no máximo, uma piada | Feito | Duas camadas, sem repetir fato; sem humor em contexto sensível (D-133, D-142) |
| Progresso antigo migrado sem limpeza e sem dar aprendizado novo como feito | Feito | Formato 6, com o salvo anterior guardado inteiro e a marca "período visto na versão anterior" (D-135) |
| Celular de 360 a 390 pixels, alvos de 44 por 44, teclado, movimento reduzido | Feito em emulação | A cena inteira cabe entre o cartão da fase e o botão principal; todo controle das telas do jogo tem 44 pixels, medido um a um (D-148); o ciclo inteiro pelo teclado; a caminhada não acontece com movimento reduzido. Aparelho real e leitor de tela: não usados |
| Meta de sete a nove fases e de 10 a 15 minutos por trajetória | Fases: feito. Tempo: **não medido** | Nove fases por pessoa. O tempo é meta de desenho; ninguém jogou com um relógio |
| Celular físico e roteiro de compreensão com três pessoas | **Não feito** | Não havia aparelho nem pessoas nesta sessão. O roteiro está pronto em [USER-VALIDATION.md](USER-VALIDATION.md): a tarefa 5, as perguntas 12 a 19 e os quinze passos de celular real |
| Publicação fica para a etapa de lançamento | Mudou por decisão do responsável | A entrega não publicou nada, e o endereço provisório, que é anterior, mostrava a edição 0.2.1. Depois dela, em 11 de outubro de 2026, o responsável pediu o commit e o envio à `main`, informado de que o push pode publicar (D-147). O envio, na madrugada de 12 de outubro, publicou a edição 0.3.0 no endereço provisório (seção Depois do envio) |

### O que mudou, por parte

- **Conteúdo, edição 0.3.0.** Cinco coleções novas no conjunto: fases do jogo (22), fatos biográficos (14), conceitos (26), atuações legislativas (9) e propostas eleitorais (42). Mais 11 atos do Executivo, 8 proposições, 3 declarações de cobertura e 74 fontes. O formato gerado passou a 4. Nenhum acontecimento novo: as duas pessoas continuam com vinte, o teto da política editorial, e duas candidaturas de Lula (1982 e 1998) ficaram em rascunho (D-144).
- **Jogo.** As regras em `src/lib/game/trail.ts`; o progresso no formato 6, com a migração em `legacy.ts`; o endereço em `query.ts`; a apresentação de cada fase em `presentation.ts`; o caminho do boneco e a câmera em `world/`. Saíram `mission.ts`, `chapters.ts`, o painel de capítulos, a colisão por movimento, o direcional e o botão de ação.
- **Atlas.** O cartão de decisão ganhou a terceira natureza; a página da pessoa e a comparação mostram as atuações legislativas e o grupo "Outros assuntos"; a comparação ganhou o resumo e as propostas por área; a metodologia ganhou a seção dos tipos de registro. O aviso fixo das decisões deixou de dar um critério só para a amostra inteira.
- **Documentos.** Reescritos ou atualizados: GAMEPLAY, GAME-TRAIL, DECISIONS, EDITORIAL, DATA_MODEL, DATA-PIPELINE, COMPARISON, ARCHITECTURE, UX, PAGES, USER-VALIDATION, PERFORMANCE, QA, DEPLOY, os dois README e os de capturas e de evidências. GAME-RELEASE e VOTOS-E-ESCRIVAO ficaram como histórico, com o aviso no alto.

### Achados durante a verificação, e o que foi feito

- **A contagem de atos na cobertura da edição estava desatualizada** depois de o Decreto nº 5.090, de 2004, entrar na amostra, e o aviso fixo das decisões dizia que a amostra inteira tinha um critério só, o da edição 0.2.0. Os dois textos foram corrigidos: dezessete atos, e a regra de cada parte dita na metodologia.
- **Links com menos de 44 pixels em celular.** O teste de celular media uma lista de controles escolhidos à mão, e a passagem de acessibilidade deixa de fora os links de texto. Uma medição de todos os controles achou os caminhos do resumo e da lista de fases, "Ir para o início da vida" na leitura sem o cenário e os títulos dos documentos com 17 a 37 pixels de altura. Corrigido, com uma jornada nova que mede tudo; sem a correção, ela reprova (conferido por mutação).
- **Uma pasta ficava atrás da porta.** Na sala de audiências da fase 6 de Flávio Bolsonaro, uma pasta opcional saía cortada pela verga do portal. Apareceu olhando a captura da cena: o teste só recusava pasta colada à porta. A pasta foi para o meio da frente da sala, e o teste das cenas passou a recusar pasta atrás da porta; com a pasta de volta ao lugar antigo, ele reprova (conferido por mutação).
- **A cadência "durante a caminhada" do medidor** amostrava um segundo fixo depois do toque, e a caminhada pode acabar antes: entravam quadros da cena já parada. O medidor passou a amostrar só enquanto o boneco anda, e a medir também uma fase pedida pelo endereço e a leitura sem o cenário.
- **Na lista "Explorar este período", uma lei aparecia só pelo número.** A linha passou a trazer a área e a ementa da proposição, que já estavam nos dados. Um decreto, que não tem proposição, continua só com o nome e a área.
- **Sobras do jogo anterior no código:** comentários que falavam em capítulo e em recolher, e o efeito de recolher, que nenhuma tela usava. Removidos. O roteiro da matriz de cobertura passou a conferir também as decisões e as áreas das propostas, como o teste já fazia.
- **Uma correção tentada e desfeita.** Nas duas entradas, em celular, um link com altura de toque no fim de uma frase ("Metodologia e fontes", na do jogo; "Como é o jogo", na do atlas) deixa a última linha mais alta que as outras. Pôr o link em linha própria resolvia isso, mas na tela de 360 por 640 empurrava o botão de começar para fora da primeira tela, e a jornada que confere isso reprovou. A mudança foi desfeita: o botão na primeira tela vale mais que a entrelinha. Fica nas pendências.

### Revisão independente antes do envio

Como o envio à `main` pode publicar, a árvore passou antes por uma revisão só de leitura, com assistência de IA: quatro leitores, um para cada recorte (documentos, fases, registros e código), e um segundo leitor para tentar refutar cada apontamento. Não é revisão humana, e não substitui a de [HUMAN-REVIEW.md](HUMAN-REVIEW.md). Foram 40 apontamentos, 36 confirmados e 4 refutados; alguns são o mesmo ponto visto por dois leitores. A regra que mudou está na D-149.

| Recorte | Confirmados | O que foi corrigido antes do envio |
| --- | --- | --- |
| Registros | 9 | **O único apontamento impeditivo:** os avisos "o trecho não traz número" estavam em oito frases do documento de Flávio Bolsonaro e em duas do de Lula, com dezesseis frases nessa situação em cada um. As 42 frases ficaram sem ressalva, e o aviso passou a ser um só, no texto fixo das telas. Também: três leis promulgadas diziam que a página "não diz o motivo", e a página cita os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que não foram lidos; a cobertura dos atos de 2003 a 2010 prometia um motivo de exclusão que a pesquisa não registrou; uma fala de humor citava uma funcionária inventada, logo depois da fase dos estágios; quatro observações de revisão afirmavam o que nenhum trecho guardado sustenta (três passaram a dizer que a origem do projeto foi lida nos dados abertos da Câmara, sem trecho nas evidências, e uma perdeu o nome do tribunal); três frases de proposta se afastavam do trecho; o termo sindicato citava uma das pessoas pelo nome |
| Fases | 9 | A fase de processos de Flávio Bolsonaro punha a denúncia em novembro de 2020 (o registro diz que foi apresentada em outubro e divulgada em 4 de novembro) e parava em 2022: passou a trazer, com o nome de quem noticiou, o recurso negado em fevereiro de 2025. A fase de processos de Lula não diz quem acusou, e passou a declarar isso como lacuna. Uma pergunta sobre o relator vinha sem a explicação do termo. Uma lacuna dizia que os documentos divergem onde o registro diz que o documento não informa. "Imposto" virou "tributo" onde o registro fala em contribuição. Uma fórmula de lei entre aspas não era a literal |
| Código | 9 | Na leitura sem o cenário, apagar o progresso deixava a atividade travada, com a resposta antiga na tela. Uma ordenação aparecia já na ordem certa. A assinatura de uma ordenação mudava com a ordem em que a fase escreve os itens. O título de um termo ia para minúsculas ("pec"). O caminho para o início da vida recarregava a página na leitura sem o cenário. Os testes passaram a conferir que a pergunta só aponta termo da própria fase e que os registros de "Explorar este período" caem nos anos da fase |
| Documentos | 9 | A metodologia dizia que todas as fontes foram abertas de novo na última conferência, e isso vale para a de 9 de outubro: os registros que entraram depois foram conferidos contra os documentos baixados no dia em que entraram. A regra de divergência dos fatos biográficos estava escrita como absoluta, e alguns registros adotam uma versão: a regra passou a dizer isso. O link das propostas prometia "todas". Referências e termos antigos em quatro documentos |

Os quatro refutados: a falta da situação atual dos processos de Lula (a fase a declara como lacuna, e os registros não a trazem); a diferença de regra entre as amostras de decisões, que é escolha editorial registrada (D-143) e está nas limitações; e dois sobre a lista de contexto sensível, que é por identificador (D-142): a indicação de 2025 para a Presidência, que cita a condenação de um terceiro, e a greve de 1979, que cita repressão policial, um registro de cada pessoa, ficam fora dela e seguem com humor. Pô-los ou não na lista é decisão do responsável pelo projeto, e está nas pendências.

**Segunda passagem, sobre a árvore já corrigida.** Outros leitores, também de IA, conferiram um por um os 40 apontamentos e fizeram um olhar novo só para diferença de tratamento entre as duas pessoas, de novo com um segundo leitor para refutar. Os 36 confirmados estavam resolvidos ou declarados como limitação. Vieram 37 apontamentos novos: 29 confirmados, 7 refutados e 1 sem decisão. O único classificado como impeditivo eram as capturas de `docs/capturas/jogo-trilha/`, tiradas antes das correções: quando foi apontado, elas já tinham sido refeitas, e o segundo leitor o refutou. O que essa passagem mudou:

- **Fases de processos, na mesma régua.** A de Lula passou a trazer a decisão que declarou a suspeição do juiz no caso do triplex, que o registro apontado já trazia. Para caber no limite de palavras, o envio dos processos à Justiça Federal do Distrito Federal foi para a explicação da atividade, como já tinha acontecido na de Flávio Bolsonaro com a frase sobre novas investigações. Os títulos ficaram na mesma fórmula: "Condenação, prisão e anulação" e "Denúncia, anulação e rejeição". Na de Flávio Bolsonaro, a rejeição da denúncia ficou no ano, porque o registro só data a divulgação da decisão.
- **Número de fonte única leva o nome da fonte.** Cinco números das fases de Lula que vêm só das biografias publicadas pela Presidência (os 13 dias de viagem, os 92% dos votos no sindicato, os 170 mil grevistas, os 31 dias de prisão e os quase 53 milhões de votos de 2002) passaram a dizer isso, como o percentual de 2018 de Flávio Bolsonaro já dizia da Agência Senado. A terceira passagem achou mais dois números e acertou a fórmula e o alcance da regra.
- **Propostas.** Uma palavra trocada voltou a ser a do documento ("interoperável"). Uma frase de Lula saiu do futuro certo para a fórmula comum. Dois resumos, um de cada documento, foram completados: a condição de consentimento, LGPD e sigilo no prontuário eletrônico, no de Flávio Bolsonaro, e as outras quatro frentes do programa contra o crime organizado, no de Lula. As duas frases que usam um trecho de outra página, uma de cada documento, passaram a ter a localização dos dois na citação; outras duas, do documento de Lula, tiram de uma frase vizinha da mesma página o nome do programa e o do pacto.
- **Busca de divergência interna, igual para os dois documentos.** Dois leitores de IA, um por documento, procuraram trechos que divergissem das 42 frases, e um segundo leitor conferiu cada ponto: 37 confirmados, 23 no documento de Lula e 14 no de Flávio Bolsonaro. Nenhum contradiz uma frase do atlas. Quase todos são frases vizinhas que acrescentam alcance, instrumento ou número à medida resumida. Um só é a mesma medida dita com dois alcances no mesmo documento (a tornozeleira eletrônica, nas páginas 14 e 19 do de Flávio Bolsonaro), e a frase do atlas diz os dois. Seis pontos confirmados são parte da própria frase resumida, quatro no documento de Lula e dois no de Flávio Bolsonaro: foram completados os dois em que o corte tirava a condição da medida ou quase toda a lista de medidas, e os outros estão nas limitações.
- **Escrivão.** A fala de humor do primeiro erro falava em aniversário comemorado no mês errado e caía na fase do nascimento de Lula, em que os documentos divergem sobre o dia. Foi trocada, e a validação recusa humor com nascimento ou aniversário; a fala nova foi trocada de novo na terceira e na quarta passagens. As instruções de erro diziam "a explicação abaixo", e ela fica acima.
- **Jogo.** Na leitura sem o cenário, errar na última fase e ver o resumo deixava a fase com o aviso do erro, sem botão para tentar de novo. E "Como funciona" mandava tocar em uma pasta que esse modo não tem.
- **Testes e documentos.** Saiu uma asserção que não podia falhar, dois títulos de teste prometiam o que o teste não confere, e sete trechos de documentos foram alinhados ao que a árvore faz.

Refutados na segunda passagem, além das capturas: a pergunta de 2016 da trilha de Flávio Bolsonaro, cuja resposta é uma eleição perdida (a trilha de Lula tem pergunta do mesmo tipo, sobre o veto derrubado); o humor da sala de Segurança pública, que é escolha registrada (D-129, D-142) e foi para as pendências; os anos citados no termo sindicato; a lista de papéis da validação do humor; o mês da decisão de 2025, que vem do registro; e o estado civil em um trecho guardado do registro de candidatura de 2002, que saiu assim mesmo. Ficou sem decisão a meia-risca dentro da ementa literal de uma lei estadual, que continua como o documento a traz.

**Terceira passagem, só sobre o que a segunda mudou.** Três leitores de IA, um para o conteúdo, um para o código e um para os documentos, conferiram a segunda rodada de correções, de novo com um segundo leitor para refutar. Foram 23 apontamentos, nenhum impeditivo. O segundo leitor confirmou os 23: dez no conteúdo, sete no código e seis nos documentos. O que eles mostraram foi, sobretudo, onde as regras novas ainda não valiam por igual:

- **A atribuição do número.** Sobravam o "sétimo de oito irmãos", na trilha de Lula, e o placar de uma votação do Senado, na de Flávio Bolsonaro, sem o nome da fonte. E a fórmula não era a mesma: na trilha de Lula a fonte vinha no fim da frase do fato, e podia ser lida como dúvida sobre a eleição ou sobre a prisão; na de Flávio Bolsonaro, em frase própria. Ficou em frase própria nos dois lados, e a regra passou a dizer o alcance dela: número que vem só de fonte ligada à instituição da própria pessoa.
- **O número como o registro o escreve.** A fase de processos de Flávio Bolsonaro dizia "outras 16 pessoas", e o registro diz "Fabrício Queiroz e outras 15 pessoas": a contagem saiu da frase. A frase do curso do Senai dizia "Em São Paulo", e os registros não dizem onde foi o curso.
- **Propostas.** A frase das frentes do programa contra o crime organizado, ao ser completada, tinha perdido dois itens e ganhado uma contagem que o documento não traz: voltou aos itens do documento. A regra do corte estava escrita como absoluta e passou a dizer o que foi aplicado: condição da medida e lista de medidas.
- **Escrivão e jogo.** A fala nova do primeiro erro ainda falava em datas, e foi trocada por uma sem data nenhuma. A instrução de conclusão falava em "período seguinte" também na última fase. Na leitura sem o cenário, fechar o resumo depois de um erro na última fase deixava o foco no corpo da página.
- **Testes.** A expressão que recusa futuro certo nas propostas não pegava "terá" nem "será", por causa do acento, e ganhou um controle positivo. Três títulos de teste ainda prometiam mais do que o teste confere.
- **Documentos.** As contagens e as datas deste relato, a regra de atribuição e a do corte, e a frase que dizia que um teste confere todo número das fases.

O estado final da regra do número: seis números das fases de Lula (o sétimo de oito irmãos, os 13 dias de viagem, os 92% dos votos no sindicato, os 170 mil grevistas, os 31 dias de prisão e os quase 53 milhões de votos de 2002) dizem que são das biografias publicadas pela Presidência, e dois da trilha de Flávio Bolsonaro (o percentual de 2018 e o placar de uma votação) dizem que são da Agência Senado, sempre em frase própria.

**Quarta passagem, curta, sobre as correções da terceira.** Dois leitores de IA, com um segundo leitor para refutar: nove apontamentos, todos confirmados, nenhum impeditivo e nenhum erro de fato nos trechos mudados. O que mudou:

- **Três frases do documento de Flávio Bolsonaro ficavam com uma de duas medidas coordenadas na mesma frase:** as escolas cívico-militares sem o atendimento ao aluno com altas habilidades, a meta de desmatamento sem o combate às queimadas, e o mercado de carbono sem a bioeconomia. Os resumos do documento de Lula já traziam as duas medidas. As três foram completadas, e a regra passou a dizer isso: o resumo traz todas as medidas que a frase propõe.
- **Três falas de humor.** A do primeiro erro, com "três gavetas", caía na fase das três eleições que Lula perdeu, e duas da primeira fase falavam em datas. Foram trocadas por falas sem data e sem contagem.
- **Testes.** Dois títulos de teste e a expressão que recusa futuro do indicativo nas propostas, que só pegava os verbos ter e ser.
- **Este relato.** O parágrafo da segunda passagem tinha passado a descrever o que só a terceira fez.

Ficou declarado nas limitações, sem correção: a diferença de forma entre os resumos dos dois documentos e a falta de trecho guardado para um percentual do primeiro turno de 2026.

### Verificações feitas

Todas sobre a árvore final, depois das correções de todas as passagens da revisão, na madrugada de 12 de outubro de 2026, um comando pesado de cada vez. As exceções estão ditas na linha: a medição de desempenho é anterior às correções da revisão. Os registros levam a data de revisão de 11 de outubro, que é a dos documentos baixados; as últimas correções de texto são da madrugada do dia 12.

| Verificação | Resultado |
| --- | --- |
| `npm run lint`, `npm run typecheck` | limpos |
| `npm run test` (Vitest) | 43 arquivos, 784 testes verdes |
| `npm run data:validate` | 0 erros, 6 pendências (os rascunhos), 0 avisos; edição 0.3.0, formato gerado 4 |
| `npm run build` e `npm run verify:export` | 54 páginas HTML, 324 arquivos conferidos |
| `npm run test:export` | 38 de 38 |
| Jornadas sobre a exportação (`npm run test:journeys`, em três partes) | 244 de 244: 52 do jogo e 192 do atlas |
| Jornadas no servidor de desenvolvimento (`npm run test:e2e`, em três partes) | 265 de 265: 52 do jogo e 213 do atlas e das telas de prova |
| `npm run audit:a11y` | 100 telas (25 em 4 larguras) e 25 passagens de teclado sem falha: nenhum erro de console, nenhuma rolagem lateral, nenhum contraste abaixo do mínimo. Menor contraste de 5,24:1 no atlas e na entrada do jogo, 7,55:1 nas telas do jogo com cena e 6,87:1 na resposta errada. 1.080 paradas de teclado, todas com foco visível. A comparação com período foi medida só em parte nessa rodada, e inteira depois (seção Depois do envio) |
| `npm run capturas:verificar` | 7 capturas íntegras |
| `npm run game:coverage -- --check`, `npm run review:human -- --check` | em dia |
| `npm run verify:release` | recusa, como esperado: 17 condições (229 registros sem revisão humana, em 15 coleções; domínio e canal de correção sem valor) e 2 avisos (indexação desligada e falta de licença) |
| Mutação à mão | Feita antes das correções da revisão: sem a altura de toque dos caminhos, a jornada dos 44 pixels reprova; com a pasta atrás da porta, o teste das cenas reprova |
| `npm run measure:game -- --rotulo trilha-2026-10-11` | Sete páginas em dois perfis. O LCP das páginas com cena voltou a coincidir com o primeiro desenho (celular emulado: de 2,3 a 2,4 s para 1,07 a 1,16 s). A leitura sem o cenário pedida pelo endereço fica em 2,34 s no celular emulado. Cena parada de 23 a 27 quadros por segundo no celular emulado, e 60 com a janela da fase aberta. Números e leitura em [PERFORMANCE.md](PERFORMANCE.md). A medição é anterior à troca de lugar de uma pasta e às correções da revisão, e não foi refeita |
| Capturas de `docs/capturas/jogo-trilha/` | 114, refeitas sobre o build final depois de cada rodada de correções. Na primeira rodada, as que mudaram foram olhadas uma a uma; nas seguintes, uma de cada tipo de tela que mudou, com as frases novas conferidas também no HTML exportado |
| Dados pessoais nos arquivos alterados | Busca por CPF, título de eleitor, e-mail e telefone nos 166 arquivos de texto alterados: 39 ocorrências dos padrões, todas lidas, e nenhuma é dado pessoal. São identificadores de candidatura e de arquivo em endereços públicos do TSE, a palavra CPF dentro de um texto, inclusive em uma frase de proposta, e um e-mail de teste. Um trecho guardado do registro de candidatura de 2002 trazia o estado civil, que nenhum registro usa, e foi cortado. Os documentos baixados na pesquisa, que têm esses dados, ficaram fora do repositório |
| Endereço provisório, por HTTP, antes do envio | Respondia com a edição 0.2.1 e o jogo anterior, com `noindex` e `robots.txt` bloqueando tudo, conferido de novo na madrugada de 12 de outubro de 2026. Nada desta entrega estava no ar |

### Depois do envio

O commit `f2efc28` foi enviado à `main` em 12 de outubro de 2026, à 1h30, a pedido do responsável pelo projeto. O que está abaixo foi conferido na mesma madrugada, com assistência de IA.

| O que aconteceu | Como foi conferido |
| --- | --- |
| O push publicou no endereço provisório | Consulta ao projeto na Vercel: a publicação de produção ligada a `https://atlas-politico.vercel.app/` veio do Git, do ramo `main` e do commit `f2efc28`, foi criada à 1h30 e ficou pronta à 1h31, menos de um minuto depois do envio. Pedidos HTTP: à 1h29, antes do envio, a metodologia do endereço trazia a edição 0.2.1; à 1h32, a edição 0.3.0 |
| O que está no ar é a trilha, sem indexação | Pedidos HTTP, repetidos depois das 2h: a entrada, a entrada do jogo, as duas trajetórias, um aprofundamento de cada pessoa, a comparação, a metodologia e as páginas das duas pessoas responderam 200, e um endereço que não existe, 404. As páginas levam `noindex, nofollow`, e o `robots.txt`, `Disallow: /`. Os textos novos estão lá, e o painel **Capítulos e tarefas**, do jogo anterior, não |
| O que a pessoa recebe | Sete capturas do endereço público em um Chromium sem interface, cinco em computador e duas em celular emulado, olhadas uma a uma: a entrada do jogo, a cena e a fase aberta da primeira fase de Lula, a sexta fase de Flávio Bolsonaro aberta, as propostas na comparação, a cena da primeira fase de Flávio Bolsonaro e a sétima fase de Lula na leitura sem o cenário. O roteiro das capturas foi repetido às 5h55, com a saída guardada e as sete capturas olhadas de novo: nenhum erro de página nem de console. Não é aparelho real |
| Verificação contínua no GitHub, commit `f2efc28` | **Vermelha em um dos dois trabalhos.** Jornadas no servidor de desenvolvimento: verde, 265 de 265. Regras, build e exportação: lint, tipos, 784 testes de regra, build e conferência da saída, 38 testes de carregamento e 244 jornadas sobre a exportação passaram; a passagem de acessibilidade reprovou uma tela, a da leitura sem o cenário, em duas das quatro larguras (1440 e 390 pixels); a conferência da matriz de cobertura e da lista de revisão e a da integridade das capturas não rodaram, porque vêm depois do passo que reprovou |
| A causa da reprovação é do roteiro de medição, e não do site | O roteiro abria a tela, limpava o armazenamento do navegador e recarregava. Na leitura pedida pelo endereço, a página guarda o pedido como preferência e tira `leitura=1` do endereço: quando ela terminava isso antes da limpeza, a preferência era apagada, e o recarregamento abria a cena. As capturas guardadas pelo GitHub mostram a cena no lugar da leitura nas duas larguras reprovadas. A ordem que falha foi reproduzida na máquina, de propósito, nas mesmas duas larguras; nas passagens feitas na máquina antes do envio, a tela medida tinha sido a da leitura |
| O mesmo roteiro media cedo demais as telas abertas por um link com consulta | Achado ao comparar, tela por tela, a passagem repetida com a de antes do envio. Nesse tipo de link, a área que vai mudar fica encoberta até o endereço ser lido, e a passagem roda com movimento reduzido, modo em que essa área aparece aos poucos (linha de baixo). O roteiro media logo depois do carregamento. A comparação com período teve de 17 a 1.541 textos medidos, conforme a largura e a rodada: na máquina, antes do envio, 770, 17, 1.522 e 1.522 textos nas larguras de 1440, 768, 390 e 360 pixels; na rodada do GitHub, 231, 1.541, 1.538 e 1.538; na máquina, só com a troca da ordem da limpeza, 1.541, 17, 366 e 1.522. Com a espera, são 1.557, 1.541, 1.538 e 1.538, sem contraste abaixo do mínimo (o menor é 6,16:1, em 1440 pixels) e sem rolagem lateral. Em 1440 pixels, a medição inteira tem 16 textos a mais que a maior medição anterior nessa largura e lista três alvos abaixo de 24 pixels nessa tela, dois deles links de 20 pixels de altura que a passagem de antes do envio não tinha alcançado; a rodada do GitHub já os listava. No total, a passagem lista 15 alvos abaixo de 24 pixels, contra 13 antes do envio, sem reprovar. Nas outras 24 telas, as medições não mudaram |
| Com movimento reduzido, a área de um link com consulta aparece e some aos poucos | É do site, e não do roteiro, e é anterior à trilha. A regra geral para quem pede menos movimento (`globals.css`) põe uma transição de 0,01 ms em todo elemento; a visibilidade é herdada, e cada nível da página só muda um quadro depois do nível de cima. Medido em um Chromium sem interface, contando quadros, em 1440 e em 390 pixels. Na comparação com período, a área leva 15 quadros para aparecer por inteiro com a preferência e um quadro sem ela, na saída local (de 0,34 a 0,38 segundo) e no endereço público (0,36 segundo em 390 pixels; 0,7 segundo em 1440, na primeira carga). Na página de uma pessoa aberta com período, medida só na saída local, foram 10 quadros em 390 pixels; em 1440 pixels, a sonda não viu a marca da consulta em nenhum quadro amostrado e não mediu essa largura. O sentido contrário também é gradual. Quando a página já foi desenhada antes de a marca da consulta chegar, o que aconteceu na primeira carga do endereço público e acontece em conexão lenta, o recorte padrão, que o encobrimento existe para não mostrar, some aos poucos com a preferência: 15 quadros no endereço público, em 1440 pixels (0,9 segundo), e 12 na saída local com a rede limitada (de 0,34 a 0,44 segundo), onde sem a preferência foi um quadro. **Não foi corrigido:** a correção é no CSS do site, pede a verificação inteira de novo e uma publicação, e fica para decisão do responsável |
| A correção do roteiro | `scripts/audit-a11y.mjs` passou a limpar o armazenamento em um documento que não roda o jogo, antes de abrir a tela, e a abrir a tela uma vez só; a esperar a tela parar de mudar antes de medir e depois de cada Tab, reprovando a que não parar no prazo e anotando quanto esperou; e a exigir a cena pronta nas quatro telas de cena do jogo. A passagem inteira foi repetida na máquina com o roteiro como ficou, sobre a mesma saída: 100 telas e 25 passagens de teclado sem falha, 1.080 paradas de teclado com foco visível, nenhuma tela que não assentasse (a que mais esperou foi a comparação com período em 390 pixels, com 0,95 segundo) e nenhuma parada lida com o foco em transição. Fora a comparação com período, as outras 96 medições saíram iguais às de antes do envio. As 25 passagens de teclado têm as mesmas paradas, na mesma ordem; mudou o tamanho anotado do link Pular para o conteúdo em 14 telas, de 163 por 24 para 187 por 40 pixels, que é o tamanho dele com o foco: a passagem lia a parada no instante do foco, antes do fim da transição. Nenhum arquivo do site mudou com a correção: até o envio seguinte, o que estava no ar continuou sendo a saída do commit `f2efc28` |

### Implementado e não verificado

- **Pessoas.** Ninguém jogou. Não se sabe se o ciclo é entendido sem ajuda, nem quanto tempo uma trajetória leva.
- **A fidelidade das simplificações.** Os testes conferem a estrutura e as referências de cada fase, pergunta e definição. Não conferem se a explicação simples diz o mesmo que o documento: isso é da revisão humana.
- **Aparelho real, Firefox e Safari.** Só Chromium sem interface, com celular emulado.
- **Leitor de tela.** A estrutura foi conferida (nomes, regiões, o que é anunciado), e não ouvida.
- **A configuração do projeto na Vercel.** O build desta versão rodou lá e foi ao ar com o push (seção Depois do envio). A configuração não foi conferida no painel, e o registro do build não foi lido.

A verificação contínua no GitHub depois da correção do roteiro de acessibilidade saiu desta lista. A correção foi à `main` no commit `fac621e`, em 12 de outubro de 2026, e a verificação contínua dele passou nos dois trabalhos: a tela da leitura sem o cenário foi aprovada nas quatro larguras, e a conferência da matriz de cobertura e da lista de revisão e a da integridade das capturas, que no commit `f2efc28` não tinham rodado no GitHub porque vêm depois do passo que reprovou, rodaram e passaram (seção Passaporte do Escrivão, Envio, publicação e verificação contínua).

### Limitações conhecidas

- **As amostras de decisões têm regras diferentes para as duas pessoas, e o resumo da comparação mostra o efeito.** Os onze atos de Lula de 2003 a 2010 foram escolhidos para que cada uma das sete áreas tivesse ao menos um. As leis estaduais de Flávio Bolsonaro entraram por regra fixa, duas por legislatura, sem olhar a área. No resumo por área, Lula aparece com registro nas sete, e Flávio Bolsonaro em cinco: Educação e Direitos das mulheres trazem "Nenhuma decisão publicada nesta edição". A tela diz que isso é lacuna da pesquisa, e não conclusão sobre a pessoa, mas a diferença de regra é uma escolha editorial feita com assistência de IA, que nenhuma pessoa conferiu (D-143).
- **A origem está na trilha, e não na linha do tempo.** Os fatos biográficos são uma coleção à parte. A linha do tempo, o mapa, a comparação e a página da pessoa continuam com os 39 acontecimentos, que começam em 1975 e em 2002.
- **Em sete fases o marco é um ato do Executivo ou uma votação,** e a caixa do marco mostra o nome oficial ("Medida Provisória nº 132, de 20 de outubro de 2003"). Nos atos, a data aparece duas vezes: no nome e na linha de baixo.
- **Um decreto aparece nas listas só com o nome e a área,** porque o modelo não guarda a ementa do próprio ato.
- **A leitura sem o cenário, pedida pelo endereço, só entra depois de o JavaScript carregar.**
- **Nas duas entradas, em celular, a última linha de uma frase fica mais alta** por causa do link com altura de toque.
- **A cena fica em 20 a 27 quadros por segundo no celular emulado,** que é um perfil pessimista, desenhado por software.
- **O texto de referência das seis votações continua sem ligação com o registro,** e as atas das sessões não foram abertas: vem da edição 0.2.0 e não mudou.
- **As duas fases de processos não dizem as mesmas coisas, porque os registros não trazem as mesmas coisas.** A de Flávio Bolsonaro diz quem acusou e do quê, porque o registro traz a denúncia do Ministério Público, e chega a 2025, porque o registro traz o recurso negado. A de Lula começa na condenação e para em 2021: os registros desta edição não dizem quem apresentou a acusação nem o que aconteceu com os processos depois de enviados à Justiça Federal do Distrito Federal, e a fase declara as duas coisas como lacuna. O andamento do caso de Flávio Bolsonaro depois de 2022 vem de reportagem, com o nome do veículo na frase, e o processo corre em segredo de justiça. O mês da decisão de 2025 não está no trecho guardado da reportagem: ela foi aberta de novo em 11 de outubro de 2026 e diz "Já em fevereiro deste ano", em texto de 6 de dezembro de 2025.
- **A fase de origem de Lula tem mais detalhe que a de Flávio Bolsonaro.** A viagem de 1952 vem das biografias publicadas pela Presidência, e o texto diz. A moradia de 1956 está em uma delas e em texto da Agência Senado de 2002, e a fase a traz sem nome de fonte. Para Flávio Bolsonaro, nenhum documento oficial lido traz a infância, e a fase declara a lacuna. Cada frase tem documento, mas o efeito, lado a lado, é desigual.
- **O artigo 115 da Constituição do Estado do Rio de Janeiro não foi lido.** As páginas de três leis promulgadas pela Assembleia citam os parágrafos 5º e 7º desse artigo. O atlas diz que a página cita o artigo e não diz o que ele dispõe. Nada no atlas autoriza escrever que houve veto derrubado.
- **Cinco termos aparecem sem definição ou antes dela,** nas duas trilhas: "votos válidos", "segundo turno" de uma proposta de emenda, "registro da candidatura", "Assembleia Legislativa" na primeira fase e "suspeição", que entrou na fase de processos de Lula com a palavra do registro. Cada definição é texto novo com fonte oficial, e pede uma edição de conteúdo. Dos seis casos da primeira passagem, um saiu do texto ("primeira instância") e um não foi sustentado pelo segundo leitor.
- **Nas frases de propostas, a expressão "o que chama de" aparece uma vez no documento de Lula e duas no de Flávio Bolsonaro.** Marca palavra que é do documento, e não do atlas. Duas frases, uma de cada documento, usam um trecho de outra página: a da tornozeleira eletrônica diz os dois alcances que o documento de Flávio Bolsonaro dá à medida, e a da NDC traz a descrição que o documento de Lula faz da meta. Outras duas, do documento de Lula, tiram de uma frase vizinha o nome do programa e o do pacto. Em pelo menos sete frases, quatro do documento de Lula e três do de Flávio Bolsonaro, o resumo deixa de fora uma parte da própria frase que não é condição nem medida: a finalidade, o contexto, os apoios, os beneficiários ou o conteúdo de um cadastro. Cinco resumos do documento de Lula juntam duas frases seguidas da mesma página, e nenhum do de Flávio Bolsonaro: a forma dos dois lados não é idêntica, e fica para a revisão humana dizer se deve ser. Em vários casos, nos dois documentos, a frase seguinte à resumida traz uma medida mais concreta ou um número: o atlas resume uma frase, ou duas seguidas, e a tela diz que três frases por área não são o documento inteiro. A escolha das frases e dessas marcas é editorial, feita com assistência de IA, e nenhuma pessoa a conferiu.
- **"Voltar ao jogo", na ficha de um acontecimento, leva à trajetória da pessoa, na fase da retomada,** e não necessariamente à fase em que ela estava, nem ao aprofundamento de onde veio.
- **O percentual de Lula no primeiro turno de 2026 (45,16%) não tem trecho guardado na lista de evidências, e o de Flávio Bolsonaro (47,03%) tem.** O registro é de uma edição anterior e cita a notícia do TSE para os dois números. A notícia não pôde ser reaberta nesta sessão: o servidor recusou o pedido.
- **Com o humor desligado, a fala de humor da primeira fase aparece até o JavaScript carregar,** porque vai no HTML estático.
- **Com movimento reduzido, a área de um link com consulta aparece e some aos poucos,** um nível da página por quadro, e não de uma vez: o recorte pedido demora a aparecer e, quando a página é desenhada antes de a marca da consulta chegar, o recorte padrão demora a sumir. É do atlas, anterior à trilha, e foi achado depois do envio (seção Depois do envio). Os documentos das fases anteriores dizem que, com movimento reduzido, os estados são os mesmos: são, mas essa área leva de 10 a 15 quadros, e não um, para chegar ao estado final.
- **A validação do conteúdo confere só se o marco cai nos anos da fase.** Os registros de "Explorar este período" são conferidos por um teste sobre o conteúdo publicado; os que a explicação aponta não têm conferência automática de período. O teste de números das fases pega só porcentagem e número com casa de milhar: "13 dias", "170 mil" e "62 votos a 2" são conferidos na leitura.

### Pendências

1. **De uma pessoa:** a revisão humana dos 229 registros ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)), a começar pelo que é novo: as 22 fases com as perguntas, os 26 termos, os 14 fatos biográficos, as 42 frases de propostas, os 11 atos de 2003 a 2010, as 8 leis estaduais e a relatoria; as regras de escolha das amostras; o tom do Escrivão e a lista de registros sem humor; as fontes de imprensa dos registros de processo; e a validação com três pessoas, com celular real ([USER-VALIDATION.md](USER-VALIDATION.md)).
2. **Decisões do responsável pelo projeto:** manter ou tirar o endereço provisório e a publicação a cada push; pôr ou não na lista sem humor os dois registros que só mencionam condenação de um terceiro ou repressão policial (a indicação de 2025 e a greve de 1979); manter, trocar ou tirar o humor da sala de Segurança pública, que fala de chave, cadeado e lacre e, pela regra de contexto sensível, só é dito no aprofundamento de Flávio Bolsonaro; domínio, canal de correção, indexação e licença; o limite de vinte acontecimentos, que deixou em rascunho as candidaturas de Lula de 1982 e de 1998; e a redação da regra de publicação em [EDITORIAL.md](EDITORIAL.md).
3. **Para uma edição de conteúdo:** um rótulo simples para cada ato e cada votação, e a ementa do próprio ato; a leitura do artigo 115 da Constituição do Estado do Rio de Janeiro; um documento que diga quem apresentou a acusação da condenação de 2017 e o que aconteceu com os processos depois de 2021; o trecho da notícia do TSE com o percentual de Lula no primeiro turno de 2026; a definição dos cinco termos sem definição; e o total de votos de 2002 em documento do TSE, no lugar da biografia.
4. **Acabamento, se a validação com pessoas confirmar:** a entrelinha das duas entradas em celular; uma rota própria para a leitura sem o cenário; a cadência da cena em aparelho real.
5. **Uma correção pequena no site, para decisão do responsável:** a regra de movimento reduzido, para a área de um link com consulta aparecer e sumir de uma vez (seção Depois do envio). Mexe no CSS de todas as páginas, e por isso pede a verificação inteira e uma publicação. As suítes de navegador rodam com movimento reduzido e passam com o defeito, porque nenhum teste conta quadros: a correção pede também um teste novo que confira que a área muda de uma vez, e a atualização do que [INTERACTIONS.md](INTERACTIONS.md) e os comentários do código dizem da regra.

## Auditoria de QA de produção de 11 de outubro de 2026

Em 11 de outubro de 2026 o responsável pelo projeto trouxe uma auditoria externa de prontidão para produção, feita por outro agente de IA sobre o commit da entrega P1 (`c4120e6`). O diagnóstico dela: a etapa está implementada, mas não está pronta para produção. As correções de código e de testes que ela pede foram feitas no mesmo dia e estão descritas abaixo. O que ela pede a uma pessoa continua pendente, e é o que decide a publicação. As decisões de projeto estão em [DECISIONS.md](DECISIONS.md), D-129 a D-132.

Depois das correções, uma revisão interna em paralelo (quatro revisores e quatro verificadores, só de leitura) olhou as mudanças: confirmou doze pontos, todos corrigidos, e refutou cinco.

### O que a auditoria pediu e como ficou

| Item da auditoria | Situação | O que foi feito |
| --- | --- | --- |
| B1. Catálogo da metodologia sem as fontes das decisões | Corrigido | O catálogo e a contagem de citações percorrem a lista de coleções factuais do domínio, e não mais uma lista da página: 78 fontes e 195 citações. A votação conta também o texto de referência, e o ato, a página oficial dele, sem contar o mesmo registro duas vezes |
| B2. Três jornadas reprovadas na verificação contínua | Corrigido | A do catálogo, pelo B1. A da comparação confere o texto que a tela escreve, por subtração do conteúdo documental, e a ausência de medidor ou barra de progresso. A da página da pessoa confere que a área de trabalho ocupa a tela e que a seção de decisões chega pela rolagem, pelo teclado e pela âncora do endereço, em uma carga nova |
| B3. Revisão humana, domínio e canal de correção | Pendente, de uma pessoa | `npm run verify:release` recusa, como deve: 94 registros factuais sem revisão humana nas dez coleções, domínio e canal sem valor; avisa da indexação desligada e da falta de licença. O comando novo `npm run release:check` junta a régua de publicação |
| B4. Planos de governo registrados no TSE | Fora desta entrega, decisão do responsável | O atlas não tem esse módulo, e nenhuma tela, documento ou texto do código o anuncia (conferido por busca). As sete proposições publicadas são proposições legislativas |
| A1. Releitura com a fala de outro registro | Não aparecia na tela; estado corrigido | No commit auditado a janela de releitura já não mostrava o Escrivão, e o defeito não chegava à tela. O estado, porém, não era amarrado ao registro: as falas guardadas passaram a pertencer ao registro ou ao capítulo de que foram ditas (`falasDe`), com teste de regra e jornadas para acontecimento e para decisão |
| A2. Desligar o humor não tirava as falas já escolhidas | Corrigido | A camada de humor sai na hora, em toda tela, inclusive da caixa sobre a cena; religar devolve. A jornada nova falha sem a correção (conferido por mutação) |
| A3. Captura JSON alterada passava como íntegra | Corrigido | A captura guarda o corpo original; `npm run capturas:verificar` reprova corpo, resumo, tamanho ou resposta alterados e captura sem o corpo, e roda na verificação contínua. As sete capturas da amostra receberam o corpo depois de cada consulta ser repetida e o resumo conferir (D-131) |
| A4. Texto votado sem ligação com o registro; divergência PLP 39 e 93 | Parte de código feita; parte humana pendente | A divergência da votação 6714 virou campo público do registro e aparece no cartão. O cartão diz que o texto de referência não está ligado, nas seis votações. Ligar o texto e abrir a ata de cada sessão é da revisão humana |
| A5. Resposta guardada vale depois de uma correção | Corrigido | Progresso no formato 5: a assinatura cobre os dados que decidem a resposta. Uma correção reabre só a resposta afetada, e os capítulos seguintes guardam o que tinham e voltam a concluídos quando ela é refeita (D-130) |
| Escrivão: humor em contexto sensível | Regra aplicada; aprovação humana pendente | Sem humor nos dez episódios da ficha judicial, na prisão de 1980 e nos dois registros da intervenção de 8 de janeiro de 2023, e nos três capítulos em que isso domina. As salas temáticas mantêm o humor (D-129) |
| Escrivão: anúncio a leitor de tela | Mudado, sem leitor de tela | Só a instrução é anunciada como estado; a informação do registro e o humor ficam como texto comum |
| Cartões em tela estreita e hierarquia dos títulos | Corrigido | A lista de 22 dispositivos da Lei Complementar nº 214, de 2025, vem dobrada e abre por um controle com altura de toque; o título do cartão fica um nível abaixo do título acima dele |
| Matriz de acessibilidade | Ampliada | De 10 para 20 telas: as salas temáticas, a cena dos dois personagens, a ajuda com o humor desligado, a decisão recolhida, as duas etapas da resposta, o erro, a conclusão e a transição |
| Histórico de falas sem limite | Corrigido | O histórico guarda as últimas 240 falas |
| Verificabilidade da seleção da amostra | Registrada, sem trocar nada | O registro da seleção diz o que comprova e o que não comprova: a amostra ficou com três decisões por pessoa e tema, e a exclusão do Decreto 11.615/2023 mostra que isso pesou ao menos nesse caso. Refazer a comparação é da revisão humana (`research/selecao-decisoes-2026-10.md`, seção A regra aplicada) |

### O que a revisão interna achou, além disso

- Uma correção de conteúdo em um capítulo do meio apagava o que tinha sido recolhido e respondido nos capítulos seguintes da sala. Era a regra antiga de reabertura, que ganhava um gatilho de rotina. Passou a guardar tudo.
- A tela de transição de um capítulo revisto mostrava a fala de conclusão do último capítulo cumprido, com humor mesmo em capítulo de contexto sensível. A jornada escrita para isso passava por engano, porque a transição some sozinha em 2,6 segundos e a afirmação de ausência esperava por isso: a mutação mostrou, e a jornada passou a ler a transição enquanto ela está na tela.
- O verificador de capturas só reprovava captura alterada; bastava apagar o corpo do arquivo para a alteração passar como "não verificável". Passou a reprovar.
- O cartão dizia, de texto fixo, de onde vinha a descrição do objeto e que a conferência era pendência da revisão: duas afirmações que o registro não prova. Ficou só o que o campo vazio prova.
- Quatro testes novos provavam menos do que diziam (a formatação da captura, as guardas da etapa de evidência, a âncora que não recarregava a página, o texto próprio da comparação com seletores de menos). Refeitos.
- A citação dos atos tinha ficado com uma vírgula duplicada depois da troca de "nota" por "indicação", feita no commit anterior. Achada olhando a captura da página, e corrigida, com as aspas dos rótulos de volta.

### Verificações feitas

Todas sobre a árvore final, em 11 de outubro de 2026, um comando pesado de cada vez.

| Verificação | Resultado |
| --- | --- |
| `npm run lint`, `npm run typecheck` | limpos |
| `npm run test` (Vitest) | 42 arquivos, 879 testes verdes; eram 858 em 41 |
| `npm run data:validate` | 0 erros, 5 pendências (os 5 rascunhos), 0 avisos; edição 0.2.1, formato gerado 3 |
| `npm run build` e `npm run verify:export` | 54 páginas HTML, 322 arquivos conferidos |
| `npm run test:export` | 35 de 35 |
| Jornadas sobre a exportação (`npm run test:journeys`, em três partes) | 229 de 229: 39 do jogo e 190 do atlas; eram 220, com 3 reprovadas |
| `npm run audit:a11y` | 80 telas (20 em 4 larguras) e 20 passagens de teclado sem problema; menor contraste 5,24:1 |
| `npm run capturas:verificar` | 7 capturas íntegras; captura sem corpo e captura com a resposta trocada reprovam (conferido em uma pasta de teste) |
| `npm run game:coverage -- --check`, `npm run review:human -- --check` | em dia |
| `npm run verify:release` | recusa, como esperado: 12 condições e 2 avisos |
| Mutação à mão | Sem o filtro de humor, a jornada do humor falha. Sem a fala amarrada ao capítulo, a jornada da transição falha (depois de corrigida) |
| Capturas de `docs/capturas/jogo-salas/` | Refeitas e olhadas uma a uma |
| Verificação contínua no GitHub, commit `0e98420` | Verde nos dois trabalhos. Regras, build e exportação: lint, tipos, testes de regra, build e conferência da saída, 35 testes de carregamento, 229 jornadas sobre a exportação, a passagem de acessibilidade, a matriz e a lista de revisão em dia e as 7 capturas íntegras. Servidor de desenvolvimento: 250 jornadas e telas de prova |
| `npm run measure:game -- --rotulo qa-2026-10-11` | Cinco páginas, com uma sala temática de cada personagem, em dois perfis. As salas custam o mesmo que a trajetória. O primeiro desenho não mudou; o LCP das páginas com cena passou a seguir a fala de entrada do Escrivão (celular emulado: de 1,09 s para 2,3 a 2,4 s), e a cadência em computador ficou em 55 a 57 quadros por segundo com a caixa do Escrivão aberta (era 58). Números e leitura em [PERFORMANCE.md](PERFORMANCE.md) |

### Implementado e não verificado

- **`npm run test:e2e`, no servidor de desenvolvimento,** não foi rodado na máquina, que não comporta a suíte inteira com o servidor. Rodou no GitHub, no commit `0e98420`, e passou. O teste do mapa que tinha reprovado ali no commit `0f5d6fc`, por tempo do runner (a posição de um marcador lida antes do salto de inércia, 5 pixels de diferença), passou a esperar a câmera parar.
- **Leitor de tela.** A mudança no que o Escrivão anuncia foi conferida pela estrutura, e não ouvindo.
- **Aparelho real, Firefox e Safari.** Só Chromium sem interface, com celular emulado.

### Pendências

1. **De uma pessoa, antes de publicar:** a revisão humana dos 94 registros; a ata ou a lista nominal das seis votações e o texto que foi votado em cada uma; os alvos e o contexto dos quatro vetos; a regra de seleção da amostra, a começar pelo Decreto 11.615/2023; o tom do Escrivão e a lista de registros sem humor; o celular real, com o roteiro de [USER-VALIDATION.md](USER-VALIDATION.md), que ganhou três passos.
2. **Decisões do responsável pelo projeto:** se o lançamento precisa de planos de governo registrados no TSE, que seriam conteúdo novo; domínio, canal de correção, indexação e licença.
3. **Desempenho da página do jogo,** achado na medição desta data e não mexido: o LCP passou a seguir a fala de entrada do Escrivão, que entrou na entrega P1 e só aparece depois de o JavaScript carregar, e a caixa dele tem desfoque de fundo sobre a cena. As duas saídas estão nas pendências de [PERFORMANCE.md](PERFORMANCE.md) e mudam o primeiro desenho da página, inclusive o da página sem JavaScript.

## Histórico de decisões e Escrivão, entrega P1 (investigação jogável)

Entregue em 10 e 11 de outubro de 2026, pelo recorte que o responsável pelo projeto decidiu em 10 de outubro (D-128). Plano e situação em [VOTOS-E-ESCRIVAO.md](VOTOS-E-ESCRIVAO.md); as decisões de projeto em [DECISIONS.md](DECISIONS.md), D-125 a D-128.

### O que ficou pronto

- **Salas (D-125).** `RoomId` com Histórico (a trajetória, investigação), Economia e Segurança pública (as decisões do tema), progressão própria em cada sala, rotas `/jogo/<personagem>/economia/` e `/jogo/<personagem>/seguranca-publica/`, entrada do jogo com as salas de cada personagem e a situação de cada uma, quatro cenas novas de sala de arquivo (artes do gabinete e da sala de comissão, paletas próprias).
- **Missão documental (D-126).** Tarefa `decisao`: recolher a decisão, indicar o documento que a sustenta, interpretar o que ela documenta, abrir a passagem. Na trajetória, Lula 5 (o Decreto nº 11.377/2023) e Flávio Bolsonaro 4 (o voto no PL 2.253/2022); nas salas temáticas, uma missão por personagem e tema. Progresso no formato 4, com a etapa da evidência e a migração das versões 1 a 3 (formato 5 desde a auditoria de QA de 11 de outubro, D-130).
- **Escrivão (D-127).** Nome novo em toda a interface; catálogo em `src/lib/game/escrivao/` com 120 falas em três camadas (instrução, documental, humor), por sala e evento; seletor determinístico com controle de repetição; validação por teste (sem pessoa, partido, data escrita, juízo, travessão); humor desligável pelo painel e pelo diálogo do Escrivão, preferência em `localStorage` (`atlas-politico:jogo:preferencias`).
- **Atlas.** Cartões de voto e ato (`DecisionCard`) na página da pessoa (`/politicos/<slug>/#decisoes`) e comparação por tema em `/comparar/`, com cargo, instituição, data, objeto, manifestação ou tipo do ato, fontes e revisão; aviso de amostra em toda tela; "mesma proposição" marcada quando os dois têm decisão.
- **Conteúdo (edição 0.2.0).** 12 decisões: 6 votos nominais do senador no Plenário do Senado (importados do webservice em 11/10/2026, UTC, com as capturas em `research/capturas/`), 6 atos do presidente lidos no Portal da Legislação (1 decreto, 1 sanção sem veto, 4 sanções com veto parcial, com as mensagens e os dispositivos); 7 proposições; `casa` nos 12 mandatos de casas e órgãos; 4 declarações de cobertura (amostra, parcial, com as lacunas); 1 identidade institucional; 18 fontes novas. A seleção, os excluídos e as lacunas estão em `research/selecao-decisoes-2026-10.md`. Tudo conferido com assistência de IA; revisão humana pendente (`npm run review:human`, seção 6).

### Verificações feitas

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck`, `npm run lint` | limpos |
| `npm run test` (Vitest) | 41 arquivos, 858 testes verdes, 44 novos (Escrivão, salas e progresso v4, tarefa de decisão, cartão de decisão, endereços) |
| `npm run build` + `npm run verify:export` | 55 páginas, inclusive as 4 das salas temáticas; 322 arquivos conferidos |
| `npm run test:export` | 35 de 35 (com servidor de pré-visualização novo: o antigo guarda o build anterior em memória) |
| Jornadas sobre o build (`tests/e2e/jogo.spec.ts`) | entrada, regra da saída, Escrivão e salas temáticas, missão da sala Histórico, documento e lugar, trajetória inteira dos dois: verdes |
| `npm run game:coverage`, `npm run review:human` | documentos regenerados e conferidos por teste |

### Pendências

- **Revisão humana** de tudo, inclusive da seção 6 de [HUMAN-REVIEW.md](HUMAN-REVIEW.md) (decisões, cobertura e identidades), antes de qualquer publicação; a barreira de release continua recusando a edição sem ela.
- **Celular real**: só emulação. O roteiro curto para o responsável pelo projeto executar está em [USER-VALIDATION.md](USER-VALIDATION.md), seção "Salas e decisões em celular real".
- **Leitor de tela** não foi usado; o Escrivão e os cartões saem como texto comum, com `role="status"` só na instrução (D-129).
- **Atas e painéis das sessões** não foram abertos: a conferência dos votos ficou no webservice de dados abertos.

## Histórico de decisões e Escrivão, entrega P0 (contratos e evidência)

Feita em 10 de outubro de 2026, a partir do relatório de arquitetura e narrativa trazido pelo responsável pelo projeto (plano e situação em [VOTOS-E-ESCRIVAO.md](VOTOS-E-ESCRIVAO.md); decisões D-122 a D-124). É a base para o histórico de votos parlamentares e de atos do Executivo, comparável entre os dois perfis por votação e por tema, e para a investigação documental no jogo. Nesta entrega entrou só o que o relatório chama de P0: contratos, pipeline, consulta e importação, com fixtures fictícias; nenhum voto ou ato real foi cadastrado, e nenhuma tela mostra decisões ainda.

| Parte | Situação |
| --- | --- |
| Seis coleções factuais novas: proposições, votações, votos, atos do Executivo, cobertura da pesquisa e identidades institucionais | **Feitas,** com estado editorial, citações e a mesma régua de evidência das demais; mandato com o campo opcional `casa` (D-122) |
| Três naturezas sem confusão: voto parlamentar, ato do Executivo, participação | **Voto e ato modelados;** autoria e relatoria ficam para depois, como entidade própria se a experiência exigir |
| Estados: favor, contra, abstenção, obstrução, outro registro, ausência documentada, não votou documentado; nunca ausência inferida | **Feitos** no contrato do voto; a falta de linha no acervo não produz registro |
| Consulta comparativa discriminada: registro, não se aplica, competência não confirmada, sem registro individual, pesquisa pendente | **Feita** (`resolveParticipation`, D-123), pela competência do mandato na casa e pela cobertura da pesquisa |
| Integridade e validação: referências, mandato da pessoa e da casa, competência, voto vigente único, retificação, data de corte | **Feitas,** com diagnósticos próprios e erro na publicação |
| Pipeline, índices, manifesto, recorte por pessoa, importação, barreira de release | **Estendidos** às seis coleções; formato dos dados gerados na versão 2 |
| Importador dos acervos oficiais com captura bruta, IDs externos, valor original e relatório | **Feito** para o Senado e a Câmara (`npm run importar:decisoes`, D-124); tudo entra como rascunho; Alerj e Planalto ficaram fora dos adaptadores, pelo que a pesquisa mostrou |
| Pesquisa dos contratos das APIs | **Feita** por dois agentes de IA, sem registrar fato sobre as pessoas; resumo em DATA-PIPELINE.md |
| Conteúdo real (recorte, temas, `casa` dos mandatos) | **Não feito:** decisão editorial da entrega P1 |
| Telas do atlas e missão do jogo com decisões; Escrivão | **Não iniciados:** entrega P1 |

### O que foi entregue

- **Domínio:** `src/lib/domain/decisions.ts` (temas, instituições, provedores, modalidades, objetos, resultados, posições, tipos de ato, estados de cobertura, respostas da consulta, com rótulos e explicações) e os seis schemas em `src/lib/domain/schemas.ts`; `competenceOf` e as regras novas em `integrity.ts`.
- **Pipeline:** coleções, diagnósticos, validação, seleção, importação, índices, recorte por pessoa e barreira de release cobrem as seis coleções; `scripts/data.mts` conta todas as factuais.
- **Consulta:** `src/lib/data/participation.ts`.
- **Importação:** `src/lib/import/` (capturas, requisições com ritmo e nova tentativa, adaptadores do Senado e da Câmara) e `scripts/importar-decisoes.mts`; `research/` para capturas e pacotes.
- **Fixtures:** seis arquivos sintéticos novos e um mandato executivo fictício, cobrindo as cinco respostas da consulta; amostras reais das APIs, reduzidas, em `tests/fixtures/apis/`.
- **Testes:** `tests/decisions.test.ts` (27) e `tests/import-decisoes.test.ts` (16); os anteriores ajustados às contagens e listas novas.
- **Documentos:** VOTOS-E-ESCRIVAO.md (novo), DATA_MODEL.md, DATA-PIPELINE.md, EDITORIAL.md, DECISIONS.md, ARCHITECTURE.md, README.md, `research/README.md` e este status.

### Verificações

Todas em 10 de outubro de 2026, uma de cada vez: `npm run typecheck` e `npm run lint`, passando; `npm run test`, 814 testes em 37 arquivos, todos passando; `npm run build`, com o formato 2 e as contagens novas no manifesto (todas zero no conteúdo real), e `npm run verify:export`, 302 arquivos e 50 páginas; `npm run importar:decisoes -- senado … --dry-run` para um trimestre de 2025 do senador 5894: 7 proposições, 10 votações, 10 votos e a cobertura, 29 registros aceitos como rascunho, nenhum rejeitado, nada gravado; `npm run importar:decisoes -- camara … --dry-run` para fevereiro a julho de 1987 do deputado 139289: nenhuma votação listada pelo acervo, só a cobertura da pesquisa. As suítes de navegador não foram repetidas: nenhuma tela mudou.

### Implementado e não verificado

- **Importação gravando de verdade.** Só a simulação rodou. A primeira importação real depende do recorte decidido.
- **Adaptador da Câmara com votos.** A varredura de 1987 não encontrou votações; o caminho com lista de votos foi conferido só com a amostra real de 2026 nos testes.
- **Ritmo contra os limites reais.** A espera e a nova tentativa foram testadas com respostas simuladas; nenhum 429 apareceu nas consultas reais.

### Pendências reais

1. **Recorte documental e critérios,** para os dois, e a classificação dos temas: decisão editorial (P1).
2. **`casa` nos mandatos reais:** sem ela a consulta responde "competência não confirmada" para tudo.
3. **Conteúdo real:** importar, conferir contra as atas e os painéis, promover e revisar; a Câmara de 1987 a 1991, a Constituinte e a Alerj pedem pesquisa documental fora das APIs; os atos do Executivo são cadastro à mão.
4. **Telas e jogo:** cartões, comparação por tema, missão documental, salas, Escrivão (P1).
5. **Autoria e relatoria** como entidades próprias, se a experiência exigir (P2).

## Jogo, versão de lançamento (candidata)

A continuação da etapa 1, feita em 10 de outubro de 2026 a partir do plano em [GAME-RELEASE.md](GAME-RELEASE.md), com a meta de lançamento em 22 de outubro. O jogo passou de quatro capítulos sobre 15 acontecimentos a **onze capítulos sobre os 39**, com quatro tipos de tarefa, uma ficha própria para os episódios de processo, cinco ambientes novos, três figuras de cada personagem (uma por época) e o progresso salvo na versão 2, com migração da versão 1. A entrada do atlas, os metadados, a prévia de compartilhamento, os créditos e o bloqueio de indexação foram preparados para a publicação, que não aconteceu. O desenho do jogo está em [GAMEPLAY.md](GAMEPLAY.md); as decisões, de D-111 a D-118, em [DECISIONS.md](DECISIONS.md); a matriz de cobertura, em [GAME-COVERAGE.md](GAME-COVERAGE.md); o material para a revisão humana, em [HUMAN-REVIEW.md](HUMAN-REVIEW.md); o procedimento de publicação, em [DEPLOY.md](DEPLOY.md).

| Parte | Situação |
| --- | --- |
| Capítulos para os 24 acontecimentos restantes | **Feitos em 10/10/2026.** Sete capítulos novos (quatro de Lula, três de Flávio Bolsonaro): 11 ao todo, 6 e 5. Os 39 acontecimentos publicados estão em capítulo, nenhum excluído; o primeiro turno de 2026 pertence aos dois e aparece uma vez na trajetória de cada um. A matriz acontecimento → personagem → capítulo é gerada dos dados (`npm run game:coverage`) e conferida por teste |
| Contratos: unicidade por personagem, fronteira cronológica pela data e pela precisão, alcance de todo registro, migração do progresso | **Feitos,** com testes de regra. O progresso da etapa 1 (versão 1) é lido e convertido; quem tinha terminado a etapa recebe o primeiro capítulo novo disponível (D-115, D-116) |
| Ficha judicial | **Feita.** Os 10 registros de processo (7 de Lula, 3 de Flávio Bolsonaro) mostram a natureza do registro (liminar, condenação, confirmação, prisão, decisão eleitoral, soltura, anulação, denúncia, rejeição), o contexto como a ficha do atlas o traz, as decisões relacionadas por identificador, cada uma com a própria data, e o aviso de que o jogo não pede juízo de culpa (D-114) |
| Mecânicas novas | **Feitas:** associar um registro ao documento que o sustenta (3 capítulos) e relacionar um registro ao lugar documentado (2 capítulos), com duas opções erradas tiradas do próprio capítulo, explicação do erro e nova tentativa sem penalidade. Com as duas anteriores (encontrar um registro, 2 capítulos; ordem de dois, 4 capítulos), cada personagem tem os quatro tipos (D-113) |
| Cenários | **Feitos:** comitê de campanha, sala de audiências (duas variantes), gabinete, sala de comissão e auditório de convenção (duas variantes): 9 artes para 11 cenas, com a arte separada da cena (D-112). Arte por código, no padrão das quatro anteriores, sem bloco provisório. Três artes foram refinadas por agentes de IA; o gabinete, em parte; a sala de comissão ficou na versão própria, porque o agente dela não chegou a rodar |
| Figuras por período | **Feitas:** três figuras de cada personagem (primeiros anos, anos intermediários, anos recentes), com variação de cabelo, barba e roupa e a mesma escala e o mesmo cuidado para os dois; a transição e a cena dizem qual é a época da figura (D-111). D-103 superada |
| Entrada do atlas e experiência pública | **Feitas:** a primeira dobra da entrada traz os dois cartões e o acesso **Jogar com**, com o número de capítulos; título e descrição por página; prévia de compartilhamento gerada (`public/share/atlas.png`); créditos do jogo na metodologia; `robots.txt` e `sitemap.xml` que só liberam a indexação com domínio decidido (D-117). O canal de correção continua pendente, como antes |
| Medição das páginas do jogo | **Feita em laboratório,** com o medidor novo (`npm run measure:game`), nos perfis de computador e de celular emulado. Os números estão abaixo e em [PERFORMANCE.md](PERFORMANCE.md) |
| Capítulos antigos e progresso salvo | **Preservados.** Os quatro identificadores da etapa 1 não mudaram; a migração foi testada com um progresso da versão 1 no navegador |
| Revisão humana do conteúdo | **Pendente,** como desde a fase 2. O material está em [HUMAN-REVIEW.md](HUMAN-REVIEW.md), gerado dos dados: 10 episódios judiciais, 16 acontecimentos eleitorais, 8 filiações, 15 mandatos e os demais registros, trecho a trecho |
| Sessões com três pessoas, com celular real | **Pendentes.** O roteiro ganhou a tarefa do jogo e quatro perguntas ([USER-VALIDATION.md](USER-VALIDATION.md)). Nenhuma pessoa jogou |
| Aparelho real, leitor de tela e outros navegadores | **Não feitos.** Só Chromium, com celular emulado |
| Publicação | **Não feita.** Sem domínio, sem hospedagem, sem deploy; todas as páginas seguem com `noindex`. O procedimento está em [DEPLOY.md](DEPLOY.md) e só roda com autorização |

Para abrir: `npm run build`, `npm run preview` e `http://localhost:4311/jogo/`. Em desenvolvimento: `npm run dev` e `http://localhost:3000/jogo/`; a galeria da arte fica em `http://localhost:3000/dev/jogo-arte/`.

### O que o pedido exigia e como ficou

| Exigência | Situação | Como foi conferido |
| --- | --- | --- |
| Todo acontecimento publicado em um capítulo, ou com exclusão justificada; matriz de cobertura | Atendido: 39 de 39, sem exclusão | `tests/game-coverage.test.ts` recusa acontecimento fora de capítulo e matriz desatualizada |
| Cada acontecimento em um só capítulo por personagem; capítulos em ordem cronológica, pela data e pela precisão | Atendido | `tests/game-chapters.test.ts`: todo par de registros entre capítulos vizinhos tem a ordem decidida pelas datas, sem comparação por ano |
| Situação eleitoral de 2026 conferida em fonte oficial; apuração parcial mantida como parcial; nenhum resultado de segundo turno | Atendido: os registros de 2026 não mudaram, e os textos do jogo dizem "apuração parcial" | Teste dos textos dos capítulos contra os dados; o conteúdo continua na edição 0.1.1, com a data de corte de 8 de outubro (D-118) |
| `SceneId` ampliado, registro de cenas e de artes, testes de cobertura e de alcance | Atendido | `tests/game-draw-registry.test.ts` (toda arte e todo objeto registrados), `tests/game-chapters.test.ts` (todo registro à vista e alcançável, nenhum ao lado da porta) |
| Identificadores dos capítulos mantidos e progresso salvo com migração explícita e testada | Atendido | `tests/game-progress.test.ts` (versão 1 lida, convertida e reaplicada) e a jornada com um progresso da versão 1 gravado no navegador |
| Cenário próprio por fase, abertura com título, período e contexto, guia fictício | Atendido | Capturas de cada cena e da transição com contexto; o guia continua o Arquivista, dito fictício |
| Mecânica reutilizável "associar um documento à sua fonte"; opcional "relacionar ao lugar documentado"; pistas, explicação e nova tentativa | Atendido, com as duas | Testes de regra (`tests/game-mission.test.ts`) e de navegador, com a resposta errada antes da certa, pelo teclado, nos dois personagens |
| Regra da saída mantida (todos os registros e a tarefa) | Atendido | A jornada da saída fechada e aberta, nos dois personagens |
| Figuras por período, com o mesmo cuidado para os dois; sem arte provisória | Atendido, no juízo de quem fez | Galeria capturada por época; capturas dos capítulos; `data-epoca` conferido na jornada completa |
| Progresso, não julgamento | Atendido | Nenhum placar, nenhuma nota; o fim diz quantos capítulos e acontecimentos a trajetória cobriu |
| Episódios judiciais: quem alegou, defesa, decisão, data, efeitos, situação na data de corte; relação por identificador; sem equiparar denúncia, condenação, anulação e absolvição; sem pedir ao jogador que decida culpa | Atendido com o que a ficha do atlas traz | `tests/game-judicial.test.ts` (todo relacionado existe, é do mesmo personagem e tem data); a jornada da ficha judicial lê a natureza, os relacionados e o aviso |
| Lista de trechos que precisam de revisão humana | Atendido | [HUMAN-REVIEW.md](HUMAN-REVIEW.md), gerado por `npm run review:human` e conferido por teste |
| Primeira dobra da entrada com a escolha de personagem e a entrada do jogo | Atendido em 390×844 e em 1280×800; em janela de 1440×720 os botões **Jogar com** ficam logo abaixo da dobra | Capturas da primeira dobra, em roteiro fora do projeto |
| Teclado, toque, pausa, foco, painel; celular em pé e deitado | Atendido em emulação, como na etapa 1 | As jornadas de teclado, de foco e de toque; capturas em pé e deitado em dois cenários |
| Exportação estática, recursos locais, jogo em pacote à parte, sem login, banco, ranking ou serviço pago | Atendido | `npm run verify:export`; `tests/export/jogo.spec.ts` (o palco só na página do jogo; nenhum pedido externo) |
| Medir o carregamento e a cadência nas páginas do jogo | Atendido em laboratório | `npm run measure:game`, números abaixo |
| Títulos, descrição, prévia de compartilhamento, créditos, canal de correção | Atendido, menos o canal, que depende de decisão | `src/app/layout.tsx`, `scripts/share-image.mjs` (gera e confere a imagem), metodologia com os créditos |
| Canônico, sitemap e indexação só para o domínio escolhido e a edição lançada | Atendido: tudo bloqueado até haver `publicUrl` e `indexar` | `src/app/robots.ts`, `src/app/sitemap.ts`; o build atual sai com `Disallow: /` e sitemap vazio |
| Verificação no build estático | Atendido | Todas as suítes abaixo rodaram sobre `out/`, fora a de desenvolvimento |
| Roteiro de validação com 3 pessoas e celular real; material para revisão humana | Preparado; as sessões e a revisão não aconteceram | [USER-VALIDATION.md](USER-VALIDATION.md), [HUMAN-REVIEW.md](HUMAN-REVIEW.md) |
| Versão executável local, matriz, capturas, comandos e resultados, roteiro de demonstração, pendências de publicação | Atendido | Este documento, [GAME-COVERAGE.md](GAME-COVERAGE.md), `docs/capturas/jogo-lancamento/`, [GAME-RELEASE.md](GAME-RELEASE.md) (roteiro e pendências) |
| Procedimento de deploy preparado; publicação e divulgação só por último, sem serviço e sem postagem automática | Atendido: [DEPLOY.md](DEPLOY.md); nada publicado | Leitura; nenhum comando de deploy existe no projeto |

### O que foi entregue

- **Onze capítulos**, com título, período, cenário, época da figura, motivo (inventário do que os registros dizem) e tarefa: Lula, 6 (sindicato 1975 a 1980; Constituinte 1986 a 1994; Presidência 2002 a 2006; nomeação suspensa, processos e prisão 2016 a 2019; anulação, terceira eleição e intervenção federal 2021 a 2023; convenção e primeiro turno de 2026); Flávio Bolsonaro, 5 (Assembleia 2002 a 2016; Senado 2018 a 2019; denúncia, partidos e decisões judiciais 2020 a 2022; liderança da Minoria, relatoria e comissão 2023 a 2025; indicação, convenção e primeiro turno 2025 a 2026).
- **Quatro tarefas:** encontrar um registro, ordem de dois registros, o documento que sustenta um registro e o lugar em que o atlas o documenta. As duas novas têm três opções (a certa e duas do próprio capítulo), explicação do erro com a data do registro que cita o outro documento, ou com o lugar certo, e nova tentativa.
- **Ficha judicial** dentro do registro: natureza, contexto, decisões relacionadas com a própria data e o aviso.
- **Onze cenas sobre nove artes:** salão do sindicato, plenário da Constituinte, salão da Assembleia, plenário do Senado, comitê de campanha, sala de audiências (quente e fria), gabinete, sala de comissão e auditório de convenção (duas disposições). Kits de parede, piso, porta e folhas de porta compartilhados; 24 tipos de objeto, 5 novos (balcão, cartaz, tela, fileira de assentos, sofá).
- **Três figuras de cada personagem,** escolhidas pela época do capítulo, na cena, na prévia e na galeria.
- **Progresso na versão 2,** com tentativas por tarefa e a migração da versão 1.
- **Entrada do atlas** com o acesso ao jogo na primeira dobra; **metadados** com canônico, Open Graph e prévia condicionados ao domínio; **robots e sitemap** gerados pelo build; **créditos** do jogo na metodologia.
- **Comandos novos:** `npm run game:coverage` (matriz, com `--check`), `npm run review:human` (lista de revisão), `npm run measure:game` (medição das páginas do jogo), `node scripts/capture-art.mjs` (galeria da arte, peça a peça), `node scripts/share-image.mjs` (prévia de compartilhamento). O roteiro `npm run capture:game` passou a gravar em `docs/capturas/jogo-lancamento/`.
- **Testes:** quatro arquivos novos de regra (ficha judicial, registro da arte, cobertura, lista de revisão) e os anteriores reescritos para os contratos novos; as jornadas do jogo ganharam a trajetória inteira de cada personagem, as tarefas de documento e de lugar, a ficha judicial, a figura por época e a migração da versão 1.
- **Documentos:** GAME-RELEASE.md, GAME-COVERAGE.md, HUMAN-REVIEW.md e DEPLOY.md (novos); GAMEPLAY.md, ARCHITECTURE.md, DECISIONS.md, EDITORIAL.md, EDITORIAL-REVIEW.md, PAGES.md, QA.md, USER-VALIDATION.md, PERFORMANCE.md, `capturas/README.md`, o README.md da raiz e este status.

### Arquivos

| Onde | O quê |
| --- | --- |
| `src/lib/game/` | Reescritos: `types.ts`, `chapters.ts` (11 capítulos), `content.ts`, `mission.ts` (quatro tarefas), `progress.ts` (versão 2 e migração). Novos: `judicial.ts`, `coverage.ts`, `scenes/comite.ts`, `tribunal-a.ts`, `tribunal-b.ts`, `gabinete.ts`, `comissao.ts`, `convencao-a.ts`, `convencao-b.ts`. As quatro cenas anteriores ganharam a arte e a paleta no próprio arquivo (`palettes.ts` saiu) |
| `src/lib/editorial/` | Novo: `human-review.ts` (a lista de revisão humana, gerada dos dados) |
| `src/features/game/draw/` | Novos: `arts/` (nove artes e o registro), `wall-kit.ts`, `floor-kit.ts`, `floors.ts`, `exit-kit.ts`, `door-leaves.ts`, `props-balcao.ts`, `props-tela.ts`, `props-fileira.ts`, `props-sofa.ts`. Reescritos: `scene-walls.ts`, `scene-floor.ts`, `scene-exit.ts`, `props-base.ts`, `props.ts`, `characters.ts` (figuras por época). Os objetos anteriores leem o material pela arte, e não pela cena |
| `src/features/game/` | `GameShell.tsx`, `ui/dialogs.tsx` (janela de escolha), `ui/RecordCard.tsx` (ficha judicial), `ui/ChapterPanel.tsx`, `ui/Hud.tsx`, `ui/tarefa.ts` (novo), `CharacterSelect.tsx`, `engine/render.ts` (arte e época) |
| `src/app/` | `layout.tsx` (metadados condicionados), `robots.ts` e `sitemap.ts` (novos), `metodologia/page.tsx` (créditos do jogo), `dev/jogo-arte/ArtGallery.tsx` (épocas, modo parado) |
| `src/lib/site.ts` | Domínio, indexação e canal de correção em um só lugar, todos pendentes |
| `scripts/` | Novos: `game-coverage.mts`, `human-review.mts`, `measure-game.mjs`, `capture-art.mjs`, `share-image.mjs` |
| `tests/` | Novos: `game-judicial`, `game-draw-registry`, `game-coverage`, `human-review`. Reescritos ou alterados: `game-mission`, `game-progress`, `game-chapters`, `game-storage`, `game-world`, `e2e/jogo.spec.ts`, `export/jogo.spec.ts`, `export/jogo.capture.ts` |
| `docs/`, `public/`, raiz | Novos: GAME-RELEASE.md, GAME-COVERAGE.md, HUMAN-REVIEW.md, DEPLOY.md, `capturas/jogo-lancamento/`, `desempenho/jogo-*.json`, `public/share/atlas.png`. Atualizados: os documentos listados acima e `package.json` (comandos) |

Nenhuma dependência foi acrescentada. Nenhum registro de `content/` foi alterado: a edição continua a 0.1.1, com a data de corte de 8 de outubro de 2026.

### Como a versão foi feita

Na ordem do plano: primeiro os contratos e os testes de regra (unicidade, fronteira, alcance, cobertura, migração), depois os capítulos e as cenas, a ficha judicial, as mecânicas, a arte dos ambientes novos, as figuras por época e a experiência pública. A arte dos cinco ambientes foi escrita primeiro em uma versão própria, para o jogo rodar inteiro, e depois refinada por agentes de IA em paralelo, um por arte, com a galeria capturada antes e depois. Três agentes terminaram (sala de audiências, auditório de convenção e comitê); o do gabinete foi interrompido pelo limite de uso da sessão depois de gravar o gabinete e o sofá (o código compila, passa no lint e nos testes, e foi olhado nas capturas); o da sala de comissão não chegou a rodar. Durante o trabalho dos agentes o sistema derrubou o servidor de desenvolvimento por falta de memória, e as verificações finais rodaram sobre o build estático, uma de cada vez.

### Problemas achados na conferência e corrigidos

| Problema | Correção |
| --- | --- |
| Com os contratos novos, a conferência de tipos só falhava nos testes antigos (campo `ordemConfirmada`, fixtures sem `epoca` e `arte`) | Testes reescritos para a versão 2 do progresso e para os campos novos |
| Na sala de comissão, seis objetos estavam em células que o mapa não reservava, e um registro ficava ao lado da porta | Objetos e registro movidos; foi o teste dos capítulos que apontou |
| O roteiro de captura da galeria estourava o tempo no servidor de desenvolvimento: a rede nunca "assenta" (o canal de recarga fica aberto) e a captura de cada elemento esperava dezenas de canvases animados | A galeria ganhou o modo `?parado` (um quadro só), o roteiro espera só o documento e captura por recorte |
| Na imagem de compartilhamento, a nota do rodapé invadia a última marca da linha | Disposição refeita e imagem gerada de novo |
| A matriz de cobertura quebrava quando a edição não tinha número | Leitura tolerante ao campo ausente |
| Linhas sem efeito deixadas nas primeiras versões de três artes (arcos e elipses de coordenada zero) | Removidas |
| A jornada "mesma figura em todos os capítulos" ficou falsa com as figuras por época | A asserção lê a frase nova da entrada, "três figuras, uma por época" |
| Dois dos cinco agentes de arte pararam no limite de uso da sessão | O gabinete ficou com o que o agente gravou, conferido; a sala de comissão ficou na versão própria |
| Em janela de 1440×720, os botões **Jogar com** da entrada ficam logo abaixo da dobra | Não mudado: em 390×844 e 1280×800 aparecem na primeira dobra; registrado aqui |
| `npm run test:e2e` não subia o próprio servidor: o Next 16 só aceita um servidor de desenvolvimento por pasta, e o que o sistema tinha derrubado por falta de memória deixou o processo do servidor órfão na porta 3000 | O processo órfão foi encerrado, e a suíte subiu. A anotação de como conferir e encerrar está no estado do projeto |

### Verificações executadas

Todas em 10 de outubro de 2026, sobre o build final, uma de cada vez. O servidor de desenvolvimento só foi usado por `npm run test:e2e`, que sobe o próprio.

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` e `npm run lint` | Passaram |
| `npm run test` (Vitest) | 753 testes em 34 arquivos, todos passando |
| `npm run build` e `npm run verify:export` | 51 rotas geradas (50 páginas HTML, 3 do jogo, mais `robots.txt` e `sitemap.xml`); 302 arquivos conferidos. `robots.txt` sai com `Disallow: /` e o sitemap, vazio, como a decisão manda |
| `npm run game:coverage -- --check` e `npm run review:human` | Matriz e lista em dia com os dados (os dois têm teste) |
| `npm run test:export` (carregamento sobre a exportação) | 32 testes, todos passando: 16 do atlas e 16 do jogo, em 1,0 minuto |
| `npm run capture:game` | 71 capturas em `docs/capturas/jogo-lancamento/`, em 2,8 minutos, olhadas uma a uma |
| `npm run test:journeys` (jornadas sobre a exportação) | 216 testes, todos passando: 184 do atlas e 32 do jogo, em 8,4 minutos |
| `npm run test:e2e` (as mesmas jornadas e as telas de prova, no servidor de desenvolvimento) | **Não concluída.** De 237 testes, 185 passaram, sem nenhuma falha real; aos 11,2 minutos o sistema derrubou a suíte por falta de memória da máquina (8 GB), e o Playwright registrou 4 testes interrompidos no instante da parada (0 a 145 ms) e 48 que não chegaram a rodar. As mesmas jornadas passaram inteiras sobre o build (linha acima). Rodar de novo com os outros programas fechados |
| `npm run audit:a11y` | 10 telas, 4 larguras e a passagem por teclado, sem falha: nenhum texto abaixo do contraste mínimo, nenhuma rolagem lateral, nenhum erro de página, nenhuma parada do teclado sem foco visível. Nas telas do jogo, o menor contraste é 5,24 na entrada e 7,51 na cena, e o único alvo abaixo de 24 px é o nome do atlas no cabeçalho, como nas demais páginas. Na entrada do atlas, o link **Como é o jogo**, novo, tem 20 px de altura, como os outros links de texto corrido do site. Relatório em `test-results/a11y/` |
| `npm run measure:game -- --rotulo lancamento-2026-10-10` | Laboratório, nesta máquina, mediana de 3 execuções com o cache vazio, Chromium sem interface com o canvas desenhado por software. Computador (1440×900, 10 Mbit/s, 40 ms, CPU sem limite): entrada do jogo com LCP de 304 ms, carregamento em 506 ms e 370 KB; página do jogo com LCP de 244 a 276 ms, palco pronto em 750 a 775 ms, 386 a 387 KB, e a cena a 58 quadros por segundo parada e andando, sem quadro longo. Celular emulado (390×844, 1,6 Mbit/s, 150 ms, CPU 4 vezes mais lenta): entrada com LCP de 1.040 ms e carregamento em 2.358 ms; página do jogo com LCP de 1.088 ms, palco pronto em 2.717 a 2.741 ms, e a cena a 19 a 24 quadros por segundo, com 7 a 14 quadros longos em 3 segundos de caminhada (p95 de 50 a 67 ms). Arquivo: `docs/desempenho/jogo-lancamento-2026-10-10.json`; leitura em [PERFORMANCE.md](PERFORMANCE.md), seção Páginas do jogo |
| Galeria da arte (`scripts/capture-art.mjs`), antes e depois dos agentes | As nove artes, os 24 objetos e as seis figuras capturadas e olhadas |
| Primeira dobra da entrada, em roteiro fora do projeto | 390×844 e 1280×800 com os cartões e **Jogar com** na primeira tela; 1440×720 com os botões logo abaixo |

### Implementado e não verificado

- **Aparelho real, leitor de tela, Firefox e Safari.** Como na etapa 1: só Chromium, com celular emulado.
- **Pausa por perda de foco da janela.** Sem teste automático, como antes.
- **Reconhecimento das figuras por época e legibilidade da arte por outras pessoas.** Julgados por quem os fez, pelas capturas. A crítica independente da arte não rodou; os agentes refinaram quatro das cinco artes novas e não olharam as quatro anteriores.
- **Ritmo da trajetória inteira.** Onze capítulos, dois deles com seis registros. Ninguém jogou do início ao fim; a jornada automática leva perto de meio minuto por personagem, sem ler nada.
- **Migração de um progresso real da etapa 1.** Testada com um progresso da versão 1 gravado pelo teste, não com um gravado pelo build da etapa 1 em um navegador de verdade.
- **Prévia de compartilhamento.** A imagem existe e foi conferida; os metadados que a citam só entram com o domínio, e nenhum serviço a leu.
- **Desempenho em aparelho real.** As medições acima são de laboratório, em um notebook, com celular emulado.
- **Cadência em celular.** No perfil emulado, com a CPU 4 vezes mais lenta e o desenho por software, a cena fica em 19 a 24 quadros por segundo, com quadros longos. Um celular real tem placa de vídeo e outro processador, e o número real não foi medido: é o primeiro item a olhar numa sessão com aparelho.

### Auditoria externa de 10 de outubro de 2026

Depois do commit `17875bc`, o responsável pelo projeto trouxe um relatório de auditoria técnica e de cobertura informativa, feito por um agente de IA sobre esse commit. O parecer principal não é sobre defeito: o repositório implementa o jogo sobre o atlas, com os 39 acontecimentos em capítulos, mas **não implementa o produto descrito em um pedido novo, "conhecer todas as propostas, projetos e posicionamentos de Flávio Bolsonaro" em sete áreas** (segurança pública, economia, saúde, educação, reforma do Estado, meio ambiente, direitos das mulheres). O modelo não tem entidade de proposta, proposição legislativa, voto ou declaração, e a política editorial exclui opinião e declaração isolada. Isso é uma decisão de escopo, e ficou como ponto em aberto em [DECISIONS.md](DECISIONS.md): nenhuma tela promete propostas hoje, e nada foi construído nessa direção sem a decisão. Os achados técnicos foram conferidos um a um no código e tratados no mesmo dia:

| Achado | Conferência | O que foi feito |
| --- | --- | --- |
| A-01 (P0): objetivo anunciado maior que o conteúdo | Verdadeiro quanto ao cadastro: não há propostas no modelo nem na política | Nada no código. Decisão do responsável: focar só Flávio Bolsonaro (com o recorte declarado) ou manter o tratamento igual aos dois, e com que fontes e política. Registrado em DECISIONS.md, pontos em aberto |
| A-02 (P0): revisão humana ausente e regra de release inconsistente entre os documentos; `checkPublication` aceita `revisado` de qualquer tipo | Confirmado | `npm run verify:release` (D-120): recusa a release com o diagnóstico. Hoje recusa, de propósito: 64 registros sem revisão humana em quatro coleções, domínio e canal de correção pendentes, mais dois avisos (indexação desligada, sem LICENSE). GAME-RELEASE.md, DEPLOY.md e EDITORIAL.md passaram a dizer a mesma coisa. O build de desenvolvimento continua passando com o conteúdo em conferência |
| A-03 (P1): a ficha do jogo perdia onde está o trecho, a data do documento e a data de acesso | Confirmado | `GameSource` ganhou os três campos; o registro no jogo mostra a linha do documento e **Onde:**, como a lista de fontes do atlas; teste de regra compara campo a campo com o conteúdo e a jornada da ficha lê o localizador de cada fonte |
| A-04 (P1): uma confirmação sobrevivia à troca da tarefa sob os mesmos identificadores | Reproduzido no teste de regra, como o auditor fez | A confirmação grava a assinatura da tarefa respondida; progresso na versão 3, com migração explícita das versões 1 e 2 pela tabela congelada do que cada capítulo pedia então (D-119). O caso do auditor virou teste |
| A-05 (P1): sem o contexto 2D do canvas, a cena ficava vazia sem aviso | Confirmado | O lugar da cena mostra o aviso e o botão **Abrir o painel**; teste no navegador com o contexto 2D negado, que joga o capítulo 1 inteiro pelo painel |
| A-06 (P1): celular e acessibilidade sem uso real | Já registrado acima | Continua pendente: sessões com pessoas e aparelho real |
| A-07 (P1): sem verificação contínua | Confirmado | `.github/workflows/verificacao.yml` (D-121): um trabalho com `check`, as suítes sobre a exportação, a passagem de acessibilidade e a conferência da matriz e da lista; outro com as jornadas em desenvolvimento. Escrito e não executado: o primeiro resultado é o do GitHub, depois do push |
| A-08 (P1): o critério editorial não mede equilíbrio nem completude temática | Risco, sem demonstração de viés, como o próprio relatório diz | Sem mudança: entra na decisão de escopo |
| A-09 (P1): o primeiro turno é apuração parcial | Já registrado (D-118) | Pendente de decisão e documento oficial |
| A-10: configuração pública, canal de correção e licença pendentes | Já registrado (D-117) | `verify:release` lista os três; a licença entrou nos pontos em aberto |
| P2: separar os diálogos do `GameShell`, links permanentes para capítulo, sincronia entre abas, conferência de fontes como comando | Anotados | Pontos em aberto em DECISIONS.md |

Verificações depois das correções, em 10 de outubro de 2026, uma de cada vez: `npm run typecheck` e `npm run lint`, passando; `npm run test`, 771 testes em 35 arquivos (18 novos: assinatura, migrações, barreira de release, localizador das fontes), todos passando; `npm run build` e `npm run verify:export`, 51 rotas e 302 arquivos; as 33 jornadas do jogo sobre a exportação (a nova do canvas negado entre elas), todas passando; `npm run test:export`, 32; `npm run verify:release`, recusando como previsto; `npm run capture:game` refeito, com as capturas do registro mostrando as linhas novas. As jornadas do atlas não foram repetidas: nenhum arquivo delas mudou. `npm run test:e2e` não rodou nesta máquina pelo mesmo motivo da tabela acima; é o segundo trabalho da verificação contínua.

### Pendências reais

0. **Decisão de escopo sobre propostas** (auditoria, A-01): só com ela se desenha o modelo, as fontes e a política, para os dois personagens ou com o recorte declarado.
1. **Revisão humana do conteúdo** ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)): condição da publicação, pela regra do próprio projeto, e agora pela barreira `npm run verify:release`.
2. **Sessões com três pessoas, com celular real** ([USER-VALIDATION.md](USER-VALIDATION.md)).
3. **Domínio, canal de correção, nome definitivo e liberação da indexação** (`src/lib/site.ts`), hospedagem e **autorização do deploy** ([DEPLOY.md](DEPLOY.md)).
4. **Totalização final do primeiro turno:** o registro de 4 de outubro traz a apuração parcial, como a notícia do TSE a publicou. Trocar é uma edição nova de conteúdo, com documento oficial lido e decisão do responsável. O segundo turno, de 25 de outubro, fica depois da data de corte.
5. **Licença do repositório:** não há arquivo LICENSE.
6. **Aparelho real, leitor de tela e outros navegadores.**
7. **Olhar de fora sobre a arte,** incluindo a sala de comissão, que não passou por agente.
8. **Som** e a sincronia entre duas abas do mesmo personagem, como antes.
9. **Cadência da cena em celular real.** Se um aparelho de verdade ficar perto dos 20 quadros por segundo do perfil emulado, reduzir o trabalho por quadro (por exemplo, limitar a densidade de pixels do canvas da cena em telas pequenas).
10. **A suíte no servidor de desenvolvimento,** `npm run test:e2e`, que não chegou ao fim em 10/10 (tabela acima): rodar com os outros programas fechados.

## Jogo, etapa 1 (primeira versão jogável)

Esta seção é o registro da primeira entrega, do mesmo dia. As pendências que ela lista sobre capítulos, figuras por período, ficha judicial e medição foram resolvidas pela versão de lançamento (seção acima); as demais continuam valendo e estão repetidas lá.

Depois da fase 9, o atlas ganhou uma direção nova: além de consultar, dá para **jogar** a trajetória. O visitante escolhe Lula ou Flávio Bolsonaro, controla um personagem por cenários isométricos e avança por capítulos; em cada um, recolhe todos os registros do atlas e cumpre uma tarefa para abrir a passagem ao capítulo seguinte. O documento do jogo é [GAMEPLAY.md](GAMEPLAY.md): fluxo, capítulos escolhidos, tarefas, regras editoriais, progresso, arquitetura e direção visual. As decisões vão de D-91 a D-110, em [DECISIONS.md](DECISIONS.md).

| Parte | Situação |
| --- | --- |
| Dois capítulos jogáveis de cada personagem, com as duas mecânicas de tarefa | **Feito em 10/10/2026**, conferido no build estático |
| Regra da saída: a porta só abre com todos os registros recolhidos e a tarefa cumprida | **Feita em 10/10/2026**, a pedido do responsável pelo projeto, depois da primeira entrega (D-109). Conferida no build estático |
| Arte dos personagens, dos cenários e dos objetos | **Feita por código, com assistência de IA.** Conferida por quem fez, pelas capturas. A crítica independente da arte, que estava planejada, não aconteceu |
| Revisão independente do código | **Feita com assistência de IA, em cinco lentes.** Duas lentes (editorial e carregamento) terminaram antes de o limite de uso da sessão interromper as outras; as três restantes (estado, entrada e acessibilidade, testes) rodaram depois, sobre o código já corrigido. Foram 40 achados, alguns repetidos entre as lentes, todos conferidos no código e corrigidos. A regra da saída, que veio depois, teve revisão própria em três lentes: 17 achados, 12 distintos, todos corrigidos |
| Capítulos para os demais acontecimentos | **Não feitos.** 15 dos 39 acontecimentos estão em capítulos; faltam 24 |
| Teste em aparelho real, com leitor de tela e em outros navegadores | **Não feito.** Toque e celular só em emulação |
| Sessões com três pessoas | **Pendentes,** como na fase 9. Nenhuma pessoa jogou |
| Revisão humana do conteúdo | **Pendente,** como desde a fase 2. O jogo usa o mesmo conteúdo, conferido com assistência de IA, e diz isso nas telas |
| Publicação do site | **Não feita.** Não há deploy, e as páginas continuam com `noindex`. O código e o conteúdo estão em repositório público no GitHub, na `main`, desde 10/10/2026 |

Para abrir: `npm run build`, `npm run preview` e `http://localhost:4311/jogo/`. Em desenvolvimento: `npm run dev` e `http://localhost:3000/jogo/`.

### O que o pedido exigia e como ficou

| Exigência | Situação | Como foi conferido |
| --- | --- | --- |
| Entrada com escolha clara entre os dois personagens e prévia do mundo | Atendido em `/jogo/`. A entrada do atlas leva ao jogo com um acesso por personagem (D-99) | Teste de navegador: os dois cartões iguais, em ordem alfabética, com a prévia desenhada |
| A cena domina a tela ao iniciar | Atendido | A cena ocupa mais de 75% da altura da janela em 1440×900 e em 390×844, sem rolagem lateral |
| Personagem de corpo inteiro, com caminhada, repouso, direção, colisão e câmera | Atendido | Testes de movimento e de colisão, de regra e no build; arte olhada na bancada e nas capturas |
| Objetivo curto, objetos a encontrar e interação | Atendido | O objetivo fica sobre a cena, com a contagem dos registros recolhidos; perto de um registro, a pasta ganha destaque, com o anel e a dica; a tecla recolhe e abre o registro |
| Saída bloqueada com a tarefa pendente; retorno claro e passagem aberta ao concluir | Atendido, com a regra pedida depois da primeira entrega: a saída abre com a tarefa cumprida e todos os registros recolhidos (D-109) | Teste: a porta segura o personagem e diz o que falta; com a tarefa cumprida e registros por recolher, continua fechada; com o último registro, o objetivo muda e a porta abre, na regra e no desenho |
| Transição curta com novo período, novo cenário e novo objetivo | Atendido | Teste: a tela de transição traz o capítulo seguinte, e a cena, o cenário e o objetivo mudam |
| Progresso por personagem, continuar e reiniciar com confirmação | Atendido | Teste: progresso separado, recuperado ao recarregar, reinício com confirmação e só para aquele personagem, com o personagem de volta ao início |
| Setas, WASD e tecla de interação; toque confortável; pausa em diálogos, menus e perda de foco; teclas só na área do jogo | Atendido em emulação | Testes de teclado, de foco e de toque, em pé e deitado. A pausa por perda de foco da janela foi lida no código, sem teste automático |
| Dois tipos de tarefa, sem botão de concluir, com nova tentativa sem punição | Atendido | Testes das regras e de navegador, com a resposta errada antes da certa, pelo teclado |
| Guia fictício, sem fala atribuída, datas na precisão do registro, progresso sem avaliação | Atendido | Teste dos textos dos capítulos; leitura das telas; o registro de data parcial mostra os avisos do atlas |
| Fatos e documentos fora do jogo; fichas, fontes, comparação e metodologia acessíveis | Atendido | As rotas do atlas não mudaram; o registro leva à ficha, e a ficha, de volta ao capítulo |
| Separação entre dados, capítulos, regras, estado e desenho | Atendido | ARCHITECTURE.md, seção Jogo; o ESLint confere as fronteiras |
| Progresso salvo com versão, dado inválido tratado, funciona sem armazenamento | Atendido | Testes do formato e do armazenamento; teste de navegador com o armazenamento bloqueado, com ida à ficha e volta |
| Exportação estática, sem login, banco ou backend | Atendido | `npm run check` e a conferência da saída, com as três páginas do jogo |
| Recursos do jogo só quando necessários; sem dois renderizadores pesados | Atendido | Teste sobre o build: o palco só é pedido na página do jogo, que não pede o mapa |
| Abrir a ficha pelo jogo e voltar; link direto não altera o progresso | Atendido | Teste de navegador e teste dos endereços |
| Caminho acessível por controles de interface, foco visível, contraste | Atendido, sem leitor de tela | O painel cumpre a tarefa e abre a saída sem o cenário; passagem de acessibilidade nas duas telas do jogo |
| Redução de movimento | Atendido | O desenho e a casca recebem a preferência; os testes rodam com movimento reduzido, e um deles com o movimento ligado |
| Personagens expressivos, objetos legíveis, cada capítulo com composição própria, sem blocos provisórios | Atendido, no juízo de quem fez | Quatro cenários com piso, paredes, objetos e porta próprios; três personagens com quatro direções e ciclo de caminhada. Nenhuma pessoa de fora avaliou |

### O que foi entregue

- **Rotas:** `/jogo/` (escolha de personagem, com prévia) e `/jogo/lula/` e `/jogo/flavio-bolsonaro/` (os capítulos), geradas no build. Item **Jogo** no menu e acesso **Jogar com** na entrada do atlas.
- **Quatro capítulos:** dois de cada personagem, sobre 15 acontecimentos publicados, cada um com cenário próprio.
- **Duas mecânicas:** encontrar um registro e organizar dois acontecimentos.
- **Regra da saída:** a porta abre com a tarefa cumprida e todos os registros do capítulo recolhidos. A cena mostra a contagem, e o registro, a saída fechada, o guia e o painel dizem o que falta (D-109).
- **Mundo:** projeção isométrica, colisão com paredes e objetos, desvio na quina, alcance de interação, câmera que acompanha, porta que abre.
- **Desenho por quadro:** o que é fixo na cena é desenhado uma vez, em telas prontas, e só o que se move é redesenhado.
- **Arte por código:** três personagens (os dois jogáveis e o Arquivista, guia fictício), quatro cenários, dezenove tipos de objeto (dezesseis em uso nas quatro cenas), a porta de cada cenário, o registro e os efeitos.
- **Interface:** objetivo e contagem dos registros sobre a cena, registro com resumo, fontes e situação da revisão, tarefa de ordem com nova tentativa, painel **Capítulos e tarefas**, com a releitura de um registro recolhido (D-110), transição, fim da etapa, confirmação de reinício e controles de toque.
- **Avisos editoriais nas telas:** cenário como representação, guia fictício, figura única de cada personagem, ordem não documentada e revisão humana pendente.
- **Progresso** por personagem, no navegador, com versão.
- **Ida e volta** entre o registro, a página do acontecimento e o capítulo.
- **Testes:** regras em Vitest, jornadas no navegador (no desenvolvimento e sobre o build) e carregamento sobre o build, com as falhas de pacote.
- **Comandos novos:** `npm run capture:game`. A passagem `npm run audit:a11y` ganhou as duas telas do jogo, e `npm run test:journeys`, as jornadas do jogo.
- **Documentos:** GAMEPLAY.md (novo), ARCHITECTURE.md, UX.md, DECISIONS.md, README.md, este status e `capturas/README.md`; PERFORMANCE.md e QA.md ganharam a remissão para o jogo.

### Arquivos

| Onde | O quê |
| --- | --- |
| `src/lib/game/` | Novo: `types.ts`, `chapters.ts`, `content.ts`, `mission.ts`, `progress.ts`, `storage.ts`, `scenes/` (quatro cenas e as paletas) e `world/` (`iso`, `grid`, `movement`, `interact`, `camera`, `touch`) |
| `src/features/game/` | Novo: `GameShell.tsx`, `GameStage.tsx`, `CharacterSelect.tsx`, `WorldPreview.tsx`, `hooks.ts`, `draw/` (arte), `engine/` (laço, entrada, desenho da cena) e `ui/` (diálogos, painel, HUD, registro, frases da saída, toque, fronteira de erro) |
| `src/app/` | Novos: `jogo/page.tsx`, `jogo/[personagem]/page.tsx` e, só em desenvolvimento, `dev/jogo-arte/`. Alterados: `page.tsx` (acesso ao jogo), `acontecimentos/[slug]/EventReturn.tsx` (volta ao jogo) e `globals.css` (palco) |
| `src/lib/domain/order.ts`, `src/features/events/chronology.ts` | A regra da ordem em aberto passou ao domínio, para a lista do atlas e o jogo usarem a mesma |
| `src/lib/state/links.ts`, `src/components/` | Endereços do jogo e retorno da ficha; item do menu (`SiteHeader.tsx`) e marca do cartão de perfil (`PersonCard.tsx`) |
| `tests/` | Novos: `game-mission`, `game-progress`, `game-storage`, `game-world`, `game-chapters` e `game-input` (Vitest); `e2e/jogo.spec.ts` e `e2e/jogo-caminho.ts`; `export/jogo.spec.ts` e `export/jogo.capture.ts`. Alterados: `links.test.ts` e `e2e/acabamento.spec.ts` (os acessos da entrada) |
| `scripts/`, raiz | `check-export.mjs` (as páginas do jogo), `audit-a11y.mjs` (as telas do jogo), `eslint.config.mjs` (fronteiras do jogo), `playwright.export.config.ts` e `package.json` (`capture:game`) |
| `docs/`, raiz | Novo: GAMEPLAY.md e `capturas/jogo-etapa-1/`. Atualizados: ARCHITECTURE.md, UX.md, DECISIONS.md, PERFORMANCE.md, QA.md, STATUS.md, `capturas/README.md` e o README.md da raiz |

Nenhuma dependência foi acrescentada. Nenhum registro de `content/` foi alterado. O trabalho das fases 8 e 9 foi preservado.

### Como a etapa foi feita

A mecânica, as regras e a interface foram escritas primeiro, com uma arte provisória. A arte final foi dividida em três frentes paralelas de agentes de IA (personagens, cenário e objetos), e o código passou por uma revisão independente em cinco lentes, também por agentes. O limite de uso da sessão interrompeu os dois trabalhos no meio:

- **Arte.** As três frentes já tinham gravado os personagens, os objetos, os pisos e as paredes. A saída, o registro, os efeitos e a disposição final das cenas ficaram por fazer, e foram desenhados em seguida. A crítica independente da arte, com correções, não rodou.
- **Regra da saída.** Veio depois da primeira entrega: o responsável pelo projeto a viu rodando e pediu que a porta só abrisse com todos os documentos recolhidos. Mudaram a regra pura, o progresso salvo, a cena, as janelas, o painel e os testes, e a mudança teve uma revisão independente própria, por agentes de IA, em três lentes (regras e estado, textos e interface, testes), só de leitura: 17 achados, 12 distintos, todos corrigidos.
- **Revisão.** Duas lentes tinham terminado (editorial e carregamento), com 16 achados. As outras três (estado, entrada e acessibilidade, testes) rodaram de novo depois, sobre o código já corrigido, com mais 24. Ao todo foram 40 achados nas cinco lentes, alguns repetidos entre elas. Cada um foi conferido no código antes de ser corrigido; o do toque em celular foi reproduzido por um teste com toque de verdade, que falhava antes da correção. Na primeira rodada, a conferência de cada achado por um segundo agente, que estava prevista, só chegou a rodar para um deles; na segunda, cada lente tentou refutar os próprios achados antes de devolvê-los, sem segundo agente.

### Problemas achados na conferência e corrigidos

| Problema | Correção |
| --- | --- |
| A fronteira entre os capítulos 1 e 2 de Lula sugeria que a prisão de 1980, só com o ano, veio antes da fundação do PT, de 10 de fevereiro de 1980. A ressalva só existia no painel | Capítulos reagrupados para toda fronteira ficar onde as datas decidem; o aviso do atlas, "ordem dentro de 1980 não documentada", no registro e no painel; teste de todos os pares (D-100) |
| "Quatro mandatos na Assembleia" ao lado de 2002–2014, e motivos de capítulo com enredo ("Do Rio ao Senado") | Títulos e motivos viraram inventários do que os registros dizem, na mesma forma para os dois (D-92) |
| O nome do cenário lia como o lugar do fato, e a ressalva só existia na entrada do jogo, que o acesso **Jogar com** pula | Rótulo "cenário" na cena, na transição e no painel; frase da representação no guia e no rodapé da página do jogo (D-101) |
| O registro lido no jogo não dizia que a conferência foi assistida por IA nem que a revisão humana está pendente | A nota de revisão do atlas no registro, e a frase da edição na entrada e no rodapé (D-102) |
| No último capítulo, o guia mandava "seguir ao próximo período", que não existe | O texto depende de haver capítulo seguinte |
| A explicação da tarefa de ordem saía truncada com os títulos reais ("...e não é eleito é de 2016") | "Datas dos registros: A (data); B (data)", com a fixture do teste em orações |
| Sem armazenamento, ir à ficha de um registro e voltar zerava o progresso, e dois textos diziam o contrário | A cópia em memória passou a ser da página; os textos dizem o que acontece |
| Se o pacote do palco não chegava, a página inteira virava o erro padrão, em inglês | Fronteira de erro em volta do palco e da prévia; o painel continua valendo (D-104) |
| Celular deitado: o palco ficava mais alto que a janela, e o direcional e o botão de ação abriam cortados | O palco cabe na janela, e o que fica sobre a cena encolhe (D-105) |
| Uma direção ficava presa quando Shift mudava durante o movimento, e atalhos do navegador eram engolidos | Teclas lidas pela posição; atalhos passam direto; soltar a tecla de comando solta tudo |
| Em celular, o menu do cabeçalho abria atrás das janelas do jogo | Camada própria para o palco, abaixo do cabeçalho |
| Na tarefa de ordem pelo teclado, o foco sumia ao confirmar, e Esc deixava de valer | O foco acompanha a troca de botões |
| Sem JavaScript, "Carregando o jogo…" para sempre, com o aviso fora da primeira tela | O aviso fica dentro do palco |
| Depois do fim da etapa, a saída não respondia mais; ao reiniciar, o personagem não voltava ao início e podia ficar preso na porta que fechou | A cena recomeça nos dois casos, e a saída vale a cada entrada na célula |
| A prévia do mundo refazia o canvas a cada quadro em telas com densidade fracionária | Tamanho arredondado antes de comparar |
| A página do jogo rolava um pixel, por causa do fio de baixo do cabeçalho | A altura do palco desconta o fio |
| O personagem prendia na quina de uma bancada, em corredor de uma célula | Desvio curto para o lado livre, para quem anda reto (D-105) |
| Registros ficavam escondidos atrás da porta; o tapete do plenário aparecia em retalhos | Disposição das quatro cenas refeita, com a regra escrita no arquivo de cada cena |
| Um progresso salvo de uma edição anterior do capítulo podia concluir a tarefa nova | A leitura descarta registros que o capítulo não cita mais e a ordem confirmada sem os dois registros atuais |
| Textos de capítulo afirmavam mais do que os registros ("em São Bernardo do Campo", "único mandato parlamentar") | Reescritos antes da revisão independente, e conferidos por ela frase a frase |
| Em celular em pé, tocar no botão de ação abria o registro e o mesmo toque já o fechava: o clique que o navegador gera quando o dedo levanta caía no botão da janela, que aparece onde estava o botão de ação | O toque age dentro do próprio `touchstart`, cancelado no mesmo passo, e as janelas não aceitam toque nem clique por 350 ms ao abrir. Teste com toque de verdade (D-107) |
| Desenhada inteira a cada quadro, a cena ia a cerca de 18 quadros por segundo, mesmo com a placa de vídeo | O que é fixo fica em telas prontas, e só o que se move é redesenhado: 55 a 60 quadros por segundo, com o mesmo resultado na tela (D-106) |
| Com a saída aberta, a dica "E Atravessar a saída" e o botão de toque "Atravessar" não faziam nada | A interação com a saída aberta atravessa (D-108) |
| O anel de foco da cena ficava escondido atrás do canvas | O contorno do atlas, virado para dentro, que é pintado por cima do desenho |
| Enter segurado ao recolher fechava o registro que acabara de abrir; a seta segurada ao atravessar rolava a página durante a transição | A repetição de uma tecla que atravessou a troca de tela é descartada, até a tecla soltar (D-108) |
| A entrada do jogo dizia "Ainda não jogado neste navegador" para quem já tinha registros recolhidos | "Continuar", com o capítulo, desde o primeiro registro recolhido |
| Desistir do reinício pedido na tela de fim levava à cena, e não de volta à tela de fim | Volta à tela de fim |
| Quem revia um capítulo concluído e ia à ficha de um registro voltava ao capítulo corrente | A página lembra o capítulo aberto para essa volta, sem guardar nada |
| A tela de fim cortava o começo em celular deitado, sem como rolar até ele | O conteúdo fica no meio quando cabe e rola inteiro quando não cabe |
| Com movimento reduzido, a pasta ainda subia ao ser recolhida | Sem efeito de recolher com movimento reduzido |
| Sem a cena (pacote que não chegou), fechar uma janela deixava o foco solto na página | O foco vai para o botão do painel |
| Nos testes: nenhum conferia quais fontes o registro mostra, nem o que está desenhado no canvas, nem erros não tratados na página; a jornada completa só rodava para Lula; o toque era um evento sintético; textos de capítulo com datas escritas à mão não eram conferidos contra os dados | As fontes são comparadas uma a uma; todo teste do jogo recusa erro de página e lê o canvas; as duas jornadas pelo cenário rodam para os dois personagens; o toque é de verdade; anos, datas e contagens dos textos são conferidos contra os registros |
| Com um registro, a tarefa de ordem ou a transição na tela, a dica do que estava ao alcance ("E Recolher o registro") continuava escrita atrás da janela. Apareceu ao olhar as capturas finais | A dica some enquanto há janela aberta, com teste nas jornadas dos dois personagens |
| Com capítulo concluído e tudo recolhido, não haveria como reler um registro nem chegar à ficha dele pelo jogo: a pasta recolhida some da cena. Visto ao implementar a regra da saída | **Ler de novo**, em cada registro recolhido do painel, sem mexer no progresso (D-110) |
| Com todos os registros recolhidos e a ordem por responder, a cena e a janela da saída fechada repetiam "Recolha dois registros" e não diziam onde responder | A cena diz onde colocar os registros em ordem, e a janela da saída fechada leva à pergunta |
| A contagem dizia "a saída abre com todos" também no capítulo de ordem, em que recolher todos não basta | "a saída abre com todos e a ordem certa", enquanto a ordem não é confirmada |
| A entrada do jogo dizia "recolha todos os registros do atlas", mais do que o jogo tem e sem a tarefa | "em cada capítulo, recolha todos os registros e cumpra a tarefa" |
| No guia, "Falta 1 registro para a saída abrir: eles continuam no cenário" | O singular e o plural acompanham a contagem |
| Depois de reler um registro, o painel voltava ao topo, com o foco em **Voltar ao jogo**; os botões **Ler de novo** tinham todos o mesmo nome | O foco volta ao botão do registro lido, que a janela traz à vista, e cada botão diz no nome qual é o registro |
| Na ordem certa, a frase sobre a saída ficava fora do aviso anunciado a leitores de tela | Fica no mesmo aviso do resultado |
| A legenda do mapa, no código, ainda dizia a regra antiga da saída | Corrigida |
| Nos testes da regra: um teste do progresso gravava um estado igual ao que já existia, e passaria com a função sem efeito; a porta desenhada não era conferida; o estado "tudo recolhido, ordem por responder" não era conferido no painel nem na porta; as frases da regra na entrada do jogo não tinham teste | O teste grava um estado diferente e confere por identidade; o palco diz no documento como desenha a porta (`data-porta`), e os testes conferem; o estado ganhou asserções na cena, no painel, na ficha e na porta; a entrada e as instruções da cena têm as frases conferidas |
| Com a regra, o teste da tecla segurada passou a falhar: os cliques de preparação, dados antes de a janela aceitar ponteiro, deixavam a página rolada | O clique que espera a janela passou ao auxiliar comum dos testes do jogo (D-107) |
| Em sete capturas (a tarefa de ordem e a porta aberta), a página saía rolada, com o cabeçalho fora da tela. Não era o jogo: o robô de captura clicava no instante em que a janela ainda não aceita ponteiro e repetia o clique rolando a página. Com o mouse de verdade e pelo teclado a página não rola (medido nos quatro casos) | O roteiro de capturas espera a janela aceitar o clique e recusa captura com a página rolada. Duas capturas novas: o guia e o rodapé da página do jogo |

### Verificações executadas

Todas em 10 de outubro de 2026. Os comandos do projeto rodaram de novo depois da regra da saída e das correções da revisão dela. Depois disso mudou só o tempo máximo de três testes do jogo, e as jornadas do jogo rodaram mais uma vez sobre o build (26, todas passando). As medições de bancada são anteriores à regra da saída: foram feitas com o código de desenho da cena (`engine/render.ts` e `draw/`) no estado final, e a regra não mexeu nele; ao quadro, ela só acrescentou a gravação de um atributo no elemento da cena. A cadência não foi medida de novo. As revisões independentes são anteriores às correções que elas mesmas pediram.

| Verificação | Resultado |
| --- | --- |
| `npm run check` (lint, tipos, dados, regras, build e conferência da saída) | Passou. 704 testes de regra em 30 arquivos, 197 deles do jogo, em 6 arquivos. 50 páginas HTML, 3 do jogo |
| `npm run test:journeys` (jornadas sobre a exportação estática) | 210 testes, todos passando: 184 do atlas e 26 do jogo |
| `npm run test:export` (carregamento sobre a exportação estática) | 32 testes, todos passando: 16 do atlas e 16 do jogo |
| `npm run test:e2e` (as mesmas jornadas e as telas de prova, no servidor de desenvolvimento) | 231 testes, todos passando: 205 do atlas e 26 do jogo |
| `npm run audit:a11y` (contraste do texto desenhado, rolagem lateral, alvos e ordem de foco) | 10 telas, 4 larguras e a passagem por teclado, sem falha. Nas telas do jogo, o menor contraste é 5,24 na entrada e 7,51 na cena, e o único alvo abaixo de 24 px é o nome do atlas no cabeçalho, o mesmo das demais páginas (QA.md) |
| `npm run capture:game` | 43 capturas em `docs/capturas/jogo-etapa-1/`, tiradas da saída estática, com a regra da saída, e olhadas uma a uma |
| Rolagem da página no caminho pelo painel, em roteiro fora do projeto (cliques do robô, mouse nas coordenadas com e sem espera, teclado) | A página só rola com os cliques do robô dados antes de a janela aceitar ponteiro. Nos outros três casos, não rola |
| Cadência de quadros da cena, em bancada fora do projeto, antes da regra da saída (Chromium sem interface, por software e com a placa de vídeo, 1440×835 e 390×780) | 55 a 60 quadros por segundo, com cerca de 1 ms de desenho por quadro. Sem as telas prontas, 17 a 45 |
| Desenho com telas prontas contra o desenho direto, pixel a pixel, nas quatro cenas (1200×760) | Diferença de até 4 níveis em 255, em menos de 0,2% dos pixels |
| Revisão independente do código, em cinco lentes, por agentes de IA | 40 achados, todos tratados |
| Revisão independente da regra da saída, em três lentes, por agentes de IA, só de leitura | 17 achados, 12 distintos: 2 de severidade média, que são o mesmo teste visto por duas lentes, e os demais de severidade baixa. Todos tratados |

### Implementado e não verificado

- **Aparelho real.** O toque, o direcional e o layout de celular foram conferidos em emulação (390×844 e 360×800 em pé, 844×390 deitado, com toque). Nenhum celular foi usado: o conforto do direcional no dedo, a barra de endereço do navegador móvel, a taxa de quadros real e o toque no botão de ação fora do Chromium não foram vistos.
- **Pausa por perda de foco da janela.** Implementada e lida no código; não há teste automático, porque o navegador de teste não perde o foco.
- **Leitor de tela.** Papéis, nomes e avisos foram conferidos pela estrutura e pelos testes, não com NVDA, VoiceOver ou TalkBack.
- **Firefox e Safari.** Só Chromium.
- **Reconhecimento dos personagens e legibilidade da arte por outras pessoas.** Julgados por quem os fez, pelas capturas. A crítica independente da arte não rodou.
- **Desempenho medido.** As medições de PERFORMANCE.md não incluem as páginas do jogo. O que foi conferido é o que cada página pede e, em bancada fora do projeto, a cadência de quadros nesta máquina.
- **Ritmo com a regra da saída.** Recolher todos os registros alonga cada capítulo: o primeiro de Flávio Bolsonaro tem cinco. Ninguém jogou com a regra, e não se sabe se cansa.
- **Uso por pessoas.** Nenhuma pessoa jogou.

### Pendências reais

1. **Capítulos para os 24 acontecimentos restantes,** e uma ficha própria para os episódios judiciais dentro do jogo (D-92).
2. **Validação com pessoas e revisão humana do conteúdo,** que continuam pendentes e valem também para o jogo.
3. **Aparelho real, leitor de tela e outros navegadores.**
4. **A entrada do atlas como entrada do jogo** (D-99): decisão de produto em aberto.
5. **Uma figura de cada personagem por período** (D-103): hoje cada um tem uma figura só, a de hoje.
6. **Medir o carregamento e a taxa de quadros das páginas do jogo,** com o medidor da fase 8.
7. **Olhar de fora sobre a arte:** a crítica independente não rodou.
8. **Som,** deixado para uma etapa posterior.
9. **Duas abas no mesmo personagem** não se sincronizam: fica guardado o que foi gravado por último.
10. **Toque em aparelho real,** em Android e em iPhone: a correção do toque no botão de ação foi conferida no Chromium, com toque emulado.

### O que falta para expandir aos demais acontecimentos

A lista está em [GAMEPLAY.md](GAMEPLAY.md), no fim: capítulos novos (só configuração e cenário, com o teste conferindo), a ficha dos episódios judiciais, mais cenários, a figura de cada época, mais um ou dois tipos de tarefa e as verificações com pessoas e em aparelho real.

## Fase 9 (revisão editorial, testes e validação com pessoas)

A fase tem duas partes, e elas estão em situações diferentes.

| Parte | Situação |
| --- | --- |
| Editorial e técnica | **Feita em 09/10/2026, com assistência de IA.** As 60 fontes foram abertas de novo, cada registro foi relido contra os documentos, as jornadas rodaram sobre a exportação estática e os problemas encontrados foram corrigidos |
| Validação com três pessoas | **Pendente.** O roteiro e as fichas estão prontos em [USER-VALIDATION.md](USER-VALIDATION.md). Nenhuma sessão foi feita |
| Revisão humana do conteúdo | **Pendente**, como desde a fase 2. O roteiro está em [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md) |

Os três registros da fase: [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), com o conjunto revisado, a conferência fonte por fonte, as correções e as pendências; [QA.md](QA.md), com o ambiente, as jornadas, os checks e as evidências; e [USER-VALIDATION.md](USER-VALIDATION.md), com o roteiro e as fichas. As decisões novas vão de D-87 a D-90, em [DECISIONS.md](DECISIONS.md).

A fase 9 foi commitada na `main` em 10 de outubro de 2026, depois da fase 8 e antes da etapa 1 do jogo.

### Critério de conclusão do plano

"A jornada principal passa, não há informação publicada sem sustentação identificada e as pendências restantes não prejudicam leitura ou interpretação." O pedido da fase acrescentou: validação com pessoas registrada quando efetivamente realizada.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Jornada principal funcionando | Atendido, em emulação | 184 testes de navegador sobre a exportação estática, 205 no servidor de desenvolvimento e a jornada principal percorrida no Chrome e no Edge instalados, com a placa de vídeo. Nenhum aparelho real |
| Informações publicadas com sustentação identificada | Atendido com assistência de IA | 60 de 60 fontes acessadas, e 398 de 398 trechos de evidência encontrados nos documentos de 9 de outubro. A leitura de cada registro contra os trechos foi feita por IA. Nenhuma pessoa a refez |
| Pendências sem prejuízo à leitura ou à interpretação | Atendido para o que a IA consegue julgar | As leituras enganosas encontradas foram corrigidas (cargos chamados só de "Presidente", nota dos cargos em data parcial, anos do eixo ilegíveis). O juízo final sobre interpretação é da revisão humana |
| Validação com pessoas registrada quando realizada | **Não realizada** | Roteiro pronto, fichas em branco. Nada foi inventado |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Revisar a coleção final contra as fontes | Feito com assistência de IA: 39 acontecimentos, 15 cargos, 8 filiações, 2 perfis, 9 lugares, 60 fontes e 2 imagens. 14 correções |
| 2. Conferir todos os links de evidência e registrar a data | Feito em 9 de outubro de 2026. Oito endereços trocados, uma fonte acrescentada, nenhuma indisponível. Quadro fonte por fonte em EDITORIAL-REVIEW.md |
| 3. Testar regras de datas, períodos, filtros e integridade | Feito: 502 testes. Seis novos, para o fuso do aparelho, a igualdade entre as vistas do conteúdo real, o catálogo de fontes e o nome dos cargos |
| 4. Testar escolha de pessoa, seleção, sincronização do mapa e comparação | Feito sobre a exportação estática |
| 5. Testar acesso direto, recarregamento e voltar/avançar | Feito. Achou um defeito que só existia no build |
| 6. Conferir teclado, foco, contraste, movimento reduzido e leitura em celular | Feito em emulação, com um comando novo, `npm run audit:a11y`. Achou os anos do eixo ilegíveis sob a hachura. Leitor de tela e celular real não foram usados |
| 7. Testar falha do mapa e conteúdo sem coordenadas | Feito, com um teste novo para o navegador sem WebGL nas telas reais |
| 8. Três pessoas encontram um episódio e conferem a fonte | **Não feito.** Depende de pessoas. Roteiro pronto |

### O que foi entregue

- **Conteúdo na edição 0.1.1,** com a mesma data de corte, 8 de outubro de 2026. O registro de alterações traz a entrada de 9 de outubro, com 32 registros afetados.
- **Conferência das fontes com data real:** `acessadoEm` de 9 de outubro de 2026 nas 60 fontes; `docs/evidencias/provas-2026-10-09.json`, com 169 citações e 398 trechos; `docs/evidencias/conferencia-2026-10-09.json`, com o acesso a cada fonte.
- **Endereços do TSE que abrem a ficha.** Os sete cadastrados respondiam, mas mostravam uma página de erro.
- **Nome dos cargos que se explica sozinho,** e a nota dos cargos da página do acontecimento com a precisão da data.
- **Anos do eixo legíveis** com um período escolhido.
- **Link com consulta inválida sem a espera de 6 segundos** no build.
- **Jornadas sobre a exportação estática:** `npm run test:journeys`.
- **Passagem de acessibilidade:** `npm run audit:a11y`, com capturas e relatório.
- **Metodologia pública atualizada:** a regra da data do fato e da data da notícia, e o que foi feito na última conferência.
- **Roteiro da validação com três pessoas,** com tarefas, gabarito para quem aplica, perguntas e fichas.
- **Roteiro da revisão humana,** passo a passo.

### Arquivos

Comparação com o estado da fase 8: 76 arquivos, dos quais 35 são as capturas e o relatório de `docs/capturas/fase-9/`.

| Onde | O quê |
| --- | --- |
| `content/published/` | `fontes.json`, `acontecimentos.json`, `mandatos.json`, `filiacoes.json`, `pessoas.json`, `imagens.json` e `edicao.json`. Toda mudança passou pelo pipeline e está em `alteracoes` |
| `docs/` | Novos: EDITORIAL-REVIEW.md, QA.md, USER-VALIDATION.md, `evidencias/provas-2026-10-09.json`, `evidencias/conferencia-2026-10-09.json` e `capturas/fase-9/`. Atualizados: CONTENT-REVIEW.md, SOURCES.md, EDITORIAL.md, PAGES.md, TIMELINE.md, DECISIONS.md, DATA-REPORT.md, STATUS.md, `evidencias/README.md` e `capturas/README.md` |
| `src/` | `lib/state/AtlasUrlStateProvider.tsx` (ordem da revelação do link com consulta), `components/time/PeriodShade.tsx`, `components/time/TimeAxis.tsx` e `features/timeline/Timeline.tsx` (hachura acima dos anos), `app/acontecimentos/[slug]/page.published.tsx` (nota dos cargos) e `app/metodologia/page.tsx` |
| `tests/` | Novo: `e2e/map-package.ts`. Atualizados: `content.test.ts`, `dates.test.ts` e, em `e2e/`, `linha-do-tempo.spec.ts`, `mapa.spec.ts`, `paginas.spec.ts`, `acabamento.spec.ts` e `previa.spec.ts` |
| `scripts/` | Novo: `audit-a11y.mjs` |
| Raiz | `package.json` (dois comandos: `test:journeys` e `audit:a11y`), `playwright.export.config.ts` (projeto das jornadas), README.md e `.claude/project-state.md` |

Nenhuma dependência foi acrescentada. Nenhum acontecimento foi incluído ou retirado. Nenhuma cor, fonte ou tela foi criada.

### Problemas achados e corrigidos

Cada um com causa, mudança e verificação em [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), seção Correções, e em [QA.md](QA.md), seção Falhas encontradas e correções.

| Problema | Correção |
| --- | --- |
| Sete endereços de fichas do TSE abriam "Erro ao carregar a página" | Endereços no formato atual, abertos em navegador |
| Dois trechos sobre a candidatura de Geraldo Alckmin em 2006 eram atribuídos à ficha de Lula | A ficha de Alckmin entrou como fonte |
| O serviço de lideranças do Senado é anunciado como descontinuado | Endereço do substituto, com os mesmos registros |
| Título de uma reportagem, autoria de cinco notícias e data de uma ficha não conferiam com as páginas | Corrigidos como as páginas mostram |
| O registro de 2016 dava a data da notícia do STF como a da decisão | O texto diz que a data é a da publicação |
| O contexto da sentença de 2017 afirmava a confirmação em segunda instância sem citação | Citação acrescentada |
| Dois episódios judiciais de 2018 não traziam a manifestação da defesa, que as fontes trazem | Acrescentada ao contexto |
| O desfecho da denúncia de 2020 vinha de uma reportagem, sem atribuição | Atribuído ao veículo, com a data |
| O perfil de Lula não trazia o nascimento, que o de Flávio Bolsonaro traz | Mês e ano, em que os documentos concordam; a divergência no dia está registrada |
| O início de uma liderança tinha um dia que o registro do Senado não confirma | Precisão de mês, com os dois dias escritos no texto |
| Três cargos de Lula apareciam como "Presidente" na página do acontecimento e na linha do tempo | "Presidente do Sindicato dos Metalúrgicos" e "Presidente do PT" (D-89) |
| A nota dos cargos dizia "na data do acontecimento" mesmo com só o ano documentado | "Na data", "no mês" ou "no ano" |
| Com um período escolhido, os anos do eixo ficavam sob a hachura, com contraste de 1,6:1 | A hachura para acima dos anos (D-88). Contraste de 8:1 |
| No build, um link com consulta inválida deixava a tela encoberta por 6 segundos | Ordem dos efeitos corrigida (D-87) |
| Quatro testes de falha do mapa não testavam nada no build | Auxiliar que reconhece o pacote nos dois ambientes |

### Verificações executadas

Todas em 9 de outubro de 2026, depois da última mudança.

| Verificação | Resultado |
| --- | --- |
| `npm run data:validate` | 0 erros, 0 avisos, 5 pendências (os rascunhos) |
| `npm run check` | Passou: lint, tipos, 502 testes em 24 arquivos, build e conferência da saída (276 arquivos, 47 páginas) |
| `npm run test:journeys` | 184 passando, sobre a exportação estática |
| `npm run test:export` | 16 passando |
| `npm run test:e2e` | 205 passando |
| `npm run audit:a11y` | 32 telas e 8 passagens de teclado, sem problema |
| Conferência das fontes | 60 de 60 acessadas; 398 de 398 trechos encontrados |
| Jornada principal no Chrome 154 e no Edge 154 instalados | 25 de 25 passos em cada um |
| Capturas | 32 telas do build final, olhadas, mais o antes e o depois do eixo |

Dois testes novos foram provados ao contrário, o do fuso e o da hachura: com a regra quebrada de propósito, falharam. Os de endereço inválido falhavam no build antes da correção. O desempenho não foi medido de novo: as mudanças não tocam o que PERFORMANCE.md mede (QA.md, seção Desempenho).

### Implementado e não verificado

- **Aparelho móvel real.** Não havia um disponível. Todo o celular desta fase é emulado.
- **Firefox e Safari.** As versões instaladas com o Playwright são de outra versão da ferramenta e não abrem. Nada foi instalado.
- **Leitor de tela** e zoom do navegador a 200% e 400%.
- **Uso por pessoas.** É a parte pendente da fase.
- **Interpretação dos textos.** A IA procurou afirmação sem apoio e leitura enganosa. Se o atlas interpreta bem cada fonte, quem julga é a revisão humana.
- **Totalização final do primeiro turno de 2026.** O registro usa os números da apuração, e diz isso.
- **Hospedagem.** Tudo rodou no servidor local.

### Pendências reais

1. **Validação com três pessoas.** Aplicar o roteiro de USER-VALIDATION.md, com pelo menos uma sessão em celular de verdade, e registrar o que acontecer.
2. **Revisão humana do conteúdo.** A política do projeto é que a publicação depende dela. A decisão de publicar sem ela, se for o caso, é do responsável.
3. **Fim da filiação de Flávio Bolsonaro ao Republicanos:** o mês vem da combinação de dois documentos. Decisão para a revisão humana.
4. **Firefox e Safari,** antes de publicar: `npx playwright install firefox webkit` e as jornadas nesses navegadores, o que pede um projeto a mais na configuração do Playwright.
5. **Texto sob a hachura na comparação** (D-88): fica velado de propósito. Rever se a validação mostrar dificuldade.
6. **Alvos de toque de 24 pixels** nas marcas da linha do tempo, e o nome do atlas com 22 pixels de altura no cabeçalho (QA.md).
7. **Conferência das fontes como comando do projeto.** Hoje depende de ferramentas escritas na sessão.
8. **Os 5 rascunhos,** com as pendências de cada um.
9. **Herdadas das fases anteriores, sem mudança:** canal público de correção, domínio, nome definitivo, política de segurança de conteúdo, abertura da vista do mapa em rede lenta e as demais da lista da fase 8, abaixo.

### Preparação para a fase 10 (publicação e apresentação)

A fase 10 só começa com um pedido. Antes dela, o que depende de pessoas: a validação com três pessoas e a decisão sobre a revisão humana.

| Passo da fase 10 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Confirmar a hospedagem estática | Exportação estática conferida, com servidor local que se comporta como uma hospedagem comum | Escolher a hospedagem e ler as condições vigentes |
| 2. Metadados, imagens de compartilhamento, sitemap e endereço canônico | Títulos e descrições por página | Domínio, `metadataBase`, sitemap e imagem de compartilhamento (D-69) |
| 3. Build final e conferência da saída | `npm run check`, `npm run test:journeys`, `npm run test:export` e `npm run audit:a11y` | Rodar de novo no dia |
| 4. Publicar | O código está em repositório público no GitHub desde 10/10/2026. Não há hospedagem nem deploy | Só com pedido |
| 5. Conferir páginas e links no endereço público | As jornadas rodam contra o servidor local | Conferir no endereço público, à mão ou com a base das jornadas trocada na configuração; conferir o 404 e o cache da hospedagem |
| 6. Demonstração de 20 a 30 segundos | Roteiro de demonstração em UX.md | Gravar |
| 7. Case | Documentação por fase | Escrever, dizendo com clareza que a revisão foi assistida por IA e o que a validação com pessoas mostrou |
| 8. Textos para redes | Nada | Só com pedido |

Pontos de atenção para quem continuar:

- O case não pode dizer que o conteúdo teve revisão humana, nem que o atlas foi validado com pessoas, enquanto as duas coisas estiverem pendentes.
- Mexeu em efeito do React, rode `npm run test:journeys`: o servidor de desenvolvimento esconde defeito de ordem de efeitos.
- O servidor do TSE recusa pedidos sem cabeçalhos de navegador. Uma conferência automática de links, na hospedagem ou em uma integração contínua, vai acusar erro em fontes que abrem normalmente.
- Seis fontes são documentos vivos. Na próxima edição, a data do documento e o conteúdo podem ter mudado.

## Fase 8 (acabamento visual e desempenho)

Entrega: o acabamento da interface e o desempenho medido em build de produção. Retratos em versões preparadas, com o mesmo enquadramento nos dois perfis; a leitura com o título como âncora; a comparação com as faixas na primeira tela; transições curtas, que acompanham a seleção sem segurar o estado; o mapa carregado só quando vai ser usado; a saída estática corrigida; o link com consulta sem a tela errada; e as medições antes e depois. As condições e os resultados estão em [PERFORMANCE.md](PERFORMANCE.md); o movimento e os estados, em [INTERACTIONS.md](INTERACTIONS.md); a escala e os componentes, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-74 a D-86; as capturas, em [capturas/fase-8/](capturas/README.md).

Para abrir a versão de produção: `npm run build`, `npm run preview` e `http://localhost:4311/`. Em desenvolvimento: `npm run dev` e `http://localhost:3000/`.

### Critério de conclusão do plano

"O fluxo principal permanece legível e responsivo; animações ajudam a acompanhar a seleção; a entrada e as páginas de leitura funcionam sem depender do carregamento do mapa." As metas do plano: "buscar LCP até 2,5 segundos e CLS até 0,1 em medições documentadas", com os resultados de laboratório identificados como tais e o INP deixado para a observação de uso e para os dados de campo.

O pedido da fase escreveu o critério com uma parte a mais: "fluxo principal legível e responsivo, transições que ajudam a acompanhar a seleção, conteúdo acessível sem esperar o mapa e desempenho documentado com medições reais". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Fluxo principal legível e responsivo | Atendido em emulação | A jornada inteira (abrir, escolher a pessoa, mudar o período, abrir um acontecimento, ver a fonte e ir à comparação) passa em teste, em 1440×900 e em 390×844. Nas quatro larguras pedidas, 1440×900, 768×1024, 390×844 e 360×800, nenhuma das sete telas rola para o lado e o título cabe na largura; em 360×800, os controles da jornada têm 44 pixels de altura ou mais. As 39 capturas do build foram olhadas uma a uma. Nenhum aparelho real foi usado |
| Transições que ajudam a acompanhar a seleção | Atendido | Com o movimento ligado, os testes conferem que o endereço e a tela mudam no clique, que seleções e filtros em sequência rápida deixam só o último estado, que a lista rola até o item escolhido em outra parte sem mover a página e que o foco vai para o título da leitura em celular. Quadros tirados no meio das transições, com a placa de vídeo, mostram a leitura já no lugar 50 ms depois do clique, a lista a caminho do item e o anel no marcador e na marca |
| Conteúdo acessível sem esperar o mapa | Atendido | Sobre o build, pelos pedidos reais: a entrada, a comparação, a metodologia e a página 404 não pedem nada do mapa; a exploração em celular só o pede quando a vista **Mapa** é aberta; a página do acontecimento mostra o texto antes, e em celular o mapa espera a rolagem chegar perto |
| Desempenho documentado com medições reais | Atendido, com resultados de laboratório | PERFORMANCE.md, com as condições, o que cada número é e o que ele não é, antes e depois medidos na mesma rodada. Nas cinco telas e nos dois perfis, o LCP ficou entre 320 e 1.612 ms, para uma meta de 2,5 segundos, e o CLS, em no máximo 0,022, para uma meta de 0,1. São resultados de laboratório, com celular emulado |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Refinar abertura, tipografia, imagens e hierarquia dos detalhes | Feito: cartões da entrada antes dos números em tela estreita, retratos com o mesmo enquadramento, título maior que a data na leitura, cabeçalho do perfil com o retrato ao lado do nome, faixas da comparação na primeira tela (D-74, D-82) |
| 2. Ajustar transições de pessoa, período e acontecimento | Feito, só com CSS e sem dependência nova: vista, recorte, troca de pessoa, marcadores, marcas, hachura do período e entrada do mapa (D-80) |
| 3. Carregar o mapa quando necessário e reduzir seu peso na entrada | Feito. A entrada nunca pediu o mapa; a página do acontecimento deixou de carregá-lo abaixo da primeira tela, e o pacote passou a ser aquecido por intenção (D-76) |
| 4. Otimizar imagens localmente antes do build e manter dimensões definidas | Feito: `npm run images`, nove versões WebP por retrato, dimensões declaradas e conferência no build (D-74, D-75) |
| 5. Garantir funcionamento com movimento reduzido | Feito, com teste: transições, aviso de carregamento e rolagem ficam sem movimento, e os estados são os mesmos |
| 6. Medir carregamento, estabilidade visual e resposta dos controles | Feito: `npm run measure`, com os dois builds alternados (D-84) |
| 7. Conferir em computador e em um aparelho móvel real, quando disponível | Feito só em emulação. Não havia aparelho móvel disponível, e o navegador foi um Chromium sem interface. Fica para a fase 9 |

### O que foi entregue

- **Retratos preparados:** nove versões WebP de cada retrato, por moldura e por largura, de 1 a 53 KB, no lugar dos JPEG de 215 e de 290 KB. O enquadramento põe a linha dos olhos na mesma altura e o rosto no mesmo tamanho nos dois perfis. O original, a autoria e as condições de uso não mudaram.
- **Abertura:** em tela estreita, os dois cartões vêm antes dos números da edição e cabem na primeira tela nas quatro larguras.
- **Hierarquia da leitura:** no painel e na página do acontecimento, o título é o maior elemento, e a data continua acima dele, forte e em números de mesma largura. O perfil ganhou um cabeçalho com o retrato ao lado do nome.
- **Comparação:** as faixas vêm logo abaixo do recorte, e as notas de leitura, depois delas e antes das colunas. O cabeçalho ficou menor em celular.
- **Continuidade da seleção:** a lista rola até o item escolhido no mapa, na linha do tempo ou pelo endereço, por dentro dela; o perfil continua montado sob a leitura e volta como estava.
- **Transições:** vista que entra, recorte que muda, troca de pessoa, marcadores e marcas que entram no recorte, hachura do período e entrada do mapa. Só CSS, 120 e 180 ms, depois da primeira ação da pessoa.
- **Mapa sob demanda:** montagem a até 400 px da área visível, aquecimento por intenção no botão da vista **Mapa**, moldura com o tamanho final e aviso de carregamento com um traço que vai e volta.
- **Link com consulta:** a área que depende da consulta fica encoberta, com o aviso "Abrindo a consulta do endereço…", até o endereço ser lido. Vale para a exploração e para a comparação.
- **Saída estática ajustada** depois do build: arquivos de navegação no nome que o navegador pede, 4,5 MB de arquivos do MapLibre sem uso retirados, pré-carregamento da fonte nas páginas de acontecimento. A saída foi de 14,5 MB para 10,3 MB.
- **Navegação por intenção:** o roteador só adianta o destino dos cartões da entrada; menu, nome do atlas e **Comparar as trajetórias** adiantam quando a pessoa aponta (`IntentLink`).
- **Fontes:** o itálico serifado, sem uso, saiu. Duas estratégias de pré-carregamento foram medidas e descartadas.
- **Estado com identidade estável:** selecionar e fechar um acontecimento deixaram de refazer o que não mudou.
- **Medição:** `npm run measure` e `npm run measure:report`, com o resultado bruto em `docs/desempenho/`.
- **Testes sobre o build:** `npm run test:export`, que confere o que cada página pede e quando.
- **Capturas** do build, antes e depois, nas quatro larguras: `npm run capture:finish`.

### Arquivos

Comparação com o estado da fase 7: 61 arquivos de código e de documentação (14 novos, 46 alterados e 1 removido), mais 8 arquivos de medição, 18 versões de retrato e 78 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: PERFORMANCE.md, `desempenho/` (8 arquivos de medição) e `capturas/fase-8/` (39 imagens, mais as 39 de `antes/`). Atualizados: ARCHITECTURE.md, COMPARISON.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, MAP.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `scripts/` | Novos: `images.mts`, `images.config.json`, `finalize-export.mjs`, `measure.mjs` e `measure-report.mjs`. Atualizados: `preview.mjs` (pasta e porta por variável, gzip, `ETag` e cache) e `check-export.mjs` |
| `public/media/derivados/` | Novo: 18 arquivos WebP, gerados por `npm run images` |
| `src/lib/media/` | Novos: `portraits.ts` (molduras, larguras e caminhos das versões) e `portraits.manifest.json` |
| `src/lib/state/` | `AtlasUrlStateProvider.tsx`: identidade estável do recorte e retirada da marca do link com consulta |
| `src/components/` | Novo: `IntentLink.tsx`. Atualizados: `Portrait.tsx`, `PersonCard.tsx`, `ProfilePanel.tsx`, `SiteNav.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx` e `time/PeriodShade.tsx` |
| `src/features/` | `map/MapView.tsx`, `map/PlaceMarker.tsx`, `map/base/README.md`, `events/EventPanel.tsx`, `timeline/Timeline.tsx`, `timeline/EventMarks.tsx` e `timeline/PeriodContext.tsx` |
| `src/app/` | `layout.tsx`, `globals.css`, `page.tsx`, `not-found.tsx`, `politicos/[slug]/Explorer.tsx`, `comparar/Comparison.tsx`, `acontecimentos/[slug]/page.published.tsx`, `acontecimentos/[slug]/EventReturn.tsx`, `metodologia/page.tsx`, `dev/previa/page.dev.tsx` e `fonts/README.md`. Removido: `fonts/newsreader-latin-italic.woff2` |
| `tests/` | Novos: `portraits.test.ts`, `e2e/acabamento.spec.ts`, `export/carregamento.spec.ts` e `export/acabamento.capture.ts`. Atualizados: `e2e/previa.spec.ts` e `e2e/prova.spec.ts` |
| Raiz | `package.json` (seis comandos novos e o `sharp`), `package-lock.json`, `playwright.export.config.ts` (novo), `next.config.ts` (só comentário), README.md, `content/README.md` (nota sobre os retratos) e `.claude/project-state.md` |

Nenhum registro de `content/` foi alterado. Uma dependência foi declarada, de desenvolvimento: o `sharp`, que já estava instalado como parte do Next (D-85). Nenhuma cor e nenhuma família tipográfica foram criadas. As capturas das fases 4 a 7 não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- A jornada principal, do começo ao fim, em computador e em celular.
- Abertura nas quatro larguras, com os dois cartões inteiros na primeira tela e do mesmo tamanho.
- Retratos na mesma moldura, com as dimensões declaradas e as versões certas para cada largura.
- Título como âncora no painel e na página; faixas da comparação na primeira tela.
- Seleção vinda da lista, da linha do tempo, do mapa e do endereço, com as partes no mesmo acontecimento.
- Transições com o movimento ligado e com movimento reduzido.
- Link com consulta na exploração e na comparação: encoberto, revelado, sem consulta, e a saída quando o código da página não chega.
- Mapa indisponível e página do acontecimento aberta direto, que já vinham das fases 6 e 7, conferidos de novo no build e nas capturas.
- Sobre o build: o que cada página pede, o mapa adiado, os retratos e a navegação.

Em demonstração, com o contrato de cada um em INTERACTIONS.md, sem mudança nesta fase: canal de correção, endereço público, fonte indisponível, imagem de acontecimento, rótulos da base e lugares fora da América do Sul.

### O que a fase 7 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Acabamento do perfil, da metodologia e da barra do recorte da comparação | O perfil ganhou cabeçalho e ritmo próprios. A comparação mostra as faixas primeiro e tem o cabeçalho menor em celular. A metodologia foi conferida nas quatro larguras e ficou como estava |
| Rever as transições com a comparação e com as páginas novas | Feito (D-80). A comparação e as páginas de leitura não ganharam transição de entrada: continuam com as de cor, de foco e da seta dos blocos que abrem |
| Medir o peso do pacote do mapa e tirar do build o worker de desenvolvimento do MapLibre | Feito: o peso está em PERFORMANCE.md, e os seis arquivos sem uso saem depois do build (D-77) |
| Conferir formato e peso das imagens | Feito (D-74) |
| Conferir o movimento reduzido no que a fase acrescentar | Feito, com teste |
| LCP, CLS e resposta dos controles, com o resultado identificado como de laboratório | Feito (PERFORMANCE.md) |
| Abrir em uma janela visível e em um celular | Não feito: não havia aparelho, e o navegador foi um Chromium sem interface. As medições e os quadros das transições usaram a placa de vídeo da máquina |
| Pendência 8 da fase 7: estado inicial por um instante | Resolvida para a exploração e a comparação (D-83). Nos links de retorno da página do acontecimento, a página não é encoberta: o contexto só muda os links |
| Pendência 11 da fase 7: pedidos de pré-carregamento com 404 na saída estática | Resolvida (D-77) |
| Ponto de atenção da fase 6: quadro opaco sobre o mapa parado, que não se sabia se acontecia com placa de vídeo | Conferido com a placa de vídeo: um quadro opaco aberto sobre o mapa não apaga a base. Por software, no mesmo roteiro, apaga. O defeito é do desenho por software, e o fundo a 98% continua porque é assim que os testes rodam (MAP.md) |

### Problemas achados na conferência e corrigidos

A conferência começou pelo build da fase 7: capturas das telas nas quatro larguras e uma medição completa, antes de qualquer mudança. Depois, cada mudança foi medida contra esse build.

| Problema | Correção |
| --- | --- |
| Na entrada em celular com rede lenta, o maior elemento da tela era um retrato JPEG de até 290 KB, que só terminava de chegar depois de 4 segundos | Versões WebP por moldura e por largura, com prioridade só nos dois cartões |
| As duas fotos oficiais têm cortes diferentes: na mesma moldura, um rosto ficava maior do que o outro | Enquadramento definido para cada retrato, com o mesmo critério |
| Toda página com link para a entrada baixava os retratos dos cartões sem mostrá-los | `Portrait` passou a ser componente de cliente (D-75), com teste sobre o build |
| No build feito no Windows, os arquivos de navegação saíam em pastas e o navegador os pedia com pontos: 404, e a troca de página recarregava o documento | Renomeados depois do build (D-77) |
| Corrigido o 404, cada página passou a baixar e a processar o destino de todos os links visíveis | Pré-carregamento por intenção (D-78) |
| O build publicava 4,5 MB de arquivos do MapLibre que nenhuma página pede | Retirados depois do build |
| As 39 páginas de acontecimento saíam sem o pré-carregamento da fonte da interface | Completado depois do build |
| A página do acontecimento carregava o mapa mesmo com ele abaixo da primeira tela | O mapa só é montado a até 400 px da área visível |
| O trecho de script do link com consulta, posto no começo do `<body>`, atrasava o primeiro desenho de todas as telas, de 40 a 140 ms no perfil de celular | Passou para o fim do `<body>` |
| Abrir um acontecimento refazia os pontos do mapa, os lugares, o agrupamento e as contagens, sem nada ter mudado; fechar reconstruía o perfil | Identidade estável do recorte e perfil montado sob a leitura (D-81) |
| Escolher um acontecimento no mapa ou na linha do tempo não levava a lista até o item | A lista rola até ele, por dentro, sem mover a página |
| Em celular, os cartões da entrada ficavam cortados no fim da primeira tela | Cartões antes dos números da edição |
| Na comparação, quatro parágrafos empurravam as faixas para fora da primeira tela, em qualquer largura | Faixas logo abaixo do recorte |
| Na leitura, a data era o maior elemento e disputava com o título | Título maior do que a data (D-82) |
| Quem abria um link com consulta via primeiro a lista inteira e o perfil, e só depois o que o link pedia | Área encoberta, com aviso, até o endereço ser lido (D-83) |
| O servidor de pré-visualização não mandava validadores de cache nem compressão, e as medições não pareciam com as de uma hospedagem | `scripts/preview.mjs` passou a responder com gzip, `ETag` e cache longo |
| O itálico da Newsreader, de 143 KB, era publicado sem que nenhuma página o usasse | Arquivo removido |
| Medidos em momentos diferentes, os mesmos arquivos davam resultados até 50% diferentes | Os dois builds são medidos na mesma rodada, com as execuções alternadas (D-84) |
| O medidor deixava o worker do mapa (141 KB) fora do peso transferido, porque o navegador informa corpo de tamanho zero para o script de um worker | O medidor passou a usar o tamanho declarado pelo servidor, e a medição final foi refeita |
| Com movimento reduzido, se o código da página não chegasse, o aviso "Abrindo a consulta do endereço…" continuava sobre a tela depois dos 6 segundos. A regra geral de movimento reduzido trocava a duração zero por 0,01 ms, e o aviso não chegava ao estado final | As duas regras do link com consulta ficaram fora da redução de movimento. O defeito foi achado quando o teste passou a esperar a tela aparecer de fato, em vez de conferir só a configuração |
| O teste que protegia a D-75 passava com a regra quebrada: desde o pré-carregamento por intenção, a metodologia não busca mais a entrada sozinha, e o teste não exercitava nada | O teste passou a levar o ponteiro ao nome do atlas e a conferir que o conteúdo da entrada chega sem imagem. Com a regra quebrada, ele falha |
| O servidor de desenvolvimento continuou servindo o CSS antigo depois de uma mudança em `globals.css`, mesmo reiniciado | O cache do Turbopack fica em `.next/dev` e sobrevive ao reinício: é preciso apagá-lo. Registrado nos pontos de atenção |
| A documentação dizia que, sem JavaScript, a área encoberta aparecia em 6 segundos. Com o JavaScript desligado, o trecho não roda e nada é encoberto; os 6 segundos valem quando o código da página não chega | Texto corrigido em três documentos, e o teste passou a esperar a área aparecer de fato |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run data:validate` | Nenhum erro; 5 pendências, que são os 5 rascunhos |
| `npm run test` | 496 testes passando, em 24 arquivos. Eram 485 em 23: entraram os 11 das versões dos retratos |
| `npm run build` | 47 páginas HTML, como antes. O ajuste da saída renomeou 44 arquivos de navegação, retirou 6 arquivos do MapLibre (4,5 MB) e completou o pré-carregamento da fonte em 42 páginas |
| `npm run verify:export` | 276 arquivos, 10,3 MB; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento. Passou a conferir também as versões dos retratos, os arquivos de navegação, os arquivos do MapLibre e o pré-carregamento da fonte |
| `npm run test:e2e` | 201 testes passando: 14 da prova sintética, 7 dos dados reais, 26 da prévia, 40 da navegação temporal, 35 do mapa, 23 da comparação, 25 das páginas e 31 do acabamento, que são os desta fase. Eram 170 |
| `npm run test:export` | 16 testes passando, sobre a saída estática servida por `scripts/preview.mjs` |
| `npm run capture:finish` | 39 capturas do build final, mais as 39 do build da fase 7 em `antes/`, tiradas pelo mesmo roteiro. Conferidas uma a uma |
| `npm run measure` | 5 telas, 2 perfis, 7 execuções de cada build, alternadas, com a placa de vídeo. Resultado em `docs/desempenho/antes.json` e `depois.json`; tabelas em PERFORMANCE.md |
| Quadros no meio das transições | 15 quadros, com o movimento ligado e a placa de vídeo: seleção e filtro em computador, leitura e vista do mapa em celular, e o link com consulta antes e depois de o endereço ser lido. Olhados um a um; não ficam no repositório |
| Larguras | 1440×900, 768×1024, 390×844 e 360×800, por teste e pelas capturas |
| Movimento reduzido | É o modo padrão dos testes de navegador. Um teste confere que as transições e o traço do aviso de carregamento ficam sem movimento |
| Mapa indisponível | Capturas em computador e em celular, sem WebGL: a lista de lugares no lugar do mapa, com a leitura funcionando |
| Página de um acontecimento aberta direto | No build: o texto chega antes do mapa, nada se desloca, e em celular o mapa espera a rolagem |
| Nenhum pedido a outro domínio | Conferido no build, nas telas principais |

Dezenove regras foram quebradas de propósito, para confirmar que os testes falham. Onze no navegador: a lista sem rolar até o item, o perfil remontado a cada seleção, o título menor do que a data, os números da edição antes dos cartões, a marca do link com consulta nunca retirada, a área sem ser encoberta, a comparação fora da regra do link com consulta, a seleção esperando 400 ms, a redução de movimento desligada, um título mais largo do que a tela e a transição de vista desligada. Seis sobre o build: o mapa montado a 6.000 px da área visível, o retrato como componente de servidor, o menu adiantando todos os destinos, os cartões da entrada sem prioridade, os arquivos de navegação sem renomear e as páginas sem o pré-carregamento da fonte. Duas nas regras dos retratos: o nome do arquivo sem a moldura e um enquadramento alterado sem gerar as versões. Dezoito foram notadas na primeira passagem. Uma não foi, a do retrato como componente de servidor, e o teste foi refeito (tabela acima); repetida, foi notada. O código foi restaurado em todos os casos.

### Implementado e não verificado

- **Aparelho móvel real.** Não havia um disponível. Tela, toque, rede e processador foram emulados em um notebook. A rolagem com o dedo, a barra de endereço do navegador móvel e o tempo real para abrir a vista do mapa não foram vistos.
- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface. As medições e os quadros das transições usaram a placa de vídeo; os testes, o desenho por software.
- **Dados de campo e INP.** Não existem: o atlas não foi publicado.
- **Hospedagem real.** A compressão, o protocolo e o cache do servidor local não são os de uma hospedagem. O cache longo para `/_next/static/` e o `404.html` dependem dela.
- **Build no Linux ou no macOS.** Todos os builds foram feitos no Windows. O primeiro passo do ajuste da saída não deve ter o que fazer em outro sistema, e isso não foi visto.
- **Navegador sem WebP.** O retrato não aparece; o nome e o texto continuam. Não foi testado.
- **Leitor de tela.** Os dois avisos novos, "Abrindo a consulta do endereço…" e "Carregando o mapa…", têm `role="status"` e foram conferidos pela estrutura, não com um leitor de tela.
- **Segunda visita.** Todas as medições são com o cache vazio.
- **Leitura das telas por outra pessoa.** A hierarquia e o ritmo foram julgados por quem os fez, pelas capturas. A validação com pessoas é da fase 9.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal. É da fase 9.
2. **Aparelho móvel real e navegador com janela.** Nada desta fase foi visto fora de um Chromium sem interface, com celular emulado.
3. **Abrir a vista do mapa em celular com rede lenta leva perto de 4 segundos,** antes e depois. O gargalo é o pacote e o worker do MapLibre, e não há saída dentro do pacote (D-86).
4. **O primeiro desenho da página do acontecimento em celular ficou 112 ms mais tarde** (de 1.032 para 1.144 ms, no perfil emulado). Está dentro da meta. Um terço vem do pré-carregamento da fonte, medido; o resto não foi isolado (PERFORMANCE.md, Leitura dos resultados).
5. **Bloqueio de 0,5 a 0,9 segundo no carregamento, no perfil de celular.** Não mudou nesta fase.
6. **Dados de campo e INP:** só depois da publicação.
7. **Hospedagem** (fase 10): compressão, cache longo para `/_next/static/`, `404.html` e tipo de conteúdo dos arquivos `.mjs`. Medir de novo no endereço público.
8. **Política de segurança de conteúdo** (fase 10): precisa permitir o trecho de script do link com consulta, que é o único escrito dentro do HTML.
9. **Passos do ajuste da saída:** dependem das versões do Next e do MapLibre. Rever a cada atualização.
10. **Navegador sem WebP** não mostra o retrato. Não há versão em outro formato.
11. **A instância do mapa não é mantida na troca de pessoa** (D-86).
12. **Capturas das fases 4 a 7** mostram a interface de antes do acabamento. Não foram refeitas; `docs/capturas/README.md` avisa.
13. **Herdadas, sem mudança:** canal público de correção e domínio público, que são decisões do responsável; nome definitivo e retrato em cinza e recortado (D-42); a natureza de cada fonte, que não aparece nas páginas; 4 das 59 fontes sem data do documento; vídeo de demonstração não gravado; lacunas de conteúdo (lista na seção da fase 3).

### Preparação para a fase 9 (revisão editorial, testes e validação com pessoas)

O critério da fase 9, no plano: a jornada principal passa, não há informação publicada sem sustentação identificada, e as pendências restantes não prejudicam leitura ou interpretação. Situação de cada passo:

| Passo da fase 9 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Revisar a coleção final contra as fontes | 39 acontecimentos conferidos com assistência de IA, com o roteiro de revisão no fim de CONTENT-REVIEW.md | A revisão humana, que é a pendência principal desde a fase 2, e a decisão de quem a assina |
| 2. Conferir todos os links de evidência e registrar a data | Os endereços conferem com os registros; nenhum foi aberto desde a pesquisa | Abrir as 59 fontes e registrar a data da conferência |
| 3. Testar regras de datas, períodos, filtros e integridade | Testes unitários das regras e validação do conteúdo no build | Rodar de novo depois de cada ajuste no conteúdo |
| 4. Testar escolha de pessoa, seleção, sincronização do mapa e comparação | Testes de navegador das fases 5 a 8, mais a jornada principal em computador e em celular | Repetir o que os ajustes da fase 9 afetarem |
| 5. Testar acesso direto, recarregamento e voltar/avançar | Testes de navegador, e os testes sobre o build | O mesmo |
| 6. Conferir teclado, foco, contraste, movimento reduzido e leitura em celular | Contraste medido em teste, foco e teclado por teste, movimento reduzido por teste | Leitor de tela, zoom de texto e um celular real |
| 7. Testar falha do mapa e conteúdo sem coordenadas | Cinco falhas tratadas e testadas; acontecimentos sem ponto acessíveis pelo mapa | Ver a falha em um aparelho real |
| 8. Três pessoas encontram um episódio e conferem a fonte | Nada | Recrutar, observar e registrar as dificuldades |

Pontos de atenção para quem continuar:

- Para ver o que a pessoa recebe, use o build: `npm run build` e `npm run preview`. O servidor de desenvolvimento não tem o ajuste da saída, e nele o pré-carregamento e os pacotes são outros.
- Ao trocar um retrato ou o enquadramento, rode `npm run images` e olhe o resultado. O build recusa versões desatualizadas.
- Os três passos de `scripts/finalize-export.mjs` corrigem defeitos de versões específicas do Next e do MapLibre. Ao atualizar qualquer um dos dois, confira se o defeito continua; se não, o passo sai.
- Um link novo entre páginas precisa de uma decisão sobre o pré-carregamento: padrão só para o caminho principal, `IntentLink` para a navegação, `prefetch={false}` para o resto (D-78).
- Em um teste que abre uma página com consulta, espere a marca `data-consulta` sair antes de agir.
- Se o servidor de desenvolvimento mostrar o CSS antigo depois de uma mudança em `globals.css`, reiniciar não basta: apague `.next/dev` antes de subir de novo.
- Para comparar o desempenho de uma mudança, meça os dois builds na mesma rodada (`--contra`). Números de rodadas diferentes não se comparam.
- A medição leva perto de uma hora com 7 execuções e trava a máquina para outras tarefas: rodar testes ou builds ao mesmo tempo estraga os números.

## Fase 7 (comparação, páginas e fontes)

Entrega: a comparação das duas trajetórias no mesmo período e com as mesmas categorias, com a consulta no endereço; o perfil completo dentro da exploração; a página de cada acontecimento com fontes, créditos, revisão e edição; **Copiar link** e o retorno com o recorte de antes; e a metodologia pública. A especificação está em [COMPARISON.md](COMPARISON.md) e em [PAGES.md](PAGES.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-66 a D-73; as capturas, em [capturas/fase-7/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/comparar/`. Exemplos de endereço estão em COMPARISON.md, em PAGES.md e no README.

### Critério de conclusão do plano

"Links de acontecimentos abrem diretamente; recarregar preserva a consulta relevante; a comparação respeita cargos e períodos diferentes. Quantidade de registros não é apresentada como medida de desempenho."

O pedido da fase escreveu o critério com mais alcance: "comparação contextualizada, páginas estáticas acessíveis por link direto, fontes e créditos visíveis, compartilhamento preservando a consulta e metodologia pública dentro do projeto". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Comparação contextualizada | Atendido | As duas trajetórias saem da mesma consulta, com o mesmo período e as mesmas categorias, sobre um eixo só. Os testes de navegador comparam cada coluna com a conta feita sobre os dados gerados, conferem que as duas faixas têm a mesma posição e a mesma largura, que cargos e filiações trazem instituição e intervalo, que o recorte vazio diz falta de registro e não de atividade, e leem o texto da página atrás de palavras de ranking |
| Páginas estáticas acessíveis por link direto | Atendido | 39 páginas de acontecimento e 2 de perfil, geradas no build. Na saída estática, servida por `npm run preview`, as 44 rotas responderam 200 por pedido direto; um slug inventado e um slug de rascunho responderam 404, com a página 404 do atlas. O servidor de desenvolvimento responde do mesmo jeito, com teste |
| Fontes e créditos visíveis | Atendido | Cada acontecimento, cada cargo e cada filiação mostra as próprias fontes, com o trecho e o que ele sustenta. Um teste percorre as 39 páginas e confere que os links de fonte são os do registro, sem link a mais; outro confere as 59 fontes do catálogo da metodologia. Crédito do retrato com autoria, origem e condições de uso; crédito da base do mapa |
| Compartilhamento preservando a consulta | Atendido | **Copiar link** na exploração, na comparação e na página do acontecimento, conferido lendo a área de transferência. O link da exploração reproduz recorte e seleção; o da comparação, o recorte. Com a cópia recusada ou indisponível, o endereço aparece em um campo e nada é confirmado. O retorno da página devolve pessoa, período, categorias e seleção, inclusive em uma aba nova |
| Metodologia pública dentro do projeto | Atendido, com uma configuração pendente | `/metodologia/`, com onze seções e os números vindos dos dados. O canal público de correção não foi definido: a página diz isso e oferece um modelo para copiar |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Comparação das duas trajetórias em um mesmo intervalo | Feito: período e categorias no estado compartilhado e no endereço, sem pessoa em foco (D-66) |
| 2. Cargos, filiações e acontecimentos de cada pessoa | Feito: uma coluna por pessoa, com as mesmas seções na mesma ordem, mais as fontes do recorte |
| 3. Mesma escala temporal e cobertura explicada | Feito: um eixo só, os mesmos limites, e o bloco **Como ler esta comparação**, escrito com os dados do recorte |
| 4. Páginas estáticas por perfil e por acontecimento | Feito. O perfil é a própria exploração, com o painel completo (D-67); a página do acontecimento ganhou retorno, cópia do link, edição e caminhos |
| 5. Fontes, créditos e data de revisão nas páginas | Feito: fontes por registro, catálogo sem repetição, crédito do retrato com origem, revisão e edição em todas as páginas de leitura (D-71) |
| 6. Cópia de link e retorno à exploração | Feito: endereço do ambiente em execução, confirmação só depois do sucesso, campo selecionável na falha e contexto de retorno no endereço da página (D-68, D-69) |
| 7. Metodologia e instruções para sugerir uma correção | Feito, com o canal pendente e um modelo copiável no lugar dele (D-70, D-72) |

### O que foi entregue

- **Comparação por período e categorias** em `/comparar/`, com o mesmo provider de estado da exploração. Recarregar, voltar e avançar restauram a consulta; parâmetro inválido cai sozinho e o endereço é corrigido no lugar.
- **Leitura paralela:** em tela larga, as seções das duas colunas começam na mesma altura. Em celular, o recorte fica escrito e preso ao topo, os controles ficam atrás de **Filtros**, e as faixas rolam até o período escolhido mantendo o eixo de anos.
- **Linguagem da comparação:** quantidade dita como acontecimentos cadastrados, cobertura de cada pessoa, trecho fora da cobertura e lacunas explicados. Nenhuma soma, ordem, média ou cor por pessoa.
- **Acontecimento das duas pessoas** nas duas trajetórias, com a nota "nas duas trajetórias" e uma página só.
- **Perfil** no painel da exploração: apresentação, cargos e partidos com intervalo, marca **em curso** e fontes de cada registro, cobertura, fontes do perfil, revisão, edição e crédito do retrato com origem.
- **Página do acontecimento:** retorno por pessoa e à comparação, **Copiar link**, resumo e contexto em seções com nome, revisão e edição, **Sugerir uma correção**, **Continuar no atlas** e créditos.
- **Fontes:** `RecordSources` para as fontes de um registro e `SourceCatalog` para os documentos de um conjunto, sobre a mesma identificação de documento da `SourceList`.
- **Copiar link** (`CopyLink`), com os três estados, e os endereços entre telas em um módulo puro (`src/lib/state/links.ts`).
- **Metodologia** reescrita: objetivo e escopo, seleção, fontes, a revisão que de fato aconteceu, datas, lugares, lacunas e limites da comparação, edição e atualização, correção, créditos e o catálogo das 59 fontes.
- **Modelo de sugestão de correção,** que já vem com o link e o título quando a pessoa chega pela página de um acontecimento.
- **Guia de estados** (`/dev/previa/`) com os cargos e partidos com fontes, o catálogo e a cópia do link.
- **Capturas** da fase e o comando que as refaz: `npm run capture:pages`.

### Arquivos

Comparação com o estado da fase 6: 51 arquivos de código e de documentação (14 novos e 37 alterados), mais 23 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: COMPARISON.md, PAGES.md e `capturas/fase-7/` (23 imagens). Atualizados: ARCHITECTURE.md, CONTENT-REVIEW.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, SOURCES.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/lib/state/` | Novos: `links.ts` (endereços entre telas e retorno) e `location.tsx` (leitura do endereço no navegador). Atualizados: `url-state.ts` (rota sem pessoa e modo de comparação), `selectors.ts` (`selectComparison`) e `AtlasUrlStateProvider.tsx` |
| `src/lib/` | Novo: `site.ts` (configuração pendente). Atualizado: `data/queries.ts` (`listSourcesOf`) |
| `src/components/` | Novos: `CopyLink.tsx` e `RecordSources.tsx`. Atualizados: `ProfilePanel.tsx`, `PeriodRecords.tsx`, `SourceList.tsx`, `EditionStatus.tsx`, `Portrait.tsx` e `time/EventMarkLinks.tsx` |
| `src/features/` | `comparison/TrajectoryLanes.tsx` e o README da pasta, `events/EventPanel.tsx`, `events/EventLinkList.tsx` e `timeline/PeriodContext.tsx` |
| `src/app/` | Novos: `acontecimentos/[slug]/EventReturn.tsx` e `metodologia/CorrectionTemplate.tsx`. Reescritos: `comparar/Comparison.tsx` e `metodologia/page.tsx`. Atualizados: `comparar/page.tsx`, `acontecimentos/[slug]/page.published.tsx`, `politicos/[slug]/page.tsx`, `politicos/[slug]/Explorer.tsx` e `dev/previa/StatesGallery.tsx` |
| `tests/` | Novos: `links.test.ts`, `comparison.test.ts`, `e2e/comparacao.spec.ts`, `e2e/paginas.spec.ts` e `e2e/paginas.capture.ts`. Atualizados: `e2e/previa.spec.ts` e `e2e/linha-do-tempo.spec.ts` |
| Raiz | `package.json` (`capture:pages`), README.md e `.claude/project-state.md` |

`content/` não foi alterado, nenhuma dependência foi acrescentada, nenhum token de cor ou de tipografia foi criado, e as imagens de `docs/capturas/fase-4/`, `fase-5/` e `fase-6/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Comparação: estado inicial, período, categorias combinadas com o período, acontecimento compartilhado e datas parciais.
- Endereço da comparação: recarregar, voltar e avançar, parâmetros inválidos, correção sem entrada no histórico e ajustes seguidos contando como um.
- Cargos e partidos do período, com o que as datas não decidem; recorte sem registros; texto sem ranking; fontes de cada registro e do recorte.
- De uma tela para outra: comparação, página do acontecimento e exploração, nos dois sentidos, com o recorte.
- Perfil dos dois políticos, com as mesmas seções na mesma ordem; perfil em celular.
- Página do acontecimento por link direto, para um registro de cada tipo; as 39 páginas com os links de fonte do registro; leitura sem o mapa.
- Retorno sem contexto, com contexto, em aba nova, com contexto inválido e para o acontecimento das duas pessoas.
- Cópia do link com sucesso, recusada e indisponível, na comparação, na exploração e na página.
- Metodologia: seções, catálogo, créditos, canal pendente e modelo de correção.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: canal de correção, endereço público, fonte indisponível, imagem de acontecimento, rótulos da base e lugares fora da América do Sul.

### O que a fase 6 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Ligar a comparação ao estado e ao endereço | Feito, com o provider da exploração (D-66) |
| Rever cargos e filiações com o recorte vindo do endereço | Feito: as listas saem da mesma consulta, com o título de cada seção dizendo o período |
| Conferir a mesma escala com período e categorias no endereço | Feito, com teste da posição e da largura das duas faixas |
| Rever o conteúdo das páginas de perfil e de acontecimento | Feito (PAGES.md) |
| Conferir o que faltava nos perfis | Faltavam as fontes de cada cargo e de cada filiação, a edição e a origem do retrato. Entraram |
| Botão de copiar e retorno com o recorte de antes | Feitos (D-68, D-69) |
| Revisar a metodologia e escrever o caminho de correção | Feito. O canal continua sendo decisão do responsável (D-70) |
| Pendência 10 da fase 6: página que voltava sem o recorte e comparação fora do endereço | Resolvida |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo cada tela em um Chromium, em computador, tablet e celular, capturando e olhando cada captura, e depois quebrando regras de propósito.

| Problema | Correção |
| --- | --- |
| Em tela larga, a barra do recorte da comparação mudava de altura quando **Limpar filtros** aparecia | O botão passou para a linha dos rótulos |
| Em celular, a barra do recorte da comparação quebrava em duas linhas | O texto encolhe e o botão **Filtros** mantém a largura |
| A metodologia passava da largura da tela em celular, por causa da tabela das categorias | A coluna do texto deixou de crescer com a tabela, que rola por dentro |
| A lista "ordem de preferência" das fontes saía com marcadores, e não com números | Classes de lista separadas |
| "Presidente" não identifica um cargo: há mais de um registro com o mesmo nome | Os itens de cargo e de filiação levam o identificador do registro, e os testes usam o identificador |
| O teste de parâmetros inválidos da comparação passava mesmo com a comparação abrindo acontecimento, porque o acontecimento do teste ficava fora do período | O teste ganhou um acontecimento dentro do recorte |
| O teste do modelo de correção passava antes de a página ler o endereço | A troca do endereço é feita com a página já lendo o endereço |
| Um teste da fase 5 esperava que o link da página do acontecimento não levasse o recorte | Atualizado para o contrato novo |
| Dois testes da prévia cobriam a comparação da fase 4, com o período local | Substituídos pelos de `e2e/comparacao.spec.ts` |
| SOURCES.md e CONTENT-REVIEW.md falam em 166 citações, e as páginas mostram 160 | As 6 restantes são dos 5 rascunhos. Os dois documentos passaram a dizer isso; nenhum registro foi alterado |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run data:validate` | Nenhum erro; 5 pendências, que são os 5 rascunhos |
| `npm run test` | 485 testes passando, em 23 arquivos. Eram 435 em 21 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 170 testes passando: 14 da prova sintética, 7 dos dados reais, 26 da prévia, 40 da navegação temporal, 35 do mapa, 23 da comparação e 25 das páginas. Eram 124. Dois testes da prévia, sobre a comparação antiga, deram lugar aos novos |
| `npm run capture:pages` | 23 capturas, conferidas uma a uma |
| Saída estática, servida por `npm run preview` | As 44 rotas respondem 200 por pedido direto. Comparação aberta com consulta, recarregada, com voltar e avançar e com endereço corrigido; perfil; página do acontecimento com e sem contexto; retorno à exploração e à comparação; link copiado com o endereço do servidor local; link em campo sem a área de transferência; metodologia com as onze seções, as 59 fontes e o modelo de correção: tudo como no servidor de desenvolvimento. Slug inexistente e slug de rascunho respondem 404, com a página 404 do atlas. Nenhum pedido a outro domínio |
| Conferência dos links | Nenhuma citação sem fonte, nenhuma fonte sem citação, nenhum endereço repetido ou sem `https` nos dados gerados (PAGES.md, seção Conferência dos links) |
| Larguras conferidas pelas capturas | 1440×900, 768×1024 e 390×844 |
| Teclado e foco | Na falha da cópia, o foco vai para o campo com o endereço selecionado, e no modelo de correção o texto fica selecionado (testes). Os blocos de fontes são elementos nativos de abrir e fechar |
| Toque | Em 390×844: 44 pixels ou mais de altura nas fontes de cada registro e nos caminhos do perfil, e nos controles do recorte da comparação |

Vinte e uma regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham. Oito nas regras puras: comparação abrindo acontecimento, categorias valendo para um lado só, retorno com um recorte que não contém o acontecimento, retorno sem ajuste à cobertura, **Voltar à comparação** para quem não veio dela, lado aberto do período virando a escala inteira, página levando o acontecimento como aberto e fonte contada por citação. Treze no navegador: cópia confirmada sem sucesso, links da comparação sem contexto, comparação tratada como exploração, retorno ignorando o contexto, exploração abrindo a página sem o recorte, perfil sem as fontes dos cargos, perfil sem a edição, catálogo só com acontecimentos, modelo aceitando qualquer slug, colunas desalinhadas, recorte solto em celular, página sem a edição e fonte com o endereço trocado. Dezenove foram notadas na primeira passagem. Duas não foram, e os dois testes foram reforçados (tabela acima); repetidas, as duas foram notadas. O código foi restaurado em todos os casos.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface.
- **Celular e tablet reais.** As larguras e o toque foram emulados. A rolagem das faixas com o dedo e a barra do recorte presa ao topo com a barra de endereço do navegador móvel não foram vistas.
- **Área de transferência fora do Chromium.** A recusa e a ausência foram simuladas. O comportamento em uma página servida por `http` em outro aparelho da rede, e no Safari, não foi visto.
- **Leitor de tela.** Os nomes, os estados e os avisos foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Links das fontes no ar.** Os endereços conferem com os registros. Nenhum foi aberto nesta fase para saber se ainda responde: é da fase 9.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local. O status 404 para um slug inexistente depende de a hospedagem servir `404.html`.
- **Canal de correção configurado.** O caminho em que a página troca o aviso pelo link não tem teste de navegador, porque não há valor para configurar.
- **Leitura da metodologia por outra pessoa.** O texto segue os documentos editoriais do projeto e não foi lido por ninguém além de quem o escreveu.
- **Desempenho.** Nada foi medido. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal. A metodologia diz que ela não aconteceu.
2. **Canal público de correção.** Decisão do responsável pelo projeto. Para configurar: `SITE.correctionChannel`, em `src/lib/site.ts`.
3. **Domínio público.** Sem ele não há endereço canônico, `metadataBase`, sitemap nem imagem de compartilhamento. Os links copiados usam o endereço em que o atlas estiver aberto. Fase 10.
4. **Decisões herdadas do responsável:** nome definitivo e retrato em cinza e recortado (D-42).
5. **A página do acontecimento responde com e sem contexto no endereço.** O conteúdo é o mesmo; o endereço canônico, sem contexto, só pode ser declarado com o domínio definido.
6. **A natureza de cada fonte não aparece nas páginas.** O conteúdo não tem esse campo; a página mostra a autoria (D-71).
7. **4 das 59 fontes não têm data do documento.** Aparecem como "data do documento desconhecida".
8. **Estado inicial por um instante,** herdado da fase 5 (D-49). Vale agora também para a comparação e para os links de retorno, que aparecem sem o recorte até o JavaScript carregar. Fica para a fase 8.
9. **A comparação não tem mapa, e a câmera do mapa não vai para o endereço.** Fora do pedido da fase.
10. **As capturas das fases 4 a 6 mostram a comparação e a página do acontecimento antigas.** Não foram refeitas; `docs/capturas/README.md` avisa.
11. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`. A navegação funciona.
12. **Vídeo de demonstração** não gravado, como nas fases anteriores.
13. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 8 (acabamento visual e desempenho)

O critério da fase 8, no plano: o fluxo principal permanece legível e responsivo, as animações ajudam a acompanhar a seleção, e a entrada e as páginas de leitura funcionam sem depender do carregamento do mapa. Situação de cada passo:

| Passo da fase 8 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Refinar abertura, tipografia, imagens e hierarquia dos detalhes | Direção visual e tokens da fase 4; páginas de leitura completas | O acabamento: a hierarquia do perfil, que ficou longo, a metodologia e a barra do recorte da comparação |
| 2. Transições de pessoa, período e acontecimento | Duas durações e uma curva em tokens; movimento curto e com função | Rever com a comparação e com as páginas novas |
| 3. Carregar o mapa quando necessário | O mapa só é montado quando a moldura aparece na tela, e a página do acontecimento não depende dele | Medir o peso do pacote e tirar do build o worker de desenvolvimento do MapLibre |
| 4. Otimizar imagens e manter dimensões definidas | Dois retratos, com dimensões no conteúdo | Conferir formato e peso |
| 5. Movimento reduzido | Respeitado em todas as telas; os testes rodam nesse modo | Conferir o que a fase acrescentar |
| 6. Medir carregamento, estabilidade visual e resposta | Nada medido | LCP, CLS e a resposta dos controles, com o resultado identificado como de laboratório |
| 7. Computador e aparelho móvel real | Só Chromium sem interface, com larguras e toque emulados | Abrir em uma janela visível e em um celular |

Pontos de atenção para quem continuar:

- O instante de estado inicial (D-49) agora aparece em três lugares: a exploração, a comparação e os links de retorno da página do acontecimento. Uma solução vale para os três, porque todos leem o endereço por `useOwnSearch`.
- As capturas de página inteira saem com a base do mapa deslocada no Chromium sem interface. As da fase 7 são da área visível.
- O perfil da exploração e as colunas da comparação usam os mesmos componentes de cargos, partidos e fontes. Mexer em um muda os dois.
- Os testes de `tests/e2e/comparacao.spec.ts` e `tests/e2e/paginas.spec.ts` montam as expectativas a partir dos dados gerados. O roteiro de capturas cita acontecimentos pelo slug.
- Em um teste que abre uma página com consulta, é preciso esperar o endereço ser lido antes de agir: o HTML do build chega com o estado inicial.

## Fase 6 (mapa sincronizado)

Entrega: o mapa ligado ao recorte e à seleção da exploração, com conteúdo real. Um marcador por lugar documentado, seleção nos dois sentidos, uma lista para os acontecimentos que dividem um lugar, acesso aos que não têm ponto e a leitura preservada quando o mapa falha. A especificação está em [MAP.md](MAP.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-58 a D-65; as capturas, em [capturas/fase-6/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/politicos/lula/`. Em tela estreita, o mapa fica na vista **Mapa**. Exemplos de endereço estão em MAP.md e no README.

### Critério de conclusão do plano

"Mapa, lista e painel permanecem sincronizados; acontecimentos sem lugar municipal continuam acessíveis; falha de WebGL preserva a leitura do conteúdo."

O pedido da fase escreveu o mesmo critério com mais alcance: "mapa, lista, linha do tempo e painel mostram o mesmo recorte e seleção; todos os acontecimentos continuam consultáveis; uma falha do mapa preserva a leitura do conteúdo". A tabela segue esta versão.

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Mapa, lista, linha do tempo e painel mostram o mesmo recorte e seleção | Atendido | O mapa não filtra nem guarda seleção: recebe os pontos que a exploração já recortou e o acontecimento aberto. Os testes de navegador comparam, com filtros combinados, os acontecimentos dos marcadores com os da lista e com a conta feita sobre os dados gerados. Conferem a seleção vinda do marcador, da lista do marcador, da lista de acontecimentos, da linha do tempo e do endereço, inclusive depois de recarregar, voltar e avançar. Conferem também que mover a câmera não muda a seleção nem o endereço |
| Todos os acontecimentos continuam consultáveis | Atendido | O lugar com vários acontecimentos abre uma lista com todos, em qualquer zoom. Os 13 sem ponto ficam no botão **sem ponto no mapa** e continuam na lista e na linha do tempo. Um teste percorre cada marcador e confere que o número é o de acontecimentos distintos e que cada acontecimento aparece em todos os seus lugares |
| Uma falha do mapa preserva a leitura do conteúdo | Atendido | Cinco falhas tratadas e testadas em navegador: sem WebGL, pacote que não chega, mapa que não termina de carregar, contornos que não carregam e perda do contexto gráfico. Em todas, filtros, endereço, lista, linha do tempo e painel continuam, e a lista de lugares assume a área do mapa |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Base geográfica local e estilo do mapa | Feito. A base da fase 4 foi adotada, com origem, licença e transformações registradas, e o estilo ficou só com a base (D-58) |
| 2. Plotar os acontecimentos com localização documentada | Feito: um marcador por lugar, com o nome ao lado. Na edição, 26 acontecimentos em 9 lugares |
| 3. Foco e seleção nos dois sentidos | Feito: o marcador e a lista dele selecionam; a lista de acontecimentos, a linha do tempo e o endereço destacam todos os lugares do acontecimento |
| 4. Agrupar ou permitir escolher pontos sobrepostos | Feito: um marcador por lugar, lugares próximos juntos e uma lista para escolher (D-60) |
| 5. Pontos de acordo com pessoa, período e categoria | O recorte já vinha da fase 5. Nesta, os marcadores, os números e o botão dos sem ponto o acompanham, com teste de filtros combinados |
| 6. Limites de zoom | Feito: de 2 a 6, câmera presa à área da base e teto pela precisão do lugar na aproximação automática (D-58, D-61) |
| 7. Câmera e gestos em computador e celular | Feito: a câmera só anda quando precisa; gestos livres na exploração e cooperativos na página do acontecimento. Conferido com toque emulado; falta aparelho real |
| 8. Lista e detalhes utilizáveis quando o mapa falhar | Feito: cinco falhas, com mensagem, saída e a lista de lugares (D-64) |

### O que foi entregue

- **Marcadores por lugar,** em HTML sobre a base: a forma e a cor da categoria quando o lugar tem um acontecimento, a quantidade quando tem vários, contorno tracejado quando só o estado é conhecido, e o nome do lugar ao lado.
- **Lista de um marcador,** para lugares com vários acontecimentos e para lugares próximos: data na precisão do registro, título, categoria e lugar. Folha embaixo em celular, quadro no canto nas demais larguras.
- **Seleção nos dois sentidos,** pelo mesmo estado e pelo mesmo endereço da fase 5. O acontecimento com dois lugares destaca os dois.
- **Sem ponto no mapa:** botão com a quantidade, que abre a lista dos acontecimentos de abrangência nacional, sem lugar documentado ou fora da área da base, com o motivo. O mapa avisa quando o acontecimento aberto não tem ponto e quando o recorte não tem nenhum.
- **Câmera** que enquadra o recorte ao abrir, só se move quando a seleção ou o recorte ficam fora da vista, respeita quem moveu o mapa e não se aproxima sozinha além do que a precisão do lugar sustenta.
- **Controles** de aproximar, afastar e enquadrar, e **legenda** com os símbolos em uso e o aviso de base simplificada.
- **Limites da base:** zoom de 2 a 6 e câmera dentro da área que os contornos cobrem.
- **Página do acontecimento** com o mesmo mapa, só para leitura: marcadores com nome e gestos cooperativos, para a página continuar rolando.
- **Falhas** com mensagem por causa, **Tentar de novo** ou **Recarregar a página**, e a lista de lugares agrupada por lugar.
- **Base documentada:** origem, licença, resolução e transformações em `src/features/map/base/README.md`. A pasta `public/geo/` foi removida.
- **Guia de estados** (`/dev/previa/`) com os marcadores e a falha da base.
- **Capturas** da fase e o comando que as refaz: `npm run capture:map`.

### Arquivos

Comparação com o estado da fase 5: 43 arquivos de código e de documentação (12 novos, 30 alterados e 1 removido), mais 21 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novo: MAP.md e `capturas/fase-6/` (21 imagens). Atualizados: ARCHITECTURE.md, DATA-PIPELINE.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, TIMELINE.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/features/map/` | Novos: `places.ts`, `camera.ts`, `PlaceMarker.tsx`, `PlaceChooser.tsx`, `MapControls.tsx`, `MapLegend.tsx` e `MapFallback.tsx`. Reescritos: `MapCanvas.tsx` e `MapView.tsx`. Atualizados: `style.ts` e `palette.ts` (só a base) e `base/README.md` |
| `src/lib/data/` | `points.ts`: `listUnplaced` |
| `src/app/` | `politicos/[slug]/Explorer.tsx` (entrega ao mapa os sem ponto e o cartão), `acontecimentos/[slug]/EventLocator.tsx` (gestos cooperativos), `dev/prova/ProofScreen.tsx`, `dev/previa/StatesGallery.tsx` e `globals.css` (saiu o estilo dos controles do MapLibre) |
| `tests/` | Novos: `map-places.test.ts`, `map-camera.test.ts`, `e2e/mapa.spec.ts` e `e2e/mapa.capture.ts`. Atualizados: `map.test.ts`, `design.test.ts`, `e2e/previa.spec.ts`, `e2e/linha-do-tempo.spec.ts`, `e2e/prova.spec.ts` e os dois roteiros de captura anteriores |
| Raiz | `package.json` (`capture:map`), README.md, `.claude/project-state.md` e a remoção de `public/geo/.gitkeep` |

`content/` não foi alterado, nenhuma dependência foi acrescentada, e as imagens de `docs/capturas/fase-4/` e `fase-5/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Marcadores do recorte, com filtros de período e de categoria combinados.
- Seleção pelo marcador, pela lista do marcador, pela lista de acontecimentos, pela linha do tempo e pelo endereço.
- Lugar com vários acontecimentos e lugares vizinhos no zoom máximo, com todos os itens acessíveis.
- Acontecimento com dois lugares, com os dois destacados.
- Acontecimento sem ponto, aberto pelo mapa, e recorte sem nenhum ponto.
- Câmera: enquadramento inicial, seleção à vista e fora da vista, mapa movido pela pessoa e retorno pelo botão de enquadrar.
- Limites de zoom, com os botões desativados no limite.
- Teclado: marcadores, lista do marcador, controles e legenda.
- Falhas: contornos, contexto gráfico, pacote, tempo de espera e navegador sem WebGL.
- Celular: folha embaixo, cartão, áreas de toque e troca de vista.
- Página do acontecimento: mapa de leitura e rolagem da página.

Com dados sintéticos, em `/dev/prova/`: lugar fora da área que a base cobre.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: comparação ligada ao estado e ao endereço, retorno da página do acontecimento com o recorte de antes, rótulos da base, lugares fora da América do Sul, fonte indisponível e imagem de acontecimento.

### O que a fase 5 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Base definitiva, rótulos e glyphs (D-43) | Base adotada, sem rótulos próprios. Os nomes no mapa são os dos lugares do conteúdo, em HTML (D-58) |
| Agrupar ou listar os pontos sobrepostos | Os dois: um marcador por lugar, lugares próximos juntos e uma lista para escolher (D-60) |
| Rever foco e seleção com pontos sobrepostos | O clique em um lugar com vários acontecimentos não escolhe nenhum: abre a lista |
| Limites de navegação | Zoom de 2 a 6 e câmera presa à área da base |
| Conviver com o cartão do mapa em celular | A lista do marcador toma o lugar do cartão enquanto está aberta, e a câmera conta o que cada um cobre |
| Forma da categoria no mapa e pontos pelo teclado | Feitos, com os marcadores em HTML (D-59) |
| Buscar o GeoJSON por endereço (D-28) | Não foi preciso: o mapa continua recebendo os pontos pela página |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a exploração em um Chromium, em computador, tablet e celular, capturando as telas e olhando cada captura.

| Problema | Correção |
| --- | --- |
| O mapa aparecia em branco: o MapLibre impõe `position: relative` ao próprio contêiner, e a altura dele virava zero | O contêiner passou a ter altura e largura explícitas |
| O enquadramento sem pontos passava da área que a base cobre | Caixa corrigida; um teste confere que ela cabe na área |
| Um lugar fora da América do Sul não teria como ser desenhado com a câmera presa à base | Fica fora do mapa e entra na lista **sem ponto no mapa**, com o nome |
| Depois de um zoom, a ordem do Tab deixava de seguir a dos lugares. Aparecia no servidor de desenvolvimento, com os marcadores do MapLibre | Marcadores como elementos do React, em um portal dentro do contêiner do canvas (D-59) |
| O contorno tracejado, no disco com número, parecia uma engrenagem | O tracejado fica por fora do disco, e a legenda só o mostra quando algum marcador o usa |
| Abrir a lista de um marcador recentrava o mapa | A câmera desloca só o que falta para o marcador sair de baixo da lista |
| Quando um filtro fechava a lista do marcador, o foco saltava para o marcador | O foco só volta quando a lista é fechada por dentro: Esc, **Fechar** ou a escolha de um item |
| Em celular, com o mapa escondido em outra vista, a câmera enquadrava um quadro sem tamanho | As regras de câmera esperam o mapa voltar à tela |
| Em tablet, os controles tinham 36 pixels | 44 pixels em telas estreitas e médias, 36 em tela larga |
| O aviso de acontecimento sem ponto cobria o marcador mais ao norte, e em tablet o botão dos sem ponto encostava nele | Os avisos ficam ao lado do botão, e o enquadramento deixa a faixa de cima livre quando o quadro tem altura para isso |
| Em celular, o nome de um lugar à direita passava por baixo dos controles | O enquadramento deixa mais espaço à direita |
| Em computador, a lista do marcador cobria o resumo da legenda e deixava à mostra a borda do botão dos sem ponto | O quadro cobre o botão e para antes da legenda |
| O anel de seleção encostava no nome do lugar | O nome ficou 4 pixels mais afastado do marcador |
| Com o fundo da legenda aberta opaco, a base do mapa sumia ao lado dela no navegador dos testes | O fundo é quase opaco, e dois testes comparam o mapa pixel a pixel (MAP.md, seção Falhas) |
| A tela de prova não entregava ao mapa os acontecimentos sem ponto | Passou a entregar |
| O número do botão **sem ponto no mapa** contaria um acontecimento que tem marcador, quando ele tivesse um lugar dentro da área e outro fora | A conta passou a ser dos acontecimentos sem nenhum marcador; um teste confere. O caso não existe na edição |
| O estilo dos controles do MapLibre ficou sem uso em `globals.css` | Removido |
| Seis testes das fases anteriores dependiam do mapa antigo: clique no centro do canvas, contagem de botões e texto da falha | Reescritos para o mapa novo |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 435 testes passando, em 21 arquivos. Eram 382 em 19 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 124 testes passando: 14 da prova sintética, 7 dos dados reais, 28 da prévia, 40 da navegação temporal e 35 do mapa. Eram 88 |
| `npm run capture:map` | 21 capturas, conferidas uma a uma |
| Saída estática, servida por `npm run preview` | Marcadores do recorte, seleção pelo marcador e pela lista do marcador, seleção restaurada ao recarregar, acontecimento sem ponto aberto pelo mapa e mapa da página do acontecimento: todos como no servidor de desenvolvimento. Os contornos e o worker saem de `/_next/static/media/`, com os tipos `application/geo+json` e `text/javascript`. Nenhum pedido a outro domínio |
| Larguras conferidas pelas capturas | 1440×900, 1280×720, 768×1024 e 390×844 |
| Teclado e foco | Tab pelos marcadores, de norte a sul; Enter abre a lista; Tab, Enter e Esc dentro dela; foco devolvido ao marcador; controles e legenda com nome e foco visível |
| Toque | Em 390×844, com toque emulado: áreas de 44 pixels nos marcadores, nos controles e no botão dos sem ponto; folha, cartão e troca de vista |
| Movimento | Os testes rodam com movimento reduzido, como nas fases anteriores. Um teste roda com o movimento ligado e confere que a câmera chega ao lugar selecionado |
| Instância do mapa | Um teste confere que o canvas é o mesmo elemento depois de várias mudanças de filtro e de seleção |
| Perda de contexto | Simulada com a extensão `WEBGL_lose_context`: o aviso aparece, o mapa retoma quando o contexto volta e, sem retomada, a lista assume em 5 segundos |

Dezenove regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham. Sete nas regras puras: número do marcador contando pontos, lugares vizinhos sem agrupar, destaque só no primeiro lugar, sem ponto contando quem tem marcador, teto de zoom pelo lugar mais preciso, "à vista" ignorando o que cobre o mapa e acontecimento sem lugar documentado fora da lista dos sem ponto. Doze no navegador: clique escolhendo o primeiro acontecimento, recorte sempre recentrando, seleção sempre movendo a câmera, seleção nunca movendo, filtro recriando o mapa, falha dos contornos ignorada, contexto perdido sem saída, foco sem voltar ao marcador, zoom sem limite, sem ponto fora do mapa, página do acontecimento com gestos livres e legenda aberta com fundo opaco. Em todos os casos algum teste falhou, e o código foi restaurado.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface, com WebGL por software. O desenho com placa de vídeo real e o comportamento em outro motor não foram vistos.
- **Celular e tablet reais.** As larguras e o toque foram emulados. A pinça, o arraste com o dedo e os dois dedos dos gestos cooperativos não foram exercitados.
- **Roda do mouse e pinça na exploração.** São do MapLibre. Os testes cobrem os botões, o arraste com o ponteiro e a roda na página do acontecimento.
- **Teclado do canvas.** As setas e as teclas `+` e `-` com o foco no mapa são do MapLibre e não têm teste próprio.
- **Perda real do contexto gráfico.** Só a simulada pela extensão do navegador.
- **Quadros opacos sobre o mapa, com placa de vídeo.** O defeito da base que some ao lado de um quadro opaco só foi visto no Chromium sem interface. Não se sabe se existe em um navegador comum.
- **Leitor de tela.** Os nomes dos marcadores, os estados dos botões e os avisos foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Aviso de lugar fora da área para quem também tem marcador.** A conta tem teste de regra; a frase no mapa não foi vista no navegador, porque nem a edição nem os dados sintéticos têm esse caso.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local. O tipo MIME do worker (`.mjs`) e dos contornos (`.geojson`) em outro servidor fica para a fase 10.
- **Desempenho.** O peso do pacote do mapa e o tempo até o primeiro desenho não foram medidos. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal.
2. **Decisões do responsável pelo projeto, herdadas:** nome definitivo, retrato em cinza e recortado (D-42) e canal público de correção.
3. **Conferência em aparelho e em navegador reais,** como listado acima. É o que mais importa conferir antes de mostrar o mapa a alguém.
4. **Lugares vizinhos seguem juntos no zoom máximo.** São Paulo e São Bernardo do Campo dividem um marcador em qualquer escala que a base sustenta. A lista os separa por lugar; o mapa, não.
5. **A base não tem rótulos.** Quem não conhece o mapa do Brasil se orienta pelos nomes dos lugares do recorte e pelas divisas dos estados (D-58).
6. **Lugares fora da América do Sul não são desenhados.** Nenhum existe na edição. O caminho está em `src/features/map/base/README.md`.
7. **A câmera não vai para o endereço.** Um link compartilhado abre com o enquadramento do recorte, e não com a posição de quem o copiou.
8. **Em janela baixa, um aviso pode cobrir um marcador.** Com o quadro do mapa abaixo de 320 pixels de altura, o enquadramento não reserva a faixa de cima, para não encolher o mapa (MAP.md, seção Câmera).
9. **Estado inicial por um instante,** herdado da fase 5 (D-49). Quem chega por um link com um acontecimento vê primeiro o mapa sem destaque. Fica para a fase 8.
10. **A página do acontecimento volta sem o recorte, e a comparação não usa o endereço.** São da fase 7.
11. **As capturas das fases 4 e 5 mostram o mapa antigo.** Não foram refeitas; `docs/capturas/README.md` avisa.
12. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`. A navegação funciona. O build publica também o worker de desenvolvimento do MapLibre, de 1,1 MB, que nenhuma página pede; tirar esse arquivo é da fase 8.
13. **Vídeo de demonstração** não gravado, como nas fases anteriores.
14. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 7 (comparação, páginas e fontes)

O critério da fase 7, no plano: links de acontecimentos abrem direto, recarregar preserva a consulta relevante, e a comparação respeita cargos e períodos diferentes, sem apresentar a quantidade de registros como medida de desempenho. Situação de cada passo:

| Passo da fase 7 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Comparação das duas trajetórias em um mesmo intervalo | A tela `/comparar/`, da fase 4, com o período em estado local | Ligar ao estado e ao endereço |
| 2. Cargos, filiações e acontecimentos de cada pessoa | As colunas por pessoa e as listas de cargos e partidos, que a fase 5 passou a compartilhar com a exploração | Rever com o recorte vindo do endereço |
| 3. Mesma escala temporal e cobertura explicada | Feito na fase 4 (D-47) | Conferir com período e categorias no endereço |
| 4. Páginas estáticas por perfil e por acontecimento | 2 perfis e 39 acontecimentos, gerados no build | Rever o conteúdo de cada página |
| 5. Fontes, créditos e data de revisão nas páginas | A página do acontecimento lista as fontes, a nota de revisão e os créditos das imagens | Conferir o que falta nos perfis |
| 6. Cópia de link e retorno à exploração | O endereço já é a consulta. O retorno leva só o acontecimento | Botão de copiar e retorno com o recorte de antes |
| 7. Metodologia e instruções para sugerir uma correção | A página `/metodologia/` existe, com os créditos da base do mapa | Revisar o texto e escrever o caminho de correção, que depende de decisão do responsável |

Pontos de atenção para quem continuar:

- O mapa da página do acontecimento é o mesmo componente, com `gestures="cooperativos"` e sem `onSelect`. Se a comparação ganhar um mapa, o contrato é o mesmo: pontos já recortados e, se houver seleção, o slug.
- `MapView` aceita o que está no recorte e nada mais. Um recorte com as duas pessoas não precisa de mudança no mapa: os pontos de um acontecimento compartilhado já são um só por lugar.
- O retorno da página do acontecimento com o recorte pede que a exploração entregue a consulta ao link da página, ou que a página a leia do histórico. As regras do endereço estão em `src/lib/state/url-state.ts`.
- Os testes de `tests/e2e/mapa.spec.ts` montam as expectativas a partir dos dados gerados, e por isso acompanham uma edição nova. O roteiro de capturas, não: ele cita acontecimentos e lugares pelo identificador.

## Fase 5 (aplicação e linha do tempo)

Entrega: a navegação temporal da exploração, com conteúdo real. Escolher a pessoa, consultar um ano ou um intervalo, filtrar categorias, selecionar um acontecimento e ler os detalhes, com a consulta inteira no endereço. A especificação está em [TIMELINE.md](TIMELINE.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-49 a D-57; as capturas, em [capturas/fase-5/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/politicos/lula/`. Exemplos de endereço com consulta estão em TIMELINE.md e no README.

### Critério de conclusão do plano

"Filtros, seleção, lista e painel exibem o mesmo recorte; datas parciais são tratadas corretamente; anos com pouca informação são apresentados com clareza."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Filtros, seleção, lista e painel exibem o mesmo recorte | Atendido | O estado é um só e fica no endereço; lista, marcas, mapa e painel são derivados dele. Os testes de navegador comparam, a cada filtro, a quantidade de itens da lista e de marcas com a conta feita sobre os dados gerados, e conferem que o acontecimento aberto é o mesmo nas quatro partes, inclusive depois de recarregar, voltar e avançar |
| Datas parciais são tratadas corretamente | Atendido | A lista diz "só o ano" ou "sem o dia"; a marca cobre o ano ou o mês inteiro; o registro cuja posição as datas não decidem diz que a ordem não está documentada; o filtro por ano nunca precisa de um dia. Testes de regra e de navegador |
| Anos com pouca informação são apresentados com clareza | Atendido | As lacunas do conjunto aparecem na lista, no lugar dos anos; o recorte vazio explica que falta registro, e não atividade; os cargos e partidos de presença incerta ficam à parte; o fim da lista diz o que a edição cobre |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Entrada e seleção de pessoa | Feito. A entrada já levava aos perfis reais; a exploração ganhou a troca de pessoa, que leva o recorte |
| 2. Lista cronológica com o conjunto publicado | Feito, com as lacunas e os avisos de data parcial e de ordem em aberto |
| 3. Seleção de ano ou intervalo e categorias | Feito: campos de ano, clique e arraste no eixo, categorias e limpar filtros |
| 4. Cargos e filiações documentados para o período | Feito: bloco acima da lista, com a presença incerta à parte |
| 5. Painel de um acontecimento selecionado | Feito na fase 4; nesta, ligado ao endereço e ao histórico |
| 6. Endereços compartilháveis e voltar e avançar | Feito: o endereço é a fonte do estado |
| 7. Legibilidade em telas pequenas e datas muito próximas | Feito: fileiras medidas pela largura do eixo, faixa que rola até o período em celular e janela baixa tratada |

### O que foi entregue

- **Consulta no endereço.** Período, categorias e acontecimento aberto ficam na query string. Abrir um link, recarregar, voltar e avançar restauram a mesma consulta. Endereço com erro abre do mesmo jeito e é corrigido no lugar.
- **Troca de pessoa** dentro da exploração, com os perfis em ordem alfabética e o aberto marcado. Leva período e categorias; o acontecimento só segue quando é dos dois perfis.
- **Período por três caminhos:** campos de ano, clique em um ano do eixo e arraste sobre o eixo. O arraste mostra a prévia e só muda a consulta ao soltar.
- **Limpar filtros**, que volta ao recorte inicial de uma vez.
- **Lista cronológica** com o período e a quantidade no cabeçalho, as lacunas do conjunto como linhas, o aviso do que falta em cada data parcial e o aviso de ordem não documentada.
- **Cargos e partidos do período**, por extenso, com o que as datas provam separado do que tem presença incerta.
- **Linha do tempo** com as marcas distribuídas pela largura real do eixo, sem que uma cubra a outra, e com a hachura do período por baixo das marcas.
- **Aviso** quando um filtro tira do recorte o acontecimento que estava aberto.
- **Contrato com o mapa** escrito e exposto: filtros, `visible`, `visibleIds` e `selected` (TIMELINE.md).
- **Guia de estados** (`/dev/previa/`) com os estados novos.
- **Capturas** da fase e o comando que as refaz: `npm run capture:timeline`.

### Arquivos

Comparação com o estado da fase 4: 44 arquivos de código e de documentação, mais 20 capturas.

| Onde | O quê |
| --- | --- |
| `docs/` | Novo: TIMELINE.md e `capturas/fase-5/` (20 imagens). Atualizados: ARCHITECTURE.md, DECISIONS.md, DESIGN-SYSTEM.md, INTERACTIONS.md, UX.md, STATUS.md e `capturas/README.md` |
| `src/lib/state/` | Novos: `AtlasUrlStateProvider.tsx` e `url-state.ts`. Atualizados: `atlas-state.ts` (`clearFilters`, `fitPeriod`, `hasFilters`), `selectors.ts` (`settle`), `url-params.ts` (`mergeAtlasParams`) e `AtlasStateProvider.tsx` (`visibleIds`, contrato comum) |
| `src/features/timeline/` | Novos: `PeriodBrush.tsx` e `PeriodContext.tsx`. Atualizados: `Timeline.tsx`, `EventMarks.tsx` e o README |
| `src/features/events/` | Novo: `chronology.ts`. Atualizado: `EventList.tsx` |
| `src/components/` | Novos: `PersonSwitch.tsx` e `PeriodRecords.tsx`. Atualizados: `DateMark.tsx`, `time/scale.ts` (`yearAtPosition`, `yearsBetween`) e `time/PeriodShade.tsx` |
| `src/app/` | Atualizados: `politicos/[slug]/Explorer.tsx` e `page.tsx`, `comparar/Comparison.tsx` (usa as listas compartilhadas), `dev/previa/StatesGallery.tsx` e `globals.css` (uma regra da grade) |
| `src/features/map/`, `src/lib/domain/` | `MapView.tsx` (altura mínima em telas médias e largas) e `dates.ts` (`formatYearRange`) |
| `tests/` | Novos: `url-state.test.ts`, `chronology.test.ts`, `e2e/linha-do-tempo.spec.ts` e `e2e/linha-do-tempo.capture.ts`. Atualizados: `state.test.ts`, `url-params.test.ts`, `timeline.test.ts`, `dates.test.ts`, `e2e/previa.spec.ts`, `e2e/dados.spec.ts` e `e2e/previa.capture.ts` |
| Raiz | `package.json` (comandos de captura separados) e README.md |

`content/` não foi alterado, nenhuma dependência foi acrescentada, e as imagens de `docs/capturas/fase-4/` não foram refeitas.

### Jornada implementada e o que segue em demonstração

Implementado, com dados reais e teste de navegador:

- Entrada, perfil e troca entre os dois perfis, com o recorte.
- Ano, intervalo e categorias combinadas, com a lista, as marcas, os pontos e as contagens no mesmo recorte.
- Ordem cronológica, datas parciais, ordem em aberto e lacunas.
- Cargos e partidos do período, com mudança de cargo ou de partido dentro do intervalo.
- Seleção, abertura e fechamento do painel, com o foco devolvido.
- Limpeza da seleção quando o recorte muda, com o aviso.
- Recorte sem resultados e retorno por limpeza de filtros.
- Endereço direto, recarregamento, voltar e avançar.
- Parâmetros inválidos e acontecimento incompatível.
- Leitura sem o mapa.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: zoom na linha do tempo (não feito, por decisão), pontos sobrepostos, formas e rótulos no mapa, pontos pelo teclado, comparação ligada ao estado e ao endereço, retorno da página do acontecimento com o recorte de antes, fonte indisponível e imagem de acontecimento.

### O que a fase 4 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Escrever o estado no endereço e responder a voltar e avançar | Feito, com o endereço como fonte do estado (D-49, D-50) |
| Período por arraste, disparando o mesmo `setPeriod` | Feito, com clique para um ano só (D-53) |
| Cargos e partidos do período na exploração, com documentado e incerto | Feito (D-55) |
| Zoom ou agrupamento para anos cheios | Decidido: nenhum dos dois. Fileiras medidas pela largura (D-53) |
| Rótulo das barras de cargo estreitas | O desenho continua sem o texto; o nome está por extenso no bloco do período, que serve ao toque |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a exploração em um Chromium, em computador, tablet e celular, capturando as telas e olhando cada captura, e medindo a área de trabalho em seis tamanhos de janela.

| Problema | Correção |
| --- | --- |
| Em uma janela de 1280×720, o mapa era desenhado por cima da linha do tempo | O mapa fica com pelo menos 40% da altura; a linha do tempo rola por dentro. Um teste confere (D-56) |
| A hachura do período passava por cima das marcas do ano escolhido | A hachura fica sob as marcas |
| Em celular, chegar por um endereço com período mostrava só hachura na faixa | A faixa rola até o período |
| O bloco de cargos e partidos, aberto por padrão, empurrava os acontecimentos para fora da tela | Começa recolhido, com o resumo à vista |
| O resumo do bloco somava os registros de presença incerta aos documentados | Contagens separadas |
| O aviso de acontecimento fechado continuava na tela depois de voltar no histórico | O aviso vale só para a consulta em que o fechamento aconteceu |
| As áreas de clique das marcas se cobriam em colunas estreitas | O espaço de cada marca é calculado com a largura real do eixo |
| Clicar no menu para o perfil que já estava aberto mudava o endereço e não a tela | Um componente avisa das navegações do roteador. Sem ele, o teste falha |
| A regra de histórico escrita na fase 1 apagaria a entrada anterior ao arraste | Regra reescrita em ARCHITECTURE.md (D-50) |

### Verificações executadas

Todas em 09/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 382 testes passando, em 19 arquivos. Eram 314 em 17 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 264 arquivos; 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 88 testes passando: 13 da prova sintética, 7 dos dados reais, 28 da prévia e 40 da navegação temporal |
| `npm run capture:timeline` | 20 capturas, conferidas uma a uma |
| HTML gerado dos dois perfis | Cada arquivo traz os 20 acontecimentos, as marcas e as lacunas: a exploração não deixou de ser pré-renderizada |
| Saída estática, servida por `npm run preview` | Chegada por endereço com consulta, recarregamento, nova entrada, voltar, avançar, troca de pessoa com o recorte, correção de endereço inválido e menu para o mesmo perfil: todos como no servidor de desenvolvimento. Nenhum pedido a outro domínio |
| Janelas medidas | 1440×900, 1366×768, 1280×720, 1280×600, 1024×768 e 768×1024: o mapa não é coberto, e a linha do tempo rola por dentro quando não cabe |
| Larguras conferidas pelas capturas | 1440×900, 1280×720, 768×1024 e 390×844. Em 360×800, uma captura avulsa com o bloco de cargos aberto, e o teste da fase 4 que confere que nenhuma tela passa da largura |
| Teclado e foco | Bloco de cargos (Enter), linha do tempo com setas, Esc na leitura e no arraste, foco devolvido ao fechar. Campos de ano, categorias e troca de pessoa são controles nativos: campo de seleção, botão e link |
| Toque | Em 390×844, com toque emulado: o toque em um ano do eixo foi disparado como toque; leitura, cartão do mapa e botão voltar, como clique. Áreas de 44 px na troca de pessoa e em limpar filtros |
| Histórico | Uma entrada por escolha; uma por arraste; uma para 14 mudanças seguidas de um campo de ano; nenhuma na correção de endereço |

Dez regras foram quebradas de propósito, uma por vez, para confirmar que os testes falham: histórico sempre criando entrada, período fora da cobertura aceito, troca de pessoa levando qualquer acontecimento, ordem em aberto marcando os dois registros, seleção fora do recorte mantida, voltar e avançar sem escuta, navegação do roteador sem aviso, endereço sem correção, arraste alterando a consulta a cada ano e marcas sem medir a largura. Em todos os casos algum teste falhou, e o código foi restaurado. Com a regra antiga da grade em vigor, o teste da janela baixa também falhou.

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface. A integração com a History API e o `touch-action` do eixo não foram vistos em outro motor.
- **Celular e tablet reais.** As larguras e o toque foram emulados. O botão voltar do aparelho, a barra de endereço que encolhe e o teclado virtual não foram exercitados.
- **Arraste por toque no eixo, em tablet.** Está implementado para as larguras em que a faixa não rola; o teste cobre só o toque parado.
- **Setas do teclado em um campo de ano.** O teste dispara mudanças seguidas do campo, e não a tecla física, cujo comportamento varia entre sistemas.
- **Leitor de tela.** Os avisos da região de anúncio e a leitura das lacunas foram conferidos pela estrutura, e não com NVDA, VoiceOver ou TalkBack.
- **Hospedagem real.** A saída estática foi servida só pelo servidor local de `npm run preview`.
- **Conexão lenta.** O intervalo em que quem chega por um link com consulta vê o estado inicial não foi medido.
- **Desempenho.** Nenhuma medição. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal.
2. **Decisões do responsável pelo projeto, herdadas:** nome definitivo, retrato em cinza e recortado (D-42) e canal público de correção.
3. **Estado inicial por um instante.** Quem abre um link com consulta vê primeiro a exploração sem filtro, que é o que o HTML estático traz, e depois a consulta. É consequência da exportação estática (D-49). Fica para a fase 8.
4. **Fechar a leitura cria uma entrada no histórico.** Abrir e fechar vários acontecimentos alonga o caminho de volta. A regra é a da arquitetura; vale rever com pessoas usando, na fase 9.
5. **A página do acontecimento volta sem o recorte.** O link **Trajetória de (pessoa)** leva só o acontecimento. O botão voltar do navegador devolve a consulta inteira. É da fase 7.
6. **A comparação ainda não usa o endereço.** É da fase 7.
7. **Pontos sobrepostos no mapa.** Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. Resolvido na fase 6 (D-60).
8. **Barras de cargo estreitas sem rótulo no desenho.** O nome agora está por extenso no bloco do período, mas a barra continua muda.
9. **Saída estática em hospedagem simples.** Os pedidos de pré-carregamento de segmento do Next continuam dando 404 no servidor de `npm run preview`, como na fase 4. A navegação funciona.
10. **Servidor de desenvolvimento e `globals.css`.** Em duas ocasiões desta fase o servidor continuou entregando o CSS anterior depois de uma mudança no arquivo; em uma delas, o arquivo tinha voltado a um conteúdo que já tivera. Reiniciar `npm run dev` resolveu. O build não é afetado.
11. **Vídeo de demonstração** não gravado, como na fase 4.
12. **Lacunas de conteúdo herdadas** (lista na seção da fase 3).

### Preparação para a fase 6 (mapa sincronizado)

O critério da fase 6 é ligar os acontecimentos aos lugares, com seleção nos dois sentidos, pontos sobrepostos tratados e os pontos acompanhando pessoa, período e categoria. Situação de cada passo do plano:

| Passo da fase 6 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Base geográfica local e estilo do mapa | Contornos do Natural Earth 1:50m e estilo local, isolados em `buildBaseStyle` | Decidir a base definitiva, os rótulos e os glyphs (D-43) |
| 2. Plotar os acontecimentos com localização | 27 pontos de 26 acontecimentos, montados pelo gerador | Nada previsto |
| 3. Foco e seleção nos dois sentidos | O clique no ponto seleciona, e a seleção move a câmera. Desde esta fase, a seleção pelo mapa entra no endereço e no histórico como as outras | Rever com pontos sobrepostos |
| 4. Agrupar ou escolher pontos sobrepostos | Nada. O clique abre o de cima | Decidir entre agrupar e listar por lugar. `listEventsAtPlace(data, lugarId)` já devolve os acontecimentos de um lugar |
| 5. Pontos de acordo com pessoa, período e categoria | Feito: `filterPoints(data.pontos, visible)`; `visibleIds` para filtrar uma camada sem refazer a coleção | Nada previsto |
| 6. Limites de zoom | Zoom contido em 4,5 ao selecionar | Definir mínimo e máximo de navegação |
| 7. Câmera e gestos em computador e celular | Movimento de 500 ms; em celular, o mapa ocupa a tela e o cartão reserva a faixa de baixo | Conferir em aparelho real |

Pontos de atenção para quem continuar:

- O contrato está em TIMELINE.md, seção Contrato com o mapa. O mapa não precisa de estado próprio nem de parâmetro novo no endereço para o que o plano pede.
- Voltar e avançar mudam `selectedSlug` sem clique: a câmera já acompanha, porque reage à propriedade, e não ao gesto.
- `visible` muda uma vez por ação, inclusive no arraste de período: o mapa não recebe atualizações intermediárias.
- Em tela estreita, a seleção pelo mapa mostra o cartão e guarda que a leitura está fechada (`folded`, em `Explorer.tsx`). Um agrupamento de pontos precisa conviver com esse cartão.
- Os testes de `tests/e2e/linha-do-tempo.spec.ts` rodam com e sem o mapa e servem de rede para a troca da camada de pontos.

## Fase 4 (experiência e direção visual)

Entrega: a direção visual do atlas, a base visual reutilizável e uma prévia navegável das quatro telas, com os dados gerados da edição 0.1.0, em computador, tablet e celular. A especificação está em [UX.md](UX.md), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) e [INTERACTIONS.md](INTERACTIONS.md); as decisões, em [DECISIONS.md](DECISIONS.md), de D-37 a D-48; as capturas, em [capturas/](capturas/README.md).

Para abrir: `npm run dev` e `http://localhost:3000/`. O guia de estados fica em `http://localhost:3000/dev/previa/`.

### Critério de conclusão do plano

"O fluxo pode ser explicado pelas telas e funciona com o conteúdo real preparado."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| O fluxo pode ser explicado pelas telas | Atendido | 40 capturas reais, nas quatro larguras, e um roteiro de demonstração de 30 segundos em UX.md |
| Funciona com o conteúdo real preparado | Atendido | As quatro telas são as rotas do atlas e leem `generated/`. 28 testes de navegador percorrem entrada, exploração, acontecimento e comparação com os 39 acontecimentos reais, e tiram os textos esperados dos arquivos gerados |

### Passos do plano e situação de cada um

| Passo | Situação |
| --- | --- |
| 1. Esboçar entrada, exploração, detalhe e comparação | Feito, como telas navegáveis nas rotas reais |
| 2. Tipografia, cores, espaçamento e composição com os dois perfis | Feito: tokens, duas famílias locais e regras de equivalência (DESIGN-SYSTEM.md) |
| 3. Relação visual entre linha do tempo, mapa e painel | Feito: a mesma seleção marcada nas quatro partes, e o mesmo recorte nas três vistas |
| 4. Versões de computador e celular | Feito, com tablet e celular estreito: três composições a partir do mesmo HTML |
| 5. Estados de carregamento, período sem registros, fonte indisponível e falha do mapa | Feito. Fonte indisponível, imagem de acontecimento e perfil sem retrato só aparecem no guia, porque o conteúdo não os produz |
| 6. Teclado, foco, contraste e movimento reduzido | Feito, com testes de teclado, de foco e de contraste. Leitor de tela real não foi usado |
| 7. Sequência de 20 a 30 segundos | Feito: roteiro em UX.md. O vídeo não foi gravado |

### O que foi entregue

- **Direção visual única:** atlas editorial em tons de papel, com o grafite como tinta, um acento só para seleção e categorias com forma, cor e nome.
- **Base visual reutilizável:** tokens de cor, tipografia e movimento; seleção de pessoa (`PersonCard`, `Portrait`); marcações temporais (`DateMark`, `TimeAxis`, `EventMarks`, `PeriodLane`, `PeriodShade`); item de acontecimento (`EventList`); painel de leitura (`EventPanel`, `ProfilePanel`); apresentação de fontes (`SourceList`, `ReviewNote`).
- **Quatro telas** nas rotas reais: entrada, exploração de cada pessoa, página de cada acontecimento e comparação. Metodologia e página 404 redesenhadas na mesma identidade.
- **Mapa com referência geográfica:** contornos do Natural Earth, Brasil em foco, divisas dos estados, pontos na cor da categoria e seleção com anel.
- **Linha do tempo** com marcas por categoria, datas parciais como trecho, faixas de cargos e de partidos, recorte hachurado e teclado.
- **Composição por largura** documentada e testada em 1440, 768, 390 e 360 px.
- **Guia de estados** em `/dev/previa/`, só em desenvolvimento.
- **Capturas** e o comando que as refaz: `npm run capture:preview`.

### Arquivos

| Onde | O quê |
| --- | --- |
| `docs/` | Novos: UX.md, DESIGN-SYSTEM.md, INTERACTIONS.md e `capturas/` (índice e 40 imagens). Atualizados: ARCHITECTURE.md, DECISIONS.md, STATUS.md |
| `src/app/` | Reescritos: `globals.css`, `layout.tsx`, `page.tsx`, `politicos/[slug]/page.tsx`, `acontecimentos/[slug]/page.published.tsx`, `comparar/page.tsx`, `metodologia/page.tsx`, `not-found.tsx`. Novos: `politicos/[slug]/Explorer.tsx`, `acontecimentos/[slug]/EventLocator.tsx`, `comparar/Comparison.tsx`, `dev/previa/`, `fonts/` |
| `src/components/` | Novos: `Category`, `DateMark`, `PersonCard`, `Portrait`, `ProfilePanel`, `ReviewNote`, `SiteNav`, `SourceList` e a pasta `time/`. Atualizados: `SiteHeader`, `SiteFooter`, `EditionStatus` |
| `src/features/` | Novos: `timeline/` (quatro componentes), `comparison/TrajectoryLanes.tsx`, `events/EventLinkList.tsx`, `map/palette.ts`, `map/base/`. Atualizados: `events/EventList.tsx`, `events/EventPanel.tsx`, `map/MapView.tsx`, `map/MapCanvas.tsx`, `map/style.ts` |
| `src/lib/` | Novos: `data/coverage.ts`, `data/slice.ts`. Atualizados: `data/queries.ts` (`listMandatesAt`, `getImage`), `domain/dates.ts` (apresentação de datas e períodos), `domain/profiles.ts` (ordem), `publication/coverage.ts` |
| `tests/` | Novos: `design.test.ts`, `timeline.test.ts`, `coverage.test.ts`, `e2e/previa.spec.ts`, `e2e/previa.capture.ts`. Atualizados: `dates.test.ts`, `map.test.ts`, `e2e/dados.spec.ts`, `e2e/prova.spec.ts` |
| Raiz | `package.json` (comando `capture:preview`), `playwright.config.ts` (projeto de capturas), README.md |

`content/` não foi alterado, e nenhuma dependência foi acrescentada.

### Fluxos implementados e em demonstração

Implementados, com dados reais e teste de navegador:

- Entrada, com escolha de pessoa, recorte da edição, acesso à metodologia e à comparação.
- Exploração: seleção compartilhada entre lista, mapa, linha do tempo e painel; período e categorias; período sem registros; acontecimento sem ponto; abrir, fechar e voltar com o foco no lugar certo.
- Página do acontecimento, com fontes, ficha e retorno para a exploração com o acontecimento aberto.
- Comparação na mesma escala, com cobertura e lacunas escritas.
- Composição em três larguras, menu em tela estreita, falha do mapa e página 404.

Em demonstração, com o contrato de cada um em INTERACTIONS.md: escrita do estado no endereço e histórico, período por arraste, zoom e agrupamento na linha do tempo, pontos sobrepostos, formas e rótulos no mapa, pontos pelo teclado, ligação da comparação com o estado e o endereço, fonte indisponível e imagem de acontecimento.

### O que a fase 3 deixou para esta fase

| Ponto | Como ficou |
| --- | --- |
| Ordem dos dois perfis na interface | Alfabética, em todo lugar (D-38) |
| Paleta e tipografia | Tokens em `globals.css`; Newsreader e Libre Franklin locais (D-37, D-39, D-41) |
| Como mostrar o que é incerto | Tabela "O que é incerto" em DESIGN-SYSTEM.md: tracejado, hachura e texto, sempre os mesmos |
| Vários pontos no mesmo lugar | Não resolvido: o clique abre o de cima, e a lista dá acesso a todos. É da fase 6 |
| Trajetórias de tamanhos diferentes | A comparação não nivela: 27 anos aparecem como "fora da cobertura desta edição" (D-47) |

### Problemas achados na conferência e corrigidos

A conferência foi feita abrindo a prévia em um Chromium, capturando as telas nas quatro larguras e olhando cada captura. O que apareceu e foi corrigido antes da entrega:

| Problema | Correção |
| --- | --- |
| Os dois cartões da entrada saíam com larguras diferentes | Cartão com largura total da coluna; um teste compara as medidas |
| A área de trabalho não respeitava a altura da tela | Cálculo de altura corrigido; em tela larga a página não rola além do rodapé |
| A barra de filtros mudava de altura ao aparecer "Todo o período" ou "Mostrar todas" | Os dois botões passaram para a linha do rótulo; um teste confere a altura |
| Em celular, o mapa passava da tela e disputava o toque com a rolagem | A vista do mapa ocupa a tela abaixo do cabeçalho |
| Em celular, selecionar pela linha do tempo tirava a pessoa do mapa | Na vista do mapa, a seleção mostra um cartão; a leitura abre a pedido |
| O ponto selecionado ficava atrás do cartão | O enquadramento reserva a faixa do cartão |
| O rótulo "sem registros" saía riscado pela linha do colchete e cortado em trechos curtos | Texto abaixo do colchete, só quando cabe inteiro |
| A faixa da comparação abria, em celular, no trecho sem cobertura | Começa pelos anos recentes, com o aviso escrito |
| O painel mostrava cargo de período incerto como cargo da época | Só entram os cargos que as datas provam |
| Texto só para leitor de tela esticava a página: 2.259 px de altura em uma tela de 900 | Áreas com rolagem própria passaram a conter esse texto. Achado por um teste |
| A tinta mais clara dava 4,29:1 sobre o papel rebaixado | Token escurecido. Achado pelo teste de contraste |
| O acento de seleção era um vermelho terroso | Trocado por laranja queimado, pelo motivo de D-39 |
| O zoom ao selecionar deixava o mapa sem referência | Zoom contido em 4,5 e movimento de câmera direto, de 500 ms |

### Verificações executadas

Todas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 314 testes passando, em 17 arquivos. Eram 266 em 14 |
| `npm run build` | 47 páginas HTML, como antes |
| `npm run verify:export` | 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 48 testes passando: 13 da prova sintética, 7 dos dados reais e 28 da prévia |
| `npm run capture:preview` | 40 capturas, conferidas uma a uma |
| Larguras | 1440×900, 768×1024, 390×844 e 360×800. Nenhuma rota passa da largura da tela em 360, 390 e 768 px |
| Seleção | Lista, linha do tempo e mapa levam ao mesmo acontecimento, em tela larga, média e estreita |
| Teclado e foco | Pular para o conteúdo, lista, linha do tempo com setas, Esc na leitura, foco devolvido ao fechar, anel de foco visível |
| Áreas de toque | 44 px ou mais em abas, filtros, itens de lista, menu e fechar, em 390 px |
| Contraste | Todos os pares de texto em 4,5:1 ou mais; marcas de categoria e acento em 3:1 ou mais |
| Movimento | Um teste com movimento ligado confere a transição do painel e a chegada da câmera; os demais rodam com movimento reduzido |
| Falha do mapa | Pacote bloqueado: a lista de lugares assume e a seleção continua |
| Saída estática | Servida por `npm run preview`: fontes locais carregadas, mapa montado, retorno com seleção funcionando, nenhum pedido a outro domínio, `/dev/previa/` ausente |

### Implementado e não verificado

- **Navegador com janela visível, Firefox e Safari.** Tudo foi conferido em um Chromium sem interface, com WebGL por software. Vale também para o ponto aberto desde a fase 1.
- **Celular e tablet reais.** As larguras foram emuladas. Toque, gesto de pinça no mapa, teclado virtual e barra de endereço que encolhe não foram exercitados.
- **Leitor de tela.** A estrutura foi conferida pela árvore de acessibilidade dos testes, e não com NVDA, VoiceOver ou TalkBack.
- **Zoom de texto em 200% e modo de alto contraste do sistema.**
- **Transições vistas em movimento por uma pessoa.** As capturas são estáticas e rodam com movimento reduzido.
- **Acontecimento com imagem.** O lugar existe no painel e na página, mas nenhum registro tem imagem.
- **Desempenho.** Nenhuma medição de carregamento foi feita. É da fase 8.

### Pendências reais

1. **Revisão humana de todo o conteúdo.** Continua sendo a principal, e a prévia a anuncia em quatro lugares.
2. **Decisões do responsável pelo projeto:** o nome definitivo (o rodapé diz "nome provisório"); se o retrato com condição "uso livre com crédito" pode ser exibido em cinza e recortado (D-42); o canal público de correção.
3. **Pontos sobrepostos no mapa.** Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. O clique abre só o de cima.
4. **Barras de cargo estreitas ficam sem rótulo** na linha do tempo. O nome aparece na dica do ponteiro e na lista do perfil, o que não serve ao toque.
5. **O texto alternativo dos retratos descreve cores** que a exibição em cinza não mostra. O conteúdo não foi alterado nesta fase.
6. **Saída estática em hospedagem simples.** O Next 16.4 grava os arquivos de pré-carregamento de segmento em pastas (`__next.politicos/$d$slug/__PAGE__.txt`) e o navegador os pede com pontos (`__next.politicos.$d$slug.__PAGE__.txt`). No servidor de `npm run preview` esses pedidos dão 404; a navegação funciona, porque o Next busca a página inteira em seguida. Precisa ser resolvido na hospedagem ou no build, na fase 8 ou na 10.
7. **Vídeo de demonstração.** O roteiro está escrito; a gravação não foi feita.
8. **Lacunas de conteúdo herdadas** (lista na seção da fase 3): cobertura desigual, lugares aproximados, nenhuma imagem de acontecimento.

### Preparação para a fase 5 (aplicação e linha do tempo)

*Registro da fase 4. O que a fase 5 fez com cada ponto está na seção dela, acima.*

O critério da fase 5 é "filtros, seleção, lista e painel exibem o mesmo recorte; datas parciais são tratadas corretamente; anos com pouca informação são apresentados com clareza". Situação de cada passo do plano:

| Passo da fase 5 | O que já existe | O que falta |
| --- | --- | --- |
| 1. Entrada e seleção de pessoa | Pronto, nas rotas reais | Revisão de acabamento |
| 2. Lista cronológica com o conjunto publicado | Pronto | Nada previsto |
| 3. Seleção de ano ou intervalo e categorias | Dois campos de ano e botões de categoria, ligados ao estado | Arraste sobre o eixo e atalho para um ano só, disparando o mesmo `setPeriod` |
| 4. Cargos e filiações documentados para o período escolhido | `listMandates` e `listAffiliations` por período, já usados na comparação; o painel mostra os cargos na data do acontecimento | Mostrar, na exploração, os cargos e os partidos do período em vigor, com a diferença entre documentado e incerto |
| 5. Painel de um acontecimento selecionado | Pronto, nas três larguras | Nada previsto |
| 6. Endereços compartilháveis e voltar e avançar | Leitura do endereço na chegada; `serializeAtlasParams` com a forma canônica | Escrever no histórico e responder a voltar e avançar (regras em ARCHITECTURE.md) |
| 7. Legibilidade em telas pequenas e datas muito próximas | Fileiras para marcas próximas; rolagem horizontal em celular; datas parciais como trecho | Decidir zoom ou agrupamento para anos cheios (2018, na trajetória de Lula, e 2021, na de Flávio Bolsonaro, têm três registros cada), e o rótulo das barras estreitas |

Pontos de atenção para quem continuar:

- `src/app/politicos/[slug]/Explorer.tsx` concentra a composição da exploração. Ao ligar o endereço, o estado de apresentação (vista ativa, leitura aberta) continua local; só o recorte e a seleção vão para o endereço.
- Os 28 testes de `tests/e2e/previa.spec.ts` descrevem o comportamento atual e servem de rede para a refatoração.
- O guia `/dev/previa/` mostra cada componente isolado e é o lugar para ver um estado novo antes de ele existir no conteúdo.
- "Anos com pouca informação", no critério, já tem texto e desenho: "sem registros", hachura de cobertura e a mensagem de recorte vazio.

## Fase 3 (camada de dados e preparação do backend)

Entrega: um pipeline local que valida o conteúdo, seleciona o que foi revisado e gera dados, índices e GeoJSON para as páginas. O funcionamento está em [DATA-PIPELINE.md](DATA-PIPELINE.md) e as decisões em [DECISIONS.md](DECISIONS.md), de D-27 a D-36.

### Critério de conclusão do plano

"Conteúdo inválido bloqueia sua publicação com mensagem útil; rascunhos não aparecem nas páginas; o conjunto aprovado pode ser gerado de forma reproduzível."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Conteúdo inválido bloqueia a publicação, com mensagem útil | Atendido | O conteúdo real foi quebrado de propósito (referência a fonte inexistente e data de 30 de fevereiro). `npm run build` parou em `data:build`, com código 1 e os dois diagnósticos apontando arquivo, registro e campo. `next build` chamado direto também parou, por os dados gerados serem de outra versão do conteúdo. O conteúdo foi restaurado e conferido byte a byte |
| Rascunhos não aparecem nas páginas | Atendido | Os 5 rascunhos não estão em `generated/dados/`, não têm página em `out/` e nenhum arquivo de `out/` cita o slug ou o título de algum deles. `verify:export` confere isso a cada build |
| O conjunto aprovado é gerado de forma reproduzível | Atendido | Gerar duas vezes regrava só o relatório técnico, que guarda o horário. Um teste compara os bytes de todos os arquivos de dados entre duas gerações, e outro mostra que formatação, BOM, fim de linha e ordem dos campos não mudam a entrada nem a saída |

### O que foi entregue

- **Leitura e validação** das duas pastas de conteúdo, com diagnósticos em português que dizem arquivo, entidade, `id`, campo e motivo, em três severidades: erro, pendência e aviso.
- **Regra de elegibilidade** explícita, escrita no código e na documentação.
- **Gerador**: `generated/dados/conjunto.json`, `indices.json`, um GeoJSON geral e um por pessoa, mais o manifesto e dois relatórios.
- **Índices** por pessoa, ano, categoria, lugar, `id` e `slug`.
- **Consultas tipadas**, puras, que rodam no build e no navegador.
- **Importação** de pacotes JSON para os rascunhos, com registro de origem e resultado.
- **Cinco comandos**: `data:validate`, `data:build`, `data:report`, `data:import` e `data:query`.
- **Integração**: `npm run dev` e `npm run build` geram os dados antes; as páginas leem só os dados gerados; o build recusa dados de outra versão do conteúdo; o servidor de desenvolvimento regenera ao recarregar a página.
- **Tela de prova com os dados reais**, em `/dev/dados/`, só em desenvolvimento.
- **Relatório de cobertura** da edição 0.1.0, em [DATA-REPORT.md](DATA-REPORT.md).

Passos do plano e situação de cada um:

| Passo | Situação |
| --- | --- |
| 1. Leitura e validação dos arquivos de conteúdo | Feito |
| 2. Identificadores únicos, referências e datas coerentes | Feito |
| 3. Comando que seleciona só os revisados | Feito: `npm run data:build` |
| 4. Índices por pessoa, ano, categoria e lugar | Feito, mais `id` e `slug` |
| 5. Coleções GeoJSON dos acontecimentos com localização | Feito: 27 pontos de 26 acontecimentos |
| 6. Relatório de campos incompletos e referências inválidas | Feito: `npm run data:validate` e `npm run data:report` |
| 7. Importação separada da publicação, chegando como rascunho | Feito: `npm run data:import` |
| 8. Procedimento de atualização e correção | Feito: DATA-PIPELINE.md e content/README.md |

### Números da edição 0.1.0 nos dados gerados

| Item | Quantidade |
| --- | --- |
| Acontecimentos elegíveis | 39 (20 de cada pessoa, 1 compartilhado) |
| Acontecimentos fora da publicação | 5, todos rascunhos com pendência escrita |
| Mandatos e funções, filiações | 15 e 8 |
| Lugares, fontes, imagens | 9, 59 e 2 |
| Pontos no mapa | 27, de 26 acontecimentos. Um acontecimento tem dois lugares |
| Acontecimentos sem ponto | 13: 6 de abrangência nacional e 7 sem lugar documentado |
| Erros, pendências, avisos | 0, 5 e 0 |

### Casos essenciais verificados

| Caso | Onde está o teste |
| --- | --- |
| Revisado válido entra; rascunho e fixture sintética ficam fora | `tests/pipeline.test.ts`, bloco "elegibilidade" |
| Referência inexistente e `id` ou `slug` duplicado geram diagnóstico útil | `tests/pipeline.test.ts`, bloco "referências e identificadores" |
| Datas parciais, datas impossíveis e intervalos incoerentes | `tests/pipeline.test.ts`, bloco "datas" |
| Acontecimento sem coordenadas continua consultável | `tests/queries.test.ts`, bloco "acontecimento sem coordenadas" |
| Vários lugares geram pontos ligados, e o acontecimento aparece uma vez | `tests/map.test.ts` e `tests/queries.test.ts` |
| Filtros combinados e limites de período | `tests/queries.test.ts`, blocos "filtro de acontecimentos" e "mandatos e filiações no período" |
| Repetir a geração preserva a saída | `tests/generate.test.ts`, bloco "reprodução" |
| Falha de validação impede o build e preserva os arquivos editoriais | `tests/generate.test.ts`, bloco "falha de validação", e `tests/reader.test.ts` |

Sete regras foram quebradas de propósito no código, uma por vez, para confirmar que os testes falham: aceitar revisado em `content/drafts/`, tirar a ordenação das chaves, deixar o leitor aceitar dados de outra versão, aceitar o estado declarado na importação, tornar exclusiva a ponta final do período, deixar de tratar dependência quebrada como erro e deixar de apagar arquivo obsoleto. Em todos os casos algum teste falhou. O código foi restaurado.

### Lacunas encontradas na base e como foram resolvidas

Todas pontuais, necessárias para integrar o pipeline:

| Lacuna | Resolução |
| --- | --- |
| Os scripts não tinham como usar os schemas TypeScript (ponto em aberto desde a fase 1) | Node com remoção de tipos e um gancho de resolução, sem dependência nova (D-27) |
| Mensagens de erro do Zod pouco claras em casos comuns, como "esperava um número, recebeu um número" para um valor infinito | Mensagens próprias para campo ausente, campo desconhecido, valor não aceito, lista vazia e número fora do limite |
| Ordenação com `localeCompare`, que depende do idioma da máquina | Comparação pelo código dos caracteres, em um lugar só (`order.ts`) |
| `id` como `constructor` é válido no contrato e confundiria uma busca em objeto comum | Buscas nos índices com `Object.hasOwn` |
| Rascunhos só podiam ser acontecimentos, e a importação precisa guardar também fontes e lugares | `content/drafts/` aceita as sete coleções (D-31) |
| Referência a um registro inválido gerava um segundo erro, de "inexistente" | O segundo erro é suprimido: o problema já está apontado no registro |
| O exemplo de DATA_MODEL.md não tinha o campo `tipo` da revisão | Corrigido |

### Ajustes no que veio das fases anteriores

- `src/lib/content/load.ts` deu lugar a `sources.ts`, `output.ts`, `pipeline.ts` e `published.ts`. As páginas chamam `getAtlasData()`.
- `src/features/map/features.ts` deu lugar a `src/lib/data/points.ts`: os pontos são montados pelo gerador, e o navegador só os recorta.
- `npm run content:coverage` deu lugar a `npm run data:report`.
- Um registro não revisado em `content/published/` deixou de interromper o build: fica fora e aparece como pendência (D-29).
- `engines` passou a exigir Node 22.18, e `tsconfig.json` ganhou `erasableSyntaxOnly`.
- O conteúdo de `content/` não foi alterado.

### Verificações executadas

Todas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| `npm run data:validate` no conteúdo real | 0 erros, 5 pendências, 0 avisos |
| `npm run data:build`, duas vezes seguidas | 39 acontecimentos e 27 pontos; na segunda vez só o relatório técnico foi regravado |
| `npm run lint` | Sem problemas. As regras de fronteira foram testadas com dois arquivos temporários que as violavam |
| `npm run typecheck` | Sem erros |
| `npm run test` | 266 testes passando, em 14 arquivos |
| `npm run build` | 47 páginas HTML, como na fase 2: início, 2 perfis, 39 acontecimentos, comparar, metodologia e 404 |
| `npm run verify:export` | 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 20 testes passando: 13 da prova com dados sintéticos e 7 novos com os dados reais |
| Páginas estáticas contra os dados gerados | Cada perfil lista seus 20 acontecimentos em ordem cronológica; as 39 páginas trazem todas as fontes e o aviso de revisão pendente; nenhum rascunho é citado; o Zod e a pasta `generated/` não estão na saída |
| Bloqueio do build com conteúdo quebrado | Descrito no critério de conclusão, acima |
| `npm run data:import` em simulação, no projeto real | 1 pendente e 2 rejeitados, com os motivos; nada gravado |
| `npm run data:query` no projeto real | Recortes por pessoa, período, categoria e lugar, e a leitura de um acontecimento |

### Implementado e não verificado

- **Node 22.** Os comandos foram rodados só no Node 24.15.0. O mínimo declarado, 22.18, vem da documentação do Node.
- **Linux e macOS.** Tudo foi rodado no Windows. Os caminhos usam `node:path` e são gravados com barra normal, mas isso não foi exercitado em outro sistema.
- **WebP simples e sem perdas, AVIF e SVG reais.** A sonda de mídia foi testada com os dois JPEG do projeto e com cabeçalhos montados no teste para PNG, WebP estendido, AVIF e SVG. Os outros dois tipos de WebP estão implementados e não têm teste.
- **Ambiente de hospedagem.** O build com geração de dados não foi rodado em nenhum serviço. É item da fase 10.

### Lacunas herdadas da pesquisa

Não mudaram nesta fase. O pipeline as mostra, e não as resolve.

1. **Revisão humana de todo o conjunto.** Continua sendo a principal. Os 39 acontecimentos, os 15 mandatos, as 8 filiações e os 2 perfis têm revisão `assistida-por-ia`.
2. **Os 5 rascunhos,** com as pendências de cada um (DATA-REPORT.md).
3. **Lacunas de período de Lula:** 1981 a 1985, 1990 a 1993, 1995 a 2001 e 2007 a 2015.
4. **Atuação de Flávio Bolsonaro na Alerj:** de 2003 a 2018 só há eleições.
5. **Cinco das oito filiações com algum limite desconhecido.** As consultas por período as devolvem como incertas.
6. **Todos os lugares são aproximações:** centro de município ou de estado. Sete acontecimentos não têm lugar documentado.
7. **Nenhum acontecimento tem imagem.** Só os dois retratos.
8. **Trechos de evidência:** as 160 citações dos registros publicados têm trecho registrado em `docs/evidencias/`, mas a conferência é a fotografia de 8 de outubro de 2026. Não há comando que a repita.
9. **Conteúdo no meio de uma eleição:** o segundo turno é em 25 de outubro de 2026, depois da data de corte.
10. **Decisões do responsável pelo projeto:** quem assina a revisão humana, canal público de correção e as divergências entre documentos (CONTENT-REVIEW.md).

### Limitações desta entrega

- **Promover um rascunho é manual:** editar o estado e mover o registro entre dois arquivos. A validação pega o erro, mas não faz a movimentação (D-36).
- **A importação não atualiza registro existente.** Conflito de `id` é recusa.
- **Não há coletor de sites nem integração recorrente.**
- **Os dados não têm endereço próprio no site.** Chegam ao navegador pelas páginas. Se a fase 6 quiser que o mapa busque o GeoJSON por endereço, é preciso copiá-lo para `public/` no build (D-28).
- **A interface continuava estrutural** ao fim da fase 3. A fase 4 a substituiu.
- **O site continua com `noindex`** e não foi publicado.

## Fase 2 (pesquisa e primeiro conjunto de conteúdo)

Concluída em 08/10/2026. O critério do plano era "cada item publicado tem evidência para suas afirmações, data com precisão definida e revisão registrada", e foi atendido com uma ressalva: toda revisão é assistida por IA, e nenhuma revisão humana foi feita nem registrada. O plano coloca a revisão humana da coleção final na fase 9.

O que foi entregue:

- **39 acontecimentos conferidos** em `content/published/acontecimentos.json`: 20 de Lula (1975 a 2026) e 20 de Flávio Bolsonaro (2002 a 2026), sendo um compartilhado.
- **5 rascunhos** em `content/drafts/acontecimentos.json`, cada um com a pendência escrita.
- **15 mandatos e funções**, **8 filiações partidárias**, **9 lugares**, **59 fontes** e **2 imagens**.
- **Edição 0.1.0**, com data de corte em 08/10/2026.
- Documentação: [SOURCES.md](SOURCES.md), [EDITORIAL.md](EDITORIAL.md), [CONTENT-REVIEW.md](CONTENT-REVIEW.md) e a lista de trechos em `docs/evidencias/`.

Bloqueios de acesso, detalhados em SOURCES.md: a Assembleia Legislativa do Rio de Janeiro não expõe legislaturas antigas; a biografia atual do presidente no Planalto estava bloqueada; o TSE não tem arquivos de candidaturas anteriores a 1994.

O que a fase 2 pediu à fase 3, e o que foi feito:

| Pedido | Situação |
| --- | --- |
| Promoção de rascunho para publicado | Continua manual, agora com procedimento escrito e validação que acusa o passo esquecido (D-36) |
| Validar os rascunhos junto com o conjunto publicado | Feito: as duas pastas são lidas e validadas juntas |
| Verificador de evidências como comando | Não feito (D-36). O relatório informa quantas citações têm trecho registrado |
| Índices por pessoa, ano, categoria e lugar, e GeoJSON | Feito |
| Relatório de campos incompletos e de referências sem uso | Feito: avisos de fonte, lugar e imagem sem uso |
| Como os scripts importam os schemas TypeScript | Resolvido (D-27) |
| Conferência dos itens do registro de alterações | Feito, como aviso |

## Fase 1 (arquitetura e fundação)

Concluída em 08/10/2026 e registrada no commit `9be1013`. O que ela entregou está em ARCHITECTURE.md, DATA_MODEL.md e DECISIONS.md. Pontos da fase 1 que seguem abertos:

- O mapa só foi verificado em Chromium sem interface, inclusive nas fases 4 e 6. Falta abrir a exploração em uma janela visível do Chrome.
- Firefox, Safari, celular real e leitor de tela não foram testados.
- Hospedagem real, incluindo o tipo MIME de `.mjs`, fica para a fase 10.
- `npm audit`, conferido de novo em 08/10/2026: nenhuma vulnerabilidade em produção; 5 altas na cadeia do lint, que não vai para o site.
- A próxima versão maior do Next deve ligar Cache Components para todos (DECISIONS.md, D-02).
- O plano de desenvolvimento em 10 fases não faz parte do repositório.

## Próximo passo

A decisão é do responsável pelo projeto. O que está pendente, em ordem: a revisão humana do conteúdo, a começar pelo que a edição 0.3.0 trouxe ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)); a validação com três pessoas, com celular real ([USER-VALIDATION.md](USER-VALIDATION.md)); e as decisões de publicação: manter ou tirar o endereço provisório, que um push na `main` pode atualizar, o domínio, o canal de correção, a indexação e a licença ([DEPLOY.md](DEPLOY.md)). Tudo é versionado na `main`, em repositório público no GitHub (https://github.com/rickjs2005/atlas-politico).
