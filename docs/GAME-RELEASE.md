# Jogo: plano até a versão de lançamento

> **Documento histórico.** Este plano é de 10 de outubro de 2026 e descreve o jogo de exploração com capítulos, tarefas e saída, que foi substituído em 11 de outubro pela trilha simples ([GAME-TRAIL.md](GAME-TRAIL.md)). As regras em vigor estão em [GAMEPLAY.md](GAMEPLAY.md), e a situação atual, em [STATUS.md](STATUS.md). O texto abaixo fica como foi escrito: capítulos, tarefas e salas temáticas, quando aparecem aqui, são os do jogo anterior. As pendências humanas que ele lista (revisão humana, validação com pessoas, domínio e canal de correção) continuam valendo. O que mudou nelas: o site passou a responder em um endereço provisório da Vercel, sem indexação, por decisão do responsável pelo projeto (D-147).

Plano curto, escrito em 10 de outubro de 2026 a partir da `main` em `28fddd4`, para levar o jogo da etapa 1 (quatro capítulos, 15 dos 39 acontecimentos) a uma versão candidata a lançamento antes do segundo turno. A meta pedida é **22 de outubro de 2026**, com margem até o dia 24; o segundo turno é em **25 de outubro de 2026** ([Resolução TSE 23.751/2026](https://www.tse.jus.br/legislacao/compilada/res/2026/resolucao-no-23-751-de-26-de-fevereiro-de-2026)). O que já está feito e verificado fica em [STATUS.md](STATUS.md); o desenho do jogo, em [GAMEPLAY.md](GAMEPLAY.md).

## O que a data permite, e o que não

A parte técnica cabe no prazo: os capítulos, as mecânicas, os cenários e as verificações são trabalho de código, com testes que já existem para a maior parte das regras. O que não depende de código é o que decide o lançamento, e ninguém pode fazê-lo por quem é responsável pelo projeto:

- **Revisão humana do conteúdo.** Toda a conferência foi assistida por IA. A política do projeto condiciona a publicação a essa revisão ([EDITORIAL.md](EDITORIAL.md)). São 39 acontecimentos, 15 cargos, 8 filiações e 60 fontes; a lista do que mais precisa de olho humano está em [HUMAN-REVIEW.md](HUMAN-REVIEW.md).
- **Validação com três pessoas, com celular real.** Roteiro em [USER-VALIDATION.md](USER-VALIDATION.md). Nenhuma sessão foi feita.
- **Domínio, hospedagem e canal de correção.** Sem domínio não há endereço canônico, sitemap nem prévia de compartilhamento com endereço absoluto.
- **Decisão sobre a totalização do primeiro turno.** O registro de 4 de outubro traz a apuração com 99,99% das urnas, como a notícia do TSE a publicou. Trocar pelos números definitivos é uma atualização de conteúdo, com nova entrada na edição; não é feita sem decisão e sem documento oficial lido.

**Risco real:** se a revisão humana e a validação não acontecerem até 20 de outubro, a versão candidata existe, mas a publicação em 22 viola a regra editorial do próprio projeto, e a barreira de release (`npm run verify:release`, [DEPLOY.md](DEPLOY.md)) a recusa. As saídas são duas, e nenhuma é tomada aqui: adiar, ou mudar a política por decisão escrita do responsável pelo projeto em [EDITORIAL.md](EDITORIAL.md), mantendo o aviso de revisão pendente que já existe na entrada, no jogo e nas fichas e dizendo isso na divulgação. Enquanto a política for a atual, a barreira continua recusando.

## Etapas

| Etapa | O quê | Prioridade | Critério de conclusão |
| --- | --- | --- | --- |
| 1. Contratos | Unicidade de acontecimento por personagem; fronteira entre capítulos pelas datas e precisões, sem a comparação por ano; `SceneId` ampliado, com a arte separada da cena; progresso com migração explícita da versão 1; cobertura e alcance de todos os registros | Alta | Testes de regra passando com os capítulos novos declarados |
| 2. Capítulos sobre o conteúdo existente | Sete capítulos novos (quatro de Lula, três de Flávio Bolsonaro) sobre os 24 acontecimentos, com matriz acontecimento → personagem → capítulo gerada dos dados | Alta | Todo acontecimento publicado em um capítulo, ou com exclusão justificada; `npm run game:coverage` sem pendência |
| 3. Ficha judicial | Apresentação dos episódios judiciais com o contexto do atlas (acusação, defesa, decisão, desfecho, como o registro os traz) e as decisões relacionadas por identificador, com a própria data | Alta | Cada registro judicial mostra as decisões relacionadas; teste de regra para as relações |
| 4. Mecânica nova | Associar um registro ao documento que o sustenta; opcional: ao lugar documentado. Pistas, explicação e nova tentativa | Alta | Os dois personagens têm pelo menos três tipos de tarefa, distribuídos; testes de regra e de navegador |
| 5. Cenários | Cinco ambientes novos (comitê de campanha, sala de audiências, gabinete, sala de comissão, auditório de convenção), arte por código no padrão dos quatro atuais | Alta | Cada capítulo com cenário próprio; nenhum bloco provisório |
| 6. Figuras por período | Variações de cabelo, barba e roupa por época, com o mesmo cuidado para os dois | Média | Capítulos antigos com a figura da época; D-103 superada |
| 7. Público | Primeira dobra da entrada com os personagens e o jogo; celular em pé e deitado; medição de carregamento e cadência; títulos, descrição, prévia de compartilhamento, créditos | Média | Medições registradas; capturas; checks |
| 8. Publicação preparada | Procedimento de deploy com a infraestrutura disponível; endereço canônico, sitemap e indexação só com o domínio decidido | Média | [DEPLOY.md](DEPLOY.md) com o passo a passo e o que depende de decisão |

Som e outras mecânicas ficam para depois do lançamento.

## Marcos

| Data | Meta | Situação |
| --- | --- | --- |
| 10 a 12/10 | Contratos, ficha judicial, um capítulo novo de cada personagem | Feito em 10/10 |
| 13 a 17/10 | Capítulos restantes, matriz de cobertura, cenários, tarefas | Feito em 10/10: os sete capítulos, a matriz sem exclusão, os cinco cenários e as duas tarefas novas |
| 18 a 20/10 | Acabamento, figuras por período, material para revisão humana e validação | Feito em 10/10: três figuras de cada personagem, [HUMAN-REVIEW.md](HUMAN-REVIEW.md) gerado dos dados e a tarefa do jogo em [USER-VALIDATION.md](USER-VALIDATION.md). A revisão humana e as sessões com pessoas continuam por fazer, e não dependem de código |
| 21/10 | Versão candidata verificada, correções, preparação da publicação | A versão candidata foi verificada em 10/10 ([STATUS.md](STATUS.md), seção Jogo, versão de lançamento); [DEPLOY.md](DEPLOY.md) escrito. O que resta até o dia 21 é o que depende do responsável pelo projeto |
| 22/10 | Meta de lançamento; 23 e 24/10, margem para correções | Depende da revisão humana, da validação, do domínio e da autorização do deploy |

Os marcos eram metas de planejamento. A execução de 10/10 adiantou todas as etapas de código no mesmo dia; nenhum dos cortes abaixo foi usado. O que ficou por fazer está em STATUS.md, com o motivo: tudo o que resta depende de pessoas, e não de código.

### Como a execução de 10/10 correu

As oito etapas foram feitas na ordem do plano, em uma sessão, com testes de regra escritos junto com cada contrato. A arte dos cinco cenários novos foi feita primeiro em uma versão própria e depois refinada por agentes de IA em paralelo, um por arte: três terminaram (sala de audiências, auditório de convenção e comitê de campanha), um foi interrompido pelo limite de uso da sessão depois de gravar o gabinete e o sofá (o código compilou e passou nos testes) e o da sala de comissão não chegou a rodar, de modo que a sala de comissão ficou com a versão própria. As propostas dos agentes que saíam do escopo (mover auxiliares de folha de porta e de disco de parede para os kits, a galeria mostrar a variante 1 e uma célula de parede sem janela, cadeiras de plástico nos ambientes frios) ficaram anotadas e não foram aplicadas. O servidor de desenvolvimento foi derrubado pelo sistema por falta de memória durante o trabalho dos agentes; as verificações finais rodaram sobre o build estático, uma de cada vez.

## Pendências humanas

1. Revisão humana do conteúdo ([HUMAN-REVIEW.md](HUMAN-REVIEW.md), [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), seção Revisão humana).
2. Sessões com três pessoas, incluindo celular real ([USER-VALIDATION.md](USER-VALIDATION.md)).
3. Domínio público e hospedagem; canal de correção (`src/lib/site.ts`).
4. Decisão sobre atualizar o primeiro turno com a totalização final, e sobre a licença do repositório.
5. Autorização para o deploy, que é o último passo e não acontece sem ela.
6. Da auditoria de QA de 11 de outubro de 2026 ([STATUS.md](STATUS.md)): abrir a ata ou a lista nominal das seis votações e ligar a cada uma o texto que foi votado; conferir os alvos e o contexto dos quatro vetos; refazer a comparação da seleção da amostra, a começar pelo Decreto 11.615/2023, e decidir se a divisão em três decisões por pessoa e tema fica (`research/selecao-decisoes-2026-10.md`, seção A regra aplicada); aprovar o tom do Escrivão e a lista de registros em que ele não faz humor (D-129); e decidir se o produto vai anunciar planos de governo, que o atlas não tem: as sete proposições publicadas são proposições legislativas.

## Roteiro de demonstração (20 a 30 segundos)

Para gravar a tela ou mostrar ao vivo, sem narração obrigatória. Cada passo cabe em poucos segundos; as capturas correspondentes estão em `docs/capturas/jogo-lancamento/`.

| Tempo | O que mostrar | Como |
| --- | --- | --- |
| 0 a 4 s | A entrada do atlas: os dois cartões iguais e, abaixo, **Jogar com Flávio Bolsonaro · 5 capítulos** e **Jogar com Lula · 6 capítulos** | Abrir `/` e clicar em **Jogar com Lula** |
| 4 a 10 s | O capítulo 1, no salão do sindicato (1975 a 1980): a figura dos primeiros anos anda até a pasta destacada, recolhe com **E**, e o registro abre com a data na precisão documentada, o resumo, a fonte e a nota "revisão humana pendente" | Setas ou WASD, **E**, **Guardar e continuar** |
| 10 a 15 s | O painel **Capítulos e tarefas**: os seis capítulos, o período e o tipo de tarefa de cada um, e **Ler de novo** no registro recolhido | Botão **Capítulos e tarefas**, depois **Voltar ao jogo** |
| 15 a 22 s | A ficha judicial: no capítulo 4 (sala de audiências), recolher o registro da condenação de 2017; a natureza do registro, o contexto como a ficha o traz, as decisões relacionadas com a própria data (TRF4 em 2018, anulação em 2021) e o aviso de que o jogo não pede juízo de culpa | Para chegar sem jogar os três primeiros capítulos, usar o progresso salvo como no roteiro de capturas (`tests/export/jogo.capture.ts`, `progressoAte`) |
| 22 a 28 s | A tarefa de documento: escolher a opção errada, ler a explicação ("Ainda não. Esse documento é citado por outro registro do capítulo..."), tentar de novo e acertar; a porta abre e o personagem atravessa | Capítulo 3 de Lula ou de Flávio Bolsonaro |
| 28 a 30 s | O celular em pé, com o direcional e o botão de ação, ou a transição com o contexto do capítulo seguinte | Uma captura basta: `lula-23-celular-capitulo-1` ou `lula-13-transicao-com-contexto` |

O que não entra na demonstração: nenhuma afirmação sobre as pessoas retratadas além do que o registro diz, nenhum placar, nenhuma comparação de "quem fez mais".

## Cortes possíveis, se o prazo apertar

Na ordem, do que custa menos ao que custa mais: a tarefa de lugar (fica só a de fonte); as figuras por período (fica a figura atual, como hoje, dita na entrada); a medição de cadência em celular emulado (fica a de computador). Nenhum corte esconde acontecimento nem muda o tratamento de um personagem em relação ao outro: os capítulos e a cobertura são a prioridade.
