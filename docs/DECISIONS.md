# Decisões

Registro das decisões do projeto, com o motivo de cada uma: fase 1 (D-01 a D-21), fase 2 (D-22 a D-26), fase 3 (D-27 a D-36) e fase 4 (D-37 a D-48). Decisão nova entra no fim, com número novo. Decisão revista ganha uma linha "Revista em", sem apagar o texto original.

## D-01. Uma aplicação Next.js com exportação estática, gerenciada por npm

**Decisão.** Uma única aplicação Next.js 16.4 (App Router, React 19.3, TypeScript estrito) com `output: "export"`. Gerenciador npm, com um único `package-lock.json`.

**Motivo.** É a decisão do plano (seção 3): o visitante recebe páginas prontas, a publicação cabe em qualquer hospedagem de arquivos, e a atualização editorial é controlada. O npm é o gerenciador mais usado nos outros projetos da pasta e não exige aprovar scripts de instalação.

**Consequência.** Sem servidor em produção: nada de rotas de API, redirecionamentos, cookies ou otimização de imagem em tempo de execução. `next start` não se aplica; a pré-visualização da saída é `npm run preview`.

## D-02. `cacheComponents` desligado

**Decisão.** O `create-next-app` 16.4 gera o projeto com `cacheComponents: true` e `partialPrefetching: true`. As duas opções foram removidas.

**Motivo.** A documentação que acompanha o Next 16.4 marca `use cache` como não suportado em exportação estática (`node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`, tabela de plataformas). Com Cache Components ligado, a opção `dynamicParams` deixa de existir e o roteador passa a preservar o estado das rotas com `<Activity>`. Para um site sem servidor isso traz regras a mais e nenhum ganho.

**Consequência.** A mesma documentação avisa que as duas opções serão ligadas para todos e removidas na próxima versão maior. Uma atualização para o Next 17 exige rever este ponto. As rotas dinâmicas já chamam `notFound()` quando o parâmetro não resolve, que é o padrão exigido naquele modelo.

## D-03. Barra final nas rotas e imagens sem otimização em tempo de execução

**Decisão.** `trailingSlash: true` e `images.unoptimized: true`.

**Motivo.** Com barra final, `/comparar` vira `out/comparar/index.html`, formato que qualquer hospedagem serve sem regra de reescrita. Sem servidor não existe o otimizador de imagens do Next; as imagens serão preparadas localmente antes do build (plano, fase 8).

**Consequência.** Os endereços canônicos terminam com barra.

## D-04. Três camadas em `src/lib`, com fronteiras verificadas

**Decisão.** `src/lib/domain` (regras e contratos, sem I/O), `src/lib/content` (leitura de arquivos) e `src/lib/state` (estado da exploração). O plano previa schemas e regras de datas dentro de `src/lib/content`; eles foram para `src/lib/domain`, e `src/lib/content` ficou só com a leitura.

**Motivo.** Com pastas separadas, a regra "domínio não lê arquivo, navegador não lê conteúdo" vira regra de lint, e não só combinado. O ESLint barra as importações erradas, e `server-only` faz o build falhar se a leitura de conteúdo for parar no navegador.

**Consequência.** Componentes do navegador importam tipos por `@/lib/domain/types`. O Zod fica fora do bundle.

## D-05. Vocabulário do domínio em português, código em inglês

**Decisão.** Tipos, campos do JSON, valores de enumeração e parâmetros de URL em português (`Acontecimento`, `pessoaIds`, `em-curso`, `?de=`). Funções, componentes e arquivos em inglês (`formatDate`, `EventList`).

**Motivo.** O conteúdo é pesquisado, escrito e revisado em português, e as rotas já são em português. Os nomes das pastas previstos no plano são em inglês. Há também um ganho prático: `Acontecimento` não colide com o tipo `Event` do DOM.

## D-06. A rota de acontecimento só existe quando há conteúdo publicado

**Decisão.** A página fica em `src/app/acontecimentos/[slug]/page.published.tsx`. O `next.config.ts` só inclui a extensão `published.tsx` quando `content/published/acontecimentos.json` tem ao menos um item.

**Motivo.** Verificado no build: com `output: "export"`, o Next 16.4 interrompe o build se `generateStaticParams` de uma rota dinâmica devolve lista vazia ("at least one route must be generated"). Na fase 1 não há acontecimento publicado. As alternativas eram não criar a rota (deixando um passo manual para a fase 2) ou gerar uma página falsa de enchimento, que acabaria publicada.

**Consequência.** A rota se liga sozinha no primeiro build depois de publicado o primeiro acontecimento. Com o servidor de desenvolvimento aberto é preciso reiniciá-lo. O arquivo não usa o tipo `PageProps` do Next, que só conhece rotas ativas. O mecanismo foi verificado com um build temporário (ver STATUS.md).

**Revista na fase 3.** A condição passou a ser lida de `generated/manifest.json`, que registra quantos acontecimentos os dados gerados têm (D-28). O resto vale como está.

## D-07. Tela de prova e fixtures só em desenvolvimento

**Decisão.** A tela de prova é `src/app/dev/prova/page.dev.tsx`, e a extensão `dev.tsx` só é reconhecida no servidor de desenvolvimento. As fixtures ficam em `tests/fixtures/sintetico/`. Todo `id` de fixture começa com `sintetico-`, todo texto leva `[SINTÉTICO]` e toda URL usa o domínio reservado `exemplo.invalid`.

**Motivo.** Um arquivo que não é rota no build de produção não entra no grafo do build, e as fixtures que só ele importa também não. Isso é mais seguro do que esconder a rota em tempo de execução. As marcas tornam o dado de teste reconhecível por uma busca de texto.

**Consequência.** Três barreiras independentes: a rota não existe no build, o conjunto publicado recusa `id` sintético, e `npm run verify:export` procura as marcas em todos os arquivos de `out/`. Nenhuma fixture usa nome, cargo ou fato de pessoa real.

## D-08. Data com precisão explícita e intervalo de cálculo numérico

**Decisão.** `{ valor, precisao }`, com formato e precisão obrigados a concordar. Para ordenar e filtrar, um intervalo em número de dias (`DiaOrdinal`), que a função de apresentação não aceita.

**Motivo.** O plano pede que a precisão conhecida seja preservada e que os intervalos de cálculo não virem datas inventadas. Declarar a precisão, mesmo redundante com o formato, pega o erro de quem preenche um dia que a fonte não dá. Guardar o intervalo como número torna impossível formatá-lo por descuido.

**Consequência.** Toda data exibida passa por `formatDate`. Não se usa `Date` com texto nem `Intl`, para o resultado não depender do fuso da máquina e ser igual no build e no navegador.

## D-09. Limites de período sempre escritos

**Decisão.** Início e fim são obrigatórios e cada um é uma data, `desconhecida` ou, só no fim, `em-curso`.

**Motivo.** Campo ausente não distingue "não sabemos" de "esqueceram de preencher". O plano pede que datas desconhecidas permaneçam explicitamente desconhecidas.

## D-10. Fonte e citação são coisas diferentes

**Decisão.** A fonte é o documento (título, autoria, URL, data, acesso). A citação fica dentro de cada registro e diz qual fonte, em que trecho e o que o trecho sustenta.

**Motivo.** O plano lista "localização do trecho e descrição da evidência" como campos da fonte. Mas o mesmo documento, como um perfil institucional, sustenta vários registros com trechos diferentes. Com a evidência na fonte, seria preciso duplicar a fonte a cada uso.

**Consequência.** Todos os campos pedidos existem; a evidência mudou de lugar. A citação já é a tabela de ligação de um futuro banco.

## D-11. Coordenadas nomeadas e localização como escolha entre três casos

**Decisão.** O lugar guarda `longitude` e `latitude` em campos separados. A localização do acontecimento é `lugares`, `nacional` ou `desconhecida`.

**Motivo.** Par de números em lista convida à troca. Com campos nomeados, a ordem GeoJSON é aplicada em uma função só. A escolha entre três casos impede lista vazia de lugares: um acontecimento sem ponto no mapa sempre diz por quê.

## D-12. Estado editorial em todo registro factual

**Decisão.** Pessoa, mandato, filiação e acontecimento têm `editorial`. Registro revisado exige revisão identificada e ao menos uma citação. O conjunto publicado só aceita revisados.

**Motivo.** O plano exige o estado no acontecimento. Mas um mandato ou um resumo de perfil também são afirmações factuais e precisam da mesma garantia. O custo é um campo por registro.

## D-13. Publicar nada é um estado válido

**Decisão.** Sem `edicao.json`, `getPublishedSet()` devolve o conjunto vazio com `edicao: null`, e as páginas informam que não há edição publicada.

**Motivo.** A alternativa seria criar uma edição de enchimento, ou seja, publicar um registro que não corresponde a nenhuma revisão real.

**Revista na fase 3.** A função das páginas passou a ser `getAtlasData()`, que lê os dados gerados. Sem edição, o gerador grava o conjunto vazio com `edicao: null`, e as páginas dizem o mesmo de antes.

## D-14. As rotas de perfil vêm do escopo da edição

**Decisão.** `/politicos/lula` e `/politicos/flavio-bolsonaro` são geradas a partir de `PROFILES` (slug e nome de exibição). Todo o resto do perfil vem do conjunto publicado.

**Motivo.** Quais perfis o atlas tem é decisão de produto, tomada no plano. O que o atlas afirma sobre cada um é conteúdo e depende de revisão. Assim as páginas existem desde já, sem nenhuma afirmação não revisada.

**Consequência.** A ordem dos perfis segue a do plano. A fase 4 trata da equivalência visual entre os dois.

## D-15. Estado central com seleção sempre dentro do recorte

**Decisão.** Um reducer e seletores puros. A regra "o acontecimento selecionado pertence ao recorte visível" é aplicada a cada transição. A rota define pessoa e modo de comparação; a query string define período, categorias e acontecimento.

**Motivo.** O critério de conclusão da fase 5 é filtros, lista e painel mostrarem o mesmo recorte. Com um estado só e a regra aplicada no ponto de transição, eles não têm como divergir. Pessoa na rota dá endereços legíveis e uma página estática por perfil.

**Consequência.** Na fase 1 a tradução entre estado e URL está implementada e testada, mas ainda não ligada ao roteador (fase 5).

## D-16. MapLibre 6 com worker publicado pelo bundler e estilo local

**Decisão.** `setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href)`. Estilo montado no código: fundo, grade gerada e camadas de círculos. Sem tiles, sprites ou glyphs.

**Motivo.** O MapLibre 6 é só ESM e não embute mais o worker: ele é um arquivo à parte, que por padrão a biblioteca procura ao lado de si mesma por `http`. Dentro de um bundle esse caminho não existe. Com `new URL(..., import.meta.url)` o Turbopack copia o arquivo para `/_next/static/media/` e o mapa não depende de CDN. Camadas de texto exigem arquivos de glyphs, que são decisão da fase 6.

**Consequência.** Verificado em desenvolvimento e na saída estática. A hospedagem precisa servir `.mjs` como JavaScript (conferir na fase 10). As cores do mapa repetem os tokens CSS, porque o WebGL não lê variáveis CSS.

## D-17. Falha do mapa tratada na fronteira

**Decisão.** `MapView` troca o mapa por uma lista de lugares, com a mesma seleção, em três casos: o construtor lança (sem WebGL), o pacote do mapa não carrega, ou o mapa não termina de carregar em 15 segundos com a aba visível.

**Motivo.** O plano exige que a leitura continue quando o mapa falha. O limite de tempo só conta com a aba visível porque em segundo plano o navegador não desenha quadros: sem esse cuidado, um mapa saudável aberto em outra aba seria dado como travado. O defeito apareceu durante a verificação e foi corrigido.

**Consequência.** A simulação de falha fica na tela de prova, que bloqueia o contexto WebGL do canvas. O código do mapa não tem nenhum gancho de teste.

## D-18. Base visual com tokens CSS e fontes do sistema

**Decisão.** Variáveis CSS em `globals.css`, expostas ao Tailwind 4 por `@theme`. Pilhas de fontes do sistema. Tema claro apenas.

**Motivo.** Tipografia, paleta e identidade dos dois perfis são decisões da fase 4. `next/font/google` baixa fontes da rede no build, e a fase 1 roda só com arquivos do projeto.

## D-19. Vitest para as regras, Playwright para a tela de prova

**Decisão.** Vitest 5 para datas, schemas, integridade, leitura, estado e mapa. Playwright 1.63.0, com versão fixa, para a tela de prova em um Chromium real.

**Motivo.** As duas ferramentas são as do plano. O Playwright entrou já na fase 1 porque a verificação no navegador é um critério de conclusão e um teste automatizado pode ser repetido a cada mudança. A versão 1.63.0 usa o Chromium que já está na máquina, sem novo download.

**Consequência.** Os testes de navegador rodam contra o servidor de desenvolvimento, porque a tela de prova não existe em produção. O Chromium sem interface desenha o WebGL por software.

## D-20. TypeScript 5.9 e ESLint 9, as versões do template

**Decisão.** Manter as versões que o `create-next-app` 16.4 instala, mesmo havendo TypeScript 7 e ESLint 10 publicados. Só `@types/node` subiu de 20 para 24, por exigência do Vitest 5 e para acompanhar o Node instalado.

**Motivo.** São as versões com que `eslint-config-next` 16.4 é distribuído. Trocar o compilador e o linter por versões maiores na fundação traria risco sem benefício para a fase 1.

## D-21. Indexação bloqueada até a publicação

**Decisão.** `robots: { index: false, follow: false }` no layout.

**Motivo.** O site ainda não tem conteúdo revisado. Metadados, sitemap e endereço canônico são da fase 10.

**Consequência.** Remover na fase 10. Está listado em STATUS.md.

## D-22. O tipo de revisão é um campo obrigatório

**Decisão (fase 2).** `revisao.tipo` passou a ser obrigatório, com dois valores: `assistida-por-ia` e `humana`. Vale para a revisão de cada registro e para a da edição.

**Motivo.** O primeiro conjunto foi conferido contra as fontes por um modelo de IA. Sem um campo próprio, essa conferência ficaria registrada com as mesmas palavras de uma revisão feita por uma pessoa. A fase 2 exige que revisão humana só seja registrada quando de fato ocorrer.

**Consequência.** O site mostra "Revisão humana pendente" nos registros e no aviso de edição. Um teste falha se algum registro do conjunto publicado aparecer como revisão humana antes de ela existir; ele deve ser ajustado na primeira revisão humana. A regra de publicação não mudou: entra o que está `revisado`, de qualquer tipo. Exigir revisão humana para o lançamento é decisão da fase 9.

## D-23. Rascunhos são uma coleção parcial de acontecimentos

**Decisão (fase 2).** `content/drafts/` guarda só `acontecimentos.json`. Os rascunhos citam pessoas, lugares e fontes que já estão no conjunto publicado.

**Motivo.** Duplicar pessoas, lugares e fontes em duas pastas criaria duas versões do mesmo cadastro. Os registros de referência não fazem afirmações que dependam de revisão própria.

**Consequência.** Rascunho não pode ser validado sozinho. O teste "content/drafts do repositório" valida os rascunhos junto com o conjunto publicado e exige que todo rascunho diga o que falta. `verify:export` confere que nenhum rascunho virou página. O comando que promove um rascunho é trabalho da fase 3.

**Revista na fase 3.** `content/drafts/` passou a aceitar as sete coleções (D-31), e a validação conjunta das duas pastas saiu dos testes e foi para o pipeline. O comando de promoção não foi feito (D-36).

## D-24. Fichas do TSE: endereço público cadastrado, leitura pelo serviço REST

**Decisão (fase 2).** As candidaturas de 2006 em diante foram lidas no serviço REST do DivulgaCandContas. O endereço cadastrado em cada fonte é o da ficha pública equivalente, que o próprio serviço informa. As de 1994, 1998 e 2002 vieram dos arquivos `consulta_cand` do repositório de dados eleitorais.

**Motivo.** O serviço devolve os dados em formato que permite conferir campo a campo. A ficha pública é o endereço que um leitor consegue abrir.

**Consequência.** A citação indica o campo ou a linha consultada. Eleições anteriores a 1994 não têm arquivo no repositório consultado e ficaram com precisão de ano.

## D-25. Lugares pelo centroide do IBGE

**Decisão (fase 2).** Todas as coordenadas vêm do campo `centroide` da API de malhas geográficas do IBGE, para municípios e para unidades da federação. Decisão de tribunal usa o município-sede quando ele aparece no documento lido.

**Motivo.** É uma fonte oficial, consultável por código do município, sem depender de base de terceiros. O centroide é o centro do polígono, e não a sede urbana.

**Consequência.** Todo lugar tem precisão `municipio` ou `uf` e aparece como aproximação. Em municípios extensos, o ponto pode ficar longe do centro urbano. A fase 6 decide se usa outra base para a escala de cidade.

## D-26. Trechos de evidência guardados fora do conteúdo

**Decisão (fase 2).** A lista dos trechos literais que sustentam cada citação fica em `docs/evidencias/provas-2026-10-08.json`, e não dentro dos registros.

**Motivo.** O contrato de conteúdo já tem `localizacao` e `evidencia` em cada citação. Os trechos literais servem à conferência, e não à leitura no site, e incluem citações curtas de reportagens.

**Consequência.** A conferência desta fase usou scripts temporários e cópias locais dos documentos, que não estão no repositório. Tornar isso um comando é item da fase 3.

**Revista na fase 3.** O comando não foi feito (D-36). O relatório de dados passou a ler este arquivo, só para informar quantas citações têm trecho registrado.

## D-27. Os scripts rodam o TypeScript do projeto direto no Node

**Decisão (fase 3).** Os comandos de dados são `node --import ./scripts/register.mjs scripts/data.mts <comando>`. O Node remove os tipos sozinho. `scripts/register.mjs` é um gancho de resolução de 50 linhas que ensina ao Node o alias `@/` e o import relativo sem extensão, só para arquivos do projeto. `tsconfig.json` ganhou `erasableSyntaxOnly`, e `engines` passou a exigir Node 22.18.

**Motivo.** Os scripts precisam dos mesmos schemas e das mesmas regras que o build usa; duplicá-los em JavaScript criaria duas versões do contrato. As alternativas eram acrescentar uma dependência só para executar TypeScript (`tsx`) ou rodar os scripts por dentro do Vitest. O Node 24 instalado já executa TypeScript, e o que faltava era pequeno.

**Consequência.** O código que os scripts carregam só pode usar sintaxe que some ao remover os tipos: sem `enum`, sem `namespace`, sem propriedade declarada no construtor. O compilador barra isso. Tipos são importados com `import type` ou com `type` na lista. `tests/cli.test.ts` roda os comandos de verdade, fora do Vitest, e falha se algum módulo deixar de carregar assim.

## D-28. Dados gerados em pasta própria, fora do Git

**Decisão (fase 3).** `npm run data:build` grava em `generated/`. As páginas leem só `generated/dados/`. A pasta é ignorada pelo Git e recriada a cada `npm run build` e `npm run dev`.

**Motivo.** O plano pede pasta exclusiva para o que é gerado e que os arquivos editoriais sejam preservados. Versionar a saída criaria uma segunda cópia do conteúdo, que poderia ficar para trás; ignorá-la, com a geração embutida nos comandos, não tem esse risco. O plano reservava `public/geo/` para arquivos do mapa, mas tudo em `public/` é copiado para o site: gerar ali exporia os arquivos por endereço próprio antes de alguém decidir isso.

**Consequência.** Os dados chegam ao navegador pelas páginas, por props. A fase 6 manteve assim: o mapa recebe os pontos já recortados e não busca o GeoJSON por endereço (D-58). `content/published/` continua sendo conteúdo editado à mão; o "conjunto publicado" que as páginas leem passou a ser o gerado.

## D-29. Elegibilidade: pasta e estado; dependência quebrada é erro

**Decisão (fase 3).** Entra na publicação o registro que está em `content/published/`, tem estado `revisado` com revisão identificada e ao menos uma citação completa, respeita o contrato e só cita o que também entra. Lugar, fonte e imagem entram quando estão em `content/published/` e são usados por um registro elegível. Quem não foi revisado fica fora, com pendência. Quem foi revisado e não pode ser publicado é erro.

**Motivo.** O estado sozinho não basta: lugar, fonte e imagem não têm estado, e a pasta é o que diz se o cadastro já foi levado à edição. A pasta sozinha também não: o estado é o registro de que houve conferência. Tratar como erro o revisado com dependência quebrada evita que mudar o estado de uma pessoa apague do site, sem aviso, todos os acontecimentos dela.

**Consequência.** Antes desta fase, um registro não revisado em `content/published/` interrompia o build. Agora ele fica fora e aparece no relatório, o que permite tirar um registro do ar trocando o estado. Uma fonte cadastrada só para um rascunho não aparece nos dados públicos.

## D-30. Três severidades e o contrato valendo também para rascunhos

**Decisão (fase 3).** Diagnósticos são `erro` (impede a geração), `pendencia` (o registro fica fora) ou `aviso` (a conferir). Registro fora do contrato é erro em qualquer pasta. Problema entre registros é erro quando atinge a publicação e pendência quando atinge só um rascunho. As mensagens mais comuns do Zod foram reescritas em português direto ("Campo obrigatório ausente", "Campo desconhecido").

**Motivo.** O plano pede que erro impeditivo e pendência de pesquisa sejam distinguidos, e que as incompletudes permitidas em rascunho sejam relatadas sem entrar na publicação. O ponto em aberto da fase 1, um esquema mais tolerante para rascunhos, foi resolvido sem um segundo esquema: o que um rascunho pode ter de incompleto são as fontes e as referências, e isso já cabe no contrato. Um rascunho com data impossível ou campo com nome errado não é incompleto, é inválido.

**Consequência.** Um erro de digitação em um rascunho interrompe a geração até ser corrigido. Em troca, existe um contrato só, e tudo o que está em `content/` pode ser lido por qualquer ferramenta.

## D-31. Rascunhos aceitam qualquer coleção; importações têm registro próprio

**Decisão (fase 3).** `content/drafts/` passa a aceitar as sete coleções, e não só `acontecimentos.json`, mais `importacoes.json`. Revê a D-23.

**Motivo.** A importação não pode escrever em `content/published/`. Um pacote que traga um acontecimento e a fonte que ele cita precisa de um lugar para a fonte.

**Consequência.** Lugar, fonte e imagem em `content/drafts/` ficam fora da publicação por estarem ali. Um registro revisado que cite um deles é erro. A promoção de um rascunho leva junto os cadastros que só ele usa.

## D-32. Saída reproduzível

**Decisão (fase 3).** Os arquivos de `generated/dados/` e o manifesto são escritos com as chaves em ordem alfabética, as listas em ordem definida e sem horário. Texto é comparado pelo código dos caracteres. Horário e duração ficam em `generated/relatorio/execucao.json`. A impressão digital da entrada é calculada sobre o JSON interpretado e sobre o resumo dos arquivos de imagem.

**Motivo.** O plano pede que a mesma entrada produza os mesmos dados. `localeCompare` depende do idioma e da versão do ICU da máquina. Calcular a impressão digital sobre os bytes faria o mesmo conteúdo parecer diferente em máquinas com fim de linha diferente.

**Consequência.** A geração repetida não regrava arquivo nenhum de dados. Reordenar registros dentro de um arquivo de conteúdo muda a impressão digital, mas não muda os dados.

## D-33. O build recusa dados de outra versão; o desenvolvimento regenera

**Decisão (fase 3).** `getAtlasData()` recalcula a impressão digital do conteúdo e a compara com a do manifesto, e confere o resumo de cada arquivo lido. Em produção, qualquer diferença interrompe o build. No servidor de desenvolvimento, regenera na hora.

**Motivo.** `npm run build` gera os dados antes, mas `next build` pode ser chamado direto. Sem a conferência, um build assim publicaria os dados da última geração bem-sucedida, em silêncio. Foi verificado quebrando o conteúdo de propósito: `npm run build` para em `data:build`, e `next build` direto para com a mensagem de dados de outra versão.

**Consequência.** O build lê `content/` para conferir, e `generated/` para usar. Quando a geração falha, a saída anterior fica intacta no disco e inutilizável para o build.

## D-34. GeoJSON: um ponto por acontecimento e lugar, com `eventId` e `placeId`

**Decisão (fase 3).** Cada ponto tem `id` igual a `eventId@placeId` e leva os dois identificadores nas propriedades, com esses nomes. As demais propriedades repetem os nomes do conteúdo. São gerados uma coleção geral e uma por pessoa. Só há pontos.

**Motivo.** `eventId` e `placeId` são os nomes pedidos no plano para os identificadores do ponto; os outros campos seguem a D-05. A coleção por pessoa serve à página de perfil sem filtro. Linhas entre pontos seriam um trajeto que nenhuma fonte documenta.

**Consequência.** `buildEventFeatures`, da fase 1, deu lugar a `buildEventPoints` em `src/lib/data/points.ts`, usado pelo gerador. O navegador só recorta a coleção pronta (`filterPoints`).

## D-35. Consultas puras, com período incerto dito como incerto

**Decisão (fase 3).** As consultas ficam em `src/lib/data/`, sem `node:*`, sem Zod e sem React. Os seletores de estado passaram a usá-las. Mandatos e filiações consultados por período voltam com `situacao`: `documentada` ou `incerta`.

**Motivo.** O plano pede que limites calculados para consulta não apareçam como datas confirmadas. Cinco das oito filiações da edição têm algum limite desconhecido. Tratar "desconhecido" como "desde sempre" faria uma filiação sem data aparecer em qualquer ano como fato.

**Consequência.** A interface das fases 5 e 7 precisa mostrar a diferença. Buscas por chave usam `Object.hasOwn`, porque `constructor` é um `id` válido no contrato.

## D-36. O que ficou fora desta fase

**Decisão (fase 3).** Não foram feitos o comando de promoção de rascunhos, o verificador de evidências como comando, coletores de sites e modo de observação de arquivos.

**Motivo.** O pedido da fase é um pipeline proporcional ao MVP. Com cinco rascunhos, promover é mover um registro entre dois arquivos, e a validação pega o erro. O verificador de evidências baixa páginas externas, e o build não pode depender disso. Em desenvolvimento, o leitor já regenera os dados ao recarregar a página.

**Consequência.** A conferência de trechos continua sendo a fotografia de 8 de outubro de 2026 em `docs/evidencias/`. O relatório informa quantas citações de registros elegíveis têm trecho registrado ali.

## D-37. Direção visual: atlas editorial em tons de papel

**Decisão (fase 4).** Uma direção só: superfícies em tons de papel, texto em grafite, hierarquia por tipografia, alinhamento e linhas finas. O mapa ocupa a coluna central da exploração, as datas abrem cada item em destaque e o painel de leitura tem ordem fixa. Os tokens ficam em `src/app/globals.css` e são a única origem das cores.

**Motivo.** O plano pede um atlas editorial com paleta contida. Papel e tinta resolvem a hierarquia sem cor, e deixam a cor livre para duas funções: seleção e categoria. Entre grafite e papel, o papel foi escolhido porque os retratos e o mapa precisam de um fundo claro para serem tratados do mesmo jeito.

**Consequência.** Os nomes de cor da fase 1 (`surface`, `mark`, `notice-ink`) deixaram de existir. Detalhes em DESIGN-SYSTEM.md.

## D-38. Os perfis aparecem em ordem alfabética

**Decisão (fase 4).** `PROFILES` passou a listar Flávio Bolsonaro e Lula, nessa ordem, e essa é a ordem do menu, da entrada, da comparação e da página 404.

**Motivo.** A fase 3 deixou em aberto a ordem dos perfis na interface. Qualquer outra regra (cargo atual, tempo de trajetória, quantidade de registros) seria uma escolha editorial sobre quem vem primeiro. A ordem alfabética é a mesma regra dos textos (EDITORIAL.md).

**Consequência.** Um teste confere a ordem. Um terceiro perfil entra na posição que o nome pedir.

## D-39. Um acento, laranja queimado, só para seleção; categoria com forma, cor e nome

**Decisão (fase 4).** O acento (`#b24a00`) marca só o que está selecionado. Cada categoria tem uma forma (quadrado, círculo, losango, triângulo, cruz), uma cor escura e pouco saturada, e o nome escrito. Não há cor por pessoa nem por partido.

**Motivo.** O acento é a cor mais visível da interface. A primeira versão desta fase usava um vermelho terroso; em um atlas sobre Lula e Flávio Bolsonaro, vermelho vivo, azul vivo e o par verde e amarelo lembram identidades partidárias, e a troca foi feita antes da entrega. Forma e nome nas categorias atendem a quem não distingue as cores.

**Consequência.** As cores do mapa repetem os tokens em `src/features/map/palette.ts`, porque o WebGL não lê variáveis CSS; `tests/design.test.ts` falha se os dois lados divergirem e confere o contraste mínimo de cada par em uso. Desde a fase 6, só a base do mapa repete tokens, e o marcador leva a forma da categoria (D-59).

## D-40. Um tema só, claro

**Decisão (fase 4).** Não há tema escuro nesta edição.

**Motivo.** Os retratos são mesclados ao papel por multiplicação, o que só funciona sobre fundo claro, e os pares de contraste foram medidos nesta combinação. Um segundo tema dobraria a conferência visual sem mudar o que o atlas informa.

**Consequência.** O ponto em aberto "tema escuro", da fase 1, fica encerrado para esta edição. Reabrir pede outro tratamento dos retratos e outra medição de contraste.

## D-41. Newsreader e Libre Franklin, em arquivos locais

**Decisão (fase 4).** Duas famílias variáveis, em `src/app/fonts/`, carregadas por `next/font/local`: Newsreader para títulos e leitura, Libre Franklin para interface e números. Só o subconjunto latino.

**Motivo.** O plano pede tipografia expressiva nos títulos, texto confortável e números claros. As duas têm licença OFL 1.1, que permite redistribuir os arquivos. Servir do próprio site mantém a regra de não pedir nada a terceiros e evita depender de um servidor de fontes no build.

**Consequência.** Três arquivos, cerca de 310 KB no total. A serifada não é pré-carregada e entra com um substituto de medidas ajustadas; afinar o carregamento é da fase 8.

## D-42. Retratos em tons de cinza, na mesma moldura

**Decisão (fase 4).** Os dois retratos oficiais são exibidos em tons de cinza, mesclados ao papel, recortados pelo topo em uma moldura 4:5 (ou quadrada, nas miniaturas). O crédito diz o tratamento: "Exibida em tons de cinza e recortada". Sem arquivo, a moldura mostra as iniciais.

**Motivo.** As duas fotos têm cores e fundos muito diferentes: uma com a bandeira do estado ao fundo, outra com a faixa presidencial. Em cores, uma pesa mais que a outra na página.

**Consequência.** Os arquivos em `public/media/retratos/` não foram alterados: o tratamento é de CSS, na exibição. A licença do retrato de Lula (CC BY 2.0) permite adaptação com atribuição e indicação da mudança. A condição registrada para o retrato de Flávio Bolsonaro é "uso livre com crédito", da Agência Senado, sem cláusula escrita sobre adaptação: a exibição em cinza e recortada fica como ponto a confirmar pelo responsável pelo projeto. Se a resposta for não, basta tirar três classes de `Portrait.tsx`, e os dois retratos voltam a aparecer em cores. Preparar versões menores e em outro formato é da fase 8.

## D-43. Base provisória do mapa: Natural Earth 1:50m

*Substituída pela D-58 na fase 6.*

**Decisão (fase 4).** A terra, as fronteiras e as divisas dos estados vêm de dois arquivos GeoJSON derivados do Natural Earth 1:50m, recortados para a América do Sul e guardados em `src/features/map/base/`. O Brasil aparece em tom mais claro. Não há rótulos.

**Motivo.** A base da fase 1 era só uma grade de meridianos e paralelos, e os pontos ficavam sem referência. O Natural Earth é de domínio público e cabe em 249 KB, o que permite continuar sem tiles e sem pedir nada a terceiros. Rótulos exigem arquivos de glyphs, que são decisão da fase 6.

**Consequência.** O zoom ao selecionar é contido (até 4,5), porque de perto um contorno sem nomes deixa de situar o ponto. `buildBaseStyle(base)` isola a base: a fase 6 pode trocá-la sem mexer em quem usa o mapa.

## D-44. A prévia são as rotas reais, mais um guia de estados só em desenvolvimento

**Decisão (fase 4).** As quatro telas foram construídas nas rotas do atlas (`/`, `/politicos/<slug>/`, `/acontecimentos/<slug>/`, `/comparar/`), com os dados gerados. Os estados que o conteúdo atual não produz ficam em `/dev/previa/`, que usa a extensão `.dev.tsx` e não entra no build.

**Motivo.** O critério do plano é o fluxo funcionar com o conteúdo real. Uma prévia em rotas à parte teria de ser refeita na fase 5. O guia separado evita inventar dados no conteúdo só para mostrar um estado.

**Consequência.** As páginas de perfil e de acontecimento da fase 2 foram substituídas. As telas de prova das fases 1 e 3 (`/dev/prova/`, `/dev/dados/`) continuam, com as classes novas.

## D-45. Uma estrutura de página para as três larguras; em tela estreita, uma vista por vez

**Decisão (fase 4).** A exploração tem um HTML só. Dois atributos calculados (`data-pane` e `data-side`) e o CSS decidem o que aparece: uma vista por vez até 767 px, duas colunas até 1279 px e três colunas a partir daí. Em tela estreita e média, a leitura substitui a lista em vez de abrir por cima dela.

**Motivo.** Um painel sobreposto em celular esconde o que o originou e precisa de armadilha de foco, fundo escurecido e gesto de fechar. Trocar a vista mantém a ordem do documento, o foco e a rolagem previsíveis. Um HTML só evita montar o mapa duas vezes.

**Consequência.** O mapa só é montado quando sua moldura aparece na tela: quem fica na lista, em celular, não baixa o pacote do mapa. Na vista do mapa em celular, a seleção mostra um cartão sobre o mapa em vez de trocar de vista.

## D-46. O endereço é lido na chegada; a escrita fica para a fase 5

*Substituída pela D-49 na fase 5.*

**Decisão (fase 4).** A exploração lê a query string uma vez, ao carregar, e restaura período, categorias e acontecimento. Filtrar ou selecionar não altera o endereço. A página do acontecimento volta para a exploração com `?acontecimento=<slug>`.

**Motivo.** O retorno com a seleção é parte do fluxo pedido nesta fase. Escrever no endereço e responder ao histórico é a ligação que o plano coloca na fase 5, e fazê-la pela metade criaria dois comportamentos para voltar.

**Consequência.** A leitura usa `useSyncExternalStore`, porque a página é gerada no build sem query string. Um parâmetro inválido é descartado sozinho.

## D-47. A comparação não soma, não ordena e diz o que não foi pesquisado

**Decisão (fase 4).** As duas trajetórias aparecem sobre o mesmo eixo, com a mesma altura mínima. O trecho anterior à cobertura de uma pessoa é hachurado e escrito como "fora da cobertura desta edição"; as lacunas dentro da cobertura, como "sem registros". Toda quantidade é dita como "registros do atlas". O período da tela é estado local.

**Motivo.** A cobertura de uma trajetória começa em 1975 e a da outra em 2002. Sem dizer isso, a tela sugeriria 27 anos sem atividade. O plano proíbe nota ou conclusão de desempenho pelo volume de registros.

**Consequência.** `src/lib/data/coverage.ts` reúne cobertura e lacunas, usadas pela interface e pelo relatório de dados. Ligar a comparação ao estado central e ao endereço é da fase 7.

## D-48. O que ficou fora desta fase

**Decisão (fase 4).** Não foram feitos: escrita do estado no endereço e histórico, período por arraste, zoom ou agrupamento na linha do tempo, agrupamento de pontos sobrepostos, formas de categoria e rótulos no mapa, pontos focáveis pelo teclado, filtro de categoria na comparação, tema escuro e versões otimizadas das imagens.

**Motivo.** O pedido da fase é a experiência e a direção visual, com uma prévia navegável. Cada item acima pertence a uma fase posterior do plano (5, 6, 7 ou 8) e tem contrato escrito em INTERACTIONS.md.

**Consequência.** A prévia funciona com os dados reais nos fluxos principais; o que é demonstração está listado, item por item.

## D-49. O endereço é a fonte do estado da exploração

**Decisão (fase 5).** Na exploração, período, categorias e acontecimento aberto não ficam em um estado React: são derivados da query string a cada renderização, por uma função pura (`stateFromSearch`). Uma ação calcula o próximo estado e escreve o endereço que o representa, com `window.history.pushState` ou `replaceState`. Voltar, avançar, recarregar e abrir um link direto passam pelo mesmo caminho. O provider anterior, com o estado em memória, continua existindo para as telas de prova.

**Motivo.** Manter duas cópias, uma no estado e outra no endereço, exige dois efeitos de sincronização e uma regra para decidir quem vence quando os dois mudam. Com uma cópia só não existe ciclo de atualização a evitar. A alternativa do Next, `useSearchParams`, tira da pré-renderização tudo o que estiver até o `Suspense` mais próximo: a lista de acontecimentos deixaria de vir no HTML gerado. A documentação do Next 16.4 descreve a History API nativa como integrada ao roteador.

**Consequência.** O HTML do build continua trazendo a exploração inteira, no estado inicial, e o endereço é lido depois da hidratação, com `useSyncExternalStore`. `useSearchParams` aparece uma vez, em um componente sem saída visual (`RouterWatcher`), para perceber as navegações do roteador que não disparam `popstate`; um teste falha sem ele. Quem chega por um link com consulta vê o estado inicial até o JavaScript carregar. Substitui a D-46.

## D-50. Histórico: escolha cria entrada, ajuste contínuo não

**Decisão (fase 5).** Selecionar ou fechar um acontecimento, marcar uma categoria e limpar filtros criam uma entrada no histórico. O arraste no eixo não altera o estado enquanto dura e cria uma entrada ao soltar. Mudanças seguidas do período, com menos de um segundo entre elas, substituem a entrada. A correção de um endereço fora da forma canônica sempre substitui.

**Motivo.** O botão voltar deve desfazer a última escolha, e não dezenas de posições intermediárias. Um campo de ano percorrido com as setas do teclado dispara uma mudança por ano. A regra escrita na fase 1 ("substituir durante o arraste e criar ao soltar") apagaria a entrada anterior ao arraste: a primeira substituição cairia sobre ela.

**Consequência.** A regra é uma função pura, `chooseHistoryMode`, testada com tempos simulados. Voltar ou avançar encerra a sequência: o ajuste seguinte cria uma entrada. Fechar a leitura cria uma entrada em vez de voltar no histórico, e por isso abrir e fechar vários acontecimentos alonga o caminho de volta.

## D-51. Período dentro da cobertura; um lado no limite fica aberto

**Decisão (fase 5).** Os anos que podem ser consultados são a cobertura da edição para a pessoa. Um lado do período igual ao limite da cobertura, ou além dele, fica aberto (`null`). Um período inteiro fora da cobertura é descartado. Vale para os campos, para o eixo e para o endereço.

**Motivo.** Sem isso, o mesmo recorte teria duas formas de escrever ("1975 a 2010" e "até 2010"), e o botão de desfazer apareceria para um período que já é o inteiro. Um período fora da cobertura não tem o que mostrar nem como aparecer nos campos.

**Consequência.** Um lado aberto acompanha a edição: "desde 2019" passará a incluir os anos que uma edição nova cobrir. Um endereço com período fora da cobertura abre com todo o período e é reescrito.

## D-52. A troca de pessoa leva o recorte

**Decisão (fase 5).** O link para o outro perfil, dentro da exploração, leva as categorias e o período, este ajustado à cobertura do outro perfil. O acontecimento aberto só segue quando também é da outra pessoa. Os links do menu levam ao perfil sem recorte.

**Motivo.** Quem consulta 2019 a 2022 em uma trajetória e troca de pessoa quer, na maioria das vezes, ver o mesmo intervalo na outra. Levar um acontecimento que não é do outro perfil abriria um painel incompatível.

**Consequência.** A página do perfil informa ao navegador, de cada perfil, o `id` e os anos cobertos. O link não é pré-carregado, porque o endereço muda a cada filtro. A troca aparece igual nos dois perfis, com os nomes em ordem alfabética.

## D-53. Linha do tempo de eixo fixo, com fileiras medidas; sem zoom nem agrupamento

**Decisão (fase 5).** O eixo cobre sempre a cobertura inteira. Marcas próximas sobem de fileira, e o espaço que cada uma reserva é calculado com a largura real do eixo, medida no navegador. O período pode ser escolhido no eixo, com clique (um ano) ou arraste (um intervalo). Não há zoom nem agrupamento de marcas.

**Motivo.** A fase 4 deixou em aberto como tratar anos cheios. Com no máximo três registros no mesmo ano e vinte por trajetória, as fileiras resolvem sem esconder nenhum registro atrás de um número. Um eixo que muda de escala com o filtro tiraria a referência de onde o período fica na trajetória. Com a largura fixa de antes, as áreas de clique das marcas se cobriam em colunas estreitas.

**Consequência.** A quantidade de fileiras muda com a largura, e a linha do tempo pode crescer uma ou duas fileiras logo depois de carregar. A hachura do período passa por baixo das marcas. Reabrir a decisão faz sentido se uma edição futura passar de algumas dezenas de registros por trajetória.

## D-54. A lista diz o que a ordem não diz

**Decisão (fase 5).** A lista cronológica mantém a ordem da camada de dados e acrescenta três avisos: a data parcial diz o que falta ("só o ano", "sem o dia"); o registro cuja posição as datas não decidem diz "ordem dentro de (ano) não documentada"; e cada período de quatro anos ou mais sem registro vira uma linha hachurada, no lugar dos anos.

**Motivo.** Uma lista sempre põe um item antes do outro. Um registro só com o ano abre o ano por regra de ordenação, e na edição 0.1.0 isso põe um acontecimento de 1980 antes de outro que as fontes datam de fevereiro do mesmo ano, sem que a ordem entre os dois esteja documentada. Sem as lacunas, 1980 e 1986 aparecem vizinhos, como se nada faltasse entre eles.

**Consequência.** As lacunas são do conjunto inteiro da pessoa, e não do filtro: marcar uma categoria não cria lacunas. A lista passou a ter itens que não são acontecimentos, e os testes contam os acontecimentos por atributo.

## D-55. Cargos e partidos do período em bloco recolhido, com a presença incerta à parte

**Decisão (fase 5).** Acima da lista há um bloco que abre e fecha, com os cargos e os partidos que tocam o período consultado. O que as datas provam fica em uma lista; o que tem início ou fim desconhecido, e pode ou não tocar o período, fica em outra, com borda tracejada. O bloco começa recolhido, com o resumo à vista.

**Motivo.** O plano pede os cargos e as filiações documentados para o período, e as faixas sob o eixo não aparecem em tela estreita nem dizem as datas. Aberto por padrão, o bloco empurrava os acontecimentos para fora da tela nos períodos longos: 13 registros antes do primeiro acontecimento, em uma das trajetórias.

**Consequência.** A classificação vem das consultas da fase 3 (`situacao`). O mesmo componente de lista serve à comparação. O rótulo das barras estreitas, pendente da fase 4, passa a ter equivalente por extenso.

## D-56. Em janela baixa, o mapa mantém a sua parte

**Decisão (fase 5).** Em telas médias e largas, o mapa fica com pelo menos 40% da altura da área de trabalho. A linha do tempo ocupa o que precisa do restante e, se não couber, rola por dentro.

**Motivo.** Achado na conferência desta fase: em uma janela de 1280×720, a barra de filtros ocupa duas linhas, a linha do tempo pedia mais altura do que sobrava e o mapa, com altura mínima própria, era desenhado por cima dela.

**Consequência.** A altura mínima do quadro do mapa caiu de 256 para 160 pixels nessas larguras. Um teste confere a janela de 1280×720.

## D-57. O que ficou fora desta fase

**Decisão (fase 5).** Não foram feitos: zoom na linha do tempo, ligação da comparação com o estado e o endereço, retorno da página do acontecimento com o recorte de antes, botão de copiar o endereço, pontos sobrepostos, formas e rótulos no mapa, pontos pelo teclado e medição de desempenho.

**Motivo.** O pedido da fase é a navegação temporal. Mapa, comparação com páginas e fontes, e acabamento com desempenho são as fases 6, 7 e 8 do plano.

**Consequência.** O contrato de cada item está em INTERACTIONS.md, e o do mapa em TIMELINE.md.

## D-58. A base do mapa é o Natural Earth 1:50m, com a câmera presa ao que ela cobre

**Decisão (fase 6).** Os dois arquivos de contornos da fase 4 foram adotados como a base do atlas, sem rótulos. A câmera fica dentro da caixa que a base cobre (longitude de -93 a -30, latitude de -57 a 16), o zoom vai de 2 a 6, e não há rotação nem inclinação. A pasta `public/geo/`, reservada na fase 1, foi removida.

**Motivo.** O mapa precisa mostrar a posição de um município ou de um estado dentro do país, e toda coordenada do conteúdo é o centro de um município ou de um estado. Uma base mais detalhada, em 1:10 milhões ou em tiles, sugeriria uma precisão que os pontos não têm, e custaria alguns megabytes ou um serviço de terceiros. Rótulos pedem arquivos de glyphs; os nomes que importam são os dos lugares do conteúdo, e eles vão em HTML. Fora da caixa a base não tem terra, e a câmera mostraria mar onde há continente. Além do zoom 6, o litoral e as divisas viram segmentos de reta.

**Consequência.** Substitui a D-43. Os contornos chegam ao navegador pelo bundler, com o nome marcado pelo conteúdo, e não por `public/`. O mapa continua recebendo os pontos pela página (D-28). Um lugar fora da caixa não é desenhado e tem tratamento próprio (D-62). Origem, licença e transformações estão em `src/features/map/base/README.md`.

## D-59. Marcadores em HTML, um por lugar; o WebGL desenha só a base

**Decisão (fase 6).** Os lugares são botões do React, postos por um portal dentro do contêiner do canvas do MapLibre e mantidos sobre a coordenada a cada movimento da câmera. As camadas de círculos da fase 4 saíram do estilo.

**Motivo.** A edição tem 9 lugares, e nessa quantidade o HTML não pesa. Ele dá o que uma camada de círculos não dá: foco e nome para teclado e leitor de tela, área de toque de 44 pixels, a forma da categoria pelo mesmo componente da lista e o nome do lugar sem glyphs. Uma camada WebGL pediria uma segunda estrutura, paralela, só para o teclado. Os marcadores do próprio MapLibre (`Marker`) foram testados e descartados: cada um anexa o seu elemento ao fim do contêiner, e no servidor de desenvolvimento, em que o React refaz os efeitos de um componente recém-montado, a ordem do Tab deixava de seguir a dos lugares depois de um reagrupamento.

**Consequência.** `palette.ts` ficou só com as seis cores da base. A ordem do teclado é a do documento: de norte a sul. A posição dos marcadores é escrita direto no estilo de cada elemento, sem passar pelo estado, para o arraste não renderizar a árvore a cada quadro. Vale rever se uma edição futura puser centenas de lugares à vista ao mesmo tempo.

## D-60. Sobreposição: um marcador por lugar, lugares próximos juntos e uma lista para escolher

**Decisão (fase 6).** Os pontos de um mesmo lugar formam um marcador. Lugares que, na escala em vigor, ficariam a menos de 44 pixels um do outro dividem um marcador, e o agrupamento é refeito ao fim de cada zoom. O marcador com mais de um acontecimento mostra a quantidade de acontecimentos distintos e, acionado, abre uma lista com todos. Nada é selecionado sem a escolha da pessoa.

**Motivo.** As coordenadas são do lugar: todos os acontecimentos de um lugar caem no mesmo ponto, e nenhum zoom os separa. Espalhar os pontos em volta do lugar desenharia posições que nenhuma fonte documenta. O agrupamento do MapLibre conta pontos (`point_count`), e um acontecimento com dois lugares no mesmo grupo seria contado duas vezes. Abrir o acontecimento de cima, como na fase 4, escondia os demais. Uma lista serve do mesmo jeito ao ponteiro, ao toque, ao teclado e ao leitor de tela.

**Consequência.** Fecha os dois pontos em aberto da fase 4 sobre os pontos do mapa. As regras são funções puras em `places.ts`, testadas sem navegador. São Paulo e São Bernardo do Campo continuam juntos no zoom máximo, e a lista os separa por lugar. O texto ao lado de um marcador que reúne lugares diz quantos são.

## D-61. A câmera só anda quando precisa, e quem move o mapa fica no controle

**Decisão (fase 6).** O mapa enquadra o recorte ao abrir. Ao mudar o recorte, só se move se algum lugar ficou fora da vista e a pessoa ainda não moveu o mapa. Ao selecionar, só se move se o lugar não está à vista. A aproximação automática tem teto pela precisão do lugar: 6 para local específico, 5,5 para centro de município, 4,5 para estado e 3,5 para país. Mover a câmera nunca altera a seleção.

**Motivo.** Um mapa que se recentra a cada filtro tira de quem o usa a noção de onde estava; um que nunca se move deixa a seleção fora da tela. Aproximar até o limite sobre o centro de um estado faria o ponto parecer um endereço. O plano pede que o controle manual seja preservado e que a câmera não mude o acontecimento selecionado.

**Consequência.** As regras ficam em `camera.ts`, puras e testadas. **Enquadrar os lugares do recorte** devolve o enquadramento e volta a acompanhar o recorte. O que está sob o cartão do acontecimento ou sob a lista aberta não conta como à vista. Com o mapa escondido, em outra vista do celular, as regras esperam ele voltar à tela. Um enquadramento reserva espaço à direita, para os nomes dos lugares e os controles, e em cima, para o botão dos acontecimentos sem ponto e os avisos; em um quadro baixo a faixa de cima não é reservada. A câmera não vai para o endereço.

## D-62. Sem ponto e fora da área: acessíveis pelo mapa, sem marcador inventado

**Decisão (fase 6).** Os acontecimentos de abrangência nacional, os sem lugar documentado e os que só têm lugar fora da área da base ficam em um botão no canto do mapa, **N sem ponto no mapa**, que abre a mesma lista dos marcadores, com o motivo de cada grupo. O mapa também avisa quando o acontecimento aberto não tem ponto e quando o recorte não tem nenhum.

**Motivo.** 13 dos 39 acontecimentos da edição não têm ponto. Um marcador no centro do país para "abrangência nacional" seria lido como um lugar, e o plano proíbe inventar um município para preencher uma coordenada ausente. Sem o botão, quem está na vista do mapa em celular não saberia que o recorte tem mais do que os marcadores mostram.

**Consequência.** `listUnplaced`, em `src/lib/data/points.ts`, devolve os acontecimentos sem ponto com o motivo. O número do botão conta acontecimentos sem nenhum marcador: quem tem um lugar fora da área e outro dentro dela aparece no marcador de dentro. Nenhum lugar da edição está fora da área; esse caso é coberto com os dados sintéticos de `/dev/prova/`.

## D-63. Controles do atlas, legenda recolhida e gestos cooperativos só onde a página rola

**Decisão (fase 6).** Aproximar, afastar e enquadrar são botões do atlas, e não os controles do MapLibre. A legenda fica recolhida, com o resumo "Legenda · pontos aproximados" sempre à vista. Na exploração os gestos são livres. Na página do acontecimento, o mapa usa gestos cooperativos (dois dedos, ou Ctrl e a roda), e os marcadores são imagens com nome, e não botões.

**Motivo.** Os controles do MapLibre trazem estilo próprio, área de toque menor do que os 44 pixels do atlas e nomes em inglês por padrão. Na exploração em celular o mapa ocupa a tela abaixo do cabeçalho, e não existe rolagem da página para disputar com o arraste. A página do acontecimento rola, e um mapa de gestos livres prenderia o dedo ou a roda de quem só quer descer a página. A legenda aberta cobriria uma parte do mapa em tela estreita.

**Consequência.** Os controles têm 44 pixels em telas estreitas e médias e 36 em tela larga. O aviso dos gestos cooperativos é do MapLibre, com o texto em português. A legenda mostra só os símbolos que o recorte em vigor usa, e o fundo dela nunca é opaco de todo: no navegador dos testes, um quadro opaco que aparecia sobre o mapa parado fazia a base sumir ao lado dele (MAP.md). O crédito da base aparece na legenda, na página de metodologia e no README da pasta; o controle de atribuição do MapLibre fica desligado.

## D-64. Falha do mapa: cinco causas, a lista de lugares no lugar dele e nova tentativa

**Decisão (fase 6).** O mapa trata cinco falhas: navegador sem WebGL, pacote do mapa que não chegou, contornos que não carregaram, carregamento que passa de 15 segundos e contexto gráfico perdido sem retomada em 5 segundos. Em todas, a área do mapa mostra o motivo, a saída possível (**Tentar de novo** ou **Recarregar a página**) e a lista dos lugares do recorte, com os acontecimentos selecionáveis.

**Motivo.** O critério da fase é que uma falha do mapa preserve a leitura. A fase 4 já trocava o mapa por uma lista em três causas, sem saída e sem dizer qual era. A perda de contexto acontece em uso real, quando o navegador recolhe a memória gráfica de uma aba em segundo plano, e o MapLibre costuma se recuperar sozinho: por isso o aviso vem antes da troca.

**Consequência.** **Tentar de novo** monta o mapa do zero; a seleção e o recorte não se perdem, porque não são do mapa. Sem WebGL não há saída oferecida, porque repetir não muda o navegador. A lista de lugares é agrupada por lugar, como o mapa.

## D-65. O que ficou fora desta fase

**Decisão (fase 6).** Não foram feitos: rótulos da base, com nomes de estados e de países; contorno mundial para lugares fora da América do Sul; posição da câmera no endereço; comparação ligada ao estado e ao endereço; retorno da página do acontecimento com o recorte de antes; botão de copiar o endereço; página de metodologia; e medição de desempenho.

**Motivo.** O pedido da fase é o mapa sincronizado. Comparação, páginas compartilháveis e metodologia são a fase 7 do plano, e desempenho, a fase 8. Rótulos pedem glyphs locais, e nenhum lugar da edição fica fora da área da base.

**Consequência.** O que segue em demonstração está em INTERACTIONS.md. O caminho para um lugar fora da América do Sul está descrito em `src/features/map/base/README.md`.

## D-66. A comparação usa o estado do endereço, sem pessoa em foco e sem acontecimento aberto

**Decisão (fase 7).** `/comparar/` usa o mesmo provider da exploração, com `pessoa: null` e `comparar: true`. A query string guarda `de`, `ate` e `categorias`, lidos e escritos pelas mesmas regras. O período é ajustado à escala comum das duas coberturas. O parâmetro `acontecimento` é descartado nessa rota.

**Motivo.** O pedido da fase é consultar os dois perfis no mesmo recorte, sem excluir um deles por causa do filtro de pessoa da exploração, e sem uma segunda implementação da filtragem. A consulta `compareTrajectories` já aceitava período e categorias desde a fase 3; faltava a tela usar o estado. Abrir um acontecimento dentro da comparação pediria um painel de leitura igual ao da exploração, e cada acontecimento já tem a própria página.

**Consequência.** `UrlContext` passou a aceitar `pessoa: null` e `comparar`. `selectComparison` entrega o recorte do estado a `compareTrajectories`, e um teste confere que a união das duas trajetórias é o recorte visível do estado. Um link de comparação que traga `acontecimento` perde o parâmetro ao abrir. A especificação está em [COMPARISON.md](COMPARISON.md).

## D-67. O perfil é a exploração: não existe uma segunda página de perfil

**Decisão (fase 7).** `/politicos/<slug>/` continua sendo a exploração. A apresentação factual, o retrato com crédito, os cargos e as filiações com as fontes de cada um, a cobertura, as fontes do perfil e a edição ficam no painel de leitura enquanto nenhum acontecimento está aberto, e na vista **Perfil** em telas estreitas e médias.

**Motivo.** O pedido da fase prevê o caso: se a rota já for a exploração, integrar as informações sem criar uma experiência duplicada e sem quebrar mapa, filtros e seleção. Uma página à parte daria dois endereços para o mesmo perfil e duas listas de cargos para manter iguais.

**Consequência.** O perfil inteiro está no HTML do build, porque a exploração é pré-renderizada no estado inicial. O título da página é o nome, e a descrição, o resumo do perfil. Em celular, o perfil fica a um toque, na aba **Perfil**. Do painel saem os caminhos para a comparação no mesmo recorte e para a metodologia.

## D-68. O contexto de retorno viaja no endereço da página do acontecimento

**Decisão (fase 7).** Os links da exploração e da comparação para a página de um acontecimento levam `de`, `ate` e `categorias`, e os da comparação levam também `origem=comparar`. A página lê esses parâmetros e monta os links de volta com o mesmo recorte. O link que **Copiar link** copia, na página, não leva contexto.

**Motivo.** O pedido é preservar pessoa, período, categorias e seleção no retorno, sem depender só do histórico do navegador. Guardar o recorte na sessão do navegador não sobrevive a uma aba nova e esconde o estado; voltar no histórico não funciona para quem abriu a página em outra aba. O endereço já é a fonte do estado nas outras telas (D-49).

**Consequência.** A mesma página responde com e sem contexto, e o conteúdo é o mesmo nos dois casos: só os links de retorno mudam. Um contexto que não contém o acontecimento, ou inválido, é descartado, para o retorno nunca deixar de abrir o registro. No HTML do build os links saem sem recorte; o contexto é lido depois da hidratação. O endereço canônico, sem contexto, depende do domínio público e fica para a fase 10. As regras estão em `src/lib/state/links.ts`, com teste sem navegador.

## D-69. Copiar link usa o endereço em que o atlas está sendo servido

**Decisão (fase 7).** **Copiar link** monta o endereço com a origem da janela e o caminho canônico da consulta. A confirmação só aparece depois que a cópia deu certo. Se a área de transferência não existe ou recusa, o endereço aparece em um campo, já selecionado. Nenhum domínio público é configurado, e o atlas não usa o compartilhamento nativo do aparelho.

**Motivo.** O domínio de publicação não foi decidido, e supor um faria todo link copiado apontar para um endereço que não existe. A área de transferência só funciona em contexto seguro: quem abre o atlas por `http`, em outro computador da rede, não consegue copiar. Confirmar sem ter copiado é a pior falha possível de um botão desses.

**Consequência.** Um link copiado no servidor de desenvolvimento aponta para `localhost`. Parâmetros alheios ao atlas, como os de campanha, não entram no link copiado. `metadataBase`, endereço canônico e sitemap ficam para a fase 10.

## D-70. Canal de correção: configuração pendente, com um modelo para copiar

**Decisão (fase 7).** O atlas não publica um canal de correção. `SITE.correctionChannel`, em `src/lib/site.ts`, fica sem valor; a metodologia diz que o canal ainda não foi definido e oferece um modelo de sugestão com o link do acontecimento, a informação a corrigir e a fonte proposta. Quem chega pela página de um acontecimento recebe o modelo já com o link e o título do registro.

**Motivo.** O canal é decisão do responsável pelo projeto (EDITORIAL.md, seção de correção), e nenhum endereço de contato foi informado para esse fim. Publicar um por conta própria exporia um contato sem autorização.

**Consequência.** Com o valor preenchido (`rotulo` e `href`), a página troca o aviso pelo link, sem outra mudança. O parâmetro `acontecimento` da metodologia só aceita slug de acontecimento publicado.

## D-71. Fontes de cada registro recolhidas, e um catálogo sem repetir documento

**Decisão (fase 7).** No perfil e na comparação, cada cargo e cada filiação traz "N fontes", um bloco nativo de abrir e fechar com a citação completa: documento, onde está o trecho e o que ele sustenta. A comparação e a metodologia têm um catálogo em que cada documento aparece uma vez, com a quantidade de registros que o citam. A interface não classifica a fonte por natureza: mostra a autoria registrada, e a metodologia agrupa o catálogo por quem publicou.

**Motivo.** A relação entre a fonte e a afirmação é do registro, e uma lista única de fontes do perfil a perderia. Abertas, as citações de 15 cargos e 8 filiações tornariam o perfil ilegível. O conteúdo não tem um campo com a natureza da fonte; classificar na interface seria acrescentar um dado que ninguém revisou.

**Consequência.** A classificação por natureza continua só em [SOURCES.md](SOURCES.md), que é um documento editorial. Mostrá-la nas páginas pede um campo novo no conteúdo. A lista de fontes de um conjunto de registros é uma consulta (`listSourcesOf`), com teste.

## D-72. A metodologia descreve a revisão que aconteceu, com os números dos dados

**Decisão (fase 7).** A página de metodologia tira dos dados gerados as quantidades, as datas, a cobertura de cada pessoa, o registro de alterações e o tipo da revisão. O trecho sobre a revisão desta edição só aparece com a redação da conferência assistida por IA enquanto for esse o tipo registrado. Os critérios seguem [EDITORIAL.md](EDITORIAL.md), [SOURCES.md](SOURCES.md) e [CONTENT-REVIEW.md](CONTENT-REVIEW.md).

**Motivo.** O pedido é explicar a revisão efetivamente realizada, incluindo o uso de IA. Um texto fixo envelheceria na edição seguinte, e uma página que dissesse "revisado" sem dizer por quem contrariaria a regra de nunca usar para a conferência assistida as palavras da revisão humana.

**Consequência.** Quando uma revisão humana for registrada, o trecho muda sem edição da página. Mudar um critério pede mudar o documento editorial e o texto da página juntos: a página não lê os documentos de `docs/`.

## D-73. O que ficou fora desta fase

**Decisão (fase 7).** Não foram feitos: endereço canônico, `metadataBase`, sitemap, imagem de compartilhamento e dados estruturados; compartilhamento nativo do aparelho; conferência dos links das fontes no ar; índice de acontecimentos em página própria; mapa na comparação; posição da câmera no endereço; acabamento visual e medição de desempenho.

**Motivo.** O pedido da fase é a comparação, as páginas, as fontes e o compartilhamento. Acabamento e desempenho são a fase 8; a conferência de links, a fase 9; domínio, indexação e publicação, a fase 10. A indexação segue bloqueada enquanto o conteúdo não tiver revisão humana.

**Consequência.** O que depende de configuração está em [PAGES.md](PAGES.md), seção Configuração pendente.

## D-74. Retratos em versões locais, por moldura e por largura, com enquadramento próprio

**Decisão (fase 8).** `npm run images` gera, de cada retrato de perfil, nove arquivos WebP já recortados: a moldura 4:5 em cinco larguras, de 160 a 640 px, e a quadrada em quatro, de 64 a 192 px. O recorte de cada retrato está em `scripts/images.config.json`, em pixels do original. Um manifesto registra de que original e de que configuração as versões saíram, e `images:check` roda antes de `dev` e de `build`. O arquivo original não é alterado e continua sendo o que o conteúdo cadastra.

**Motivo.** Os dois JPEG, de 215 e 290 KB, eram servidos para tudo, até para miniaturas de 48 px. Na entrada em celular com rede lenta, o maior elemento da tela era um retrato, e ele só terminava de chegar depois de 4 segundos. Sem servidor não há redimensionamento em tempo de execução: as versões têm de existir antes do build. As duas fotos oficiais têm cortes diferentes, e o recorte pelo topo deixava um rosto maior do que o outro na mesma moldura.

**Consequência.** Cada página pede de 1 a 53 KB por retrato. O enquadramento põe a linha dos olhos na mesma altura e o rosto no mesmo tamanho nos dois perfis; é uma escolha de apresentação, e por isso fica em um arquivo de configuração, e não no conteúdo. Trocar um retrato pede rodar `npm run images` e conferir o resultado: o build recusa versões desatualizadas. O original segue publicado em `/media/retratos/`, sem que nenhuma página o peça. Um navegador sem suporte a WebP não mostra o retrato; o nome e o texto continuam.

## D-75. A imagem do retrato usa `srcset` próprio, em um componente de cliente

**Decisão (fase 8).** `Portrait` escreve uma `<img>` com a lista das versões (`srcset`), as dimensões declaradas e o modo de carregamento: prioritária (os dois cartões da entrada), imediata (miniatura da primeira tela) ou adiada. Deixou de usar `next/image`. O componente é de cliente.

**Motivo.** Sem servidor de imagens, o `next/image` só repassava o arquivo original (`unoptimized`, D-03). O caminho que a documentação do Next 16.4 indica para a exportação estática é um carregador próprio, com uma lista global de larguras; com dois retratos e duas molduras, a lista direta na imagem dá o mesmo resultado sem essa configuração. O componente é de cliente por um efeito medido: uma imagem que carrega logo, quando renderizada em um Server Component, entra como dica de pré-carregamento no conteúdo que o roteador busca ao ver um link. Toda página com link para a entrada baixava os retratos dos cartões sem mostrá-los.

**Consequência.** A dica fica só no HTML da própria página. Um teste sobre o build leva o ponteiro ao nome do atlas, a partir da metodologia, e confere que o conteúdo da entrada chega sem imagem nenhuma. Com o pré-carregamento por intenção (D-78), o caso que sobrou é esse: sem a regra, apontar para um link da entrada já baixaria os dois retratos. O componente não tem estado, e o código dele já estava no pacote do navegador, por causa da exploração.

## D-76. O mapa é montado perto da área visível, e aquecido só por intenção

**Decisão (fase 8).** `MapView` monta o mapa quando a moldura está na tela ou a menos de 400 px dela. Levar o ponteiro, o dedo ou o foco ao botão da vista **Mapa** começa a baixar o pacote. Não há pré-carregamento em tempo ocioso.

**Motivo.** A página de um acontecimento carregava o mapa mesmo com ele abaixo da primeira tela: em celular, o pacote do MapLibre, o worker e os contornos disputavam a rede e o processador com a leitura. Baixar o mapa em tempo ocioso, na exploração em celular, gastaria perto de 500 KB de dados de quem nunca abre a vista do mapa, e a fase 6 já garantia que quem fica na lista não baixa o pacote.

**Consequência.** A abertura e as páginas de leitura mostram o conteúdo sem esperar o mapa. Em celular com rede lenta, abrir a vista do mapa continua levando alguns segundos: o custo é do pacote e do worker do MapLibre, que o atlas não tem como reduzir. Enquanto isso a moldura já tem o tamanho final, com o aviso e um traço que vai e volta, e o mapa entra sem deslocar nada.

## D-77. A saída estática é ajustada depois do build

**Decisão (fase 8).** `scripts/finalize-export.mjs` roda no fim de `npm run build` e faz três coisas: devolve os arquivos de segmento ao nome que o navegador pede, retira os arquivos do MapLibre que nenhuma página pede e completa o pré-carregamento das fontes nas páginas de acontecimento. `npm run verify:export` confere os três.

**Motivo.** Cada passo corrige um defeito observado na saída, e nenhum tem opção de configuração. No Windows, a exportação do Next 16.4 grava os arquivos de segmento em pastas, com as barras do sistema, e o navegador os pede com pontos: os pedidos davam 404 e a navegação caía no carregamento da página inteira. O MapLibre procura o próprio worker com um endereço montado em tempo de execução, e por isso o bundler publica a pasta `dist` inteira do pacote: 4,5 MB de arquivos de desenvolvimento e cópias. A rota dos acontecimentos tem uma extensão condicional (D-06), o nome dela não bate com o do registro de fontes do Next, e as 39 páginas saíam sem o pré-carregamento das fontes.

**Consequência.** Um build feito no Linux ou no macOS não deve ter o que renomear; isso não foi conferido, porque todos os builds foram feitos no Windows. O pré-carregamento da fonte foi medido na página de um acontecimento, com o build final com e sem ele: as fontes ficam prontas 100 ms antes, e o primeiro desenho vem 16 ms depois em computador e 36 ms depois no perfil de celular. Ficou, para as 39 páginas se comportarem como as outras. Os três precisam ser revistos ao atualizar o Next ou o MapLibre: se o defeito sumir, o passo correspondente sai. Com os arquivos de segmento no lugar, o roteador passou a pré-carregar o destino dos links, o que levou à D-78.

## D-78. O roteador só adianta o destino por intenção, fora os cartões da entrada

**Decisão (fase 8).** O pré-carregamento padrão do Next fica só nos dois cartões da entrada. O menu, o nome do atlas, o botão **Comparar as trajetórias** e os caminhos da página 404 usam `IntentLink`: o destino é adiantado quando a pessoa leva o ponteiro, o dedo ou o foco ao link. Os links secundários têm `prefetch={false}`: retorno e **Continuar no atlas** na página do acontecimento, links para a metodologia dentro do texto, rodapé, créditos e todo link que leva uma consulta no endereço.

**Motivo.** Para uma rota estática, o padrão é baixar a página inteira do destino assim que o link aparece na tela. Enquanto os pedidos davam 404 isso não custava nada; corrigidos (D-77), cada página passou a baixar e a processar o conteúdo de todos os links visíveis. Com o menu em todas as páginas, eram quatro páginas a mais a cada visita, e a medição mostrou o trabalho depois do carregamento subindo nas telas de leitura. Cada endereço com consulta, além disso, conta como um destino à parte.

**Consequência.** Ir da entrada a uma trajetória não espera a rede. Pelo menu, o destino começa a vir quando o ponteiro chega ao link, e em geral já está pronto no clique; em tela de toque, o adiantamento é o tempo entre o toque e a navegação. Os outros links buscam o destino ao serem acionados. O padrão segue o que a documentação do Next 16.4 descreve como pré-carregamento por passagem do ponteiro, com o foco e o toque somados.

## D-79. A fonte serifada continua sem pré-carregamento, e o itálico serifado saiu

**Decisão (fase 8).** A Newsreader continua sendo carregada quando a folha de estilo a pede, sem pré-carregamento; só a Libre Franklin é pré-carregada. O arquivo do itálico da Newsreader saiu do projeto.

**Motivo.** A D-41 deixou para esta fase afinar o carregamento da serifada. O pré-carregamento foi construído e medido contra o build sem ele, com as execuções alternadas. Não adiantou a chegada da fonte: nos dois casos ela fica pronta por volta de 0,4 segundo no perfil de computador e de 2 segundos no de celular, porque a folha de estilo já a revela cedo. E atrasou o primeiro desenho das páginas de texto no perfil de computador, em 44 ms na página de um acontecimento e em 96 ms na metodologia: o arquivo, de 129 KB, disputa a rede com a folha de estilo. No perfil de celular não houve diferença, nem no deslocamento de layout. O caminho contrário também foi medido: sem pré-carregar nenhuma fonte, o primeiro desenho em celular adianta de 8 a 80 ms, mas a entrada passa a se deslocar quando a fonte da interface chega (de 0,002 para 0,020), e em computador o resultado é misto. O itálico, de 143 KB, não é usado por nenhum texto das páginas.

**Consequência.** O texto aparece primeiro no substituto de medidas ajustadas e troca para a Newsreader quando ela chega. Em rede lenta, um título pode mudar de quebra de linha nessa troca: é o deslocamento medido na página do acontecimento em celular, de 0,02. As notas em itálico são da sem serifa. Um texto serifado em itálico pede o arquivo de volta.

## D-80. Transições só em CSS, depois da primeira ação, com o estado na frente

**Decisão (fase 8).** As transições são de opacidade, de `transform` e de cor, com as duas durações do atlas (120 e 180 ms). O estado e o endereço mudam no clique; a transição só acompanha. Nenhuma vale ao carregar a página: as de vista e de recorte começam depois da primeira ação da pessoa, e a de troca de pessoa, só para quem veio de outro perfil. Os marcadores do mapa e as marcas da linha do tempo, que têm a posição dada por `transform`, usam uma entrada só de opacidade.

**Motivo.** O pedido da fase é que a transição ajude a acompanhar a seleção sem segurar o estado, sem acumular em interações rápidas e sem tirar o controle de quem navega. Com CSS, não existe fila: o que está na tela é sempre o último estado, e a animação pertence ao elemento que entrou. Uma entrada animada ao carregar atrasaria o primeiro desenho do conteúdo.

**Consequência.** Nenhuma dependência nova. O movimento reduzido já estava coberto pela regra global, que zera durações. A câmera do mapa não mudou (D-61). O que as transições fazem e não fazem está em [INTERACTIONS.md](INTERACTIONS.md), seção Movimento, com teste.

## D-81. Recorte com identidade estável, e o perfil montado sob a leitura

**Decisão (fase 8).** No provider do endereço, o período, as categorias e o recorte visível são os mesmos objetos enquanto não mudam. O perfil continua montado, escondido, enquanto um acontecimento está aberto. Os blocos de cargos e partidos só são refeitos quando o período ou os registros mudam.

**Motivo.** Abrir um acontecimento muda o endereço, e o estado era lido de novo por inteiro: a lista do recorte ganhava outra identidade, e com ela os pontos do mapa, os lugares, o agrupamento e as contagens eram refeitos, sem que nada tivesse mudado. Fechar a leitura reconstruía o perfil inteiro, com as fontes de cada cargo.

**Consequência.** Selecionar e fechar refazem só o que mudou. O perfil volta como a pessoa o deixou, com as fontes que estavam abertas. Ele fica fora da tela e da árvore de acessibilidade pelo atributo `hidden`.

## D-82. O título é a âncora da leitura, e a comparação mostra as faixas primeiro

**Decisão (fase 8).** No painel e na página do acontecimento, o título passou a ser maior do que a data, que continua acima dele, forte e em números de mesma largura. Na comparação, as faixas vêm logo abaixo do recorte, e as notas de leitura, depois delas e antes das colunas. Na entrada em tela estreita, os dois cartões vêm antes dos números da edição.

**Motivo.** Na fase 4 a data era o maior elemento da leitura e disputava com o título. Na comparação, quatro parágrafos empurravam as faixas para fora da primeira tela, em qualquer largura. Na entrada em celular, os cartões ficavam cortados no fim da primeira tela, e o acesso à exploração dependia de rolar.

**Consequência.** A data continua sendo o primeiro dado da leitura, e na lista o ano segue em destaque: a cronologia não perdeu a referência. As notas da comparação continuam obrigatórias e antes de qualquer lista. Ajusta a D-37: as datas continuam abrindo cada item, e o maior elemento da leitura passa a ser o título.

## D-83. Link com consulta: a área que vai mudar fica encoberta até o endereço ser lido

**Decisão (fase 8).** Em uma página de exploração ou de comparação aberta com consulta no endereço, um trecho de script no fim do `<body>` marca o documento antes do primeiro desenho. O CSS encobre a área que depende da consulta e mostra o aviso "Abrindo a consulta do endereço…". Lido o endereço, a marca sai e a tela aparece já no recorte pedido. Se o código da página não chegar, a área aparece sozinha depois de 6 segundos, no recorte padrão. Com o JavaScript desligado no navegador, o trecho não roda e nada é encoberto.

**Motivo.** Era o ponto que a D-49 deixou para esta fase. O HTML do build traz o recorte padrão, e quem abria um link copiado via primeiro a lista inteira e o perfil, e só depois o período e o acontecimento do link. Um instante de tela errada é pior do que um instante de aviso: a pessoa lê o que não pediu.

**Consequência.** Só vale para endereços com `de`, `ate`, `categorias` ou `acontecimento`, nas rotas `/politicos/` e `/comparar/`. O script fica no fim do `<body>` por um efeito medido: no começo, ele esperava a folha de estilo e parava a leitura do HTML, o que atrasava o primeiro desenho de todas as telas, de 40 a 140 ms no perfil de celular. No fim, o HTML já foi lido quando ele roda. Em uma conexão rápida, a parte de cima da página pode ser desenhada um instante antes de a marca chegar. É o único script escrito dentro do HTML; uma política de segurança de conteúdo, na fase 10, precisa permiti-lo. A página do acontecimento não é encoberta: o contexto de retorno só muda os links. As duas regras usam uma animação de duração zero como relógio, e por isso ficam fora da redução de movimento: com os 0,01 ms que a regra geral impõe, o aviso não chegava ao estado final e ficava sobre a tela depois do prazo.

## D-84. Medição de laboratório própria, com os dois builds alternados

**Decisão (fase 8).** As medições são feitas por `scripts/measure.mjs`: um Chromium controlado pelo Playwright abre cada rota sobre a saída estática, com o cache vazio, em dois perfis de rede e de processador, e lê as entradas de desempenho do próprio navegador. Para comparar dois builds, as execuções se alternam, e o resultado é a mediana. O servidor local responde como uma hospedagem comum, com compressão e validadores de cache.

**Motivo.** O pedido é medir antes e depois em condições comparáveis e não chamar uma aproximação pelo nome de outra métrica. Medidos em momentos diferentes, os mesmos arquivos deram resultados até 50% diferentes no perfil com o processador limitado: o estado da máquina pesava mais do que as mudanças. Alternar as execuções tira esse efeito da comparação. Uma ferramenta própria não acrescenta dependência e mede também o que as prontas não medem: quando o mapa fica pronto e quanto tempo cada parte da tela leva para mudar depois de um clique.

**Consequência.** O que cada número é, e o que ele não é, está em [PERFORMANCE.md](PERFORMANCE.md). São resultados de laboratório, em um navegador sem interface: servem para comparar builds, e não para prever a experiência em um aparelho. O WebGL é desenhado por software, como nos testes, ou pela placa de vídeo da máquina (`--webgl placa`). As medições registradas usaram a placa: por software, o desenho do mapa ocupava o processador mais do que em um navegador comum. A avaliação com dados de campo fica para depois da publicação.

## D-85. `sharp` como dependência de desenvolvimento

**Decisão (fase 8).** O `sharp` foi declarado em `devDependencies`, na versão que já estava instalada como parte opcional do Next.

**Motivo.** Preparar as versões dos retratos pede redimensionar, recortar e gravar WebP. O pacote já estava em `node_modules`; declará-lo evita depender de um pacote opcional de outro.

**Consequência.** Nada vai para o site: só `npm run images` o usa. A conferência que roda antes de `dev` e de `build` não carrega a biblioteca.

## D-86. O que ficou fora desta fase

**Decisão (fase 8).** Não foram feitos: redução do pacote do MapLibre ou troca por uma base mais leve; imagens em AVIF ou com mais de um formato; subconjunto menor das fontes; tema escuro; rótulos da base do mapa; endereço canônico, sitemap e imagem de compartilhamento; medição em aparelho real e com dados de campo; e a manutenção da instância do mapa na troca de pessoa.

**Motivo.** O pacote do mapa é o que é, e a base de contornos, com 249 KB e duas casas decimais, não é o gargalo. O WebP atende a todos os navegadores atuais com um arquivo por largura. Reduzir as fontes pede uma ferramenta que o projeto não tem instalada. Manter o mapa entre os perfis mexeria nas regras de câmera da fase 6. O resto é das fases 9 e 10.

**Consequência.** As pendências estão em [STATUS.md](STATUS.md) e em [PERFORMANCE.md](PERFORMANCE.md), seção Pendências.

## D-87. As jornadas rodam também sobre a exportação estática

**Decisão (fase 9).** `npm run test:journeys` roda sobre a pasta `out/` os mesmos testes de navegador que `npm run test:e2e` roda no servidor de desenvolvimento, menos as telas de prova. Os testes que bloqueiam o pacote do mapa o reconhecem nos dois ambientes (`tests/e2e/map-package.ts`).

**Motivo.** O servidor de desenvolvimento repete os efeitos do React, e isso escondeu um defeito de ordem: no build, um link com consulta inválida deixava a tela encoberta por 6 segundos. Quatro testes de falha do mapa também não testavam nada no build, porque bloqueavam o arquivo pelo nome de desenvolvimento.

**Consequência.** Mexeu em efeito, rode as jornadas sobre o build. São mais três minutos antes de uma entrega.

## D-88. A hachura do período não passa pelos anos do eixo

**Decisão (fase 9).** Na exploração, a hachura que marca o que está fora do período cobre as marcas, a régua e os traços, e para acima da linha dos anos. Na comparação nada mudou: lá o eixo de anos já ficava fora da hachura.

**Motivo.** Os anos fora do período são o que a pessoa lê para escolher outro ano ou outro intervalo, e sob a hachura o contraste deles ficava em cerca de 1,6:1. O guia de design já dizia, para as linhas de lacuna da lista, que a hachura não passa pelas letras.

**Consequência.** `PeriodShade` recebe a altura que cobre. Na comparação, o nome dos cargos e as notas das faixas que ficam fora do período continuam sob a hachura: é o desenho documentado, e as colunas abaixo trazem a mesma informação em texto. Fica como ponto em aberto.

## D-89. O nome do cargo se explica sozinho

**Decisão (fase 9).** O campo `cargo` traz um nome que dispensa a instituição: "Presidente do PT", e não "Presidente". A regra está em [EDITORIAL.md](EDITORIAL.md), e um teste recusa o mesmo nome em instituições diferentes da mesma pessoa. Na página do acontecimento, a nota dos cargos acompanha a precisão da data: "na data", "no mês" ou "no ano".

**Motivo.** A página do acontecimento e a linha do tempo mostram o cargo sem a instituição. Com três cargos de Lula chamados "Presidente", a página de um acontecimento de 1980 dizia "Lula: Presidente". O conteúdo estava certo, e a leitura que a tela permitia, não. Os cargos de Flávio Bolsonaro já seguiam o padrão ("Líder do PL no Senado").

**Consequência.** Onde a instituição aparece ao lado, o texto fica um pouco redundante ("Presidente do PT, Partido dos Trabalhadores (PT)"). A alternativa, mostrar a instituição em todas as telas, mudaria o desenho da faixa de cargos.

## D-90. Passagem de acessibilidade como comando, e não como teste

**Decisão (fase 9).** `npm run audit:a11y` mede o contraste do texto desenhado, a rolagem lateral, os alvos e a ordem de foco, sobre a saída estática, e grava capturas e um relatório. Não entra em `npm run check`.

**Motivo.** O teste de contraste que existia confere os pares de cor do sistema, e não o que cada tela desenha. A passagem leva três minutos e depende de olhar as capturas: ela não vê uma camada posta por cima do texto, que foi justamente o defeito encontrado.

**Consequência.** Nenhuma dependência nova. Leitor de tela e aparelho real continuam fora do que o projeto confere sozinho.

## D-91. O jogo é um segundo caminho sobre os mesmos dados, sem conteúdo próprio

**Decisão (jogo, etapa 1).** O atlas ganhou um jogo em que o visitante escolhe uma das duas pessoas, controla um personagem por cenários e avança por capítulos da trajetória. Um capítulo cita acontecimentos publicados pelo `id`; o título, a data, o resumo e as fontes de cada registro vêm dos dados gerados. O jogo não tem arquivo de conteúdo, e as fichas, as fontes, a comparação e a metodologia continuam nos mesmos endereços.

**Motivo.** O pedido da etapa: uma experiência jogável sobre a base existente, com os fatos disponíveis também fora do jogo. Texto editorial repetido no código das cenas sairia do pipeline, da revisão e do registro de alterações.

**Consequência.** Um capítulo só existe se os acontecimentos dele estão publicados: `playableChapters` descarta o que não está, e a rota diz isso. Corrigir um registro corrige o jogo no build seguinte. Os textos próprios do jogo (título, motivo e objetivo do capítulo, nome do cenário) ficam em `src/lib/game/` e só dizem o que os registros sustentam; um teste os confere.

## D-92. Capítulos por assunto e período, começando pelo começo de cada trajetória

**Decisão (jogo, etapa 1).** Dois capítulos por pessoa, com os primeiros registros publicados de cada uma, sem pular nenhum: para Lula, o sindicato, as greves e a fundação do partido (1975 a 1980) e a Constituinte com as duas primeiras disputas presidenciais (1986 a 1994); para Flávio Bolsonaro, as eleições para deputado estadual com a disputa pela Prefeitura (2002 a 2016) e a eleição para o Senado com os dois registros de 2019 (2018 a 2019). O mesmo desenho para os dois: a primeira tarefa é encontrar um registro, e a segunda, ordenar dois. O título e o motivo de cada capítulo são inventários do que os registros dizem, na mesma forma para os dois.

**Motivo.** As trajetórias têm períodos diferentes, e a regra editorial é não nivelar carreiras de duração diferente. Um título que conta uma história ("quatro mandatos", "do Rio ao Senado") afirma mais do que os registros: o período do capítulo é o dos anos dos acontecimentos, e não o dos mandatos, e a revisão independente achou as duas coisas lado a lado na tela.

**Consequência.** Nenhum episódio judicial dos processos recentes entrou nesta etapa: denúncia, condenação e anulação pedem uma ficha que mostre alegação, decisão e desfecho no mesmo lugar, e isso fica desenhado antes. O número de registros por capítulo não é igual entre os dois (quatro e três, cinco e três), porque segue o que cada trajetória tem no período. Faltam capítulos para 24 dos 39 acontecimentos ([GAMEPLAY.md](GAMEPLAY.md)). A regra da fronteira entre capítulos está na D-100.

## D-93. Tarefa com objetivo, ação e conclusão no código, e ordem só com datas que decidem

**Decisão (jogo, etapa 1).** Dois tipos de tarefa em `TaskSpec`: `registro` (recolher o registro pedido conclui) e `ordem` (recolher dois registros e confirmar a ordem certa conclui). Não há botão de concluir fase. Uma tarefa de ordem só aceita dois registros cujos intervalos de cálculo não se cruzam (`datesDecideOrder`). Errar mostra as duas datas e deixa tentar de novo, sem perder nada.

**Motivo.** O pedido: mecânica explícita, fácil e sem conhecimento prévio. A regra das datas é a do atlas: uma data parcial não é completada, e um ano não vem antes nem depois de um dia do mesmo ano.

**Consequência.** O par "prisão de 1980" e "fundação do PT em 10 de fevereiro de 1980" não pode virar tarefa, e o teste dos capítulos recusa. A explicação lista os dois registros com a data entre parênteses, na precisão de cada um e com o mais antigo primeiro: os títulos do atlas são orações, e uma frase montada com eles sairia truncada.

Cumprir a tarefa deixou de abrir a saída sozinho: a D-109 separou as duas coisas.

## D-94. Canvas 2D e arte por código, sem biblioteca de jogo e sem imagens

**Decisão (jogo, etapa 1).** A cena é desenhada em um canvas 2D, com uma projeção isométrica de 64 por 32 pixels por célula, e toda a arte (personagens, cenários, objetos, efeitos) é desenho vetorial feito por código em `src/features/game/draw/`. Nenhuma dependência foi acrescentada.

**Motivo.** A cena é pequena (uma sala de 12 por 9 células e uns vinte objetos), e o canvas 2D a desenha a 60 quadros por segundo. Um motor de jogo traria centenas de quilobytes e um modo de trabalhar estranho ao projeto. Sem folha de sprites não há recurso externo para carregar nem para licenciar, e o traço acompanha a densidade da tela e o zoom.

**Consequência.** Cada peça nova é código de desenho, e não um arquivo de imagem: a galeria `/dev/jogo-arte/` existe para olhar as peças sem jogar. O jogo não usa WebGL, e as páginas do jogo não têm mapa: nunca há dois renderizadores pesados na mesma tela. A conta dos 60 quadros por segundo só fechou com o que é fixo desenhado uma vez (D-106).

## D-95. O palco é um pacote à parte, carregado só na página do jogo

**Decisão (jogo, etapa 1).** `GameStage` (canvas, laço e entrada) e o desenho entram por `next/dynamic`, sem renderização no servidor, só em `/jogo/[personagem]`. A entrada do jogo pede só a prévia. A entrada do atlas só adianta a página do jogo quando a pessoa aponta para o acesso (`IntentLink`).

**Motivo.** É a regra da fase 8 para o mapa (D-76): o código pesado chega quando vai ser usado. Quem veio ler um acontecimento não paga pelo jogo.

**Consequência.** O HTML do build traz o capítulo, o objetivo e os botões, sem a cena; sem JavaScript, o aviso fica dentro do palco, na primeira tela, e aponta para a trajetória no atlas. Um pacote à parte pode não chegar (D-104). `tests/export/jogo.spec.ts` confere na saída estática o que cada página pede.

## D-96. Progresso no navegador, por personagem, com versão; nunca no endereço

**Decisão (jogo, etapa 1).** O progresso fica em `localStorage`, uma chave por personagem, em um formato com versão. Os capítulos têm três situações (`bloqueado`, `disponivel`, `concluido`) e transições previsíveis. A leitura aceita só o que está certo: dado inválido, de outra versão ou de outro personagem vira começo, e a progressão é reaplicada. Sem armazenamento, o jogo segue com uma cópia em memória e avisa.

**Motivo.** Sem login e sem backend, o navegador é o único lugar para guardar. No endereço, o progresso viajaria em link compartilhado e poderia ser alterado por quem abre o link: o pedido é que abrir um link direto não mude nada.

**Consequência.** O progresso não acompanha a pessoa entre aparelhos nem entre navegadores, e duas abas no mesmo personagem não se sincronizam. A página de um acontecimento aberta pelo jogo leva só `origem=jogo` e o personagem, para oferecer a volta. A cópia em memória é da página, e não de cada montagem do jogo: sem armazenamento, ir à ficha de um registro e voltar pelo site não perde o progresso da visita; recarregar perde, e o painel diz. A leitura também acerta o que ficou de uma edição anterior do capítulo: registro que ele não cita mais sai dos recolhidos, e uma ordem confirmada só vale com os dois registros da tarefa atual. Desde a D-109, acerta também o que foi guardado pela regra anterior da saída: um capítulo só consta como concluído com todos os registros recolhidos.

## D-97. As teclas são da cena, e tudo pode ser feito sem ela

**Decisão (jogo, etapa 1).** As setas, W, A, S, D e a tecla de interação são ouvidas no elemento da cena, e não na janela: só valem com o foco nela. A simulação para quando um diálogo abre, quando a janela perde o foco e quando a aba fica oculta. O painel **Capítulos e tarefas** lista os capítulos e cumpre as tarefas por botões, com o mesmo progresso.

**Motivo.** Um jogo que captura teclas na página inteira quebra a rolagem, os botões e o leitor de tela do resto do atlas. E a exploração espacial não pode ser o único caminho para o conteúdo.

**Consequência.** Recolher pelo painel é a mesma ação de recolher no cenário, e não um atalho para concluir: a tarefa de ordem ainda precisa ser respondida, e a saída, atravessada. Com um diálogo aberto, a cena e os botões sobre ela ficam fora da tabulação (`inert`). As teclas são lidas pela posição no teclado (`code`), para Shift e a trava de maiúsculas não deixarem uma direção presa, e um atalho do navegador passa direto. As janelas do jogo ficam em uma camada própria, abaixo do cabeçalho: o menu do site abre por cima delas.

## D-98. O guia é um personagem fictício, e as pessoas retratadas não falam

**Decisão (jogo, etapa 1).** Quem orienta o jogador é o Arquivista, identificado como personagem fictício na entrada do jogo e no diálogo dele. Os personagens de Lula e de Flávio Bolsonaro não têm fala, balão nem pensamento. Concluir um capítulo não gera nota, vitória nem elogio.

**Motivo.** As regras editoriais do atlas: declaração tem autor, e nada é atribuído a quem não disse. Um jogo convida a pôr palavras na boca do personagem; aqui isso seria inventar fala de pessoa real. O progresso é de quem joga, e não uma avaliação da pessoa retratada.

**Consequência.** O cenário é apresentado como representação (D-101). Os dois personagens têm o mesmo cartão, o mesmo número de capítulos, as mesmas mecânicas e o mesmo cuidado de desenho, em ordem alfabética, sem cor nem símbolo de partido.

## D-99. A entrada do atlas aponta para o jogo, e a entrada do jogo é `/jogo/`

**Decisão (jogo, etapa 1).** A escolha de personagem com a prévia do mundo fica em `/jogo/`. A entrada do atlas mantém os dois cartões de perfil, que levam à exploração, e ganhou, logo abaixo de cada um, o acesso **Jogar com**, do mesmo tamanho para os dois e na primeira tela nas quatro larguras. O menu ganhou o item **Jogo**.

**Motivo.** A entrada do atlas foi medida e ajustada na fase 8, e os cartões são o acesso às fichas, que tem de continuar à mão. Pôr a prévia do jogo nela traria o código de desenho para a primeira tela do site.

**Consequência.** Quem chega pela entrada do atlas está a um clique da cena, e a dois da entrada do jogo. Tornar a própria entrada do atlas a escolha de personagem do jogo é uma decisão de produto que fica em aberto para o responsável.

## D-100. A fronteira entre capítulos só fica onde as datas decidem

**Decisão (jogo, etapa 1).** Todo registro de um capítulo é anterior, sem ambiguidade de data, a todo registro do capítulo seguinte. Dois registros cuja ordem as datas não decidem ficam no mesmo capítulo, e o de data menos precisa leva o aviso que já leva na lista do atlas ("ordem dentro de 1980 não documentada"), no registro recolhido e no painel. A regra do aviso é a mesma função, movida para o domínio (`findUndeterminedOrder`).

**Motivo.** A revisão independente do código achou o caso: a prisão de 1980, só com o ano, fechava o capítulo 1 de Lula, e a fundação do PT, de 10 de fevereiro de 1980, abria o 2. Quem jogava pelo cenário saía com a sequência prisão e depois fundação, que o conteúdo não sustenta, e a ressalva só existia no painel. Avançar de capítulo é dito pelo jogo como passar a um período seguinte; a fronteira afirma ordem, queira o texto ou não. É a D-54 aplicada ao jogo.

**Consequência.** A fundação do PT passou para o capítulo 1, junto da prisão, e o capítulo 2 de Lula começa em 1986. `tests/game-chapters.test.ts` confere todos os pares entre capítulos vizinhos e a marca de ordem em aberto contra o conteúdo real. Um capítulo novo que quebre a regra não passa no teste.

## D-101. O nome do lugar é sempre dito como cenário, na própria página do jogo

**Decisão (jogo, etapa 1).** O nome do lugar aparece com o rótulo "cenário" no alto da cena, na transição e no painel. A frase "O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele" está no diálogo do guia e no rodapé da página de cada personagem, além da entrada do jogo.

**Motivo.** O acesso **Jogar com**, da entrada do atlas, leva direto à página do personagem, e a ressalva só existia na entrada do jogo. Ao lado do período, "Plenário do Senado" lia como o lugar e a época do fato, contra a regra de lugares do atlas (o lugar é o do fato documentado).

**Consequência.** Os capítulos foram agrupados para o cenário não contradizer os registros mais do que uma representação contradiz: as eleições disputadas como deputado estadual ficam no salão da Assembleia, e o plenário do Senado começa com a eleição para o Senado. O que sobra de distância (uma disputa presidencial de 1994 no plenário da Constituinte) é o que a frase cobre. Um teste de navegador confere a frase e o rótulo.

## D-102. O registro lido no jogo leva a situação da revisão

**Decisão (jogo, etapa 1).** O registro recolhido mostra a mesma nota das outras leituras do atlas: conferido com as fontes, com assistência de IA, e revisão humana pendente. A entrada do jogo e o rodapé da página do jogo repetem a frase da edição, com o caminho para a metodologia.

**Motivo.** A regra do projeto é mostrar a nota em toda leitura de um registro (D-22). O jogo era a única que a omitia, e quem chega pelo menu ou por link direto leria os resumos sem saber que nenhuma pessoa os revisou.

**Consequência.** O recorte do jogo leva o campo editorial de cada registro, sem as observações internas. Um teste confere que nenhum registro do jogo diz ter revisão humana.

## D-103. Uma figura por personagem, a de hoje

**Decisão (jogo, etapa 1).** Cada personagem tem a mesma figura em todos os capítulos, a de hoje. Ela não acompanha a idade de cada período, e a entrada do jogo diz isso.

**Motivo.** O pedido é uma aparência reconhecível, com o mesmo cuidado para os dois. A figura de hoje é a que mais se reconhece, e desenhar bem uma figura por década, para os dois, é mais do que esta etapa comporta.

**Consequência.** Um capítulo de 1975 mostra o personagem como ele é desenhado para 2026. É uma convenção do jogo, e não uma afirmação sobre a aparência da pessoa na época. Figuras por período ficam para quando os capítulos cobrirem décadas diferentes com cenários próprios.

## D-104. O jogo não derruba a página quando algo falha

**Decisão (jogo, etapa 1).** O palco e a prévia do mundo ficam atrás de uma fronteira de erro. Se o pacote do palco não chega, aparece no lugar da cena um aviso com o botão de recarregar, e o cabeçalho, o objetivo e o painel **Capítulos e tarefas** continuam funcionando. Se o da prévia não chega, a entrada do jogo fica com o fundo do cartão.

**Motivo.** Um pacote carregado à parte pode faltar: a rede cai depois do HTML, ou uma publicação nova troca os arquivos com a página aberta. Sem a fronteira, o Next trocava a página inteira pelo erro padrão, em inglês, e sumia justamente o caminho sem o cenário.

**Consequência.** É a regra do mapa (D-64) aplicada ao jogo. `tests/export/jogo.spec.ts` derruba cada pacote na saída estática e confere que a tarefa ainda pode ser cumprida pelo painel.

## D-105. O personagem contorna a quina, e o celular deitado tem o palco inteiro

**Decisão (jogo, etapa 1).** Quem anda reto por um corredor e roça a quina de um obstáculo é desviado para o lado livre, até o corpo passar; de frente para o obstáculo, para. Em celular deitado, o palco deixa o mínimo de altura e cabe na janela, e o que fica sobre a cena encolhe.

**Motivo.** Os corredores dos cenários têm uma célula de largura, e a colisão por eixo prendia o personagem na quina de uma bancada, o que pede uma precisão que o direcional de toque não tem. Com o celular deitado, o palco ficava mais alto que a janela, e o direcional e o botão de ação, presos à base dele, abriam cortados.

**Consequência.** O desvio vale só para movimento reto em um eixo do mundo, com tolerância de um quarto de célula; na diagonal, cada eixo segue a própria regra. Os dois casos têm teste, de regra e de navegador.

## D-106. O que é fixo na cena é desenhado uma vez

**Decisão (jogo, etapa 1).** As paredes de trás com o piso e os detalhes de chão, os parapeitos da frente e cada objeto parado são desenhados uma vez, em telas à parte, e copiados a cada quadro. Só o que se move é redesenhado: o personagem, o guia, os registros, a porta, a bandeira, a planta e os efeitos.

**Motivo.** A arte final tem milhares de traços por cena. Uma medição de bancada, feita depois de a arte ficar pronta, mostrou a cena a cerca de 18 quadros por segundo no Chromium com a placa de vídeo, em 1440×835: o custo não era o do código, de 2 ms por quadro, e sim o de o navegador rasterizar tudo de novo. Com as telas prontas, a mesma cena ficou entre 55 e 60 quadros por segundo.

**Consequência.** Os parapeitos e o portal da saída vão todos depois do que está dentro da sala, em vez de entrarem na ordem de profundidade: ficam na borda, e nada de dentro passa na frente deles. As telas são refeitas quando a escala muda e liberadas quando saem de uso; sem elas, a cena é desenhada direto. O desenho com as telas e o desenho direto foram comparados pixel a pixel. A medição foi feita fora do projeto, nesta máquina; as páginas do jogo continuam fora das medições de [PERFORMANCE.md](PERFORMANCE.md).

## D-107. O toque age ao encostar, e as janelas esperam um instante

**Decisão (jogo, etapa 1).** O botão de ação de toque age dentro do próprio `touchstart`, que é cancelado no mesmo passo. As janelas do jogo não aceitam toque nem clique por 350 ms ao abrir. O teclado não espera.

**Motivo.** A revisão independente achou o defeito mais sério da etapa, e um teste com toque de verdade o confirmou: em celular em pé, a janela do registro abre embaixo, e o botão que a fecha aparece onde estava o botão de ação. O clique que o navegador gera quando o dedo levanta caía nesse botão, e o registro fechava sem ser lido. Agir no `pointerdown` e cancelar o `touchstart` não bastava: a ação tira o botão do documento, e o `touchstart` chegava a um botão já sem ouvinte.

**Consequência.** Dá para andar com um dedo e agir com outro, o que agir no clique não permitiria. A espera das janelas cobre o segundo toque dado por reflexo e os navegadores em que o cancelamento não valer. O teste de celular usa um toque de verdade e confere que a janela continua aberta. Nenhum aparelho real foi usado.

A espera vale também para o mouse: um clique dado nos primeiros 350 ms de uma janela não faz nada. Para o robô dos testes isso tem um efeito à parte: o Playwright repete o clique barrado rolando a página de outros jeitos, e a página termina rolada. Com o mouse de verdade e pelo teclado ela não rola (medido). O roteiro de capturas espera a janela aceitar o clique antes de clicar, e recusa captura com a página rolada.

## D-108. Uma tecla segurada não atravessa a troca de tela

**Decisão (jogo, etapa 1).** A repetição do teclado de uma tecla que já estava apertada quando uma janela abriu, fechou ou trocou é descartada, até a tecla soltar. A saída aberta, ao alcance, é atravessada também pela tecla e pelo botão de interação.

**Motivo.** Com a tecla ainda apertada, a repetição caía no botão que acabara de receber o foco: o Enter que recolhia um registro fechava o registro, e a seta com que se entrava na saída rolava a página durante a transição, deixando o capítulo seguinte com o objetivo fora da tela. A dica "Atravessar a saída", com a tecla ao lado, não fazia nada.

**Consequência.** Há um ouvinte de teclado na janela enquanto a página do jogo está aberta, só para descartar essa repetição: o jogo continua sem reagir a teclas fora da cena (D-97). Os dois casos têm teste de navegador.

## D-109. A saída abre com todos os registros recolhidos, e não só com a tarefa

**Decisão (jogo, etapa 1, em 10 de outubro de 2026).** A saída de um capítulo abre com duas condições juntas: a tarefa cumprida e todos os registros do capítulo recolhidos (`isExitOpen`, em `src/lib/game/mission.ts`). Antes, abria assim que a tarefa era cumprida. A tarefa continua a mesma (D-93): encontrar o registro pedido ou pôr dois em ordem. A regra vale na cena, na tecla de interação, no painel e no progresso salvo.

**Motivo.** Pedido do responsável pelo projeto, depois de ver a primeira entrega rodando: a porta só pode abrir depois de todos os documentos recolhidos. Na primeira entrega ela abria com a tarefa cumprida, e as outras pastas podiam ficar no chão. Com a regra, ninguém passa de um capítulo sem ter aberto todos os registros dele.

**Consequência.** Há dois estados que antes não existiam, cada um com a sua frase: a tarefa cumprida com registros por recolher ("Tarefa concluída. Faltam N registros para a saída abrir.") e todos os registros recolhidos com a ordem por responder ("falta a tarefa"). A contagem "Registros: n de total" fica sempre à vista sobre a cena; a janela do registro, a da saída fechada, o guia e o painel dizem o que falta. Na tarefa de ordem, em que recolher tudo não basta, a contagem diz "a saída abre com todos e a ordem certa"; com os dois registros da tarefa recolhidos, a cena diz onde responder, e a janela da saída fechada leva à pergunta. O painel só oferece **Atravessar a saída** com ela aberta. O objetivo de cada capítulo continua dizendo só a tarefa.

Um capítulo só consta como concluído com a saída aberta, e isso vale para o que foi salvo. Um progresso guardado pela regra anterior, com um capítulo concluído sem todos os registros, é acertado na leitura: o capítulo volta a disponível, com o que já foi recolhido, e os seguintes recomeçam. O formato salvo não mudou, e a versão continua 1.

Recolher tudo leva mais tempo: as jornadas de teste pelo cenário passaram a andar por todos os registros de cada capítulo.

## D-110. Um registro recolhido pode ser lido de novo pelo painel

**Decisão (jogo, etapa 1, em 10 de outubro de 2026).** No painel **Capítulos e tarefas**, cada registro recolhido tem o botão **Ler de novo**, que abre a mesma janela do registro, sem mexer no progresso e sem os avisos de tarefa e de saída. Fechar volta ao painel.

**Motivo.** Com a D-109, um capítulo concluído tem todos os registros recolhidos, e a pasta recolhida some da cena. Sem a releitura não haveria, no jogo, como voltar ao texto de um registro nem chegar à ficha dele ao rever um capítulo. Antes, isso se fazia recolhendo um registro que tinha ficado para trás, o que a regra nova não deixa existir em capítulo concluído.

**Consequência.** O caminho "rever um capítulo, ir à ficha de um registro e voltar ao capítulo que se revia" continua existindo, agora pela releitura, com teste de navegador. Como há um botão por registro, cada um leva no nome o título do registro, e na volta de uma releitura o foco fica no botão do registro lido, que a janela traz à vista sem rolar a página.

## D-111. Uma figura de cada personagem por época, estilizada e com a mesma escala para os dois

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** Cada personagem jogável tem três figuras, uma por época dos capítulos (`Epoca`: primeiros anos, anos intermediários, anos recentes), que mudam cabelo, barba e roupa sobre o mesmo esqueleto, o mesmo rosto e o mesmo ciclo de caminhada. Lula: camisa de mangas dobradas com cabelo e barba escuros; terno com cabelo e barba grisalhos; terno com a barba branca. Flávio Bolsonaro: terno cinza sem barba; a barba rente; fios mais claros e terno escuro. Cada capítulo declara a época (`ChapterSpec.epoca`), e os dois personagens passam pelas três, em ordem. O cabeçalho da cena, a transição, o painel e o guia dizem qual figura é e que ela é estilizada: não afirma a aparência real da pessoa em cada data. Supera a D-103.

**Motivo.** Com capítulos de 1975 a 2026, a figura única de hoje em todos os períodos era um anacronismo dito na entrada. A variação por época é a solução pedida para a versão de lançamento, com a condição de não inventar aparência: as mudanças são as mais estilizadas possíveis (cor de cabelo e barba, presença da barba, roupa), e a frase na interface diz isso.

**Consequência.** `characterArt(personagem, epoca)` substitui `CHARACTERS[personagem]`; a galeria mostra as três figuras de cada um; o corpo ganhou a roupa `camisa`, além do terno e do colete; o rótulo da época (`EPOCA_LABEL`) aparece onde a figura é apresentada. Um teste confere que cada personagem tem figura nas três épocas e que as épocas seguem a ordem dos capítulos.

## D-112. A arte do ambiente separada da cena

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** Uma cena (`SceneId`) é o layout de um capítulo: mapa, objetos, paleta e posições. Uma arte (`SceneArtId`, em `src/features/game/draw/arts/`) é o que desenha piso, paredes, porta e materiais. Cada cena aponta a arte que a desenha, e duas cenas podem dividir uma arte com paleta e disposição próprias. Os períodos novos ganharam cinco artes novas (comitê de campanha, sala de audiências, gabinete, sala de comissão, auditório de convenção), e não a aparência dos quatro ambientes da etapa 1.

**Motivo.** Na etapa 1 a arte era escolhida pelo identificador da cena, espalhada por vários arquivos (paredes, piso, porta, materiais e até os objetos perguntavam "é o sindicato?"). Sete cenas novas com cinco ambientes diferentes não cabiam nisso, nem permitiam trabalho em paralelo sem conflito. Com um arquivo por arte e um registro único, cada ambiente é uma unidade, e os objetos escolhem material pela receita (`rustico`, `frio`), e não pelo nome da cena.

**Consequência.** `CellInfo` leva a cena e a arte; `scene-walls.ts`, `scene-floor.ts`, `scene-exit.ts` e `props.ts` desenham com o que a arte diz; os kits compartilhados (`wall-kit.ts`, `floor-kit.ts`, `floors.ts`, `exit-kit.ts`, `door-leaves.ts`) expõem o plano e as formas. As paletas saíram de um arquivo único e ficam na própria cena. Entraram cinco objetos novos (balcão, cartaz, tela, fileira, sofá). Um teste confere o registro: toda cena aponta uma arte, toda arte é usada, e duas cenas da mesma arte têm paletas diferentes.

## D-113. Duas mecânicas novas: o documento que sustenta e o lugar documentado

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** Além de encontrar um registro e de pôr dois em ordem, há a tarefa de **documento** (`fonte`: recolher o registro pedido e indicar, entre três documentos, o que o sustenta) e a de **lugar** (`lugar`: indicar, entre três lugares, o que o atlas documenta para o registro). As opções saem dos próprios registros: o documento certo é o primeiro que o registro cita (qualquer citado conta como certo), e as erradas são documentos de outros registros do capítulo não citados pelo pedido; o lugar certo é o da ficha, e os errados são lugares de outros registros da trajetória. A ordem das opções é fixa e não deixa a certa sempre em primeiro. Errar explica (de qual registro é o documento ou o lugar escolhido, com a data) e deixa tentar de novo, sem penalidade. Cada trajetória tem pelo menos três tipos de tarefa, nunca dois iguais seguidos, e os quatro tipos aparecem no jogo.

**Motivo.** As duas mecânicas pedidas para o lançamento são as que ensinam o que o atlas é: cada registro tem documentos que o sustentam e um lugar documentado ou uma abrangência. Montar as opções a partir dos registros garante que o jogo não escreve alternativa nenhuma e que a resposta está sempre ao alcance de quem leu o registro recolhido.

**Consequência.** `TaskSpec` ganhou os dois tipos; `TaskState.confirmada` vale para qualquer tarefa com resposta (D-115); `sourceOptions`, `placeOptions`, `submitSource` e `submitPlace` em `mission.ts`, com testes sobre fixtures e sobre o conteúdo real; a janela de escolha (`ChoiceDialog`) e as frases do HUD, do painel, do guia e da saída fechada por tipo de tarefa. O registro recolhido passou a mostrar o lugar documentado e o que cada fonte sustenta, que é onde a resposta está.

## D-114. Ficha judicial por identificador, com a natureza do registro e as decisões relacionadas

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** Os registros de processo (dez na edição) têm, no jogo, uma ficha judicial (`src/lib/game/judicial.ts`): a natureza (denúncia, decisão liminar, condenação, confirmação, prisão, decisão eleitoral, soltura, anulação, rejeição), dita sem equiparar o que é diferente; as decisões relacionadas, por identificador, com a própria data, mesmo de outro capítulo; e o aviso de que o jogo não pede que o jogador decida culpa. Quem alegou, o que a defesa disse, quem decidiu e o desfecho vêm do contexto da ficha do atlas, mostrado inteiro no registro recolhido. Cada relação repete o que o contexto do registro já diz.

**Motivo.** A etapa 1 deixou os episódios judiciais de fora até existir uma apresentação própria (D-92). A regra da versão de lançamento é mostrar, quando documentado, cada passo com a data, relacionar os acontecimentos por identificador e nunca fazer o jogador julgar: as tarefas dos capítulos judiciais são a ordem de duas decisões pelas datas e o documento que sustenta uma decisão.

**Consequência.** Um teste confere que todo identificador da ficha existe na edição e nos capítulos do mesmo personagem, que os textos não têm fala atribuída nem aspas e que a natureza de denúncia, anulação e rejeição diz o que não são. A lista de revisão humana ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)) começa por esses registros.

## D-115. Progresso na versão 2, com migração explícita da versão 1

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** O formato salvo passou à versão 2: o estado da tarefa chama a confirmação de `confirmada`, que vale para a ordem, o documento e o lugar (a versão 1 só tinha `ordemConfirmada`). A leitura aceita a versão 1 e a 2 e devolve sempre a 2; o nome antigo só vale na versão 1, e o novo só na 2. Quem terminou os dois capítulos da etapa 1 reabre o jogo com os dois concluídos e o capítulo 3 disponível.

**Motivo.** A regra do lançamento: mudança de formato só com migração explícita e testada, e os identificadores dos capítulos preservados para o progresso salvo continuar valendo. Os quatro capítulos da etapa 1 mantiveram o identificador, os acontecimentos e a tarefa.

**Consequência.** `PROGRESS_VERSION = 2`, `READABLE_VERSIONS = [1, 2]`; testes de migração em `tests/game-progress.test.ts` (inclusive o progresso da regra antiga da saída, D-109) e no navegador, com um salvo da versão 1 gravado antes de abrir a página.

## D-116. Cobertura completa, matriz gerada e fronteira entre capítulos pela data e pela precisão

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** Todo acontecimento publicado de cada personagem está em um capítulo dele; um acontecimento só pode ficar fora se estiver em `EXCLUSIONS` (`src/lib/game/coverage.ts`) com justificativa escrita, e a lista está vazia. A matriz acontecimento → personagem → capítulo é gerada dos dados (`npm run game:coverage`, [GAME-COVERAGE.md](GAME-COVERAGE.md)) e conferida por teste. A fronteira entre capítulos é decidida pela data e pela precisão de cada par de registros (`datesDecideOrder`), e não mais pelo ano: dois capítulos podem dividir um ano quando as datas têm dia. O acontecimento compartilhado (o primeiro turno de 2026) aparece uma vez na trajetória de cada personagem; a unicidade é por personagem.

**Motivo.** O lançamento exige os 24 acontecimentos restantes em capítulos, sem esconder episódio difícil e sem privilegiar um personagem. A comparação por ano era restritiva demais para fronteiras como fevereiro e dezembro de 2025, e inventar dias para separá-las seria pior.

**Consequência.** Seis capítulos de Lula e cinco de Flávio Bolsonaro, 39 acontecimentos; `tests/game-chapters.test.ts` confere unicidade por personagem, cobertura, fronteiras e as opções das tarefas sobre o conteúdo real; `tests/game-coverage.test.ts` confere o documento gerado.

## D-117. Publicação condicionada: domínio, indexação, prévia e deploy só com decisão

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** `src/lib/site.ts` concentra o que a publicação precisa decidir: o domínio público (`publicUrl`), a liberação da indexação (`indexar`), o canal de correção, o nome e a descrição. Enquanto não há domínio, não há endereço canônico, `metadataBase`, sitemap (vazio) nem imagem na prévia de compartilhamento, e o `robots.txt` bloqueia tudo; com domínio e indexação liberada, `robots.ts` e `sitemap.ts` passam a servir. A imagem da prévia está pronta em `public/share/atlas.png` (`node scripts/share-image.mjs`). O procedimento de publicação está em [DEPLOY.md](DEPLOY.md), e o deploy só acontece com autorização expressa, depois da revisão humana e da validação com pessoas.

**Motivo.** O pedido do lançamento: preparar títulos, descrição, prévia, créditos e canal de correção, com canonical, sitemap e indexação só para o domínio escolhido e a edição liberada, sem serviço nem publicação automática.

**Consequência.** Nada muda no site enquanto os campos ficarem nulos; mudar qualquer um exige build. A metodologia ganhou os créditos do jogo e do MapLibre.

## D-118. Lista de revisão humana gerada dos dados, e a apuração do primeiro turno mantida como parcial

**Decisão (jogo, versão de lançamento, em 10 de outubro de 2026).** [HUMAN-REVIEW.md](HUMAN-REVIEW.md) é gerado por `npm run review:human` (`src/lib/editorial/human-review.ts`): lista, trecho a trecho e por prioridade (episódios judiciais, dados eleitorais, filiações, mandatos, demais), o resumo, o contexto e as fontes de cada registro, com a caixa para a pessoa que conferir assinar. O código nunca registra revisão como humana. O registro do primeiro turno de 2026 continua com a apuração parcial divulgada pelo TSE (99,99% das urnas), e os textos do jogo a chamam de apuração parcial; a totalização final só entra por uma edição nova de conteúdo, com documento oficial lido e `alteracoes` registradas. A data de corte continua 8 de outubro de 2026.

**Motivo.** A política editorial condiciona a publicação à revisão humana, e o pedido do lançamento exige a lista objetiva do que precisa de olho humano e a proibição de renomear a apuração parcial como resultado definitivo.

**Consequência.** Testes conferem que a lista cita todo registro e toda fonte, que começa pelos episódios judiciais e que o documento está em dia; e que nenhum texto do jogo chama o primeiro turno de resultado final.

## D-119. A confirmação de uma tarefa leva a assinatura da tarefa respondida (progresso na versão 3)

**Decisão (auditoria externa de 10 de outubro de 2026, achado A-04).** O estado salvo de uma tarefa com resposta confirmada guarda a assinatura da tarefa respondida, o tipo e os identificadores que ela pede (`taskSignature`, em `src/lib/game/mission.ts`; por exemplo `ordem:a+b`). Na leitura, a confirmação só vale se a assinatura é a da tarefa atual do capítulo; se a tarefa mudou sob os mesmos identificadores de capítulo e de registros, a pergunta é feita de novo, sem apagar o que foi recolhido nem as tentativas. O formato salvo passou à versão 3. As versões 1 e 2, que não guardavam a assinatura, migram pela tabela congelada do que cada capítulo pedia naquela versão (`LEGACY_SIGNATURES`, em `src/lib/game/progress.ts`): a confirmação só migra se a tarefa continua a mesma de então. A tabela não acompanha mudanças futuras dos capítulos, de propósito.

**Motivo.** A auditoria reproduziu, na função pura, uma confirmação de tarefa de ordem concluindo uma tarefa de documento que tinha os mesmos identificadores: a validação conferia os registros presentes e a necessidade de resposta, não a identidade da tarefa respondida. A versão do formato é do armazenamento, e não da tarefa; faltava dizer explicitamente o que invalidar quando a tarefa muda.

**Consequência.** Testes de regra com o caso reproduzido pela auditoria, com a migração das versões 1 e 2 (com e sem o capítulo na tabela) e com a ida e volta por JSON; o teste no navegador que grava um progresso da versão 1 continua. Os roteiros de teste e de captura que semeiam progresso gravam a assinatura. Acrescentar um capítulo não mexe na tabela; mudar a tarefa de um capítulo existente invalida as confirmações antigas dele, e é isso que se quer.

## D-120. Barreira de release separada da validação do build

**Decisão (auditoria externa de 10 de outubro de 2026, achado A-02).** `npm run verify:release` (`scripts/verify-release.mts`, sobre `src/lib/editorial/release.ts`) recusa a publicação enquanto houver registro factual sem revisão humana, ou domínio público e canal de correção sem valor em `src/lib/site.ts`, e avisa, sem recusar, quando a indexação está desligada e quando não há arquivo LICENSE. `checkPublication` continua aceitando `revisado` de qualquer tipo, para o build de desenvolvimento seguir com o conteúdo em conferência. [GAME-RELEASE.md](GAME-RELEASE.md) e [DEPLOY.md](DEPLOY.md) passaram a dizer a mesma coisa: publicar sem revisão humana é uma mudança de política, registrada em [EDITORIAL.md](EDITORIAL.md), e não uma opção do comando. O código continua sem jamais registrar revisão como humana.

**Motivo.** Os documentos divergiam (um sugeria publicar com aviso se a revisão não acontecesse; o outro condicionava a publicação à revisão), e não havia barreira específica de release: `noindex` bloqueia indexação, não impede hospedar e acessar os arquivos.

**Consequência.** Hoje a barreira recusa a release, de propósito: 64 registros sem revisão humana, domínio e canal pendentes, mais os dois avisos. Testes de regra cobrem o que bloqueia e o que só avisa, sobre as fixtures sintéticas.

## D-121. Verificação contínua no GitHub, sem publicação

**Decisão (auditoria externa de 10 de outubro de 2026, achado A-07).** `.github/workflows/verificacao.yml` roda, a cada push na `main` e a cada pull request, `npm ci`, `npm run check`, as suítes sobre a exportação (`test:export`, `test:journeys`), a passagem de acessibilidade e a conferência da matriz de cobertura e da lista de revisão; em trabalho separado, as jornadas no servidor de desenvolvimento (`test:e2e`). Os resultados dos testes ficam como artefato quando algo falha. Nada ali publica: o deploy continua manual e condicionado à autorização.

**Motivo.** O projeto tinha bons comandos locais e nenhum fluxo versionado que os repetisse a cada mudança; a suíte de desenvolvimento, em uma máquina de 8 GB, não terminou na verificação da versão de lançamento. Em um executor do GitHub ela roda sozinha, com memória própria.

**Consequência.** O fluxo foi escrito e não rodou antes do primeiro push que o contém: o primeiro resultado real é o do GitHub, e o que ele apontar é a próxima correção. A regra fixa da MilWeb não muda: commit e push antes de qualquer deploy, e deploy só com pedido.

## Pontos em aberto

| Tema | Decide-se em |
|---|---|
| Comando de promoção de rascunhos e verificador de evidências (D-36) | Quando o volume de conteúdo pedir |
| Exigir revisão humana como condição de publicação | A fase 9 refez a conferência com IA e deixou o roteiro pronto ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md)). A decisão de publicar sem ela é do responsável pelo projeto, na fase 10 |
| Canal público de correção (D-70) e quem assina a revisão humana | Decisão do responsável pelo projeto |
| Passos de `scripts/finalize-export.mjs` (D-77): rever a cada atualização do Next ou do MapLibre | Quando a versão mudar |
| Nome definitivo do atlas (o rodapé diz "nome provisório") | Decisão do responsável pelo projeto |
| Exibir em cinza e recortado o retrato cuja condição de uso é "livre com crédito" (D-42) | Decisão do responsável pelo projeto |
| Política de segurança de conteúdo que permita o trecho de script da D-83 | Fase 10 |
| Fechar a leitura criando entrada no histórico ou voltando nele (D-50) | Depois da validação com pessoas, que está pendente ([USER-VALIDATION.md](USER-VALIDATION.md)) |
| Domínio público, endereço canônico, `metadataBase` e sitemap (D-69) | Fase 10 |
| Mostrar a natureza de cada fonte nas páginas, com um campo novo no conteúdo (D-71) | Quando a edição pedir |
| Rótulos da base do mapa, com glyphs locais (D-58) | Quando uma edição pedir nomes de estados ou de países |
| Contorno mundial, para lugares fora da América do Sul (D-62) | Quando o conteúdo tiver o primeiro lugar fora da área |
| Peso do MapLibre na vista do mapa em rede lenta (D-76) | Sem saída dentro do pacote; reavaliar se a base mudar |
| Tratamento do retrato quando o navegador não tem WebP (D-74) | Não apareceu nos navegadores conferidos na fase 9. Reavaliar se a validação com pessoas mostrar esse caso |
| Texto legível sob a hachura do período, na comparação (D-88) | Revisão de design, se a validação com pessoas mostrar dificuldade |
| Conferência das fontes como comando do projeto ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), pendência 6) | Quando o conteúdo passar a ser atualizado com frequência |
| Firefox e Safari nas jornadas ([QA.md](QA.md)) | Fase 10, antes de publicar |
| A entrada do atlas como escolha de personagem do jogo (D-99) | Decisão do responsável pelo projeto |
| Jogo em aparelho real, com leitor de tela e em outros navegadores | Antes de publicar ([USER-VALIDATION.md](USER-VALIDATION.md)) |
| Atualizar o primeiro turno de 2026 com a totalização final do TSE (D-118) | Decisão do responsável pelo projeto, por uma edição nova de conteúdo |
| Domínio público, indexação e autorização do deploy (D-117) | Decisão do responsável pelo projeto ([DEPLOY.md](DEPLOY.md)) |
| Som no jogo | Depois do lançamento |
| Escopo de propostas, projetos legislativos, votos e posicionamentos (auditoria externa de 10/10/2026, achado A-01): o atlas e o jogo cobrem os 39 acontecimentos cadastrados, e a política editorial exclui opinião e declaração isolada; um produto que prometa "todas as propostas" exige contratos, fontes e política novos, para os dois personagens ou com o recorte declarado | Decisão do responsável pelo projeto, antes de qualquer código |
| Licença do código (auditoria, achado A-10): não há arquivo LICENSE, e `npm run verify:release` avisa | Decisão do responsável pelo projeto |
| Links permanentes para capítulo, separação dos diálogos do `GameShell` e sincronia entre abas (auditoria, P2) | Quando o jogo ganhar novos modos |
