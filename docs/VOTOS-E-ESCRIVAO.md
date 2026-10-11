# Histórico de decisões e o Escrivão: plano e situação

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

### P1, primeira investigação jogável: não iniciada

- [ ] Decidir o recorte documental (quais votações e atos, com que critérios, para os dois) e publicar, após revisão, um conjunto pequeno com as lacunas descritas.
- [ ] Dar `casa` aos mandatos reais e classificar os temas das proposições (decisões editoriais).
- [ ] Cartões tipados de voto e ato, e a comparação com cargo, data, objeto, ação e evidência, nas páginas do atlas.
- [ ] Missão curta de interpretar a decisão (objeto votado, manifestação, ausência contra lacuna, veto parcial), integrada à coleta e à saída.
- [ ] Preservar o progresso; invalidar só confirmações incompatíveis com a nova definição (a assinatura da tarefa já faz isso).
- [ ] `RoomId` sem reaproveitar `SceneId` como classificação política.
- [ ] Escrivão: nome visível, catálogo validado, seletor puro, fallback e preferências; falas de entrada, ajuda, fonte e conclusão em Histórico, Economia e Segurança.
- [ ] Fluxo completo na exportação estática e em celular real.

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
