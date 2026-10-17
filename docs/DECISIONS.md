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

**Revista em 11 de outubro de 2026 (D-130).** Os capítulos seguintes a um que reabre voltam a bloqueados, mas não recomeçam: guardam o que foi recolhido e respondido, e voltam a concluídos quando o capítulo que reabriu é refeito.

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

**Revista em 11 de outubro de 2026 (D-130).** A assinatura passou a incluir um resumo dos dados que decidem a resposta: uma correção de conteúdo sob os mesmos identificadores também reabre a pergunta. Os progressos salvos com a assinatura antiga continuam valendo, e são regravados na forma nova.

## D-120. Barreira de release separada da validação do build

**Decisão (auditoria externa de 10 de outubro de 2026, achado A-02).** `npm run verify:release` (`scripts/verify-release.mts`, sobre `src/lib/editorial/release.ts`) recusa a publicação enquanto houver registro factual sem revisão humana, ou domínio público e canal de correção sem valor em `src/lib/site.ts`, e avisa, sem recusar, quando a indexação está desligada e quando não há arquivo LICENSE. `checkPublication` continua aceitando `revisado` de qualquer tipo, para o build de desenvolvimento seguir com o conteúdo em conferência. [GAME-RELEASE.md](GAME-RELEASE.md) e [DEPLOY.md](DEPLOY.md) passaram a dizer a mesma coisa: publicar sem revisão humana é uma mudança de política, registrada em [EDITORIAL.md](EDITORIAL.md), e não uma opção do comando. O código continua sem jamais registrar revisão como humana.

**Motivo.** Os documentos divergiam (um sugeria publicar com aviso se a revisão não acontecesse; o outro condicionava a publicação à revisão), e não havia barreira específica de release: `noindex` bloqueia indexação, não impede hospedar e acessar os arquivos.

**Consequência.** Hoje a barreira recusa a release, de propósito: 64 registros sem revisão humana, domínio e canal pendentes, mais os dois avisos. Testes de regra cobrem o que bloqueia e o que só avisa, sobre as fixtures sintéticas.

## D-121. Verificação contínua no GitHub, sem publicação

**Decisão (auditoria externa de 10 de outubro de 2026, achado A-07).** `.github/workflows/verificacao.yml` roda, a cada push na `main` e a cada pull request, `npm ci`, `npm run check`, as suítes sobre a exportação (`test:export`, `test:journeys`), a passagem de acessibilidade e a conferência da matriz de cobertura e da lista de revisão; em trabalho separado, as jornadas no servidor de desenvolvimento (`test:e2e`). Os resultados dos testes ficam como artefato quando algo falha. Nada ali publica: o deploy continua manual e condicionado à autorização.

**Motivo.** O projeto tinha bons comandos locais e nenhum fluxo versionado que os repetisse a cada mudança; a suíte de desenvolvimento, em uma máquina de 8 GB, não terminou na verificação da versão de lançamento. Em um executor do GitHub ela roda sozinha, com memória própria.

**Consequência.** O fluxo foi escrito e não rodou antes do primeiro push que o contém: o primeiro resultado real é o do GitHub, e o que ele apontar é a próxima correção. A regra fixa da MilWeb não muda: commit e push antes de qualquer deploy, e deploy só com pedido.

## D-122. Decisões políticas no modelo: três naturezas, seis coleções, formato gerado 2

**Decisão (histórico de votos e Escrivão, entrega P0, 10 de outubro de 2026).** O conjunto ganhou seis coleções factuais, com estado editorial e a mesma régua de evidência das demais: `proposicoes`, `votacoes`, `votos`, `atosExecutivos`, `coberturaPolitica` e `identidadesInstitucionais` ([DATA_MODEL.md](DATA_MODEL.md), seção Decisões políticas). O modelo separa três naturezas que não se confundem: o voto parlamentar (manifestação individual em uma votação identificada, com o objeto votado), o ato do Executivo (sanção, veto, medida provisória, decreto, iniciativa, cada tipo com campos próprios) e a participação como autoria ou relatoria, que fica fora desta entrega. O voto só existe com documento, em três tipos (`voto-individual`, `ausencia-documentada`, `nao-votou-documentado`), sempre com o valor original do acervo; a falta de linha nunca vira ausência. O mandato ganhou o campo opcional `casa`, que dá a competência. O formato dos dados gerados passou a 2, e a leitura recusa a saída anterior. O conteúdo continua em JSON versionado: nenhum banco entra só para cadastrar decisões.

**Motivo.** O relatório de arquitetura e narrativa de 10 de outubro pediu um histórico de decisões comparável entre os dois perfis, com as distinções que a documentação da Câmara e do Senado exigem (objeto votado, orientação de bancada, ausentes não listados) e as da Constituição (sanção e veto para leis; promulgação pelas Mesas para emendas). O modelo anterior tinha pessoas, mandatos, filiações e acontecimentos; "acrescentar um arquivo de votos sem estender o contrato não basta", porque as coleções são listas explícitas em várias camadas.

**Consequência.** Schemas, integridade, validação com diagnósticos próprios (`mandato-de-outra-pessoa`, `fora-do-mandato`, `competencia-nao-confirmada`, `casa-diferente`, `voto-repetido`, `retificacao-incoerente`), seleção publicável, importação, índices, recorte por pessoa, barreira de release e fixtures sintéticas cobrem as seis coleções; 43 testes novos. As telas do atlas e o jogo ainda não mostram decisões: isso é a entrega P1.

## D-123. A consulta comparativa responde cinco coisas, pela competência do mandato e pela cobertura da pesquisa

**Decisão.** `resolveParticipation` (`src/lib/data/participation.ts`) devolve um resultado discriminado para uma pessoa em uma votação: `registro`, `nao-se-aplica`, `competencia-nao-confirmada`, `sem-registro-individual` ou `pesquisa-pendente`. A competência vem das datas documentadas do mandato na casa da votação (`competenceOf`, a mesma regra de períodos da exploração: limite desconhecido nunca vira data). A diferença entre "sem registro individual" e "pesquisa pendente" vem da cobertura da pesquisa: só com um acervo consultado por inteiro para a pessoa, o tema e a data (estado `completa`) a falta de linha é uma afirmação sobre o material; antes disso é limitação do conjunto. Votação simbólica ou secreta nunca tem registro individual.

**Motivo.** Um booleano, ou um `null` com vários sentidos, faria a interface tratar "não procuramos" como "não votou". A política editorial não permite essa inferência, e o jogo não pode pedir que o jogador a faça.

**Consequência.** A interface, quando mostrar decisões, mostra o motivo de cada resposta sem voto, com as palavras de `PARTICIPACAO_EXPLICACOES`. Para o conteúdo real, os mandatos precisam ganhar `casa` (uma edição de conteúdo, com as fontes que já têm) antes de a consulta responder algo além de "competência não confirmada".

## D-124. Importação de decisões: captura bruta, adaptador por provedor, rascunho sempre

**Decisão.** `npm run importar:decisoes` (`scripts/importar-decisoes.mts`) é o único comando do projeto que consulta a rede. Ele guarda cada resposta como captura em `research/capturas/` (URL, instante, status, bytes, resumo SHA-256), normaliza pelo adaptador do provedor (`src/lib/import/senado.ts`, `src/lib/import/camara.ts`, funções puras testadas sobre amostras reais) e entrega o pacote ao mesmo caminho de `data:import`: tudo entra como rascunho, com a pendência do que conferir, e a revisão feita na origem não é aceita. O build nunca consulta rede. Os adaptadores não deduzem: sem a linha da pessoa não há voto; o tema fica vazio; o objeto votado é lido das palavras do acervo como primeira leitura, a conferir na ata.

**Motivo.** O que a pesquisa dos contratos mostrou em 10 de outubro: o Senado cobre o mandato inteiro desde 2019 pelo webservice (o limite de 12 meses é só do CSV), com as siglas de comparecimento documentando ausência e não voto; a Câmara não tem endpoint por deputado, limita a janela a três meses, não lista ausentes e só tem votos individuais a partir de 2001, de modo que a legislatura de 1987 a 1991 de Lula e a Constituinte não têm registro individual no acervo; a Alerj só tem votações simbólicas nas amostras; o Planalto serve leis e mensagens de veto em HTML estático e bloqueia o portal com desafio de JavaScript. Uma importação que inferisse ausência ou posição nesses casos escreveria o que o documento não diz.

**Consequência.** Capturas e pacotes ficam em `research/`, fora do que o pipeline lê. Atos do Executivo são cadastro à mão por enquanto. O primeiro recorte real (um trimestre do Senado, 10 votações e 10 votos de Flávio Bolsonaro, em simulação) passou de ponta a ponta sem rejeição; nada foi gravado nos rascunhos ainda, porque a seleção do recorte e os critérios são decisão editorial da entrega P1.

## D-125. Salas do jogo: a investigação e os temas, com progressão própria

**Decisão (entrega P1, 10 e 11 de outubro de 2026).** O jogo ganhou salas (`RoomId`, `src/lib/game/rooms.ts`): **Histórico**, a sala de investigação, com a trajetória em capítulos por período, e as salas temáticas **Economia** e **Segurança pública**, com as decisões documentadas de cada tema, um capítulo por personagem. A sala é o que o jogador escolhe na entrada e o que agrupa a progressão (bloqueado, disponível, concluído, dentro de cada sala); não é a cena (`SceneId`, o layout de um capítulo) nem uma categoria do atlas, e nenhuma delas é "tema político" por si: Histórico é investigação. Cada sala temática tem rota própria (`/jogo/<personagem>/<sala>/`); a sala Histórico continua em `/jogo/<personagem>/`. Um progresso só por personagem guarda todas as salas; a leitura reaplica a regra por sala.

**Motivo.** O recorte decidido pelo responsável pelo projeto: dois temas, Histórico como sala de investigação, as trajetórias e a progressão existentes preservadas. Pôr as decisões de 2023 a 2026 na fila da trajetória quebraria a regra de que todo registro de um capítulo é anterior ao do seguinte; uma sala à parte mantém a regra onde ela faz sentido e dá às decisões o próprio percurso.

**Consequência.** Entrada do jogo com as salas de cada personagem; painel, HUD, transição e fim dizem a sala; os dois personagens têm as mesmas três salas, com as mesmas regras (teste). As cenas das salas temáticas reaproveitam as artes do gabinete e da sala de comissão, com paletas próprias (D-112). Uma decisão ligada a um acontecimento da trajetória aparece também no capítulo dele (a sala Histórico tem a missão documental); a matriz de cobertura mostra os dois lugares.

## D-126. A tarefa de decisão em duas etapas, e o que mudou nos capítulos

**Decisão.** A quinta tarefa, `decisao`, pede o registro de uma decisão (voto ou ato) e duas respostas sobre ele: primeiro o documento que o sustenta (a evidência, pelas mesmas opções da tarefa de documento, agora sobre acontecimentos e decisões do capítulo), depois a interpretação do que o registro documenta: a manifestação e o objeto votado, no voto; o tipo do ato, no ato. As opções da interpretação vêm do próprio cartão e trocam uma coisa só (a posição ou o objeto; dois tipos de ato com que o tipo certo se confunde). A etapa da evidência fica no progresso (`evidencia`, formato 4) e só vale com a decisão recolhida e a tarefa ainda de decisão; a confirmação continua presa à assinatura (D-119). Errar explica e deixa tentar de novo, sem penalidade; a saída continua exigindo todos os registros.

Na trajetória, o capítulo 5 de Lula ganhou o Decreto nº 11.377/2023 (a decisão do acontecimento da intervenção) e a tarefa de decisão; o capítulo 4 de Flávio Bolsonaro ganhou o voto no PL 2.253/2022 (o projeto que ele relatou) e a tarefa de decisão; o capítulo 5 de Flávio Bolsonaro trocou a ordem pelo lugar (a convenção em São Paulo), para os quatro tipos de antes continuarem na trajetória. As respostas guardadas para essas três tarefas caem na leitura, pela assinatura; o que foi recolhido e as tentativas ficam.

**Motivo.** O relatório pediu uma missão completa, explorar, recolher, conferir a evidência, interpretar e abrir a passagem, em que a resposta certa avalie compreensão documental. Perguntar só "a favor ou contra" ensinaria a ler um rótulo; perguntar o objeto votado e o tipo do ato é o que a política editorial diz ser a leitura correta de um voto e de um ato (EDITORIAL.md, seção Decisões políticas).

**Consequência.** `GameDecision` é o mesmo cartão do atlas (`src/lib/data/decisions.ts`), montado no build; o jogo não escreve fato sobre a decisão. Os textos de definição dos tipos de ato (`ATO_DEFINICOES`) são definições gerais, e não afirmações sobre as pessoas. Testes: `tests/game-decision-task.test.ts`, `tests/game-chapters.test.ts`, as jornadas em `tests/e2e/jogo.spec.ts`.

## D-127. O Escrivão: três camadas, catálogo validado, sem IA na partida

**Decisão.** O guia fictício do jogo passou a se chamar Escrivão em toda a interface (era Arquivista até a versão de lançamento). Ele fala pelo catálogo de `src/lib/game/escrivao/`, em três camadas que a interface separa e marca: a **instrução** (obrigatória, o que fazer agora), a **informação documental** (modelos preenchidos só com campos do registro publicado: data, título, fontes, cargo, instituição, manifestação, tipo do ato) e o **humor** (ficção sobre papelada, carimbos, gavetas e o próprio Escrivão, igual para os dois personagens, que a pessoa pode desligar). As falas existem por sala e por evento (entrada, ajuda, descoberta, fonte, erro, conclusão), com um reserva por evento; a seleção é uma função pura que roda as falas pelo histórico do que já foi dito, sem sorteio; a preferência de humor fica no navegador, fora do progresso. Não há IA durante a partida.

**Motivo.** Humor sobre as pessoas retratadas quebraria a regra de mesmo tratamento e viraria juízo; humor sobre a burocracia e sobre o próprio guia não. A camada documental só pode repetir o conjunto, por isso é um modelo com campos e não um texto livre. Quem não quer humor em um tema sensível desliga, e nada do jogo depende dele.

**Consequência.** `validateCatalog` recusa fala que cite pessoa, partido ou lado, que atribua fala, que traga juízo, data escrita à mão fora da camada documental, travessão ou campo desconhecido, e exige instrução de reserva e humor suficiente por evento; o teste aplica a validação ao catálogo inteiro. As falas aparecem com `role="status"` e a camada dita a quem ouve a página. Teste: `tests/game-escrivao.test.ts`.

**Revista em 11 de outubro de 2026 (D-129).** O humor também fica de fora, sem a pessoa precisar desligar, nos registros de contexto sensível. Desligar o humor tira na hora a camada de humor das falas que já estavam na tela. E só a instrução é anunciada como estado a quem ouve a página, e não as três camadas.

## D-128. A amostra de decisões da edição 0.2.0: recorte, critérios e o que fica fora

**Decisão.** A primeira amostra de decisões publicadas segue o recorte decidido pelo responsável pelo projeto em 10 de outubro de 2026: temas Economia e Segurança pública; de 1º de janeiro de 2023 à data de corte; Flávio Bolsonaro pelas manifestações individuais documentadas no Senado e Lula pelos atos presidenciais com atribuição e alcance documentados; até doze decisões, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem igualar quantidades à força e sem olhar se a decisão favorece ou prejudica alguém. Entraram seis votos nominais e seis atos; quatro proposições têm decisão dos dois. A seleção, os excluídos e as lacunas estão em [../research/selecao-decisoes-2026-10.md](../research/selecao-decisoes-2026-10.md), e a cobertura declarada de cada pessoa e tema diz "amostra, parcial". A interface diz em toda tela de decisões que é amostra, e não histórico completo.

**Motivo.** Um histórico completo de votos de um senador tem centenas de itens e pede uma revisão humana que não existe ainda; uma amostra pequena, documentada e declarada como tal é o que a política editorial permite publicar sem fingir inventário.

**Consequência.** Quem quiser ampliar a amostra segue o mesmo caminho: importar por dia de sessão (`npm run importar:decisoes`), corrigir o objeto votado pela descrição do acervo, classificar o tema com justificativa, criar uma fonte por consulta, promover e registrar em `alteracoes`. O importador passou a ler melhor o objeto ("ressalvados os destaques" não é destaque; a Proposta de Emenda à Constituição não é emenda; a emenda substitutiva é substitutivo), e a cobertura declara as lacunas conhecidas: a votação de 10 de janeiro de 2023 sobre a intervenção no DF não está no webservice para o parlamentar; o PL 1087/2025 não tem votação nominal com registro dele.

**Revista em 11 de outubro de 2026.** O registro da seleção passou a dizer o que comprova e o que não comprova (`research/selecao-decisoes-2026-10.md`, seção A regra aplicada): a amostra ficou com três decisões por pessoa e tema, e a nota de exclusão do Decreto 11.615/2023 mostra que o número de atos já escolhidos no tema pesou ao menos nesse caso, junto com a ligação dos atos escolhidos a outros registros. O registro não diz se a divisão igual foi um alvo. Refazer essa comparação, e manter ou não a divisão, fica para a revisão humana; nada foi trocado na amostra.

## D-129. Contexto sensível: o humor do Escrivão fica de fora em registros de processo, prisão e violência

**Decisão (auditoria de QA de 11 de outubro de 2026).** O humor do Escrivão é suspenso, mesmo com a preferência ligada, nos momentos sobre um registro de contexto sensível. A regra é uma sinalização editorial por registro, a mesma para os dois personagens (`src/lib/game/sensitivity.ts`): os dez episódios da ficha judicial (`judicial.ts`) e uma lista curta de outros registros, hoje três: a prisão de 1980 com base na Lei de Segurança Nacional, o acontecimento da intervenção federal no Distrito Federal em 8 de janeiro de 2023 e o decreto dela. As falas que são do capítulo, e não de um registro (entrada, ajuda e conclusão), seguem o capítulo: ele é de contexto sensível quando a tarefa pede um registro sensível, ou quando mais da metade dos registros é sensível. Hoje são três capítulos: os processos (capítulo 4 de Lula), a anulação e a intervenção (capítulo 5 de Lula) e a denúncia (capítulo 3 de Flávio Bolsonaro). A conclusão que aparece logo depois de recolher um registro sensível também vem sem humor. A instrução e a informação documental não mudam.

**Motivo.** O humor é sobre papelada e sobre o próprio guia, nunca sobre as pessoas; ainda assim, uma piada ao lado de uma condenação, de uma prisão ou de um episódio de violência lê como leveza com o assunto. A auditoria pediu um critério que não dependesse da sala: a sala Histórico tem conteúdo judicial, e filtrar por sala não basta. Um tema inteiro não é sensível: as leis e os votos de Segurança pública são decisões como as outras, e a sala mantém o humor escrito para ela (D-127).

**Consequência.** `Momento.sensivel` no seletor: com ele, `selectLines` não escolhe humor. `isSensitive` e `isSensitiveChapter` olham só identificadores, e os testes conferem a lista contra os capítulos, os capítulos sensíveis da edição e que nenhuma sala temática vira sensível por inteiro (`tests/game-sensitivity.test.ts`; jornadas em `tests/e2e/jogo.spec.ts`). As falas guardadas pertencem ao registro ou ao capítulo de que foram ditas (`falasDe`): a transição de um capítulo revisto não mostra a conclusão de outro. A lista e o tom são decisão editorial: a aprovação é de uma pessoa, e está pendente.

## D-130. A resposta guardada pertence aos dados que a decidem: assinatura com resumo, progresso no formato 5

**Decisão (auditoria de QA de 11 de outubro de 2026).** A assinatura da tarefa (`taskSignature`) passou a ter, além do tipo e dos identificadores (D-119), um resumo dos dados que decidem a resposta certa (`decisiveData`): as datas dos dois registros na tarefa de ordem, os documentos citados na de documento, o lugar documentado na de lugar, os documentos e a interpretação certa na de decisão. O texto dos registros (título, resumo, ementa) não entra. A etapa de evidência da tarefa de decisão também passa a levar a assinatura. O progresso salvo foi para o formato 5; a leitura migra os formatos 1 a 4, em que a assinatura era só o tipo e os identificadores: a resposta vale se a tarefa é a mesma, e é regravada na forma nova.

O estado da tarefa é do capítulo, e a situação vem da ordem. Quando um capítulo reabre (a tarefa mudou, ou uma correção mudou os dados que decidem a resposta), os seguintes da sala voltam a bloqueados, mas guardam o que foi recolhido e respondido neles; refeita a resposta e atravessada a saída, os seguintes que já estavam completos voltam a concluídos, em sequência, e o primeiro que não está completo fica disponível.

**Motivo.** A auditoria mostrou que uma correção editorial sob os mesmos identificadores (a manifestação de um voto, o documento que sustenta um registro) deixaria uma resposta antiga confirmada para um conteúdo que mudou. O resumo cobre só o que decide a resposta, para uma correção de estilo não reiniciar a partida de ninguém. Como a correção de conteúdo é rotina em um atlas, o custo dela para quem joga tem de ser uma resposta refeita, e não os capítulos seguintes perdidos: por isso a leitura deixou de apagar o estado dos capítulos que voltam a bloqueados.

**Consequência.** Corrigir um dado decisivo reabre só a resposta daquele capítulo; o que foi recolhido e as tentativas ficam, nele e nos seguintes. A entrada do jogo, que não carrega os registros, recebe as assinaturas já calculadas no build (`signaturesOf`). O resumo é uma função simples e determinística (FNV-1a de 32 bits sobre o JSON), para detectar mudança, e não para segurança. Uma resposta dada antes do formato 5 não tem como saber de correções anteriores a ele: vale como estava. Revê a consequência da D-109 em um ponto: os capítulos seguintes a um que reabre ficam fechados, mas não recomeçam. Testes: `tests/game-progress.test.ts`, `tests/game-mission.test.ts`, `tests/game-decision-task.test.ts`, `tests/game-rooms.test.ts` e a jornada da migração da versão 1 em `tests/e2e/jogo.spec.ts`.

## D-131. A captura guarda o corpo original, e a conferência reprova o que não pode conferir

**Decisão (auditoria de QA de 11 de outubro de 2026).** Uma captura bruta de acervo (`research/capturas/`) guarda o corpo da resposta exatamente como chegou (`corpo`), além da leitura dele como JSON (`resposta`). O resumo SHA-256 e o tamanho são os do corpo, e a conferência (`verificarCaptura`, `npm run capturas:verificar`, que roda na verificação contínua) reprova qualquer diferença: corpo, resumo, tamanho ou resposta alterados. Uma captura sem o corpo não tem o que conferir, e também reprova; a opção `--aceitar-legadas` só serve para olhar uma pasta antiga de fora do repositório.

**Motivo.** A auditoria reproduziu a falha: a função antiga aceitava como íntegra qualquer captura JSON cujo campo de resumo tivesse 64 caracteres, porque o texto original não era guardado e o resumo não podia ser refeito sobre uma reserialização. Um resumo que não pode ser conferido não é evidência.

**Consequência.** As sete capturas da amostra da edição 0.2.0 tinham sido gravadas sem o corpo. Em 11 de outubro de 2026 cada consulta foi repetida, e o corpo só foi acrescentado porque o resumo da resposta nova era idêntico ao registrado: os bytes são os mesmos da captura original. O resumo confere que o arquivo guardado é o que foi capturado; não prova a veracidade do documento, e a conferência não liga a captura aos identificadores publicados. Testes: `tests/import-decisoes.test.ts`.

## D-132. O cartão de decisão diz o que falta e o que diverge, e a metodologia lista as fontes pela lista de coleções

**Decisão (auditoria de QA de 11 de outubro de 2026).** O objeto votado de uma votação ganhou o campo `divergenciaDocumentada`: um texto para quem lê o cartão, quando dois documentos divergem sobre o que foi votado, dizendo o que cada um diz e o que o atlas adotou. O cartão o mostra junto do objeto, e mostra também, quando o texto submetido à votação não está ligado ao registro, que ele não está ligado. A lista de dispositivos vetados de um ato sai por extenso, um por linha, e vem dobrada quando passa de seis itens. O título do cartão fica sempre um nível abaixo do título acima dele (tema, ou pessoa na comparação). O catálogo de fontes e a contagem de citações da metodologia passam a percorrer a lista de coleções factuais do domínio (`COLECOES_FACTUAIS_DO_CONJUNTO`), e não uma lista própria da página. Formato gerado 3; edição 0.2.1.

**Motivo.** A descrição da votação 6714 no acervo escreve "Projeto de Lei Complementar nº 39, de 2023", e a matéria identificada no mesmo registro é o PLP 93/2023: a observação estava só na nota interna da revisão, que a interface não mostra. Corrigir a fonte em silêncio ou expor todas as notas internas seriam dois erros; um campo próprio, público e só onde há divergência, é o meio. As seis votações da amostra não têm o texto de referência ligado, e a tela calava sobre isso. O catálogo tinha deixado de fora as 18 fontes das decisões porque a página listava à mão as quatro coleções da primeira edição.

**Consequência.** O cartão afirma só o que o registro prova: a frase sobre o texto de referência diz que ele não está ligado, e a situação da revisão continua sendo dita pela nota de revisão. Ligar o texto de referência de cada votação e conferir a ata de cada sessão continuam sendo trabalho da revisão humana. Uma coleção factual nova entra no catálogo sem a página mudar, e um teste do domínio já confere que a lista é a mesma do pipeline. Testes: `tests/decisions-view.test.ts`, `tests/e2e/paginas.spec.ts`, `tests/e2e/previa.spec.ts`, `tests/e2e/comparacao.spec.ts`.

## D-133. A trilha simples: um ciclo só, nenhuma fase bloqueada, e a trajetória antes dos assuntos

**Decisão (trilha simples, 11 de outubro de 2026, a pedido do responsável pelo projeto).** O jogo deixou de ser exploração com tarefa e saída e passou a ser uma trilha de fases curtas, com um ciclo só: abrir o marco, ler uma explicação curta, responder a atividade ou ler a explicação dela, continuar. A trajetória de cada pessoa tem nove fases, da origem à data de corte, e é por ela que a entrada do jogo começa. Nenhuma fase segura a seguinte: a lista de fases abre qualquer uma, e o progresso só serve para sugerir onde continuar e dizer o que falta. Os outros registros do período ficam em "Explorar este período" e são opcionais. Errar mostra a explicação da atividade, sem marcar a opção certa, e deixa tentar de novo ou seguir; "Ver a explicação e continuar" também conclui a fase. O fim é um resumo, sem troféu: o que cada fase mostrou, o que a edição não pesquisou e para onde ir. Economia e Segurança pública deixaram de ser salas com o mesmo peso da trajetória: são aprofundamentos de uma fase, que se apresentam pelo assunto e pelos anos e levam ao início da vida.

**Motivo.** A análise trazida pelo responsável pelo projeto ([GAME-TRAIL.md](GAME-TRAIL.md)). O jogo anterior pedia que a pessoa aprendesse a andar, alcançar, recolher todas as pastas e cumprir uma tarefa sobre documentos antes de entender qualquer coisa; dizia "Tarefa concluída" com a porta fechada; começava a trajetória em 1975 e em 2002, sem a origem de nenhum dos dois; e oferecia seis entradas com o mesmo peso, quatro delas em decisões de 2023 em diante. O objetivo passou a ser outro: quem conhece pouco de política sair sabendo de onde cada um veio, que cargos ocupou, o que esses cargos fazem e exemplos documentados do que fez neles.

**Consequência.** As regras estão em `src/lib/game/trail.ts`, puras; `mission.ts` e `chapters.ts` saíram. Ficam revistas, no que dizem do percurso: a tarefa (D-93, D-113, D-126), a saída que abria com todos os registros recolhidos (D-109), a releitura pelo painel (D-110), a progressão com capítulos bloqueados (D-96, D-125), a fronteira entre capítulos (D-100, D-116) e os controles de andar (D-97, D-105, D-107, D-108). Continuam valendo o canvas e a arte por código (D-94, D-106, D-111, D-112), o pacote à parte (D-95), o guia fictício (D-98), a ficha judicial (D-114) e a matriz de cobertura gerada, que agora separa "acessível no jogo" de "obrigatório para avançar", que não existe mais. O Escrivão (D-127) passou a falar em duas camadas, a instrução e o humor, com no máximo uma fala de cada por momento: a camada que repetia campos do registro saiu, porque a fase e o cartão já os trazem, e a instrução tem limite de 200 caracteres. A meta de desenho é de dez a quinze minutos por trajetória; ninguém mediu esse tempo com pessoas, nem se o ciclo é entendido sem ajuda.

## D-134. O texto educativo entra pelo pipeline: fatos biográficos, conceitos e fases do jogo

**Decisão.** A explicação de uma fase é texto novo sobre fatos, e por isso não mora no código. O conjunto ganhou três coleções, com estado editorial, revisão identificada e a mesma barreira de publicação das demais: `fatosBiograficos` (nascimento, família, mudança de cidade, formação e trabalho, com citações e, quando os documentos divergem, a divergência escrita para quem lê), `conceitos` (a definição simples de um termo, em até 45 palavras, com o texto oficial que a sustenta e o aviso do que ela simplifica) e `fasesDoJogo` (pessoa, sala, posição, período, objetivo, marco, até quatro blocos de explicação, os conceitos definidos, a atividade, os registros para explorar e as lacunas). A fase não cita documento por conta própria: cada bloco aponta, pelo tipo e pelo identificador, os registros publicados que o sustentam, e as datas, os títulos e as fontes chegam por eles. No código fica só a apresentação, por identificador da fase: o cenário e a figura (`src/lib/game/presentation.ts`). Formato gerado 4; edição 0.3.0.

**Motivo.** A D-91 dizia que o jogo não tinha conteúdo próprio, e isso deixou de ser possível: dizer de onde alguém veio ou o que é uma medida provisória é escrever. Texto escrito no código sairia da revisão, do registro de alterações e da lista de revisão humana. Pelo pipeline, cada frase nova tem estado, data de conferência e pendência, e a barreira de release a conta.

**Consequência.** Revê a D-91 nesse ponto: o jogo continua sem escrever fato fora do conjunto, mas o conjunto passou a ter texto escrito para o jogo. O contrato recusa explicação com mais de 100 palavras, enunciado com mais de 40, opção com mais de 24, marco que seja conceito ou proposta, opção certa fora das opções e ordenação com registro sem data; a integridade recusa referência a registro inexistente ou de outra pessoa, marco fora do período da fase e ordenação que as datas não decidem. Os testes do conteúdo publicado conferem o piso de 60 palavras; que todo ano escrito em um bloco, e todo número com porcentagem ou casa de milhar, está em um registro que a fase aponta; que cada termo é definido na fase em que aparece pela primeira vez; e que todo acontecimento e toda decisão publicados aparecem em alguma fase. A lista de revisão humana traz cada fase com a explicação, a resposta certa e o que cada bloco aponta. Os fatos biográficos não entram na linha do tempo nem no mapa: aparecem no jogo, com as fontes. O jogo não desenha a infância de ninguém: as fases de origem ficam em uma sala de arquivo.

## D-135. Progresso no formato 6: o que foi lido e respondido por fase, com o salvo anterior guardado inteiro

**Decisão.** O progresso salvo passou ao formato 6. Guarda, por fase, se a explicação foi aberta, como a atividade foi concluída (pela resposta certa ou pela leitura da explicação), quantas respostas foram dadas e a assinatura do que decide a resposta; por sala, a fase em que a pessoa parou. Não há situação de bloqueio. A leitura migra os formatos 1 a 5: as fases que cobrem os registros de um capítulo antigo concluído ganham a marca "período visto na versão anterior", sem dar a atividade nova como respondida nem a explicação como lida, e o salvo antigo entra inteiro no campo `legado`. A tabela que liga capítulo antigo a fases novas é congelada (`LEGACY_CHAPTER_PHASES`, em `src/lib/game/legacy.ts`).

**Motivo.** Sem fase bloqueada, o progresso deixa de decidir o que pode ser aberto: só diz o que já foi feito. Quem tinha progresso no jogo anterior não pode perdê-lo, e também não pode voltar e achar que o jogo começa onde parou: as fases de origem não existiam, e uma migração que desse tudo como concluído esconderia justamente o que é novo.

**Consequência.** Quem volta com um salvo anterior continua na fase seguinte ao último capítulo concluído, e a tela diz que o jogo mudou e oferece o começo (D-139). A assinatura segue a regra da D-130, agora por fase: na pergunta, as opções e a certa, pelos identificadores; na ordenação, os registros e as datas deles. Mudar a redação não reabre nada; mudar o que decide a resposta reabre só aquela fase, com aviso, e o que a pessoa leu e tentou fica. Dado inválido vira começo, e a leitura não apaga nada: um salvo de formato anterior só é regravado na ação seguinte, já com o antigo dentro. Apagar é ação própria, com confirmação, e vale para a trajetória e os aprofundamentos daquele personagem. O `legado` não é reinterpretado depois: serve para não destruir o que a pessoa tinha, e não para voltar ao jogo antigo. Testes: `tests/game-progress.test.ts`, `tests/game-storage.test.ts` e as jornadas de migração em `tests/e2e/jogo.spec.ts`.

## D-136. Atuação legislativa: a autoria e a relatoria como terceira natureza de decisão

**Decisão.** A participação como autoria ou relatoria, que a D-122 tinha deixado de fora, virou coleção: `atuacoesLegislativas`. Cada registro diz a pessoa, o mandato pelo qual atuou (é o que dá a competência), o tipo (`autoria` ou `relatoria`), a instituição, a data do que o documento registra (a da lei, na autoria que virou lei; a da designação, na relatoria), a matéria como o acervo a identifica (identificador, ementa e quem a assina), o desfecho documentado (lei sancionada, lei promulgada pelo Legislativo, norma gerada ou não documentado, com a norma quando há) e a divergência entre documentos, quando existe. O cartão de decisão, a página da pessoa, a comparação e o jogo a mostram como terceira natureza, ao lado do voto e do ato do Executivo.

**Motivo.** A trilha precisa de exemplos documentados do que cada um fez nos cargos que ocupou. Os dezesseis anos de mandato na Assembleia Legislativa do Rio de Janeiro não têm voto nominal nas amostras do acervo (D-124), e sem a autoria esse período ficaria só com as eleições. Tratar uma lei de autoria de alguém como voto ou como ato seria falso: propor e relatar não é votar, e não diz o que a norma produziu.

**Consequência.** A atuação não entra na linha do tempo: é registro de trabalho no cargo, como os atos de um presidente. As telas dizem "Propor ou relatar não é votar", e o resumo da comparação diz o tipo de registro por cargo, e não quantidade. A edição 0.3.0 tem nove, todas de Flávio Bolsonaro (oito leis estaduais e uma relatoria no Congresso, pelas regras da D-143); o mandato de deputado federal de Lula, de 1987 a 1991, aparece no resumo como cargo sem decisão publicada, o que é lacuna da pesquisa. Validação, integridade, elegibilidade, índices, recorte por pessoa, lista de revisão humana e barreira de release cobrem a coleção. Testes: `tests/decisions-view.test.ts`, `tests/overview.test.ts`, `tests/e2e/paginas.spec.ts` e `tests/e2e/jogo.spec.ts`.

## D-137. Ninguém dirige o boneco: as pastas são botões da página, e a câmera mostra a sala inteira

**Decisão.** O personagem não é mais conduzido por teclas nem por direcional. Cada pasta do cenário (a do marco, em destaque, e as dos registros para explorar que couberem) é um botão da página, posto sobre o desenho, com área de toque de 52 pixels e alcançável pelo teclado como qualquer botão. Ativar uma pasta, ou o botão "Abrir o marco", faz o boneco andar sozinho até a célula livre ao lado dela, por um caminho curto calculado de antemão, em no máximo 1,6 segundo, e então o conteúdo abre. A caminhada é enfeite: com movimento reduzido ela não acontece, e o conteúdo abre na hora. A câmera não segue o boneco: enquadra a cena inteira na área que a interface deixa livre, entre o cartão da fase e o botão principal, com zoom entre 0,36 e 1,9; só quando a cena não cabe nem no zoom mínimo ela põe a pasta do marco à vista. Em zoom pequeno, a pasta opcional que encostaria em outra sai da cena e continua na lista da fase; a do marco fica sempre. A porta deixou de ser passagem: abre quando a fase termina, como sinal.

**Motivo.** Aprender a andar era o maior custo de entrada do jogo anterior, e em celular o direcional disputava o espaço com a cena. O que a pessoa precisa ver é a sala com a pasta do marco, e não o boneco. Um botão da página tem nome, foco e tamanho conferíveis; uma pasta desenhada no canvas não tem.

**Consequência.** Saíram a colisão por movimento, o alcance, o direcional de toque, o botão de ação e o ouvinte de teclado da cena (revê D-97, D-105, D-107 e D-108). `src/lib/game/world/path.ts` e `camera.ts` são regras puras, com teste: há caminho a pé do início até o lado de toda pasta, a caminhada não passa do tempo máximo e a cena cabe na área livre. Em celular em pé, o cartão da fase vai de um lado ao outro e a cena fica entre ele e o botão principal; deitado, a cena fica ao lado do cartão. Com movimento reduzido, o quadro só é refeito quando algo muda. O toque foi conferido em emulação, a 360 e a 390 pixels de largura; nenhum aparelho real foi usado.

## D-138. Propostas eleitorais: frases do documento registrado no TSE, em coleção própria

**Decisão.** O conjunto ganhou `propostasEleitorais`: uma frase do documento que cada candidatura registrou na Justiça Eleitoral em 2026, com a pessoa, o ano da eleição, a área (uma das sete da comparação), o texto, a ressalva e as citações (a página do documento e a ficha da candidatura que o traz). O texto começa sempre por "O documento", tem até 45 palavras e diz o que o documento propõe. A edição tem três frases por área de cada documento: 42 no total, o mesmo número para as duas candidaturas em todas as áreas. A comparação as mostra por área, lado a lado; o jogo mostra uma por área na fase da eleição de 2026, em "Explorar este período", e as três da área em cada aprofundamento.

**Motivo.** Quem está começando quer saber o que cada candidatura propõe, e isso só pode entrar pelo documento oficial lido, e não por material de campanha ou por notícia. Proposta não é decisão: não tem cargo, não tem data de ato e não aconteceu. Pôr a frase entre as decisões, ou deixar o jogo tratá-la como marco, misturaria intenção com fato.

**Consequência.** A proposta nunca é marco de fase (o contrato recusa), não entra na linha do tempo, não é somada nem ordenada, e o Escrivão não a comenta. As telas dizem o que ela é e o que não é, e que três frases não são o documento inteiro: "A falta de uma proposta aqui não quer dizer que a candidatura não a faz". A escolha das frases é editorial e está à espera da revisão humana, como o resto; o campo ressalva ficou sem uso na D-149: condição e segunda formulação vão no texto da frase, e nenhuma nota avalia se a frase é precisa. Responde, em parte, ao ponto em aberto sobre o escopo de propostas (auditoria de 10 de outubro, achado A-01): o que entrou é este recorte declarado, e não "todas as propostas". Testes: `tests/proposals.test.ts`, `tests/game-coverage.test.ts`, `tests/e2e/comparacao.spec.ts`.

## D-139. O endereço pede a fase, e o jogo só lê e escreve o endereço da própria página

**Decisão.** `?fase=N` abre a fase na posição N da sala, e `?leitura=1` abre a trilha em "Ler sem o cenário". É navegação: o endereço nunca leva progresso, e abrir uma fase por ele não conclui nem apaga nada. O endereço acompanha a fase aberta sem criar entrada no histórico: recarregar volta à mesma fase, e Voltar sai do jogo. O jogo só lê e só escreve o endereço quando ele é o da própria página (`isGamePath`), e só se considera pronto depois de ler o progresso guardado e esse endereço. Quem chega sem pedir fase e cai depois da primeira vê, no cartão da fase, "Você continua de onde parou" ou, com progresso de um formato anterior, "O jogo mudou desde a sua última visita: a trajetória agora começa pela origem", com o botão "Ver desde o início" e o ano.

**Motivo.** Em uma navegação interna do Next, a página nova é desenhada antes de o endereço dela entrar no navegador. A primeira versão da trilha lia `?fase=1` cedo demais, via o endereço da página anterior e abria a fase em que a pessoa tinha parado: para quem já tinha progresso, "Ver desde o início" e "Ir para o início da vida" levavam ao fim da trajetória. O defeito era da trilha nova, apareceu durante a construção e foi corrigido antes de ser publicado; ele recriaria justamente a surpresa do relato de "entrar em 2025", que é sobre o jogo anterior ([GAME-TRAIL.md](GAME-TRAIL.md)). E mesmo sem defeito, cair em 2025 sem aviso lê como "o jogo começa aqui".

**Consequência.** `useGameAddress` (em `src/features/game/hooks.ts`) tem três situações: o HTML do build, o endereço ainda por entrar e o endereço lido. Enquanto ele não entra, o cabeçalho de uma fase suposta não aparece. A D-96 continua valendo, progresso nunca no endereço, e ganhou o parâmetro de fase, que é só posição. A fase passou a ter endereço próprio, o que responde ao ponto em aberto sobre links permanentes para capítulo. Testes: `tests/game-query.test.ts` e, em `tests/e2e/jogo.spec.ts`, a entrada por navegação interna, continuar e começar do início sem misturar nem apagar, Voltar e Avançar, e o aviso de retomada.

## D-140. Foco: fechar devolve ao controle que abriu, e mudar de fase leva ao começo dela

**Decisão.** Fechar uma janela do jogo devolve o foco ao controle que a abriu: o botão do cabeçalho, a pasta do cenário, o botão dentro da fase. Mudar de fase, ou de modo, leva o foco ao começo da fase: a pasta do marco, com o cenário, e o título da fase, na leitura sem o cenário. Responder, pedir a explicação ou tentar de novo leva o foco ao passo seguinte (continuar, tentar de novo ou a primeira opção), com o resultado à vista. Uma janela aberta por cima de outra (o registro sobre a fase, a confirmação sobre a lista) deixa a de baixo montada e inerte, para a escolha feita e o lugar da leitura não se perderem. O controle que abriu é lembrado pelo clique, e não pelo foco.

**Motivo.** Sem cenário para andar, o teclado passa a ser um caminho de primeira classe. Na primeira versão da trilha, responder tirava da tela o botão que tinha o foco: o foco caía fora da janela, Esc deixava de fechá-la e Tab saía do modal. E nem todo navegador põe o foco em um botão tocado ou clicado, o que fazia a volta cair no começo da página.

**Consequência.** A armadilha de foco do diálogo passou a contar só o que está visível: o que está dentro de um `details` fechado não conta, o `summary` conta, e Shift+Tab a partir da própria janela vai ao último controle. Uma jornada percorre o ciclo inteiro só com o teclado (`tests/e2e/jogo.spec.ts`), e a passagem de acessibilidade confere a ordem de foco das telas do jogo. Nenhum leitor de tela foi usado.

## D-141. A comparação ganha um resumo por cargo e por área, depois das faixas, e as propostas por área

**Decisão.** A página da comparação tem a seção "Resumo: os cargos de cada um e o que o atlas registra". Por cargo público de cada pessoa, ela diz o tipo de registro que a edição tem dele: votos nominais, atos do Executivo, autoria ou relatoria de matérias. Por área, diz os tipos de decisão de cada um e se há proposta de 2026 registrada no TSE. O resumo diz o tipo, nunca a quantidade, e cada linha leva à seção com os registros. Ele fica depois das faixas e das notas de leitura, e o cabeçalho da página tem o atalho "Para começar: resumo por cargo e por área". Abaixo vêm as decisões por tema, com o grupo "Outros assuntos" para as que não cabem em tema nenhum, e as propostas por área.

**Motivo.** A análise: a comparação detalhada é longa, e faltava uma síntese para quem está começando, com a cobertura das sete áreas à vista. Um resumo com números lado a lado viraria placar. Um resumo com o tipo de registro por cargo explica por que os registros são diferentes: quem preside sanciona, veta e decreta, e quem é parlamentar propõe, relata e vota.

**Consequência.** Ajusta a D-82 sem revogá-la: as faixas continuam logo depois do recorte, na primeira tela, e as notas de leitura antes de qualquer lista; o resumo, que é uma lista, vem depois delas, e quem quer começar por ele usa o atalho. Área ou cargo sem decisão aparece como "Nenhuma decisão publicada nesta edição", com o aviso de que é lacuna da pesquisa, e não conclusão sobre a pessoa; a área não some. Só os cargos públicos entram no resumo por cargo: as funções exercidas dentro de outro mandato e os cargos de sindicato e de partido ficam na lista completa. Testes: `tests/overview.test.ts`, inclusive o de que o resumo não traz número em campo nenhum, e `tests/e2e/comparacao.spec.ts`.

## D-142. Contexto sensível por fase, e o registro opcional leva a própria marca

**Decisão.** A regra da D-129 passou do capítulo à fase. Uma fase é de contexto sensível quando o marco, a explicação ou a atividade apontam um registro sensível: um episódio da ficha judicial, a prisão de 1980, o acontecimento ou o decreto da intervenção federal de 8 de janeiro de 2023. Nas falas que são dela, a entrada, o erro e a conclusão, o Escrivão não faz humor. Um registro sensível que só aparece em "Explorar este período" não muda a fase: leva a própria marca quando é aberto. Um registro comum aberto de dentro de uma fase sensível também vem sem humor.

**Motivo.** A regra antiga contava a proporção de registros sensíveis do capítulo e olhava a tarefa. A fase não tem tarefa sobre um registro, e o que a pessoa acabou de ler é o texto dela: é ele que decide o tom. Contar os opcionais faria uma fase inteira perder o humor por causa de uma pasta que a pessoa talvez nem abra.

**Consequência.** `isSensitivePhase` olha só identificadores, e o conteúdo entregue ao navegador já traz a marca de cada fase. Na edição, são de contexto sensível: na trajetória de Lula, a fase do partido e da Constituinte (pela prisão de 1980), a dos processos e a da volta à Presidência (pela intervenção federal); na de Flávio Bolsonaro, a dos processos; e o aprofundamento de Segurança pública de Lula, porque a explicação aponta o decreto da intervenção. Um tema continua não sendo sensível por si: o aprofundamento de Segurança pública de Flávio Bolsonaro mantém o humor. O resultado difere entre os dois porque os registros apontados diferem, e não porque a regra mude. A proposta eleitoral não recebe fala do Escrivão em caso nenhum. A lista e o tom continuam sendo decisão editorial, à espera da aprovação de uma pessoa. Testes: `tests/game-sensitivity.test.ts`, `tests/game-escrivao.test.ts`.

## D-143. As amostras da edição 0.3.0: uma regra escrita para cada parte, e o que o registro da pesquisa não prova

**Decisão.** A edição 0.3.0 acrescentou três partes à amostra de decisões, cada uma com a regra escrita na cobertura declarada e com a lista do que foi conferido em [../research/trilha-2026-10.md](../research/trilha-2026-10.md). **Atos de Lula de 2003 a 2010:** onze, escolhidos entre os trinta conferidos para que cada uma das sete áreas da comparação tivesse ao menos um ato de alcance nacional, com tipos de ato diferentes (medida provisória, sanção, sanção com veto parcial, decreto e iniciativa de emenda à Constituição). **Leis estaduais de autoria individual de Flávio Bolsonaro, de 2003 a 2018:** oito, duas por legislatura, pela regra fixa "entre as leis conferidas, a de menor número do primeiro e do último ano de cada legislatura com lei conferida", que não olha o assunto. **Relatoria no Congresso:** uma, a de designação mais antiga entre as seis conferidas cuja matéria gerou norma. Nenhuma regra olha se o registro favorece ou prejudica alguém. O aviso fixo das telas de decisões deixou de dar um critério só para a amostra inteira e passou a dizer que cada parte tem a própria regra, escrita na metodologia.

**Motivo.** A amostra da edição 0.2.0 (D-128) tinha um recorte decidido pelo responsável pelo projeto. As partes novas foram escolhidas durante a pesquisa da trilha, com assistência de IA, e por isso a regra de cada uma tinha de ser escrita e conferível por quem revisar. Para as leis estaduais e para a relatoria, a regra é mecânica de propósito: uma regra que escolhesse pelo assunto daria a quem escreve o poder de desenhar o perfil de alguém.

**Consequência.** O registro da pesquisa diz o que comprova e o que não comprova. Não comprova que os trinta atos, as vinte e cinco leis e as seis relatorias conferidos são os mais relevantes: as três amostras partem de listas parciais, e nenhum acervo foi varrido. Entre os atos de 2003 a 2010, a escolha entre candidatos da mesma área foi do pesquisador, com assistência de IA, e não ficou escrita no momento em que foi feita: é o primeiro ponto a refazer na revisão humana, com a tabela na mão. A primeira montagem tinha dez atos e nenhum de Saúde, embora três tivessem sido conferidos, o que contrariava a regra escrita; o Decreto nº 5.090, de 2004, entrou no mesmo dia, e o motivo da omissão original não ficou registrado. A regra das leis estaduais foi aplicada só às vinte e cinco leis conferidas: com as outras vinte e sete da busca abertas, a lei de menor número de algum ano poderia ser outra. O efeito de cada lei, o resultado dos vetos no Congresso e se cada parecer foi aprovado não foram pesquisados, e as telas dizem. Manter, ampliar ou refazer cada parte é decisão do responsável pelo projeto.

## D-144. O limite de vinte acontecimentos por pessoa fica, e o que é trabalho no cargo entra como decisão

**Decisão.** A edição 0.3.0 não publica acontecimento novo: as duas pessoas já estavam em vinte, o teto da regra 2 da política editorial. O que a trilha precisava e é trabalho no cargo (as leis estaduais, a relatoria, os atos de 2003 a 2010) entrou como decisão, que não é acontecimento da linha do tempo; o que é anterior à vida pública entrou como fato biográfico. Duas candidaturas de Lula que a pesquisa documentou, a de 1982 ao governo de São Paulo e a de 1998 à Presidência, ficaram em rascunho, com a pendência escrita.

**Motivo.** O limite é de escopo, e mudar o escopo é decisão do responsável pelo projeto. Aumentá-lo em silêncio para encaixar o que a trilha pedia seria decidir por ele, e publicar acontecimentos novos só de um dos lados mexeria no equilíbrio entre os dois perfis.

**Consequência.** A fase "Quatro disputas pela Presidência" conta a eleição de 1998 pelo contexto do acontecimento de 1994, como o atlas já fazia, e declara a lacuna. Ampliar o limite, ou trocar um acontecimento por outro, fica nos pontos em aberto. Cada rascunho tem pendência própria: a data da votação de 1982 não está no arquivo de resultados do TSE, e o total de votos de 1998 não foi localizado em documento oficial.

## D-145. A entrada do jogo: duas escolhas iguais, com o destino e o ano ditos, e os caminhos antes da prévia

**Decisão.** A entrada do jogo oferece as duas trajetórias com o mesmo cartão, em ordem alfabética. Em cada cartão, o nome, a situação e os caminhos vêm antes da prévia do cenário. Quem nunca abriu vê "Começar do início", com o ano; quem já começou vê "Continuar de onde parei", com a fase e o período, e "Ver desde o início", com o ano; quem concluiu vê "Rever desde o início". "Ler sem o cenário" fica no mesmo bloco. Os aprofundamentos ficam abaixo, sob "Aprofundamento por assunto", com os anos e a frase "Para depois da trajetória. Não é o começo da vida de ninguém".

**Motivo.** A entrada anterior tinha seis botões com o mesmo peso, quatro deles em salas de 2023 em diante, e a prévia do cenário empurrava os botões para fora da primeira tela. Dizer o destino e o ano no próprio botão é o que impede a surpresa de entrar em 2025.

**Consequência.** Os dois cartões usam as mesmas três linhas da grade (caminhos, prévia, resto), para um não desalinhar do outro quando só um tem progresso. Os botões levam `?fase=N`, e rever o começo nunca apaga. As jornadas conferem os caminhos na primeira tela em quatro tamanhos de janela e o alinhamento dos cartões. A prévia continua sendo enfeite: se o pacote dela não chega, a escolha continua valendo (D-104).

## D-146. "Ler sem o cenário" é a trilha inteira, e sem JavaScript as fases vão em texto

**Decisão.** A trilha tem dois modos com o mesmo conteúdo. Com o cenário, a fase abre em uma janela sobre a cena. Em "Ler sem o cenário", a fase está na página, sem o palco, com as mesmas explicações, atividades, fontes, registros opcionais, lista de fases e resumo. A escolha é uma preferência guardada no navegador, fora do progresso, e pode vir pelo endereço (`?leitura=1`). É também o caminho quando o navegador não dá o canvas ou o pacote do palco não chega: o aviso no lugar da cena leva a ele. Sem JavaScript, a casca do cenário sai da página, e as fases vão no HTML, em texto, com a explicação, os termos, a atividade e a resposta explicada.

**Motivo.** No jogo anterior, o caminho sem o cenário era um painel de botões para recolher registros: cumpria a regra, mas não era um jeito de ler. Na trilha, o conteúdo é texto com uma pergunta, e pode ser lido inteiro sem cena nenhuma. E sem JavaScript a página mostrava "Carregando o jogo…" para sempre, com botões que não respondiam e o texto fora da primeira tela.

**Consequência.** Em leitura, o pacote do palco não é pedido, por nenhum dos três caminhos (endereço, preferência guardada, navegação interna): `tests/export/jogo.spec.ts` confere. A leitura só entra depois da hidratação, porque o HTML do build sai com a casca do cenário; no celular emulado, o LCP dela foi de 2,34 s, contra 1,09 s da página com cenário, e o elemento medido é um parágrafo da explicação, que só é desenhado depois de o JavaScript ler o endereço ([PERFORMANCE.md](PERFORMANCE.md), seção Páginas do jogo, trilha simples, e pendência 7). Revê a D-97, porque o painel **Capítulos e tarefas** saiu, e as consequências da D-95 e da D-104 sobre o que aparece sem JavaScript e sem o palco.

## D-147. O site está no ar em endereço provisório, por decisão do responsável, com a revisão humana pendente

**Decisão (11 de outubro de 2026, do responsável pelo projeto).** O responsável pediu a publicação, e o site passou a responder em `https://atlas-politico.vercel.app`, por um projeto da Vercel criado pela importação do repositório do GitHub (ramo `main`). A primeira versão publicada foi a do commit `f084733`, com a edição 0.2.1. O site continua sem indexação: as páginas levam `noindex`, o `robots.txt` bloqueia tudo, o sitemap está vazio, e não há domínio próprio nem endereço canônico. As telas continuam dizendo "Revisão humana pendente".

**Motivo.** Decisão do responsável pelo projeto. O motivo não foi registrado.

**Consequência.** Revê a D-117 e a D-120 em um ponto: elas condicionavam a publicação à revisão humana e à validação com pessoas, e a publicação aconteceu antes das duas. A barreira `npm run verify:release` continua recusando, pelos mesmos motivos, e nenhum documento do projeto diz que a revisão humana ou a validação com pessoas aconteceram. Um projeto da Vercel ligado ao repositório publica em produção, por padrão, cada push no ramo de produção: isso não tinha sido observado quando esta decisão foi escrita, e, até alguém conferir ou desligar, todo push na `main` deve ser tratado como publicação. A frase da política editorial sobre a publicação foi atualizada para dizer o fato ([EDITORIAL.md](EDITORIAL.md), seção Revisão); confirmar a redação dela, decidir o domínio e o canal de correção e manter ou não o endereço no ar ficam com o responsável ([DEPLOY.md](DEPLOY.md)).

**Observado em 12 de outubro de 2026.** O primeiro push depois da importação, o do commit `f2efc28`, publicou a edição 0.3.0 no endereço provisório, sem esperar a verificação contínua do GitHub: a publicação ficou pronta na Vercel em menos de um minuto. Um push na `main` publica ([DEPLOY.md](DEPLOY.md), seção Situação).

## D-148. No celular, todo controle das telas do jogo tem 44 pixels, e um teste mede todos

**Decisão.** Nas telas do jogo, todo controle que recebe toque tem ao menos 44 pixels de altura e de largura em celular: os botões, as pastas, os caminhos e os títulos dos documentos nas listas de fontes. São dois tipos de link, com as classes em `src/components/touch.ts`. O **caminho** (`PATH_LINK`) é um link que leva a outra tela e fica sozinho na linha ou no começo dela: os do resumo, os da lista de fases, "Ir para o início da vida", "Abrir a ficha completa no atlas", "Escolher a outra trajetória". Tem a altura dos botões em qualquer largura. O **título de documento** (`SOURCE_LINK`) ganha a altura de toque em tela de toque e em tela com menos de 1024 pixels; com mouse em tela larga, fica na altura do texto, para a lista continuar compacta. O cartão de decisão, que o atlas também usa, segue a mesma regra.

**Motivo.** O pedido da trilha dizia alvos de 44 por 44 em telas de 360 a 390 pixels. O teste de celular media uma lista de controles escolhidos à mão, e a passagem de acessibilidade deixa de fora todo link de texto, porque o link no meio de uma frase é uma exceção aceita. Uma medição de todos os controles, feita em 11 de outubro de 2026 sobre a saída estática, achou links com 17 a 37 pixels de altura que não estão no meio de frase nenhuma: os caminhos do fim da trajetória, o caminho de volta ao início da vida na leitura sem o cenário e os documentos das fontes, que são justamente o "onde conferir" do jogo.

**Consequência.** `tests/e2e/jogo.spec.ts` ganhou uma jornada, em 360×640 e em 390×844, que percorre a entrada, a cena, a fase aberta com os termos e as fontes, a resposta errada e a certa, os registros (decisão, episódio de processo e proposta), a lista de fases, a ajuda, a confirmação de apagar, o resumo, o aprofundamento e a leitura sem o cenário, e reprova qualquer controle visível com menos de 44 pixels (`alvosPequenos`, em `tests/e2e/jogo-apoio.ts`). As listas de fontes ficam mais altas em celular. Ficam de fora, e continuam com a altura da linha: os links no meio de uma frase fora das telas do jogo, como os do crédito de cada retrato na entrada e os do resumo da comparação. Nenhum aparelho real foi usado: a medida é a do navegador em emulação.

## D-149. Antes do envio, uma revisão independente; a ressalva das propostas deixa de avaliar a frase

**Decisão (11 e 12 de outubro de 2026).** Antes do commit da trilha simples, que pode publicar no endereço provisório (D-147), a árvore passou por uma revisão independente, só de leitura, feita com assistência de IA: quatro leitores, cada um com um recorte (documentos, fases, registros e código), e um segundo leitor para tentar refutar cada apontamento. Foram 40 apontamentos: 36 confirmados e 4 refutados, alguns deles o mesmo ponto visto por dois leitores. O que foi confirmado e era erro foi corrigido antes do envio. O que é escolha editorial, ou pede um documento que não foi lido, ficou escrito como limitação ([STATUS.md](STATUS.md)).

A regra que mudou por causa dela: a ressalva de uma proposta eleitoral deixa de avaliar se a frase é precisa. As 42 frases ficaram sem ressalva. O aviso é um só, no texto fixo das telas ("O atlas resume a frase sem acrescentar número, prazo ou valor que ela não traga"), igual para as duas candidaturas. O que era divergência dentro do próprio documento passou para o texto da frase.

**Motivo.** A regra anterior mandava anotar toda frase sem número, prazo ou valor. A aplicação não foi igual: havia oito avisos do tipo "o trecho não traz" nas frases do documento de Flávio Bolsonaro e dois nas do documento de Lula, com dezesseis frases nessa situação em cada um. Lado a lado, na comparação e na fase da eleição de 2026, um documento aparecia marcado como vago e o outro não, por um critério que o atlas não aplicou do mesmo jeito. Foi o único apontamento classificado como impeditivo. Anotar as 32 frases repetiria a mesma linha em quase todos os cartões; um aviso só é igual por construção.

**Consequência.** `tests/proposals.test.ts` exige o mesmo número de ressalvas para as duas candidaturas e recusa ressalva que avalie a precisão da frase. As outras correções que saíram da revisão:

- **Fases de processos.** A de Flávio Bolsonaro diz a data da denúncia como o registro diz (apresentada em outubro de 2020, divulgada em 4 de novembro) e traz, com o nome de quem noticiou, o que veio depois da rejeição da denúncia; o que a decisão diz sobre novas investigações ficou na explicação da atividade. A de Lula declara como lacuna que os registros não dizem quem apresentou a acusação.
- **Leis promulgadas pela Alerj.** Os registros diziam que a página "não diz o motivo". A página cita os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que não foram lidos nesta edição. O atlas passou a dizer isso, e continua sem escrever que houve veto derrubado.
- **Metodologia.** Diz o que cada conferência cobriu: a reabertura de todas as fontes foi a de 9 de outubro de 2026, e os registros que entraram depois foram conferidos contra os documentos baixados no dia em que entraram. A regra de divergência dos fatos biográficos passou a ser a que foi aplicada: onde há precisão comum, o atlas fica com ela; onde adota uma versão, o registro diz qual.
- **Escrivão.** Uma fala de humor citava uma funcionária inventada, e caía na fase seguinte à dos estágios de Flávio Bolsonaro. A fala foi trocada, e a validação do catálogo passou a recusar humor com uma lista de papéis (estagiário, assessor, funcionário, colega, chefe, secretário): o humor é sobre a papelada e sobre o próprio Escrivão, e o que a lista não pega fica com quem revisa o catálogo.
- **Jogo.** Apagar o progresso na leitura sem o cenário devolve a atividade; nenhuma ordenação aparece na tela já na ordem certa; a assinatura de uma ordenação não depende da ordem em que a fase escreve os itens; a pergunta só aponta termo que a própria fase explica; o título de um termo não vai mais para minúsculas; o caminho para o início da vida não recarrega a página; o link das propostas diz "as propostas que o atlas registra", e não "todas".
- **Textos e observações.** Quatro observações de revisão afirmavam o que nenhum trecho guardado sustenta: três passaram a dizer que a origem do projeto foi lida nos dados abertos da Câmara, sem trecho nas evidências, e uma perdeu o nome do tribunal; o termo sindicato deixou de citar uma das pessoas pelo nome; "imposto" virou "tributo" onde o registro fala em contribuição; a declaração de cobertura dos atos de 2003 a 2010 diz que a escolha entre atos do mesmo tema não ficou escrita.

**Segunda e terceira passagens.** Outros leitores, também de IA, conferiram a árvore já corrigida: cada apontamento, um por um, e um olhar só para a igualdade de tratamento. Uma terceira passagem conferiu só o que a segunda mudou e mostrou onde as regras novas ainda não valiam por igual, e uma quarta, curta, conferiu as correções da terceira. Delas saíram quatro regras, todas iguais para as duas pessoas:

- **Número de fonte ligada à instituição da própria pessoa leva o nome da fonte.** Na fase, o número que vem só da biografia publicada pela Presidência, ou só da agência de notícias do Senado, diz de onde vem, em frase própria, para a frase do fato não ficar com cara de dúvida. Seis números das fases de Lula e o placar de uma votação, na de Flávio Bolsonaro, passaram a dizer isso, como o percentual de 2018 já dizia. Número de dado primário (resultado do TSE, texto de lei, registro de votação) fica fora da regra.
- **As duas fases de processos trazem o que o registro apontado traz,** com o título na mesma fórmula ("Condenação, prisão e anulação" e "Denúncia, anulação e rejeição"). A de Lula ganhou a decisão que declarou a suspeição do juiz no caso do triplex. O que não cabe no limite de palavras vai para a explicação da atividade, nas duas. A fase escreve cada número como o registro o escreve: a contagem de denunciados, que o registro traz de outro jeito, saiu da frase.
- **O resumo de uma proposta traz a condição da medida e todas as medidas que a frase propõe.** O que a frase diz sobre meios, apoios, finalidade ou justificativa pode ficar de fora, nos dois documentos. O resumo é de uma frase, ou de duas frases seguidas da mesma página. Quando o resumo usa um trecho de outra página, a citação traz a localização dos dois; uma segunda formulação com outro alcance é dita no texto, com a página. Os dois documentos foram relidos atrás de trechos divergentes, com a mesma instrução: nenhuma contradição. Cinco resumos foram completados: dois na segunda passagem, um de cada documento, e três na quarta, todos do documento de Flávio Bolsonaro, que ficavam com uma de duas medidas da mesma frase, enquanto os do documento de Lula já traziam as duas.
- **O humor não fala de nascimento nem de aniversário.** A fala do primeiro erro, sobre um aniversário comemorado no mês errado, caía na fase do nascimento de Lula, em que os documentos divergem sobre o dia. Foi trocada, e a validação recusa humor com nascimento ou aniversário. A fala nova e duas outras da primeira fase foram trocadas de novo, para não falar de datas nem de contagens que coincidam com a fase.

O relato das passagens, com as contagens, está em [STATUS.md](STATUS.md).

Ficou como está, por ser escolha editorial ou por faltar documento: a diferença de regra entre as amostras de decisões das duas pessoas (D-143); o nome oficial da norma na caixa do marco; termos usados antes da definição em algumas fases; o retorno de **Voltar ao jogo**, que leva à fase da retomada (a documentação passou a dizer isso); a fala de humor da primeira fase no HTML estático, que aparece até o JavaScript carregar para quem desligou o humor; e a lista de contexto sensível, que continua por identificador (D-142): dois registros que só mencionam condenação de um terceiro ou repressão policial, um de cada pessoa, seguem com humor, e pô-los ou não na lista é decisão do responsável. O humor da sala de Segurança pública também ficou: fala de chave, cadeado e lacre e, pela regra, só é dito no aprofundamento de Flávio Bolsonaro, porque o de Lula é de contexto sensível (D-142); trocar o motivo das falas ou tirar o humor da sala é decisão do responsável. A revisão foi feita por modelos de IA: não é revisão humana, e nenhum registro passou a dizer que uma pessoa o revisou.

## D-150. O Passaporte do Escrivão: um carimbo por fase concluída, tirado do progresso, sem nota

**Decisão (12 de outubro de 2026).** O jogo ganhou um passaporte: uma caderneta em que cada fase concluída deixa um carimbo com o título dela. Três regras o definem.

- **O carimbo é a conclusão que o progresso já registra, e nada mais.** Não há chave nova no navegador, lista de carimbos nem lista de selos: a caderneta, a contagem e os selos são calculados a cada tela (`src/lib/game/passport.ts`). Abrir uma fase não dá carimbo. Concluir dá, uma vez, pela resposta certa ou por Ver a explicação e continuar, antes de responder ou depois de um erro, e o carimbo é o mesmo.
- **Três selos, por contagem.** Primeiros passos (três fases concluídas, em qualquer sala das duas pessoas), Trajetória percorrida (todas as fases de uma trajetória) e Duas trajetórias. Nenhum depende de acertar, de tempo ou de sequência de dias.
- **Reconhece o caminho, e não o desempenho.** Sem pontos, ranking, comparação entre as pessoas ou elogio. As confirmações falam de marco registrado. Em fase de contexto sensível (D-129, D-142), a confirmação é uma linha sóbria sobre o progresso e o Escrivão não faz humor; o desenho do carimbo e a batida dele são os mesmos de toda fase.

A tela mostra o progresso durante a partida, em uma faixa no cartão da fase que separa o que foi concluído da fase aberta, e apresenta a fase seguinte depois da explicação da resposta, com o objetivo que o conteúdo publicado escreve para ela.

**Motivo.** O pedido de 12 de outubro de 2026 era estimular a continuidade com recompensas simples, sem serviço pago, cadastro ou servidor, preservando a exportação estática e o progresso local. Duas escolhas vieram das regras que o jogo já tinha. A primeira: o jogo não dá nota (D-133), e ler a explicação conclui a fase tanto quanto responder. Um prêmio só para quem acerta criaria a nota que o projeto recusa, e por isso o carimbo é o mesmo. A segunda: um registro de carimbos à parte poderia discordar do progresso, com o carimbo de uma fase que a correção reabriu (D-130) ou que a edição não tem mais, e pediria migração própria. Derivado, ele acompanha o progresso em todos esses casos, e quem já tinha fases concluídas recebe os carimbos sem que nada seja convertido. A frase da fase seguinte usa o objetivo publicado porque uma chamada nova para cada fase seria texto sobre as pessoas escrito fora do pipeline (D-134).

**Consequência.** O HTML do build sai com a faixa sem números, e a contagem entra quando o navegador lê o progresso. A página de uma pessoa passa a ler, uma vez, o progresso da outra, só para a caderneta e os selos, e a levar o título e o período das fases das duas. Quem vem dos formatos 1 a 5 não ganha carimbo pela marca "período visto na versão anterior" (D-135): a fase nova não foi concluída. A fase reaberta por correção perde o carimbo até ser concluída de novo. O catálogo do Escrivão ganhou o evento `carimbo`, com a validação das outras falas. `tests/game-passport.test.ts` confere as regras sobre as páginas das duas pessoas, e `tests/e2e/jogo.spec.ts`, as telas: a jornada básica roda para as duas, e as outras usam uma pessoa cada, alternando. Os nomes dos selos, as confirmações e as falas novas foram escritos com assistência de IA, e a aprovação de uma pessoa está pendente, como a do resto do tom do Escrivão. Ninguém mediu se o passaporte faz alguém continuar: isso é da validação com pessoas ([USER-VALIDATION.md](USER-VALIDATION.md)).

**Três escolhas que saíram da revisão independente da entrega,** feita no mesmo dia, só de leitura e com assistência de IA ([STATUS.md](STATUS.md), seção Passaporte do Escrivão):

- **Depois de um erro, o botão de seguir passou a ser Ver a explicação e continuar.** Na trilha (D-133), esse botão concluía a fase pela leitura e ia à fase seguinte no mesmo toque. Com o passaporte, o carimbo de quem errava entrava sem confirmação, sem a fase seguinte e sem o aviso do selo: justamente para quem mais precisa de um motivo para continuar. Agora o botão conclui e deixa a fase na tela, com a opção certa marcada, o carimbo e o botão de continuar, como já acontecia antes de responder. É um toque a mais para quem errou, e nenhum caminho conclui uma fase tirando-a da tela.
- **O carimbo é anunciado por uma linha de aviso própria,** que já está na fase, vazia, e recebe o texto uma vez. A região do resultado nasce já preenchida, e um leitor de tela pode não anunciar uma região assim; o botão do passaporte também não fica dentro de região de aviso. Nenhum leitor de tela foi usado: a escolha segue a prática conhecida, e não uma audição.
- **O desenho do carimbo é o mesmo em fase de contexto sensível.** A primeira versão deixava o carimbo parado nessas fases. A regra de contexto sensível pega três fases da trajetória de Lula, o aprofundamento de Segurança pública dele e uma fase da trajetória de Flávio Bolsonaro, e o efeito era um destaque visual diferente entre as duas trajetórias, que o pedido não aceita. A sobriedade ficou no texto: a confirmação sóbria e a falta de humor, que já eram a regra do jogo. Reduzir ou ampliar a lista de fases sensíveis continua sendo decisão do responsável (D-142).

## D-151. A missão de investigação "O documento diz o quê?": um dossiê como atividade de fase, com fichas que só dizem o que o documento registra

**Decisão (17 de outubro de 2026).** O jogo ganhou uma sala nova, `investigacao`, com uma fase por pessoa e uma atividade nova, `dossie` ([MISSAO-INVESTIGACAO.md](MISSAO-INVESTIGACAO.md)). O Escrivão entrega fichas (afirmações em uma frase); a pessoa abre os documentos da gaveta (decisões já publicadas), lê os cinco campos de cada um (data, instituição, cargo, objeto e ação), guarda os úteis no dossiê, relaciona cada ficha ao documento que a sustenta e aponta o campo que sustenta o trecho destacado. Quatro regras a definem.

- **A ficha é uma leitura do cartão de decisão, e nada mais.** Cada ficha aponta uma decisão da própria pessoa e diz só o que os campos dela registram; o contrato e os testes conferem o documento, o trecho destacado, os anos e os meses. Não existe ficha falsa: criar afirmações erradas sobre pessoas reais, mesmo para a pessoa desmascarar, foi descartado, e por isso a resposta "nenhum documento sustenta", que o estudo do Papers, Please sugeria, não entrou. O que a gaveta tem a mais são documentos verdadeiros que não sustentam as fichas (os distratores), da mesma pessoa.
- **Errar explica o que o documento escolhido registra, sem dizer o certo.** O aviso lista os campos em que o documento escolhido difere do que sustenta a ficha, com o valor dele; a nova tentativa é livre; "Ver a explicação e continuar" conclui pela leitura, como em toda fase, e mostra a solução de cada ficha.
- **O dossiê é uma atividade de fase.** Herda o progresso, a assinatura (o que decide: cada ficha, o documento e o campo), o passaporte, a leitura sem o cenário, o texto sem JavaScript, a lista de fases, a matriz de cobertura e a lista de revisão humana. O andamento (documentos recolhidos, fichas relacionadas e conferidas) fica em `PhaseProgress.dossie`, campo opcional do formato 6: nenhum salvo anterior muda de leitura.
- **A cena participa, e os objetos têm função.** Os marcadores da sala são objetos (`objeto`), e não pastas: o Escrivão, a gaveta, a mesa das fichas e o quadro abrem cada um uma parte do dossiê. O boneco anda até eles como anda até uma pasta. Na leitura sem o cenário, as quatro partes ficam na página.

A conversa que abre a missão é um grafo pequeno em TypeScript (`src/lib/game/escrivao/dialogo.ts`), no molde dos knots do ink: nós, escolhas, uma marca e um texto alternativo. Quem pergunta como se lê um documento recebe, no fim, os cinco campos de novo e a chave de leitura já aberta; quem não pergunta é mandado ao quadro. As falas passam pela validação do catálogo. A conversa não é gravada.

**Motivo.** O pedido de 17 de outubro de 2026 era dar à pessoa motivos para explorar, conversar, encontrar documentos e relacionar informações, com a evolução na jogabilidade, e não só em texto e cenário; e manter separados conteúdo, regras, estado, interface e cena. Entre as referências estudadas ([REFERENCIAS-JOGOS.md](REFERENCIAS-JOGOS.md)), o gesto de inspeção do Papers, Please (marcar a ficha e o campo, e ver se bate) é o que mais se parece com conferir um registro contra o documento, que é o que o atlas pede ao leitor; o erro explicado pelo campo é a "citação" daquele jogo sem a multa. O diálogo em grafo próprio, e não o InkJS, porque o roteiro tem cinco nós e uma marca, e o InkJS pesa 31 kB gzip, exige compilador em build e guarda o estado como string JSON. A sala isométrica e o canvas 2D já existiam: nada de motor novo, e o three.js continua só na Cidade do Voto.

**Consequência.** `SALAS_DO_JOGO` ganhou `investigacao`; o catálogo do Escrivão, as falas da sala em todos os momentos; a entrada do jogo, o bloco "Missão de investigação"; o passaporte, os espaços da missão ao lado dos aprofundamentos. A edição passou a 0.4.0 sem registro factual novo e sem fonte nova. O que não foi feito, de propósito: espalhar o gesto para as fases de decisão da trilha, uma segunda missão por pessoa, pedidos laterais e gavetas liberadas por contagem (ideias do A Short Hike), que ficam para depois da validação do primeiro ciclo ([TAREFAS.md](TAREFAS.md)). A duração pretendida, de 5 a 10 minutos, é hipótese: ninguém jogou a missão em sessão de validação, nenhum aparelho real foi usado, e a revisão humana das fichas está pendente.

## D-152. A Cidade do Voto: a cena vive com a praça, as frases são ditas como resumo, e duas escolhas que não apontam lado

**Decisão (17 de outubro de 2026).** Quatro mudanças no protótipo da Cidade do Voto ([MUNDO.md](MUNDO.md)), todas a partir das pistas de uma análise anterior, conferidas antes de mudar.

- **A cena é criada ao entrar na praça e descartada ao sair.** A revelação desmonta o canvas; ao voltar, o canvas é outro elemento, e a cena é criada de novo nele, na posição em que o personagem parou e com as bandeiras visitadas no alto. A cena antiga para o laço, solta os recursos da placa e perde o contexto de propósito. O defeito foi reproduzido no código anterior antes da correção: o canvas novo ficava com 300 por 150 (em branco), enquanto o laço antigo desenhava em um elemento fora da tela.
- **Cada frase é um resumo editorial, e a tela diz isso.** O aviso "sem edição" contradizia a comparação e a regra 10 de [EDITORIAL.md](EDITORIAL.md); passou a dizer que cada frase resume uma frase do documento, com a mesma regra para as duas candidaturas, e que o documento e a página aparecem na revelação.
- **Sem a cena, a instrução é a da lista.** "Toque em um prédio da lista", e não "Ande até a porta".
- **"Concordo com partes dos dois" e "Ainda não sei" são escolhas próprias.** Contadas à parte na revelação, sem nome e sem entrar na conta de ninguém. "Nenhum dos dois" e as contagens por pessoa não mudaram de significado: a frase do resumo escreve cada tipo como é, e nada soma lados.

**Motivo.** O protótipo chegou pelo repositório remoto depois da última sessão, sem testes de navegador. Os quatro pontos afetavam a experiência (tela vazia ao voltar, instrução errada, aviso falso) ou a honestidade das escolhas (quem não sabe tinha de marcar "nenhum", que diz outra coisa). As duas escolhas novas entraram porque o resumo só mostra o que a própria pessoa marcou: contá-las à parte não cria recomendação nem soma.

**Consequência.** `tests/e2e/mundo.spec.ts` cobre os dois caminhos (com a cena, duas voltas; sem WebGL, a lista e as cinco escolhas), e entrou nas jornadas sobre a exportação. A jornada com a cena segura a tecla até o botão de entrar aparecer, porque com o WebGL por software a cena anda devagar; trocar por um sinal da cena é tarefa aberta. A frase original de cada proposta continua fora do atlas: a revelação mostra o documento e a página.

## D-153. A Praça do Mural: uma aventura de investigação em uma praça brasileira compacta, com o motor da cidade e os documentos do atlas

**Decisão (17 de outubro de 2026).** O jogo ganha uma direção nova, em uma rota nova (`/praca/`, "Praça" no menu), descrita em [PRACA.md](PRACA.md): uma praça brasileira pequena (coreto, calçada de pedra portuguesa, padaria, banca de jornal, um sobrado que é o arquivo e a Câmara ao fundo, fechada), em que a pessoa é a repórter nova da rádio comunitária e responde as perguntas que os moradores pregam no mural. O laço: ler a pergunta no mural, ouvir quem sabe onde procurar, abrir a gaveta certa no arquivo e levar cópias, montar a nota com os campos do documento (qual, quando, o que registra) e fixá-la no mural. Três verbos: ouvir, procurar, conferir. A primeira sessão tem duas pautas, uma por pessoa, com a mesma mecânica; publicá-las derruba a corrente da Câmara, que é a próxima sessão. Nada soma, nada dá nota, nada premia preferência.

- **Fato, ficção e regra ficam separados.** As gavetas são todas as decisões publicadas do atlas, por pessoa, instituição e ano (24 gavetas, 32 documentos); os recortes da banca são os 39 acontecimentos. A praça, os moradores (Zefa, Teodoro e o Escrivão, o mesmo guia do jogo), o bilhete e as perguntas são ficção, ditos como tal na tela. Cada pergunta só pergunta o que um documento responde: todo ano escrito nela está no documento apontado, e um teste confere ([EDITORIAL.md](EDITORIAL.md), regra 14).
- **A resposta é montada, não escolhida entre frases prontas.** As opções de cada campo vêm só das cópias que a pessoa levou do arquivo; a nota errada é recusada com uma frase por campo, feita dos campos do documento que ela escolheu, sem entregar o certo. A nota certa mostra os campos, o detalhe do registro (os dispositivos vetados; ou o objeto, a etapa e o resultado) e as fontes.
- **A exploração tem função.** A informação está espalhada: a pergunta no mural, o "onde" com a Zefa, o "como ler" com o Escrivão, o motivo dos dois votos parecidos com o Teodoro, a chave das gavetas do Senado num bilhete no chão. Lugares interativos têm placa e tapete; o cenário de fundo não tem.
- **O motor fica, o resto não.** A cena reaproveita o laço, a entrada, a colisão, a câmera e o joystick da Cidade do Voto (`src/features/world/scene.ts`), sem troca de biblioteca. Não entram na praça o mundo aberto de sete prédios iguais, o passaporte, a escolha de pessoa na entrada nem o quiz. A Cidade do Voto e as salas do jogo continuam no ar e no menu, intactas.
- **Progresso no navegador,** em `localStorage` (`atlas-politico:praca`, formato 1): pautas, itens, cópias, marcas de conversa e posição. Dado inválido vira começo. A entrada diz "Continuar de onde parou"; passar pela entrada e sair não apaga o que estava salvo.
- **Sem WebGL, a lista** dos mesmos lugares, com as mesmas janelas. Com `prefers-reduced-motion`, câmera e giro imediatos, moradores e bilhete parados.

**Motivo.** O responsável disse que o jogo continuava chato depois da missão de investigação (D-151). A medição sobre o mesmo commit da produção (`1b192aa`, edição 0.4.0) mostrou por quê: 195 palavras antes do primeiro botão na cidade; 412 palavras e 4,1 telas de celular no painel da missão; nas 19 perguntas do jogo, as palavras da opção certa aparecem 60% na explicação anterior contra 22% nas erradas (5 com trecho literal de 25 caracteres); uma geometria e oito cores para todos os prédios, cada um abrindo o mesmo painel; jogo e cidade como entradas separadas no menu; nenhum objetivo à vista. Ler e clicar era tudo o que havia, e o cenário não pagava a viagem. Entre três alternativas (praça; balcão de checagem à la Papers, Please; dossiê de dedução à la Obra Dinn), a praça é a única em que explorar serve para algo, a única com fantasia que dá verbo a quem joga, e a que menos arrisca a regra de não julgar: a resposta é sempre um documento e os campos dele. O balcão pede um veredito sobre afirmação a respeito de pessoa real; o dossiê é de novo uma mesa de leitura, e não cabe no celular.

**Consequência.** `src/lib/praca/` (tipos, ficção, regras puras, conteúdo montado no build), `src/features/praca/` (cena e tela), `src/app/praca/page.tsx`; `tests/praca.test.ts` (regras e integridade do conteúdo), `tests/e2e/praca.spec.ts` (a jornada inteira sem WebGL; a regressão da entrada; teclado, E, Esc e foco com a cena; movimento reduzido; joystick e toque no celular emulado), também sobre a exportação; `tests/export/praca.capture.ts` (33 capturas em `docs/capturas/praca/`, com o personagem andando de verdade). O canvas expõe a posição do personagem (`data-posicao`), e as jornadas esperam por ela, nunca por tempo. Limites: nenhum aparelho real, nenhuma pessoa jogou, nenhum número de desempenho de usuário, sem revisão humana dos textos, a Câmara anuncia uma sessão que não existe (resolvido na D-154, no mesmo dia), 22 das 24 gavetas não têm pauta ([TAREFAS.md](TAREFAS.md), T-22 a T-27). Durante a tarefa, sem commit, sem envio e sem publicação, como pedido; o envio veio depois, junto com a D-154, a pedido do responsável.

## D-154. A segunda sessão da praça: a sessão da Câmara, com uma matéria lado a lado, quatro pautas novas e um item por sessão

**Decisão (17 de outubro de 2026).** A Praça do Mural (D-153) ganha a segunda sessão, descrita em [PRACA.md](PRACA.md), seção 9. Concluir a primeira abre a Câmara, onde a Lourdes, secretária fictícia, põe na mesa uma matéria que passou pelas duas pessoas: o projeto de lei de 2022 sobre a Lei de Execução Penal, que o senador votou no Senado em 2024 e que o presidente sancionou com veto parcial em 2024. A pessoa leva os dois documentos do arquivo (gavetas de pessoas diferentes) e lavra a ata: por lado, o documento e o que ele registra, só com as cópias levadas; o erro é explicado por lado, com o documento escolhido; a ata certa mostra os dois documentos inteiros, lado a lado, com as fontes, e vai para o quadro de avisos da Câmara. O mural ganha quatro pautas novas, duas por pessoa, de gavetas que a primeira sessão não visita. O portão vira regra geral: cada sessão tem um item que abre um lugar (a chave, as gavetas do Senado; a credencial de imprensa, que o Teodoro recebe pelo correio, a mesa da Câmara), e `Sessao` diz a sessão anterior, o lugar que abre, as pautas, a matéria e o portão.

- **A ata não compara posições.** Os dois documentos citam a mesma proposição, com a mesma ementa (teste). Cada coluna diz o que o seu documento registra; a única frase sobre os dois, fixa, diz que um voto no texto de um projeto e um veto a dispositivos da lei são atos diferentes, sobre textos diferentes da mesma matéria. Nenhuma frase do jogo diz que um foi "a favor" e o outro "contra" a mesma coisa.
- **As falas continuam sem fato.** A Lourdes, o Teodoro e o Escrivão falam da papelada e do método ("um documento é de voto e o outro é de sanção"; "a ementa é a mesma nos dois"); o que cada pessoa fez fica nos documentos. As treze conversas passam pela validação do Escrivão.
- **O progresso não muda de formato.** `atas` entra no formato 1 como campo que pode faltar: o que foi gravado antes é lido como se o tivesse vazio.
- **O fim da edição é dito.** Com a ata e as seis notas, o cartão, a Zefa e a Lourdes dizem que as pautas acabaram e apontam a comparação do atlas. Nada soma, nada dá nota.

**Motivo.** A primeira sessão deixava a Câmara anunciando uma sessão que não existia, e 22 das 24 gavetas sem motivo (prioridade 1 de [PRACA.md](PRACA.md), T-22). Uma matéria que passou pelas duas pessoas é o único lugar da praça em que os dois documentos ficam lado a lado, e é o que a comparação do atlas faz com cartões: aqui a pessoa monta a ata com as próprias mãos, e a integridade fica na regra (mesma proposição, mesma ementa, sem frase de comparação). As quatro pautas foram escolhidas para que cada uma tenha um documento a comparar na mesma gaveta ou na vizinha, distinto pelo campo Ação ou pela data, e para cobrir naturezas que a primeira sessão não cobria (medida provisória, sanção expressa, autoria com lei promulgada pelo Legislativo, voto contra de 2024).

**Consequência.** `src/lib/praca/tipos.ts` (`Sessao`, `Materia`, `LadoDaMateria`, `Ata`, `atas` no progresso, `lourdes`, `credencial`), `praca.ts` (as sessões, as seis pautas, a matéria, treze conversas), `regras.ts` (sessões, mesa e ata, documento exposto para a nota e a ata), `conteudo.ts` (sessões e matérias filtradas pelos documentos publicados); `scene.ts` (seis notas, a Lourdes, o quadro de avisos); `PracaWorld.tsx` (mural por sessão, Câmara com a Lourdes e a mesa, ata lado a lado, caderno com a ata). `tests/praca.test.ts` (18 testes), `tests/e2e/praca.spec.ts` (6 jornadas, a nova com a segunda sessão inteira), `tests/export/praca.capture.ts` (48 capturas). Documentos: [PRACA.md](PRACA.md), seção 9; [TAREFAS.md](TAREFAS.md), T-22 feita e T-28 aberta; [EDITORIAL.md](EDITORIAL.md), regra 14; [STATUS.md](STATUS.md), [QA.md](QA.md), [ARCHITECTURE.md](ARCHITECTURE.md), capturas. Durante a tarefa nada foi enviado; o commit e o push à `main`, com as duas sessões, vieram em 17 de outubro de 2026, à noite, a pedido do responsável, em mensagem separada depois do relatório. O push publica no endereço provisório (D-147), com a revisão humana dos textos da praça pendente.

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
| Domínio público, canal de correção e indexação (D-117). O site está no ar em endereço provisório desde 11 de outubro de 2026, e um push na `main` publica (D-147): manter ou tirar o endereço, e ligar ou desligar a publicação a cada push | Decisão do responsável pelo projeto ([DEPLOY.md](DEPLOY.md)) |
| Som no jogo | Depois do lançamento |
| Escopo de propostas, projetos legislativos, votos e posicionamentos (auditoria externa de 10/10/2026, achado A-01). Respondido em parte na edição 0.3.0, com o recorte declarado: três frases por área do documento que cada candidatura registrou no TSE (D-138), oito leis estaduais e uma relatoria (D-136) e onze atos de 2003 a 2010 (D-143). Continua fora: "todas as propostas", posicionamentos e declarações | Decisão do responsável pelo projeto, se quiser ampliar |
| Licença do código (auditoria, achado A-10): não há arquivo LICENSE, e `npm run verify:release` avisa | Decisão do responsável pelo projeto |
| Separação das janelas do `GameShell` e sincronia do progresso entre abas (auditoria, P2). O link permanente, que a auditoria pedia para o capítulo, existe para a fase desde a D-139 | Quando o jogo ganhar novos modos |
| Recorte documental das decisões a publicar (quais votações e atos, com que critérios, para os dois), temas de cada proposição, e `casa` nos mandatos reais (D-122, D-123) | Entrega P1 do histórico de votos, por decisão editorial do responsável |
| Autoria e relatoria como entidades próprias (D-122) | Feito na edição 0.3.0: a atuação legislativa (D-136) |
| Fonte das votações da Alerj (só simbólicas nas amostras) e da Constituinte (sem registro individual na API da Câmara) (D-124) | Pesquisa documental fora das APIs: atas e Arquivo Histórico |
| As amostras da edição 0.3.0 (D-143): manter, ampliar ou refazer os atos de 2003 a 2010, as leis estaduais e a relatoria. Nos atos, a escolha entre candidatos da mesma área não ficou escrita quando foi feita | Revisão humana, com a tabela de `research/trilha-2026-10.md` na mão, e decisão do responsável pelo projeto |
| O limite de vinte acontecimentos por pessoa (D-144): ampliar, ou trocar um acontecimento por outro, para publicar as candidaturas de Lula de 1982 e de 1998, que estão em rascunho | Decisão do responsável pelo projeto |
| A escolha das frases das propostas eleitorais e a redação das fases, das perguntas e das definições (D-134, D-138) | Revisão humana ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)) |
| Se o ciclo da trilha é entendido sem ajuda, e quanto tempo uma trajetória leva (D-133). A meta de desenho, de dez a quinze minutos, não foi medida | Validação com pessoas que conhecem pouco de política ([USER-VALIDATION.md](USER-VALIDATION.md)) |
| A ementa do próprio ato do Executivo no modelo de dados. Sem ela, um decreto, que não tem proposição, aparece nas listas do jogo só com o nome e a área | Quando uma edição de conteúdo tocar os atos |
| O tom do Escrivão e a lista de registros de contexto sensível, agora por fase (D-129, D-142) | Aprovação de uma pessoa |
| Os nomes dos selos, as confirmações e as falas do carimbo no passaporte, e se ele ajuda alguém a continuar (D-150) | Aprovação de uma pessoa, e validação com pessoas ([USER-VALIDATION.md](USER-VALIDATION.md)) |
| As fichas, os distratores e as explicações da missão de investigação, e o tom da conversa do Escrivão (D-151) | Revisão humana ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)) e aprovação de uma pessoa |
| Se a missão leva de 5 a 10 minutos e se o gesto de apontar o campo é entendido sem ajuda (D-151) | Validação com pessoas, com o tempo medido ([TAREFAS.md](TAREFAS.md), T-09) |
| Levar o gesto de apontar o campo às fases de decisão da trilha, uma segunda missão por pessoa, pedidos laterais (D-151) | Depois da validação do primeiro ciclo ([TAREFAS.md](TAREFAS.md)) |
| Guardar a frase literal de cada proposta para a revelação da Cidade do Voto mostrá-la (D-152) | Decisão editorial |
