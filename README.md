# Atlas Político

Nome provisório. Um atlas para percorrer a trajetória pública de Lula e de Flávio Bolsonaro por uma linha do tempo, um mapa e acontecimentos acompanhados das fontes que os sustentam. Projeto de portfólio da MilWeb.

**Estágio atual:** fases 1 a 3 de 10 concluídas (fundação, primeiro conjunto de conteúdo e camada de dados). O atlas tem a edição 0.1.0 do conteúdo, com data de corte em 8 de outubro de 2026: 39 acontecimentos, com fontes, para os dois perfis. Um pipeline local valida o conteúdo, seleciona o que foi revisado e gera os dados, os índices e o GeoJSON que as páginas leem. Toda a conferência do conteúdo foi assistida por IA, e a revisão humana está pendente; por isso o site não está pronto para publicação. A interface ainda é estrutural: páginas de perfil e de acontecimento, mais duas telas de prova técnica restritas ao desenvolvimento. O que está pronto e o que falta está em [docs/STATUS.md](docs/STATUS.md).

## Requisitos

| Item | Versão |
|---|---|
| Node.js | 22.18 ou superior, ou 24 (desenvolvido e verificado no 24.15.0) |
| npm | 11 (o lock do projeto é o `package-lock.json`; não misture com pnpm ou yarn) |
| Navegador | Com WebGL para ver o mapa. Sem WebGL o atlas mostra os lugares em lista |
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
| @playwright/test | 1.63.0 | Testes de navegador das telas de prova |
| eslint, eslint-config-next | 9.39.5, 16.4.0 | Lint e fronteiras entre camadas |

A fase 3 não acrescentou nenhuma dependência.

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

Telas de prova técnica, que só existem com `npm run dev` e não entram no build de produção:

| Endereço | Dados | Para quê |
|---|---|---|
| http://localhost:3000/dev/dados/ | Os da edição, lidos de `generated/` | Ver o caminho inteiro com conteúdo real: gerador, leitor, lista, mapa e painel |
| http://localhost:3000/dev/prova/ | Sintéticos, das fixtures de teste | Exercitar os casos de borda: datas parciais, dois lugares, sem lugar, falha do mapa |

Nas duas dá para:

- selecionar um acontecimento pela lista e ver o mapa e o painel acompanharem;
- clicar em um ponto do mapa e ver a lista e o painel acompanharem;
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
| `npm run test` | Datas, schemas, integridade, pipeline, consultas, geração, importação, comandos, estado e mapa (Vitest) |
| `npm run build` | Gera os dados e o site. Falha se o conteúdo estiver inválido |
| `npm run verify:export` | Confere `out/`: páginas previstas, uma página por acontecimento publicado e nenhuma por rascunho, nenhuma rota de desenvolvimento, nenhum dado sintético |
| `npm run check` | Os cinco acima, em sequência |
| `npm run test:e2e` | As duas telas de prova e as páginas de perfil e de acontecimento em um Chromium real (Playwright). Sobe o próprio servidor na porta 4310 |

Antes de qualquer entrega: `npm run check` e `npm run test:e2e`.

## Estrutura

```
content/
  published/     a edição: registros revisados, editados à mão
  drafts/        pesquisa em andamento e importações
generated/       dados gerados por `npm run data:build` (fora do Git)
docs/            arquitetura, modelo de dados, pipeline, decisões e status
public/
  geo/           base cartográfica local (fase 6)
  media/         imagens e fontes tipográficas locais
scripts/         comandos de dados, conferência e pré-visualização da saída
src/
  app/           rotas e páginas
  components/    componentes visuais compartilhados
  features/
    events/      lista e leitura de acontecimentos
    map/         mapa e estilo local
    timeline/    reservado (fase 5)
    comparison/  reservado (fase 7)
  lib/
    domain/      regras e contratos de dados, sem I/O
    data/        formato dos dados públicos, índices, pontos e consultas
    publication/ validação, elegibilidade, relatório e importação, sem I/O
    content/     leitura de content/ e leitura e gravação de generated/
    state/       estado compartilhado, seletores e parâmetros de URL
tests/
  fixtures/sintetico/   dados de teste, todos marcados como sintéticos
  e2e/                  testes de navegador
```

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): camadas, fluxo de dados, rotas e estado.
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md): entidades, relacionamentos e regras de datas, lugares e revisão.
- [docs/DATA-PIPELINE.md](docs/DATA-PIPELINE.md): validação, elegibilidade, dados gerados, consultas, importação e como atualizar o conteúdo.
- [docs/DATA-REPORT.md](docs/DATA-REPORT.md): relatório de cobertura da edição atual, gerado por `npm run data:report`.
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões adotadas e seus motivos.
- [docs/STATUS.md](docs/STATUS.md): situação de cada fase, limitações e preparação para a próxima.
- [docs/SOURCES.md](docs/SOURCES.md): catálogo das fontes e critérios de uso.
- [docs/EDITORIAL.md](docs/EDITORIAL.md): critérios de seleção, redação, revisão e correção.
- [docs/CONTENT-REVIEW.md](docs/CONTENT-REVIEW.md): itens conferidos, divergências e pendências da pesquisa.
- [content/README.md](content/README.md): contrato dos arquivos de conteúdo e como editar.
