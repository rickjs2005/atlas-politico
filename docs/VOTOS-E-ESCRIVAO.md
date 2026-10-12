# Histórico de decisões e o Escrivão: plano e situação

> **Documento histórico, no que diz do jogo.** O domínio de decisões que este plano criou (votos, atos do Executivo, cobertura da pesquisa, a consulta comparativa e a importação) continua em vigor, e ganhou na edição 0.3.0 a atuação legislativa, que aqui aparece como "entidade futura" (D-136). Já as salas, a missão de decisão em duas etapas e as três camadas do Escrivão são do jogo anterior, substituído em 11 de outubro de 2026 pela trilha simples: as salas temáticas viraram aprofundamentos de uma fase, a missão saiu, e o Escrivão fala em duas camadas, a instrução e o humor ([GAME-TRAIL.md](GAME-TRAIL.md), [GAMEPLAY.md](GAMEPLAY.md), D-133). O texto abaixo fica como foi escrito.

Plano do projeto a partir do relatório de arquitetura e narrativa de 10 de outubro de 2026, feito por um agente de IA sobre o commit `b7cd0ee` e trazido pelo responsável pelo projeto. O relatório pede um domínio de decisões políticas (votos parlamentares e atos do Executivo) comparável entre os dois perfis, por votação e por tema, e um guia narrativo, o Escrivão, com diálogos declarativos por sala. Este documento é a versão do projeto para esse plano: o que foi decidido, o que foi feito e o que falta, em entregas pequenas. As decisões estão em [DECISIONS.md](DECISIONS.md), D-122 a D-124; o modelo, em [DATA_MODEL.md](DATA_MODEL.md), seção Decisões políticas; a política, em [EDITORIAL.md](EDITORIAL.md), seção Decisões políticas.

## O que o relatório pediu, e como ficou

| Pedido | Situação |
| --- | --- |
| Três naturezas (voto parlamentar, ato do Executivo, participação como autoria e relatoria), sem confundi-las | Voto e ato modelados (D-122); autoria e relatoria ficam como entidade futura, se a experiência exigir |
| Estados além de favor, contra e ausência, com o valor original; ausência só com documento; nunca inferir da falta de linha | Três tipos de registro individual e cinco respostas da consulta (D-123) |
| Temas separados das categorias; ANC separada da Câmara; Alerj no recorte de Flávio Bolsonaro | Taxonomias em `src/lib/domain/decisions.ts`; a Alerj e a Constituinte são instituições próprias; o conteúdo real ainda não tem registros |
| Modelo em JSON versionado, sem banco | Seis coleções novas no pipeline, formato gerado 2 |
| Proveniência com IDs externos, valor original, captura e versão | `identidadeExterna`, `proveniencia`, `capturaId`, capturas em `research/` |
| Cobertura declarada por pessoa, tema, período e acervo | Coleção `coberturaPolitica` |
| Importador com paginação, limites, nova tentativa e relatório; sem rede no build | `npm run importar:decisoes` (D-124) |
| Barreira de release e CI estendidas às novas afirmações | A barreira cobre as dez coleções factuais; a CI roda os mesmos testes |
| Escrivão: três camadas (instrução obrigatória, fala ficcional, informação documental), salas temáticas, motor de diálogos declarativo, preferências de humor, acessibilidade | Não iniciado: entrega P1 |
| Primeira investigação jogável com prova documental | Não iniciada: entrega P1 |

## O que a pesquisa dos acervos mostrou (10 de outubro de 2026)

Dois agentes conferiram o contrato real das APIs, sem registrar fato nenhum sobre as pessoas; o resumo está em [DATA-PIPELINE.md](DATA-PIPELINE.md), seção Importação de decisões, e em D-124.

- **Senado.** O webservice de votações cobre o mandato inteiro desde 2019 (1.142 votações para o senador 5894 em 10 de outubro); o limite de 12 meses é só do CSV. Voto individual em "Sim", "Não", "Abstenção"; em votação secreta, só "Votou"; ausência e não voto como siglas de comparecimento, com lista oficial. Até 10 requisições por segundo.
- **Câmara.** Sem endpoint por deputado; janelas de três meses; a lista de votos não traz ausentes; votos individuais só a partir de 2001. A legislatura de 1987 a 1991 (deputado 139289) tem proposições de autoria e votações esparsas sem votos; a Constituinte não aparece como órgão. O histórico desse período pede pesquisa documental (Arquivo Histórico, atas).
- **Alerj.** Bases Domino por legislatura, instáveis; as votações nas amostras são simbólicas, sem lista nominal; proposições por autor existem.
- **Planalto.** Leis, mensagens de veto (com os dispositivos) e decretos em HTML estático em `ccivil_03`; o portal e as fichas de metadados ficam atrás de desafio de JavaScript. A API de legislação do Senado dá metadados de normas.

A consequência editorial: a comparação por **mesma votação** só é possível onde os dois tinham competência e o acervo individualiza (hoje, nenhuma casa em comum); a comparação por **mesmo tema** junta votos do Senado de um, atos presidenciais do outro e, com pesquisa documental, a Câmara de 1987 a 1991 e a Alerj de 2003 a 2018, sempre com a diferença institucional explícita.

## Entregas

### P0, contratos e evidência: feita em 10 de outubro de 2026

- [x] Documentar as três naturezas (DATA_MODEL.md, EDITORIAL.md).
- [x] Definir estados e mensagens: ausência comprovada, competência não confirmada, pesquisa pendente (`PARTICIPACAO_EXPLICACOES`).
- [x] Definir temas, instituições e períodos; incluir ANC e Alerj nas taxonomias. O critério de seleção do recorte real é decisão editorial pendente.
- [x] Schemas e referências, com fixtures sintéticas só nos testes (`tests/fixtures/sintetico/`).
- [x] Pipeline, índices, manifesto, recorte por pessoa e barreira de release estendidos.
- [x] Adaptadores do Senado e da Câmara com IDs externos, valor original e captura; relatório de importação.
- [x] Nenhuma promoção automática: tudo entra como rascunho; o código nunca registra revisão humana.

**Aceite conferido:** referência quebrada, atribuição sem mandato da pessoa, voto fora do mandato ou de outra casa, dois votos vigentes e retificação incoerente são erros na publicação; o build é determinístico (formato 2, manifesto com as contagens); as seis coleções participam da barreira de release; 814 testes de regra passando, 43 deles novos; a importação do Senado passou de ponta a ponta em simulação (um trimestre: 7 proposições, 10 votações, 10 votos), e a da Câmara, para 1987, trouxe só a cobertura, como o acervo permite.

### P1, primeira investigação jogável: feita em 10 e 11 de outubro de 2026, com uma pendência

O recorte foi decidido pelo responsável pelo projeto em 10 de outubro de 2026: temas Economia e Segurança pública; a sala Histórico como sala de investigação, e não como tema; período de 1º de janeiro de 2023 à data de corte; Flávio Bolsonaro pelas manifestações individuais documentadas no Senado, Lula pelos atos presidenciais com atribuição e alcance documentados; até doze decisões no total, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem igualar quantidades à força. A seleção, os excluídos e as lacunas estão em [../research/selecao-decisoes-2026-10.md](../research/selecao-decisoes-2026-10.md).

- [x] Recorte documental decidido e publicado como amostra: seis votos nominais no Plenário do Senado (importados do webservice, com as capturas em `research/capturas/`) e seis atos do presidente da República lidos no Portal da Legislação, com as mensagens de veto e os dispositivos; quatro proposições com decisão dos dois (D-128).
- [x] `casa` nos doze mandatos de casas e órgãos; temas classificados pela ementa, com a justificativa em cada registro; a Constituinte continua instituição própria, não declarada no mandato de deputado federal (ambiguidade anotada).
- [x] Cartões tipados de voto e ato (`DecisionCard`) e comparação por tema (`DecisionsByTheme`) na página da pessoa (`/politicos/<slug>/#decisoes`) e na comparação, com cargo, instituição, data, objeto, manifestação ou tipo do ato, fontes e revisão, e o aviso de amostra.
- [x] Tarefa de decisão em duas etapas, a evidência e a interpretação (D-126), integrada à coleta e à saída; na trajetória, a decisão ligada a um acontecimento (o decreto da intervenção, o voto nas saídas temporárias); nas salas temáticas, as decisões do tema.
- [x] Progresso preservado: formato 4, com a etapa de evidência; a assinatura reabre só as tarefas que mudaram (Lula 5 e Flávio 4 viraram decisão; Flávio 5 virou lugar). Desde 11 de outubro de 2026, formato 5: a assinatura cobre também os dados que decidem a resposta, e reabrir um capítulo não apaga os seguintes (D-130).
- [x] `RoomId` separado de `SceneId` (D-125): Histórico, Economia e Segurança pública, com progressão própria e rotas próprias.
- [x] Escrivão (D-127): nome visível em toda a interface, catálogo validado por teste, seletor puro com controle de repetição, reserva por evento, preferência de humor guardada no navegador, falas de entrada, ajuda, descoberta, fonte, erro e conclusão nas três salas.
- [x] Fluxo completo na exportação estática: testes de exportação e jornadas sobre o build (`tests/export/jogo.spec.ts`, `tests/e2e/jogo.spec.ts`, seção "Escrivão e salas temáticas").
- [ ] Celular real: pendente. O roteiro curto para a validação está em [USER-VALIDATION.md](USER-VALIDATION.md), seção Salas e decisões.

### Auditoria de QA de 11 de outubro de 2026: o que mudou na P1

A auditoria externa de prontidão para produção, sobre o commit da P1, pediu correções de código e de testes. Feitas em 11 de outubro de 2026; os resultados estão em [STATUS.md](STATUS.md), e as decisões, em [DECISIONS.md](DECISIONS.md), D-129 a D-132.

- [x] Catálogo de fontes e contagem de citações da metodologia com todas as coleções factuais, pela lista do domínio (as 18 fontes das decisões tinham ficado de fora).
- [x] As três jornadas que reprovaram na verificação contínua: a do catálogo, por esse defeito; a da comparação e a da página da pessoa, que mediam a página inteira e passaram a conferir o texto que a tela escreve e a área de trabalho, com a seção de decisões alcançada pela âncora, pela rolagem e pelo teclado.
- [x] Desligar o humor tira na hora a camada de humor das falas que já estavam na tela, em todas as telas.
- [x] As falas guardadas pertencem ao registro ou ao capítulo de que foram ditas: a releitura não traz fala, e a transição de um capítulo revisto não mostra a conclusão de outro.
- [x] Contexto sensível sem humor, por registro e por capítulo, com a mesma regra para os dois (D-129).
- [x] Progresso no formato 5: a resposta pertence aos dados que a decidem, e uma correção reabre só a resposta afetada (D-130).
- [x] Capturas com o corpo original e conferência que reprova o que foi alterado e o que não pode ser conferido (D-131).
- [x] Cartão de decisão: a divergência da votação 6714 à vista, o texto de referência declarado como não ligado, a lista longa de dispositivos dobrada, a hierarquia dos títulos (D-132).
- [x] Passagem de acessibilidade com as salas e os passos da missão; histórico de falas com limite.
- [ ] Revisão humana, texto de referência das votações, atas, aprovação do tom do Escrivão, celular real, leitor de tela, domínio, canal de correção e licença: de uma pessoa, pendentes ([GAME-RELEASE.md](GAME-RELEASE.md), seção Pendências humanas).
- [ ] Planos de governo registrados no TSE: fora desta entrega. O atlas não tem esse módulo, e nenhuma tela o anuncia; se for requisito do lançamento, é conteúdo novo, separado das proposições legislativas, com decisão do responsável pelo projeto.

### P2, ampliação: depois de validar a experiência

- [ ] Mais temas e acervo, pelo mesmo método; autoria e relatoria como entidades; novas artes e falas; medir repetição das falas e dificuldade; banco só quando edição e volume justificarem.

## Verificações que protegem a proposta

| Caso | Onde é conferido |
| --- | --- |
| A API não retorna a pessoa | `tests/import-decisoes.test.ts`: sem linha, sem voto, e a cobertura anota a lacuna |
| Fonte registra licença ou ausência | `registroDoVoto`: ausência documentada com o motivo da lista oficial |
| Orientação de partido sem voto individual | O adaptador não lê orientações; a política proíbe atribuí-las |
| Voto em requerimento de urgência | O objeto é `requerimento`, e "FAVOR" é a favor dele |
| Votação fora do mandato ou em outra casa | `tests/decisions.test.ts`: `fora-do-mandato`, `casa-diferente`; a consulta responde "não se aplica" |
| Veto parcial | O contrato exige os dispositivos; sem eles, o registro é recusado |
| Nova coleção sem revisão humana | `tests/decisions.test.ts`: `verify:release` recusa |
| Dados gerados antigos | O leitor recusa formato diferente de 2 |
| Definição da resposta mudou | A assinatura da tarefa (D-119) |
| Re-render, falas vistas, tema sensível, armazenamento indisponível, teclado e leitor de tela, troca entre candidatos | Entrega P1 |
