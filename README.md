# Atlas Político

Nome provisório. Um atlas para percorrer a trajetória pública de Lula e de Flávio Bolsonaro por uma linha do tempo, um mapa e acontecimentos acompanhados das fontes que os sustentam. Projeto de portfólio da MilWeb.

**Estágio atual:** fases 1 a 6 de 10 concluídas (fundação, primeiro conjunto de conteúdo, camada de dados, experiência e direção visual, aplicação com linha do tempo e mapa sincronizado). O atlas tem a edição 0.1.0 do conteúdo, com data de corte em 8 de outubro de 2026: 39 acontecimentos, com fontes, para os dois perfis. Um pipeline local valida o conteúdo, seleciona o que foi revisado e gera os dados, os índices e o GeoJSON que as páginas leem. A fase 4 entregou a direção visual e as quatro telas (entrada, exploração, acontecimento e comparação), em computador, tablet e celular. A fase 5 tornou a exploração navegável no tempo: escolher a pessoa, consultar um ano ou um intervalo, filtrar categorias, abrir um acontecimento e ler os detalhes, com a consulta inteira no endereço. A fase 6 ligou o mapa a esse recorte: um marcador por lugar documentado, seleção nos dois sentidos, lista para os acontecimentos que dividem um lugar e leitura preservada quando o mapa falha. Toda a conferência do conteúdo foi assistida por IA, e a revisão humana está pendente; por isso o site não está pronto para publicação. O que está pronto, o que ainda é demonstração e o que falta está em [docs/STATUS.md](docs/STATUS.md).

## Requisitos

| Item | Versão |
|---|---|
| Node.js | 22.18 ou superior, ou 24 (desenvolvido e verificado no 24.15.0) |
| npm | 11 (o lock do projeto é o `package-lock.json`; não misture com pnpm ou yarn) |
| Navegador | Com WebGL 2 para ver o mapa. Sem ele o atlas mostra os lugares em lista, e o resto funciona igual |
| Chromium do Playwright | Só para `npm run test:e2e`. Em máquina nova: `npx playwright install chromium` |

Nenhum serviço externo, conta ou variável de ambiente. Tudo roda com os arquivos do projeto.

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

As fases 3 a 6 não acrescentaram nenhuma dependência. As fontes tipográficas (`src/app/fonts/`) e os contornos do mapa (`src/features/map/base/`) são arquivos do projeto, com a licença de cada um descrita na própria pasta. O mapa não usa tiles, chave de API nem serviço de terceiros.

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

As quatro telas (docs/UX.md):

| Tela | Endereço |
|---|---|
| Entrada | http://localhost:3000/ |
| Exploração | http://localhost:3000/politicos/lula/ e http://localhost:3000/politicos/flavio-bolsonaro/ |
| Acontecimento | http://localhost:3000/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/ |
| Comparação | http://localhost:3000/comparar/ |
| Guia de estados, só em desenvolvimento | http://localhost:3000/dev/previa/ |

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

O conteúdo é editado à mão em `content/`. As páginas não leem essa pasta: leem `generated/`, que um comando produz depois de validar tudo. O funcionamento completo está em [docs/DATA-PIPELINE.md](docs/DATA-PIPELINE.md).

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
npm run build     # gera os dados e depois a pasta out/
npm run preview   # serve out/ em http://localhost:4311
```

`out/` é um site de arquivos estáticos: pode ser servido por qualquer hospedagem, sem Node.js em produção. `next start` não se aplica a este projeto.

## Verificação

| Comando | O que confere |
|---|---|
| `npm run lint` | ESLint, incluindo as fronteiras entre camadas |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc` |
| `npm run test` | Datas, schemas, integridade, pipeline, consultas, geração, importação, comandos, estado, endereço e histórico, pontos, lugares e câmera do mapa, linha do tempo, lista cronológica, cobertura e base visual, com o contraste das cores (Vitest) |
| `npm run build` | Gera os dados e o site. Falha se o conteúdo estiver inválido |
| `npm run verify:export` | Confere `out/`: páginas previstas, uma página por acontecimento publicado e nenhuma por rascunho, nenhuma rota de desenvolvimento, nenhum dado sintético |
| `npm run check` | Os cinco acima, em sequência |
| `npm run test:e2e` | As telas de prova, as quatro telas, a navegação temporal com o endereço e o mapa sincronizado, em um Chromium real (Playwright), em computador, tablet e celular. Sobe o próprio servidor na porta 4310 |
| `npm run capture:map` | Refaz as capturas de `docs/capturas/fase-6/`. Não confere nada: só registra as telas |
| `npm run capture:timeline` | Refaz as capturas de `docs/capturas/fase-5/` com a interface atual |
| `npm run capture:preview` | Refaz as capturas de `docs/capturas/fase-4/` com a interface atual |

Antes de qualquer entrega: `npm run check` e `npm run test:e2e`.

## Estrutura

```
content/
  published/     a edição: registros revisados, editados à mão
  drafts/        pesquisa em andamento e importações
generated/       dados gerados por `npm run data:build` (fora do Git)
docs/            arquitetura, dados, experiência, decisões, status e capturas
public/
  media/         retratos e imagens
scripts/         comandos de dados, conferência e pré-visualização da saída
src/
  app/           rotas e páginas; fontes tipográficas em app/fonts/
  components/    base visual: retrato, data, categoria, fontes, troca de pessoa, peças da linha do tempo
  features/
    events/      lista cronológica, lacunas e leitura de acontecimentos
    map/         mapa, marcadores, seletor de lugares, câmera e contornos da base
    timeline/    linha do tempo, período, categorias e cargos e partidos do período
    comparison/  trajetórias na mesma escala
  lib/
    domain/      regras e contratos de dados, sem I/O
    data/        formato dos dados públicos, índices, pontos e consultas
    publication/ validação, elegibilidade, relatório e importação, sem I/O
    content/     leitura de content/ e leitura e gravação de generated/
    state/       estado compartilhado, seletores, endereço e histórico
tests/
  fixtures/sintetico/   dados de teste, todos marcados como sintéticos
  e2e/                  testes de navegador
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
- [docs/capturas/](docs/capturas/README.md): capturas reais das telas, por fase.
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões adotadas e seus motivos.
- [docs/STATUS.md](docs/STATUS.md): situação de cada fase, limitações e preparação para a próxima.
- [docs/SOURCES.md](docs/SOURCES.md): catálogo das fontes e critérios de uso.
- [docs/EDITORIAL.md](docs/EDITORIAL.md): critérios de seleção, redação, revisão e correção.
- [docs/CONTENT-REVIEW.md](docs/CONTENT-REVIEW.md): itens conferidos, divergências e pendências da pesquisa.
- [content/README.md](content/README.md): contrato dos arquivos de conteúdo e como editar.
