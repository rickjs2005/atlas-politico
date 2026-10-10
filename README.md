# Atlas Político

Nome provisório. Um atlas para percorrer a trajetória pública de Lula e de Flávio Bolsonaro por uma linha do tempo, um mapa, acontecimentos acompanhados das fontes que os sustentam e por um jogo que percorre as duas trajetórias inteiras em capítulos. Projeto de portfólio da MilWeb.

> **Projeto em desenvolvimento. Não use como fonte.** O conteúdo trata de duas pessoas públicas e foi conferido só com assistência de IA: nenhuma pessoa refez a revisão do conjunto, e a validação com leitores está pendente. O site não foi publicado: não há hospedagem, e as páginas levam `noindex`. Cada registro traz as fontes que o sustentam; em caso de dúvida, vale o documento citado.

**Estágio atual:** fases 1 a 8 de 10 concluídas (fundação, primeiro conjunto de conteúdo, camada de dados, experiência e direção visual, aplicação com linha do tempo, mapa sincronizado, comparação, páginas e fontes, e acabamento visual e desempenho). A fase 9 está com a parte editorial e técnica feita e com a validação com pessoas pendente. O atlas tem a edição 0.1.1 do conteúdo, com data de corte em 8 de outubro de 2026: 39 acontecimentos, com fontes, para os dois perfis. Um pipeline local valida o conteúdo, seleciona o que foi revisado e gera os dados, os índices e o GeoJSON que as páginas leem. A fase 4 entregou a direção visual e as quatro telas (entrada, exploração, acontecimento e comparação), em computador, tablet e celular. A fase 5 tornou a exploração navegável no tempo: escolher a pessoa, consultar um ano ou um intervalo, filtrar categorias, abrir um acontecimento e ler os detalhes, com a consulta inteira no endereço. A fase 6 ligou o mapa a esse recorte: um marcador por lugar documentado, seleção nos dois sentidos, lista para os acontecimentos que dividem um lugar e leitura preservada quando o mapa falha. A fase 7 pôs a comparação no mesmo recorte para as duas pessoas, com a consulta no endereço; completou o perfil e a página de cada acontecimento, com fontes, créditos, revisão e edição; acrescentou **Copiar link** e o retorno com o recorte de antes; e escreveu a metodologia pública. A fase 8 fez o acabamento: retratos em versões locais do tamanho de cada tela, mapa carregado só quando vai ser usado, transições curtas que acompanham a seleção, abertura e leitura com a hierarquia revista, e o desempenho medido antes e depois ([docs/PERFORMANCE.md](docs/PERFORMANCE.md)). A fase 9 abriu de novo as 60 fontes, releu cada registro contra os documentos, corrigiu o que encontrou e testou as jornadas sobre a exportação estática ([docs/EDITORIAL-REVIEW.md](docs/EDITORIAL-REVIEW.md) e [docs/QA.md](docs/QA.md)); o roteiro da validação com três pessoas está pronto e ainda não foi aplicado ([docs/USER-VALIDATION.md](docs/USER-VALIDATION.md)). Depois da fase 9 entrou o **jogo**: o visitante escolhe uma das duas pessoas, controla um personagem por cenários isométricos e percorre a trajetória inteira em capítulos (seis de Lula, cinco de Flávio Bolsonaro, os 39 acontecimentos publicados), recolhendo registros do atlas e cumprindo uma tarefa (encontrar um registro, pôr dois em ordem, indicar o documento que sustenta um registro ou o lugar documentado) para abrir a passagem ao capítulo seguinte; os episódios de processo trazem uma ficha judicial com a natureza da decisão e as decisões relacionadas, com data ([docs/GAMEPLAY.md](docs/GAMEPLAY.md), [docs/GAME-RELEASE.md](docs/GAME-RELEASE.md)). Toda a conferência do conteúdo foi assistida por IA, e a revisão humana está pendente ([docs/HUMAN-REVIEW.md](docs/HUMAN-REVIEW.md)); por isso o site não está pronto para publicação, e o procedimento de publicação ([docs/DEPLOY.md](docs/DEPLOY.md)) só roda com autorização. O que está pronto, o que ainda é demonstração e o que falta está em [docs/STATUS.md](docs/STATUS.md).

## Requisitos

| Item | Versão |
|---|---|
| Node.js | 22.18 ou superior, ou 24 (desenvolvido e verificado no 24.15.0) |
| npm | 11 (o lock do projeto é o `package-lock.json`; não misture com pnpm ou yarn) |
| Navegador | Com WebGL 2 para ver o mapa. Sem ele o atlas mostra os lugares em lista, e o resto funciona igual |
| Chromium do Playwright | Só para `npm run test:e2e`. Em máquina nova: `npx playwright install chromium` |

Nenhum serviço externo, conta ou variável de ambiente. Tudo roda com os arquivos do projeto. Há uma configuração pendente, que não impede nada: o canal público de correção, em `src/lib/site.ts` (docs/PAGES.md, seção Configuração pendente).

O Node 22.18 é o mínimo porque os comandos de dados rodam o TypeScript do projeto direto no Node, sem compilar.

### Versões instaladas

| Pacote | Versão | Uso |
|---|---|---|
| next | 16.4.0 | Aplicação, rotas e exportação estática (Turbopack) |
| react, react-dom | 19.3.0 | Interface |
| typescript | 5.9.3 | Modo `strict`, mais `noUncheckedIndexedAccess` e `erasableSyntaxOnly` |
| tailwindcss, @tailwindcss/turbopack | 4.3.3 | Estilo, sobre variáveis CSS |
| maplibre-gl | 6.13.0 | Mapa |
| zod | 4.6.5 | Schemas do conteúdo |
| server-only | 0.0.1 | Impede que a leitura de conteúdo vá para o navegador |
| vitest | 5.0.3 | Testes das regras de dados, do pipeline e de estado |
| @playwright/test | 1.63.0 | Testes de navegador e capturas da prévia |
| eslint, eslint-config-next | 9.39.5, 16.4.0 | Lint e fronteiras entre camadas |
| sharp | 0.35.5 | Só em desenvolvimento: prepara as versões dos retratos (`npm run images`). Não vai para o site |

As fases 3 a 7 não acrescentaram nenhuma dependência. A fase 8 declarou uma, de desenvolvimento: o `sharp`, que já vinha instalado como parte do Next e passou a ser usado para preparar os retratos. As fontes tipográficas (`src/app/fonts/`) e os contornos do mapa (`src/features/map/base/`) são arquivos do projeto, com a licença de cada um descrita na própria pasta. O mapa não usa tiles, chave de API nem serviço de terceiros.

## Instalação

```bash
npm install
```

## Execução local

```bash
npm run dev
```

Gera os dados e abre em http://localhost:3000. Com erro no conteúdo, o comando para antes de subir o servidor e mostra o que corrigir.

Com o servidor aberto, editar um arquivo de `content/` e recarregar a página basta: os dados são gerados de novo. Se a edição tiver erro, a página mostra os diagnósticos.

As telas (docs/UX.md):

| Tela | Endereço |
|---|---|
| Entrada | http://localhost:3000/ |
| Exploração | http://localhost:3000/politicos/lula/ e http://localhost:3000/politicos/flavio-bolsonaro/ |
| Acontecimento | http://localhost:3000/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/ |
| Comparação | http://localhost:3000/comparar/ |
| Metodologia | http://localhost:3000/metodologia/ |
| Jogo: escolha do personagem | http://localhost:3000/jogo/ |
| Jogo: os capítulos de cada personagem | http://localhost:3000/jogo/lula/ e http://localhost:3000/jogo/flavio-bolsonaro/ |
| Guia de estados, só em desenvolvimento | http://localhost:3000/dev/previa/ |
| Galeria da arte do jogo, só em desenvolvimento | http://localhost:3000/dev/jogo-arte/ |

Na exploração, o período, as categorias e o acontecimento aberto ficam no endereço. O que está na tela pode ser recarregado, enviado por link e percorrido com voltar e avançar (docs/TIMELINE.md):

| Consulta | Endereço |
|---|---|
| Um ano | http://localhost:3000/politicos/lula/?de=2018&ate=2018 |
| Um intervalo e duas categorias | http://localhost:3000/politicos/lula/?de=2016&ate=2022&categorias=eleicoes,marcos-historicos |
| Um acontecimento aberto, dentro de um intervalo | http://localhost:3000/politicos/lula/?de=2016&ate=2019&acontecimento=lula-2018-prisao-em-curitiba |
| Um ano com mudança de partido | http://localhost:3000/politicos/flavio-bolsonaro/?de=2021&ate=2021 |
| Um período sem registros | http://localhost:3000/politicos/lula/?de=1996&ate=2001 |

Parâmetros: `de` e `ate` (ano com quatro dígitos), `categorias` (identificadores separados por vírgula) e `acontecimento` (slug). Um parâmetro inválido é descartado sozinho, e o endereço é corrigido no lugar.

O mapa acompanha a mesma consulta (docs/MAP.md):

| Estado do mapa | Endereço |
|---|---|
| Um acontecimento com dois lugares, os dois destacados | http://localhost:3000/politicos/lula/?acontecimento=lula-2023-intervencao-federal-no-distrito-federal |
| Um acontecimento de abrangência nacional, sem ponto | http://localhost:3000/politicos/lula/?acontecimento=lula-2002-eleito-presidente |
| Um recorte sem nenhum ponto | http://localhost:3000/politicos/flavio-bolsonaro/?de=2021&ate=2021 |

Em tela estreita, o mapa fica na vista **Mapa**. Para ver a lista de lugares que assume quando o mapa falha, abra http://localhost:3000/dev/prova/ e ligue **Simular navegador sem WebGL**.

A comparação guarda o período e as categorias no endereço, e as páginas abrem por link direto (docs/COMPARISON.md e docs/PAGES.md):

| O que abre | Endereço |
|---|---|
| As duas trajetórias em um intervalo, com uma categoria | http://localhost:3000/comparar/?de=2016&ate=2022&categorias=eleicoes |
| Um período em que uma trajetória está fora da cobertura | http://localhost:3000/comparar/?de=1996&ate=2001 |
| O perfil, com cargos, partidos, fontes e edição | http://localhost:3000/politicos/flavio-bolsonaro/ (em tela estreita, na vista **Perfil**) |
| A página de um acontecimento, por link direto | http://localhost:3000/acontecimentos/lula-2018-prisao-em-curitiba/ |
| A mesma página, vinda de uma consulta: o retorno devolve o recorte | http://localhost:3000/acontecimentos/lula-2018-prisao-em-curitiba/?de=2016&ate=2019&categorias=marcos-historicos |
| O modelo de correção, já com o registro | http://localhost:3000/metodologia/?acontecimento=lula-2018-prisao-em-curitiba#correcao |

No jogo (docs/GAMEPLAY.md): setas ou W, A, S e D para andar, e E, Enter ou espaço para interagir; em tela de toque, o direcional e o botão de ação. A saída de cada capítulo abre com todos os registros recolhidos e a tarefa cumprida. O botão **Capítulos e tarefas** faz tudo sem o cenário. O progresso fica no navegador, separado por personagem, e não vai ao endereço.

**Copiar link** copia o endereço em que o atlas está aberto. Em uma página servida por `http` fora do próprio computador, o navegador não deixa copiar, e o link aparece em um campo.

Telas de prova técnica, que só existem com `npm run dev` e não entram no build de produção:

| Endereço | Dados | Para quê |
|---|---|---|
| http://localhost:3000/dev/dados/ | Os da edição, lidos de `generated/` | Ver o caminho inteiro com conteúdo real: gerador, leitor, lista, mapa e painel |
| http://localhost:3000/dev/prova/ | Sintéticos, das fixtures de teste | Exercitar os casos de borda: datas parciais, dois lugares, sem lugar, falha do mapa |

Nas duas dá para:

- selecionar um acontecimento pela lista e ver o mapa e o painel acompanharem;
- clicar em um marcador do mapa e ver a lista e o painel acompanharem (o marcador com número abre antes a lista dos acontecimentos daquele lugar);
- trocar a pessoa e ver lista, mapa e painel mostrarem o mesmo recorte;
- ligar "Simular navegador sem WebGL" e ver a lista de lugares assumir o lugar do mapa.

## Dados

O conteúdo fica em JSON, em `content/`, mantido direto no repositório, e não é gerado por comando. As páginas não leem essa pasta: leem `generated/`, que um comando produz depois de validar tudo. O funcionamento completo está em [docs/DATA-PIPELINE.md](docs/DATA-PIPELINE.md).

| Comando | O que faz |
|---|---|
| `npm run data:validate` | Confere o conteúdo e mostra erros, pendências e avisos. Não grava nada |
| `npm run data:build` | Valida e gera `generated/`: conjunto publicado, índices e GeoJSON |
| `npm run data:report` | Cobertura por pessoa, período e categoria, pontos no mapa e pendências, em Markdown |
| `npm run data:import -- <arquivo.json>` | Importa um pacote JSON para `content/drafts/`, como rascunho. Com `--dry-run`, só mostra o resultado |
| `npm run data:query -- [filtros]` | Consulta os dados gerados: `--pessoa`, `--de`, `--ate`, `--categorias`, `--lugar`, `--acontecimento` |

Exemplos:

```bash
npm run data:query -- --pessoa lula --de 2016 --ate 2019
npm run data:import -- pesquisa/pacote.json --source "Planilha de outubro" --dry-run
npm run data:report -- --out docs/DATA-REPORT.md
```

`npm run dev` e `npm run build` já geram os dados. Conteúdo com erro interrompe os dois.

## Build estático

```bash
npm run build     # gera os dados, confere os retratos, gera a pasta out/ e a ajusta
npm run preview   # serve out/ em http://localhost:4311
```

`out/` é um site de arquivos estáticos: pode ser servido por qualquer hospedagem, sem Node.js em produção. `next start` não se aplica a este projeto.

`npm run build` faz quatro coisas, nesta ordem: gera os dados (`data:build`), confere se as versões dos retratos estão em dia (`images:check`), roda o `next build` e ajusta a saída (`scripts/finalize-export.mjs`). O ajuste devolve os arquivos de navegação ao nome que o navegador pede, retira os arquivos do MapLibre que ninguém pede e completa o pré-carregamento das fontes nas páginas de acontecimento. O motivo de cada passo está em [docs/PERFORMANCE.md](docs/PERFORMANCE.md).

`npm run preview` responde como uma hospedagem comum: compressão gzip, `ETag` e cache longo para os arquivos de `/_next/static/`.

### Retratos

As páginas não pedem o arquivo original de um retrato: pedem versões menores, já recortadas para cada moldura. Ao trocar um retrato em `public/media/retratos/`, ou o enquadramento em `scripts/images.config.json`:

```bash
npm run images         # gera public/media/derivados/ e o manifesto
npm run images:check   # só confere; é o que `dev` e `build` rodam
```

Confira o resultado antes de continuar: o enquadramento é o mesmo critério para os dois perfis (linha dos olhos na mesma altura, rosto do mesmo tamanho).

## Verificação

| Comando | O que confere |
|---|---|
| `npm run lint` | ESLint, incluindo as fronteiras entre camadas |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc` |
| `npm run test` | Datas, schemas, integridade, pipeline, consultas, geração, importação, comandos, estado, endereço e histórico, comparação, endereços entre telas e retorno, versões dos retratos, pontos, lugares e câmera do mapa, linha do tempo, lista cronológica, cobertura, base visual, com o contraste das cores, e o jogo: regras de missão, progresso, armazenamento, mundo, entrada de teclado e capítulos contra o conteúdo (Vitest) |
| `npm run build` | Gera os dados e o site. Falha se o conteúdo estiver inválido |
| `npm run verify:export` | Confere `out/`: páginas previstas, uma página por acontecimento publicado e nenhuma por rascunho, nenhuma rota de desenvolvimento, nenhum dado sintético, versões dos retratos publicadas, arquivos de navegação no lugar, nenhum arquivo do MapLibre sem uso e o pré-carregamento da fonte em todas as páginas |
| `npm run check` | Os cinco acima, em sequência |
| `npm run test:e2e` | As telas de prova, as quatro telas, a navegação temporal com o endereço, o mapa sincronizado, a comparação, as páginas de perfil, de acontecimento e de metodologia, o acabamento (quatro larguras, transições, link com consulta e a jornada principal) e o jogo (movimento, colisão, tarefa, saída, avanço, progresso, painel, toque em pé e deitado e os avisos editoriais), em um Chromium real (Playwright), em computador, tablet e celular. Sobe o próprio servidor na porta 4310 |
| `npm run test:export` | Sobre a saída estática, depois de `npm run build`: o que cada página pede e quando, o mapa carregado só quando vai ser usado, as versões dos retratos, a navegação pré-carregada e o palco do jogo em pacote à parte, pedido só na página do jogo, com a página sem JavaScript e a falha de um pacote. Sobe o próprio servidor na porta 4311 |
| `npm run test:journeys` | As jornadas de `npm run test:e2e` com dados reais, rodadas sobre a saída estática, depois de `npm run build`. É o que mostra defeitos que o servidor de desenvolvimento esconde ([docs/QA.md](docs/QA.md)) |
| `npm run audit:a11y` | Passagem de acessibilidade sobre a saída estática: contraste do texto desenhado, rolagem lateral, alvos e ordem de foco, em dez telas (as oito do atlas e as duas do jogo) e quatro larguras. Grava capturas e um relatório em `test-results/a11y/` |
| `npm run measure -- --rotulo <nome>` | Mede carregamento, estabilidade visual, peso e resposta das interações sobre a saída estática, e grava `docs/desempenho/<nome>.json`. Com `--contra <nome>=<pasta>`, mede dois builds alternando as execuções |
| `npm run capture:game` | Refaz as capturas de `docs/capturas/jogo-lancamento/`, tiradas da saída estática. Só registra as telas do jogo; a única conferência é que a página não esteja rolada na captura |
| `npm run measure:game -- --rotulo <nome>` | Medições de laboratório das páginas do jogo sobre a saída estática: carregamento, palco pronto, rede e cadência de quadros parado e andando; grava `docs/desempenho/jogo-<nome>.json` |
| `npm run game:coverage` | Regrava `docs/GAME-COVERAGE.md`, a matriz acontecimento → personagem → capítulo, a partir dos dados; com `-- --check`, só confere |
| `npm run review:human` | Regrava `docs/HUMAN-REVIEW.md`, a lista do que precisa de revisão humana, trecho a trecho, a partir dos dados; com `-- --check`, só confere |
| `npm run verify:release` | A barreira de release: recusa a publicação, com o diagnóstico, enquanto houver registro sem revisão humana ou domínio e canal de correção sem valor; avisa sobre indexação desligada e falta de licença. Não é o build: `npm run check` continua passando com o conteúdo em conferência ([docs/DEPLOY.md](docs/DEPLOY.md)) |
| `node scripts/capture-art.mjs --saida <pasta>` | Com `npm run dev` rodando, captura a galeria da arte do jogo (cenas, peças e as figuras por época) como PNG |
| `node scripts/share-image.mjs` | Regrava `public/share/atlas.png`, a imagem da prévia de compartilhamento |
| `npm run capture:finish` | Refaz as capturas de `docs/capturas/fase-8/`, tiradas da saída estática |
| `npm run capture:pages` | Refaz as capturas de `docs/capturas/fase-7/`. Não confere nada: só registra as telas |
| `npm run capture:map` | Refaz as capturas de `docs/capturas/fase-6/`. Não confere nada: só registra as telas |
| `npm run capture:timeline` | Refaz as capturas de `docs/capturas/fase-5/` com a interface atual |
| `npm run capture:preview` | Refaz as capturas de `docs/capturas/fase-4/` com a interface atual |

Antes de qualquer entrega: `npm run check`, `npm run test:journeys`, `npm run test:export` e `npm run test:e2e`, um de cada vez. O GitHub repete tudo isso a cada push na `main` e a cada pull request (`.github/workflows/verificacao.yml`: um trabalho com `check`, as suítes sobre a exportação, a passagem de acessibilidade e a conferência da matriz e da lista de revisão; outro com as jornadas no servidor de desenvolvimento), guardando os resultados dos testes quando algo falha. Nada ali publica.

## Estrutura

```
content/
  published/     a edição: registros no estado `revisado` (conferência assistida por IA)
  drafts/        pesquisa em andamento e importações
generated/       dados gerados por `npm run data:build` (fora do Git)
docs/            arquitetura, dados, experiência, desempenho, decisões, status e capturas
  desempenho/    resultado bruto das medições (JSON)
public/
  media/         retratos e imagens, como cadastrados
    derivados/   versões dos retratos que as páginas pedem (geradas por `npm run images`)
scripts/         comandos de dados, preparo dos retratos, ajuste, conferência, pré-visualização e medição da saída
src/
  app/           rotas e páginas; fontes tipográficas em app/fonts/
  components/    base visual: retrato, data, categoria, fontes, perfil, cópia de link, troca de pessoa, peças da linha do tempo
  features/
    events/      lista cronológica, lacunas e leitura de acontecimentos
    map/         mapa, marcadores, seletor de lugares, câmera e contornos da base
    timeline/    linha do tempo, período, categorias e cargos e partidos do período
    comparison/  trajetórias na mesma escala
    game/        o jogo: casca, palco, desenho (draw/), motor (engine/) e interface (ui/)
  lib/
    domain/      regras e contratos de dados, sem I/O
    data/        formato dos dados públicos, índices, pontos e consultas
    game/        regras do jogo, sem interface: capítulos, cenários, missão, progresso e mundo
    media/       molduras, larguras e nomes das versões dos retratos
    publication/ validação, elegibilidade, relatório e importação, sem I/O
    content/     leitura de content/ e leitura e gravação de generated/
    state/       estado compartilhado, seletores, endereço, histórico e endereços entre telas
    site.ts      configuração que depende de decisão do responsável (canal de correção)
tests/
  fixtures/sintetico/   dados de teste, todos marcados como sintéticos
  e2e/                  testes de navegador, sobre o servidor de desenvolvimento
  export/               testes e capturas sobre a saída estática
```

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): camadas, fluxo de dados, rotas e estado.
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md): entidades, relacionamentos e regras de datas, lugares e revisão.
- [docs/DATA-PIPELINE.md](docs/DATA-PIPELINE.md): validação, elegibilidade, dados gerados, consultas, importação e como atualizar o conteúdo.
- [docs/DATA-REPORT.md](docs/DATA-REPORT.md): relatório de cobertura da edição atual, gerado por `npm run data:report`.
- [docs/UX.md](docs/UX.md): direção visual, as quatro telas, composição por largura e roteiro de demonstração.
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md): tokens, tipografia, categorias e componentes.
- [docs/INTERACTIONS.md](docs/INTERACTIONS.md): seleção, teclado, estados, movimento e o que ainda é demonstração.
- [docs/TIMELINE.md](docs/TIMELINE.md): navegação temporal: troca de pessoa, filtros, datas, seleção, endereço, histórico e o contrato com o mapa.
- [docs/MAP.md](docs/MAP.md): mapa: base e recursos locais, recorte, seleção, pontos sobrepostos, câmera, precisão, falhas e conferência.
- [docs/COMPARISON.md](docs/COMPARISON.md): comparação: mesmo recorte e mesma escala, estado e endereço, datas e intervalos, linguagem e limites.
- [docs/GAMEPLAY.md](docs/GAMEPLAY.md): o jogo: fluxo, os onze capítulos, as quatro tarefas, a ficha judicial, regras editoriais, controles, progresso com migração, arquitetura, direção visual e o que falta.
- [docs/GAME-RELEASE.md](docs/GAME-RELEASE.md): o plano até a versão de lançamento, os riscos de prazo, as pendências humanas e os cortes possíveis.
- [docs/GAME-COVERAGE.md](docs/GAME-COVERAGE.md): a matriz acontecimento → personagem → capítulo, gerada dos dados.
- [docs/HUMAN-REVIEW.md](docs/HUMAN-REVIEW.md): a lista do que precisa de revisão humana, trecho a trecho, gerada dos dados.
- [docs/DEPLOY.md](docs/DEPLOY.md): o procedimento de publicação preparado, e o que depende de decisão.
- [docs/PAGES.md](docs/PAGES.md): perfis, página do acontecimento, fontes e créditos, copiar link, retorno, metodologia e configuração pendente.
- [docs/PERFORMANCE.md](docs/PERFORMANCE.md): condições e resultados das medições antes e depois da fase 8, o que cada página carrega, imagens, fontes, mapa e limitações.
- [docs/capturas/](docs/capturas/README.md): capturas reais das telas, por fase.
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões adotadas e seus motivos.
- [docs/STATUS.md](docs/STATUS.md): situação de cada fase, limitações e preparação para a próxima.
- [docs/SOURCES.md](docs/SOURCES.md): catálogo das fontes e critérios de uso.
- [docs/EDITORIAL.md](docs/EDITORIAL.md): critérios de seleção, redação, revisão e correção.
- [docs/CONTENT-REVIEW.md](docs/CONTENT-REVIEW.md): itens conferidos, divergências e pendências da pesquisa.
- [docs/EDITORIAL-REVIEW.md](docs/EDITORIAL-REVIEW.md): revisão editorial da fase 9: conjunto revisado, conferência fonte por fonte, correções, pendências e roteiro da revisão humana.
- [docs/QA.md](docs/QA.md): conferência técnica da fase 9: ambiente, regras de dados, jornadas, acessibilidade, falhas corrigidas e o que não foi verificado.
- [docs/USER-VALIDATION.md](docs/USER-VALIDATION.md): roteiro e fichas da validação com três pessoas. Ainda não aplicado.
- [content/README.md](content/README.md): contrato dos arquivos de conteúdo e como editar.
