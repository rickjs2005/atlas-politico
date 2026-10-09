# Status

Atualizado em 8 de outubro de 2026.

| Fase do plano | Situação |
| --- | --- |
| 1. Arquitetura e fundação | Concluída em 08/10/2026 |
| 2. Pesquisa e primeiro conjunto de conteúdo | Concluída em 08/10/2026, com revisão assistida por IA e pendências listadas abaixo |
| 3. Camada de dados e preparação do backend | Concluída em 08/10/2026 |
| 4 a 10 | Não iniciadas |

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
- **A interface continua estrutural.** As páginas de perfil e de acontecimento são as da fase 2, lendo agora os dados gerados.
- **O site continua com `noindex`** e não foi publicado.

## Preparação para a fase 4 (experiência e direção visual)

O critério da fase 4 é o fluxo "funcionar com o conteúdo real preparado". O que ela encontra pronto:

- **Conteúdo real em formato de consumo:** `generated/dados/`, com tudo o que uma tela precisa em um objeto só (`AtlasData`).
- **Uma tela para ver os dados reais em uso:** `/dev/dados/`, com lista, mapa e painel sobre os 39 acontecimentos. Serve de referência do que os dados permitem, e não de desenho.
- **Números para dimensionar o desenho** (DATA-REPORT.md): 39 acontecimentos em 51 anos; de 1 a 12 por década e por pessoa; 27 pontos, 9 dos quais em Brasília e 7 no ponto do estado do Rio de Janeiro; 13 acontecimentos sem ponto.
- **Consultas prontas** para cada parte da jornada: perfis, recorte por pessoa, período e categoria, mandatos e filiações no período, comparação, fontes e lugares de um acontecimento.

Estados que os dados já distinguem e que o desenho precisa prever:

| Estado | De onde vem |
| --- | --- |
| Período sem registros | `filterEvents` devolve lista vazia; a cobertura declarada diz se o período foi pesquisado |
| Acontecimento sem ponto no mapa | `localizacao.tipo` é `nacional` ou `desconhecida`; índice `semPonto` |
| Coordenada aproximada | `precisaoGeografica` em cada ponto: todos os 27 são aproximações |
| Data parcial | `data.precisao`: 10 dos 39 acontecimentos não têm o dia |
| Mandato ou filiação com período incerto | `situacao: "incerta"` nas consultas |
| Revisão humana pendente | `editorial.revisao.tipo` em todo registro |
| Vários pontos no mesmo lugar | 9 pontos em Brasília: o desenho do mapa precisa de agrupamento ou de lista por lugar |
| Trajetórias de tamanhos diferentes | 51 anos e 24 anos: a comparação não pode nivelar |
| Falha do mapa | Tratada desde a fase 1, com a lista de lugares |

O que a fase 4 decide e esta fase deixou em aberto: a ordem dos dois perfis na interface (os dados usam a ordem do `id`, que é técnica), a paleta e a tipografia, e como mostrar o que é incerto.

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

- O mapa só foi verificado em Chromium sem interface. Falta abrir `/dev/prova/` ou `/dev/dados/` em uma janela visível do Chrome.
- Firefox, Safari, celular real e leitor de tela não foram testados.
- Hospedagem real, incluindo o tipo MIME de `.mjs`, fica para a fase 10.
- `npm audit`, conferido de novo em 08/10/2026: nenhuma vulnerabilidade em produção; 5 altas na cadeia do lint, que não vai para o site.
- A próxima versão maior do Next deve ligar Cache Components para todos (DECISIONS.md, D-02).
- O plano de desenvolvimento continua fora do repositório, em `Downloads/`.

## Próximo passo

Fase 4: experiência e direção visual. A fase 3 termina aqui; a fase 4 só começa com o próximo comando.
