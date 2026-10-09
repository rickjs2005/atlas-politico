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

**Consequência.** Os dados chegam ao navegador pelas páginas, por props. Se a fase 6 preferir que o mapa busque o GeoJSON por endereço, basta copiar `dados/geo/` para `public/` no build. `content/published/` continua sendo conteúdo editado à mão; o "conjunto publicado" que as páginas leem passou a ser o gerado.

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

**Consequência.** As cores do mapa repetem os tokens em `src/features/map/palette.ts`, porque o WebGL não lê variáveis CSS; `tests/design.test.ts` falha se os dois lados divergirem e confere o contraste mínimo de cada par em uso. No mapa a categoria ainda aparece só pela cor (fase 6).

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

**Decisão (fase 4).** A terra, as fronteiras e as divisas dos estados vêm de dois arquivos GeoJSON derivados do Natural Earth 1:50m, recortados para a América do Sul e guardados em `src/features/map/base/`. O Brasil aparece em tom mais claro. Não há rótulos.

**Motivo.** A base da fase 1 era só uma grade de meridianos e paralelos, e os pontos ficavam sem referência. O Natural Earth é de domínio público e cabe em 255 KB, o que permite continuar sem tiles e sem pedir nada a terceiros. Rótulos exigem arquivos de glyphs, que são decisão da fase 6.

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

## Pontos em aberto

| Tema | Decide-se em |
|---|---|
| Comando de promoção de rascunhos e verificador de evidências (D-36) | Quando o volume de conteúdo pedir |
| Buscar o GeoJSON por endereço, em vez de recebê-lo pela página (D-28) | Fase 6 |
| Exigir revisão humana como condição de publicação | Fase 9 |
| Canal público de correção e quem assina a revisão humana | Decisão do responsável pelo projeto |
| Base cartográfica definitiva, glyphs locais e rótulos do mapa (D-43) | Fase 6 |
| Pontos como camada de círculos ou como marcadores HTML focáveis pelo teclado | Fase 6 |
| Pontos sobrepostos: agrupar ou listar por lugar | Fase 6 |
| Arquivos de segmento do Next na saída estática, pedidos com ponto e gravados em pastas (STATUS.md) | Fase 8 ou 10 |
| Nome definitivo do atlas (o rodapé diz "nome provisório") | Decisão do responsável pelo projeto |
| Exibir em cinza e recortado o retrato cuja condição de uso é "livre com crédito" (D-42) | Decisão do responsável pelo projeto |
