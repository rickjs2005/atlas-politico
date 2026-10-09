# features/timeline

Linha do tempo da exploração e controles do recorte. A base é da fase 4; a fase 5 completa.

| Arquivo | Responsabilidade |
| --- | --- |
| `Timeline.tsx` | Junta marcas, eixo, hachura do período e as faixas de cargos e de partidos. Em tela estreita rola na horizontal e traz a marca selecionada para a parte visível |
| `EventMarks.tsx` | Uma marca por acontecimento, na forma da categoria. Barra de ferramentas com uma parada de Tab: setas, Home e End movem o foco; Enter ou espaço selecionam |
| `PeriodControl.tsx` | Dois campos de ano, "De" e "Até", e o botão de desfazer |
| `CategoryFilter.tsx` | Um botão de alternância por categoria, com forma, nome e quantidade |

O que esta pasta usa, sem duplicar:

- Geometria do eixo: `src/components/time/scale.ts` (`spanOfDate`, `placeMarks`, `packRows`, `barOfPeriod`, `yearLabels`), com testes em `tests/timeline.test.ts`.
- Peças de desenho sem estado: `src/components/time/` (`TimeAxis`, `PeriodLane`, `PeriodShade`, `EventMarkLinks`).
- Regras de datas e intervalos de cálculo: `src/lib/domain/dates.ts`.
- Estado do recorte (`periodo`, `categorias`) e seletores: `src/lib/state/`.
- Filtro por período e categoria: `filterEvents`, em `src/lib/data/queries.ts`.

Limites:

- A linha do tempo altera o recorte por ações do estado central (`setPeriod`, `toggleCategory`, `selectEvent`), recebidas de quem a monta, e lê o resultado por propriedades. Não guarda seleção nem recorte e não conversa com o mapa.
- As fileiras das marcas são calculadas com todos os acontecimentos da trajetória, e não só com os visíveis: filtrar não faz as marcas mudarem de lugar.
- Data parcial ocupa o trecho inteiro que ela pode representar (o mês ou o ano), com um traço sob a marca.

Para a fase 5 (docs/INTERACTIONS.md, seção "Em demonstração nesta fase"):

- Período por arraste sobre o eixo, disparando o mesmo `setPeriod(de, ate)` e convivendo com os dois campos.
- Escrita do recorte no endereço e resposta a voltar e avançar: `serializeAtlasParams`, em `src/lib/state/url-params.ts`, já devolve a forma canônica.
- Índices prontos nos dados para contar por ano sem percorrer a lista: `indices.acontecimentos.porAno` e `indices.acontecimentos.anos` (`src/lib/data/types.ts`).
