# Atlas Político

Nome provisório. Um atlas para percorrer a trajetória pública de Lula e de Flávio Bolsonaro por uma linha do tempo, um mapa e acontecimentos acompanhados das fontes que os sustentam. Projeto de portfólio da MilWeb.

**Estágio atual:** fase 1 de 10 concluída (arquitetura e fundação). Ainda não há conteúdo real. As páginas mostram a estrutura do atlas, e uma tela de prova técnica, restrita ao desenvolvimento, exercita mapa, lista e painel com dados sintéticos. O que está pronto e o que falta está em [docs/STATUS.md](docs/STATUS.md).

## Requisitos

| Item | Versão |
|---|---|
| Node.js | 22.12 ou superior, ou 24 (desenvolvido e verificado no 24.15.0) |
| npm | 11 (o lock do projeto é o `package-lock.json`; não misture com pnpm ou yarn) |
| Navegador | Com WebGL para ver o mapa. Sem WebGL o atlas mostra os lugares em lista |
| Chromium do Playwright | Só para `npm run test:e2e`. Em máquina nova: `npx playwright install chromium` |

Nenhum serviço externo, conta ou variável de ambiente. Tudo roda com os arquivos do projeto.

### Versões instaladas (fase 1)

| Pacote | Versão | Uso |
|---|---|---|
| next | 16.4.0 | Aplicação, rotas e exportação estática (Turbopack) |
| react, react-dom | 19.3.0 | Interface |
| typescript | 5.9.3 | Modo `strict`, mais `noUncheckedIndexedAccess` |
| tailwindcss, @tailwindcss/turbopack | 4.3.3 | Estilo, sobre variáveis CSS |
| maplibre-gl | 6.13.0 | Mapa |
| zod | 4.6.5 | Schemas do conteúdo |
| server-only | 0.0.1 | Impede que a leitura de conteúdo vá para o navegador |
| vitest | 5.0.3 | Testes das regras de dados e de estado |
| @playwright/test | 1.63.0 | Testes de navegador da tela de prova |
| eslint, eslint-config-next | 9.39.5, 16.4.0 | Lint e fronteiras entre camadas |

## Instalação

```bash
npm install
```

## Execução local

```bash
npm run dev
```

Abre em http://localhost:3000.

A tela de prova técnica fica em http://localhost:3000/dev/prova/. Ela só existe com `npm run dev` e não entra no build de produção. Nela dá para:

- selecionar um acontecimento pela lista e ver o mapa e o painel acompanharem;
- clicar em um ponto do mapa e ver a lista e o painel acompanharem;
- trocar a pessoa e ver lista, mapa e painel mostrarem o mesmo recorte;
- ligar "Simular navegador sem WebGL" e ver a lista de lugares assumir o lugar do mapa.

## Build estático

```bash
npm run build     # gera a pasta out/
npm run preview   # serve out/ em http://localhost:4311
```

`out/` é um site de arquivos estáticos: pode ser servido por qualquer hospedagem, sem Node.js em produção. `next start` não se aplica a este projeto.

## Verificação

| Comando | O que confere |
|---|---|
| `npm run lint` | ESLint, incluindo as fronteiras entre camadas |
| `npm run typecheck` | Gera os tipos de rota e roda o `tsc` |
| `npm run test` | Regras de datas, schemas, integridade, leitura de conteúdo, estado e mapa (Vitest) |
| `npm run build` | Build estático. Valida `content/published/` e falha se o conteúdo estiver inválido |
| `npm run verify:export` | Confere `out/`: páginas previstas, nenhuma rota de desenvolvimento, nenhum dado sintético |
| `npm run check` | Os cinco acima, em sequência |
| `npm run test:e2e` | Tela de prova em um Chromium real (Playwright). Sobe o próprio servidor na porta 4310 |

Antes de qualquer entrega: `npm run check` e `npm run test:e2e`.

## Estrutura

```
content/
  drafts/        pesquisa em revisão (fase 2 em diante)
  published/     conjunto aprovado, o único que o build lê
docs/            arquitetura, modelo de dados, decisões e status
public/
  geo/           base cartográfica local (fase 6)
  media/         imagens e fontes tipográficas locais (fases 2 e 4)
scripts/         conferência e pré-visualização da saída estática
src/
  app/           rotas e páginas
  components/    componentes visuais compartilhados
  features/
    events/      lista e leitura de acontecimentos
    map/         mapa, estilo local e pontos
    timeline/    reservado (fase 5)
    comparison/  reservado (fase 7)
  lib/
    domain/      regras e contratos de dados, sem I/O
    content/     leitura e validação dos arquivos de conteúdo
    state/       estado compartilhado, seletores e parâmetros de URL
tests/
  fixtures/sintetico/   dados de teste, todos marcados como sintéticos
  e2e/                  testes de navegador
```

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): camadas, fluxo de dados, rotas e estado.
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md): entidades, relacionamentos e regras de datas, lugares e revisão.
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões adotadas e seus motivos.
- [docs/STATUS.md](docs/STATUS.md): conclusão da fase 1, limitações e preparação para a fase 2.
- [content/README.md](content/README.md): contrato dos arquivos de conteúdo.
