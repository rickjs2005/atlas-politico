# Missão de investigação: "O documento diz o quê?"

Documento da primeira missão de investigação do jogo (D-151), feita em 17 de outubro de 2026. Diz o que ela é, como abrir, como joga, de onde veio cada mecânica, por que a direção técnica é esta, o que foi verificado e o que falta. O estudo das referências está em [REFERENCIAS-JOGOS.md](REFERENCIAS-JOGOS.md); a lista de tarefas, em [TAREFAS.md](TAREFAS.md); as regras do jogo em vigor, em [GAMEPLAY.md](GAMEPLAY.md).

## O que é

Uma sala nova do jogo, `investigacao`, com uma fase por pessoa. O Escrivão, guia fictício, entrega fichas: afirmações em uma frase, cada uma escrita só com o que um documento do atlas registra. A pessoa explora a sala de arquivo, abre os documentos da gaveta (decisões já publicadas: atos do Executivo, votos e atuações legislativas), lê os cinco campos de cada um (data, instituição, cargo, objeto e ação), guarda no dossiê os que achar úteis, relaciona cada ficha ao documento que a sustenta e aponta, no documento, o campo que sustenta o trecho destacado da ficha. Errar explica em que campos o documento escolhido difere do que a ficha pede, sem dizer o certo, e deixa tentar de novo. Com as fichas conferidas, a missão entra no passaporte como qualquer fase.

Duração pretendida: de 5 a 10 minutos. **É uma hipótese de desenho, não uma medição:** ninguém jogou a missão em sessão de validação.

| Variante | Fase | Documentos das fichas | Distratores (da mesma pessoa) |
| --- | --- | --- | --- |
| Lula | `lula-investigacao`, "O documento diz o quê? Três atos na Presidência" | Lei Complementar 200/2023 (veto parcial), Lei Complementar 214/2025 (veto parcial), Lei 15.270/2025 (sanção expressa) | Decreto 6.025/2007, Lei 12.351/2010 (veto parcial), Lei 14.843/2024 (veto parcial) |
| Flávio Bolsonaro | `flavio-bolsonaro-investigacao`, "O documento diz o quê? Três votos no Senado" | Voto na PEC 45/2019 (2º turno, 2023), voto no PL 2.253/2022 (2024), voto no substitutivo ao PLP 68/2024 (2024) | Voto no PLP 93/2023 (2023), voto na PEC 45/2023 (2º turno, 2024), autoria da Lei estadual 5.019/2007 (Alerj) |

Os documentos de cada variante fazem sentido juntos: na de Lula, três atos de Economia do terceiro mandato, em que o tipo do ato (veto parcial ou sanção) e a data distinguem documentos parecidos, com dois distratores de mandatos anteriores e um de outro tema; na de Flávio Bolsonaro, três votos no Senado de 2023 e 2024, em que a data, o objeto votado (texto principal, substitutivo, etapa) e a manifestação distinguem registros parecidos, com dois votos próximos e uma autoria na Alerj, que não é voto. Nenhuma conexão foi forçada: cada ficha aponta um registro que já estava publicado e conferido, e nenhum registro factual novo entrou.

## Como abrir e jogar

```bash
npm run build
npm run preview
```

- Entrada do jogo: http://localhost:4311/jogo/ (a missão fica no cartão de cada pessoa, em "Missão de investigação").
- Lula: http://localhost:4311/jogo/lula/investigacao/
- Flávio Bolsonaro: http://localhost:4311/jogo/flavio-bolsonaro/investigacao/
- Sem o cenário: acrescente `?leitura=1` (as quatro partes ficam na página, em sequência).

Com o cenário: toque no Escrivão (ou no botão **Falar com o Escrivão**) e escolha o que perguntar; toque na gaveta, abra os documentos e guarde os úteis; toque na mesa (**Fichas**), relacione cada ficha a um documento do dossiê e aponte o campo; o quadro repete a chave de leitura. Com tudo conferido, a explicação e as fontes aparecem, o carimbo entra no passaporte, e **Ver o resumo** leva ao resumo, com o caminho para a mesma missão com os documentos da outra pessoa.

## O fluxo, passo a passo

| Passo pedido | Como a missão o cumpre | Onde |
| --- | --- | --- |
| 1. Encontrar o Escrivão e receber uma dúvida concreta | A conversa, com três perguntas possíveis; quem pergunta como se lê um documento deixa uma marca, e o fim da conversa muda por causa dela (a chave de leitura abre sozinha) | `src/lib/game/escrivao/dialogo.ts`, seção 1 de `ui/Dossier.tsx` |
| 2. Explorar uma sala com ao menos três elementos interativos | Quatro objetos com função: o Escrivão, a gaveta, a mesa das fichas e o quadro. São botões com nome sobre o móvel desenhado; o boneco anda até eles | `src/lib/game/scenes/arquivo-investigacao.ts`, `GameShell.tsx` (marcadores `objeto:*`), `GameStage.tsx` |
| 3. Encontrar documentos vinculados a registros reais | A gaveta: seis decisões publicadas, com data e título, em ordem estável que não entrega a resposta | `drawerDocuments` em `src/lib/game/dossier.ts` |
| 4. Examinar data, instituição, cargo, objeto e ação | Os cinco campos de cada documento, tirados do cartão de decisão do atlas; o quadro explica o que cada um é | `documentFields` em `dossier.ts`, `CAMPOS_DO_DOCUMENTO` em `src/lib/domain/game.ts` |
| 5. Reunir as evidências em um dossiê | Guardar e tirar do dossiê; o documento que entra bate uma vez; o dossiê fica guardado no progresso | `collectDocument`, `removeDocument`; `PhaseProgress.dossie` |
| 6. Relacionar uma afirmação à evidência que a sustenta | Relacionar a ficha a um documento do dossiê (toque, teclado ou arraste) e apontar o campo que sustenta o trecho destacado | `matchFicha`, `inspectField`; seção 4 de `ui/Dossier.tsx` |
| 7. Explicação contextual, com acesso às fontes | A explicação da fase, a explicação da resposta e **Ver fontes**, com o registro e os documentos de cada ficha | `atividade.explicacao`, `explicacao` da fase, `SourceList` |
| 8. Concluir, receber um carimbo e encontrar um próximo caminho | A última ficha conferida conclui a fase pela resposta; o carimbo é o do passaporte; o resumo oferece a mesma missão com a outra pessoa, a trajetória e a comparação | `conclude` em `trail.ts`, `passport.ts`, `SummaryContent` |

Inclui, como pedido: objetivo visível e curto (o cartão da fase e a linha de andamento "Dossiê: 2 de 6 documentos · fichas conferidas: 1 de 3"); diálogo com ramificação útil; exploração que revela informação (os campos só aparecem com o documento aberto); uma atividade além de múltipla escolha (relacionar e apontar o campo, com arrastar e soltar no mouse e botões no toque e no teclado); feedback que explica o erro; nova tentativa livre e ajuda (o quadro e a conversa, que pode ser refeita); conclusão integrada ao passaporte.

## Estados e transições

A fase tem o estado de toda fase (`vista`, `concluida`, `tentativas`, `assinatura`) mais o andamento do dossiê, em `PhaseProgress.dossie` (D-151): `recolhidos` (as chaves dos documentos no dossiê, na ordem), `relacionadas` (por ficha, a chave do documento, quando a relação está certa) e `conferidas` (as fichas em que o campo também foi apontado). O formato salvo continua na versão 6: o campo é opcional, e um salvo sem ele é lido como antes; um salvo com o campo em forma errada vira começo, como qualquer dado inválido.

```
ficha: pendente ──relacionar ao documento certo──▶ relacionada ──apontar o campo certo──▶ conferida
          │  relacionar a outro documento: conta a tentativa,       │  apontar outro campo: conta a tentativa,
          │  explica os campos que diferem, fica pendente           │  diz o que o campo registra, fica relacionada
          ▼                                                          ▼
fase: todas as fichas conferidas ──▶ concluída pela resposta (carimbo)
      "Ver a explicação e continuar" ──▶ concluída pela leitura (carimbo; cada ficha aparece como "lida", com o documento e o campo)
```

O que decide a resposta, para a assinatura (D-130): cada ficha, o documento que a sustenta e o campo do trecho destacado. A gaveta (os distratores) e os textos não entram: corrigir a redação de uma ficha não reabre a resposta de ninguém; trocar o documento ou o campo de uma ficha reabre só esta fase.

A conversa com o Escrivão não é gravada: vale na visita. O que persiste é o dossiê.

## Conteúdo

As fichas são conteúdo, e não código: entram em `content/published/fasesDoJogo.json`, como a atividade `dossie` da fase (`src/lib/domain/schemas.ts`), com estado editorial e revisão identificada, e aparecem em [HUMAN-REVIEW.md](HUMAN-REVIEW.md) para a revisão humana. Regras conferidas por contrato e por teste:

- Toda ficha aponta uma decisão da própria pessoa; duas fichas não apontam o mesmo documento; os distratores são decisões da mesma pessoa e não sustentam ficha nenhuma.
- O trecho destacado está, igual, no texto da ficha; os trechos de uma fase pedem ao menos dois campos diferentes.
- Todo ano e todo mês escritos em uma ficha estão no documento dela (`tests/game-phases.test.ts`).
- A explicação da fase segue as regras de toda fase (60 a 100 palavras, anos nos registros apontados, termos definidos na própria fase).
- Dois documentos da mesma gaveta nunca são iguais nos cinco campos: há sempre o que ler para distingui-los (`tests/game-dossier.test.ts`).

Nenhuma ficha afirma algo que o documento não registra: a ficha é uma leitura do cartão de decisão. Não há "ficha falsa": criar afirmações erradas sobre pessoas reais, mesmo para a pessoa desmascarar, foi descartado (D-151). O que a gaveta tem a mais são documentos verdadeiros que não sustentam as fichas.

A edição passou a 0.4.0 sem registro factual novo e sem fonte nova. A revisão é assistida por IA; a revisão humana continua pendente, e a barreira de publicação continua recusando.

## Direção visual e experiência

- A sala de investigação reaproveita a arte do gabinete (arquivos de aço, estantes, mesa, caixotes, quadro), com paleta própria por pessoa, e o Escrivão no balcão.
- Os objetos interativos são etiquetas sempre à vista ("Escrivão", "Gaveta", "Fichas", "Quadro") com um anel tracejado, sobre o móvel desenhado; nenhum é pasta. O botão principal diz o próximo passo ("Falar com o Escrivão", depois "Abrir o dossiê").
- Os documentos têm hierarquia: data e título na lista; os cinco campos em tabela quando abertos; o trecho destacado da ficha em marca. A ficha conferida recebe um carimbo pequeno, com a batida do passaporte; o documento que entra no dossiê bate uma vez. Com movimento reduzido, tudo aparece parado.
- O Escrivão responde ao progresso: a conversa muda com a marca; a instrução, o erro, a conclusão e o carimbo têm falas próprias da sala (`catalogo.ts`), com humor desligável.
- No celular, os objetos têm 52 pixels de toque, a janela abre embaixo, e as ações são botões: nada depende de arrastar.
- Sem o cenário ("Ler sem o cenário", sem canvas ou sem JavaScript), as quatro partes ficam na página, em sequência, com as mesmas regras; sem JavaScript, as fichas vão em texto, com o documento e o campo de cada uma.

## Arquitetura e decisão técnica

Separações mantidas (D-151):

| Camada | Onde | O que faz |
| --- | --- | --- |
| Conteúdo factual e fontes | `content/published/` (decisões já publicadas; as fases com a atividade `dossie`) | Nada de fato entra pelo código |
| Regras da missão | `src/lib/game/dossier.ts` (puro), com `activityRefs` e `conclude` em `trail.ts` | Gaveta, campos, recolher, relacionar, apontar, concluir, solução, resumo |
| Estado e persistência | `PhaseProgress.dossie` (`types.ts`), lido em `progress.ts` | Formato 6, campo opcional |
| Diálogo | `src/lib/game/escrivao/dialogo.ts` (puro), validado por `validateLine` | Grafo pequeno, em TypeScript |
| Interface | `src/features/game/ui/Dossier.tsx`, `dialogs.tsx`, `GameShell.tsx`, `Hud.tsx` | A tela, na janela e na página |
| Cena | `src/lib/game/scenes/arquivo-investigacao.ts`, `GameStage.tsx` | Objetos como marcadores `objeto`, sem pasta |

Decisões:

- **Sem motor de jogo e sem migração.** A missão é a sala isométrica que já existia, com objetos no lugar das pastas; o three.js continua só na Cidade do Voto.
- **Sem InkJS.** O diálogo tem cinco nós e uma marca. Um grafo em TypeScript (nós, escolhas, marca, texto alternativo, validação) cobre isso sem os 31 kB gzip, o compilador em build e o estado em string JSON do inkjs. O estudo recomenda reavaliar se o roteiro crescer ou se alguém for escrever em `.ink` ([REFERENCIAS-JOGOS.md](REFERENCIAS-JOGOS.md), seção 6).
- **O dossiê é uma atividade de fase,** e não um sistema à parte: herda o progresso, a assinatura, o passaporte, a leitura sem o cenário, o texto sem JavaScript, a lista de fases, a matriz de cobertura e a lista de revisão humana.

## De onde veio cada mecânica

| Referência | O que foi estudado (só por materiais públicos) | O que entrou na missão | O que ficou de fora, e por quê |
| --- | --- | --- | --- |
| Papers, Please | O modo de inspeção que marca dois itens e acusa discrepância; a citação que nomeia a regra violada; o livro de regras | Relacionar a ficha ao documento e apontar o campo que sustenta o trecho; o erro explicado pelos campos que não batem; a chave de leitura no quadro | Relógio, dinheiro, advertências e regras que mudam por dia: a missão é sem pressão. "Nenhum documento sustenta" como resposta: exigiria fichas sem lastro, e o projeto não inventa afirmações sobre pessoas reais |
| The Intercept (inkle) | Knots, escolhas, flags e texto condicional em ink | O grafo de diálogo: nós, escolhas, a marca `leitura` e o nó final que muda por causa dela; a validação das falas | O runtime ink e o Unity |
| A Short Hike | Exploração compacta, marcos que puxam a curiosidade, coleta sem pressão | A sala pequena em que cada objeto tem função; guardar documentos sem erro possível; nada bloqueia | Gavetas liberadas por contagem (barreira natural) e pedidos laterais de outros arquivistas: ficam para depois, e o jogo não segura nada |
| Return of the Obra Dinn | O livro que preenche o básico, campos por catálogo fechado, validação em trios | Os campos vêm prontos do documento; o campo é escolhido entre cinco, nunca em texto livre | A validação em trio, que não aponta o erro: a missão pede explicação |
| Pentiment | Diálogo em texto, sem dublagem, com opções que não são todas boas; estética de manuscrito | A conversa em texto; a estética de papel e carimbo que o jogo já tinha | A acusação sem gabarito: a missão precisa de resposta verificável |
| Three.js | Licença, ciclo de releases, o padrão de `dispose` | O ciclo de vida da Cidade do Voto (ver [MUNDO.md](MUNDO.md)) | Nada |
| BrowserQuest, phaser3-simple-rpg | Camadas de canvas, JSON de animação, cena base com HUD à parte | Confirmação do que o palco já faz (telas estáticas e dinâmicas) | Código e arte: MPL 2.0 e CC-BY-SA no BrowserQuest, assets sem licença declarada no RPG; ambos antigos |

## Verificação

| O quê | Onde | Resultado em 17 de outubro de 2026 |
| --- | --- | --- |
| Regras do dossiê (gaveta, campos, recolher, relacionar, apontar, concluir, assinatura, progresso salvo) | `tests/game-dossier.test.ts` | Ver [STATUS.md](STATUS.md), seção da missão |
| As fases da missão contra as regras de toda fase e as regras próprias (fichas, distratores, meses e anos) | `tests/game-phases.test.ts` | idem |
| O catálogo e o diálogo do Escrivão | `tests/game-escrivao.test.ts` | idem |
| A cena da sala de investigação (mapa, caminhos, objetos) | `tests/game-scenes.test.ts` | idem |
| A missão inteira para as duas pessoas (conversa ramificada, gaveta, erro explicado, campo, carimbo, resumo), recarregar, leitura sem o cenário só pelo teclado, celular 390×844 | `tests/e2e/investigacao.spec.ts`, no servidor de desenvolvimento e sobre a exportação | idem |
| As jornadas que já existiam (trilha, passaporte, atlas) | `tests/e2e/jogo.spec.ts` e as demais | idem |

O celular foi emulado. **Nenhum aparelho real, nenhum leitor de tela e nenhuma pessoa em sessão de validação.** A duração de 5 a 10 minutos não foi medida.

## Limitações e próximas tarefas

Estão em [TAREFAS.md](TAREFAS.md), com estado. As principais: revisão humana das fichas e das explicações; validação com pessoas, com o tempo medido; celular real e leitor de tela; a passagem de acessibilidade ainda não cobre as telas da missão; o arrastar e soltar é o do navegador (mouse), e no toque valem os botões; a conversa não persiste entre visitas; as duas variantes têm só três fichas, e as regras aceitam de duas a quatro.
