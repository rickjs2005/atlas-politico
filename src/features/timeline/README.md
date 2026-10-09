# features/timeline

Linha do tempo da exploração e controles do recorte. A base é da fase 4; a fase 5 a completou. O funcionamento, com o endereço e o histórico, está em `docs/TIMELINE.md`.

| Arquivo | Responsabilidade |
| --- | --- |
| `Timeline.tsx` | Junta marcas, eixo, hachura do período, escolha de período e as faixas de cargos e de partidos. Mede a própria largura para distribuir as marcas. Em tela estreita rola na horizontal e traz o período e a marca selecionada para a parte visível |
| `EventMarks.tsx` | Uma marca por acontecimento, na forma da categoria. Barra de ferramentas com uma parada de Tab: setas, Home e End movem o foco; Enter ou espaço selecionam |
| `PeriodBrush.tsx` | Clique (um ano) e arraste (um intervalo) sobre o eixo. Mostra a prévia enquanto o ponteiro se move e só avisa o recorte ao soltar |
| `PeriodControl.tsx` | Dois campos de ano, "De" e "Até", e o botão de desfazer |
| `CategoryFilter.tsx` | Um botão de alternância por categoria, com forma, nome e quantidade |
| `PeriodContext.tsx` | Cargos e partidos do período, por extenso, com a presença incerta à parte |

O que esta pasta usa, sem duplicar:

- Geometria do eixo: `src/components/time/scale.ts` (`spanOfDate`, `placeMarks`, `packRows`, `barOfPeriod`, `yearLabels`, `yearAtPosition`, `yearsBetween`), com testes em `tests/timeline.test.ts`.
- Peças de desenho sem estado: `src/components/time/` (`TimeAxis`, `PeriodLane`, `PeriodShade`, `EventMarkLinks`) e `src/components/PeriodRecords.tsx`.
- Regras de datas e intervalos de cálculo: `src/lib/domain/dates.ts`.
- Estado do recorte (`periodo`, `categorias`), seletores e regras do endereço: `src/lib/state/`.
- Filtro por período e categoria, e cargos e partidos no período: `filterEvents`, `listMandates` e `listAffiliations`, em `src/lib/data/queries.ts`.

Limites:

- A linha do tempo altera o recorte por funções recebidas de quem a monta (`onSelect`, `onPeriodChange`, `onChange`, `onToggle`) e lê o resultado por propriedades. Não guarda seleção nem recorte, não escreve no endereço e não conversa com o mapa.
- A única coisa que ela guarda é a prévia do arraste, que some ao soltar.
- As fileiras das marcas são calculadas com todos os acontecimentos da trajetória, e não só com os visíveis: filtrar não faz as marcas mudarem de lugar. O que muda as fileiras é a largura do eixo.
- Data parcial ocupa o trecho inteiro que ela pode representar (o mês ou o ano), com um traço sob a marca.
- O clique e o arraste no eixo são atalhos de ponteiro. O caminho de teclado e de leitor de tela para o mesmo recorte são os campos de ano.

Fora desta pasta, por decisão (`docs/DECISIONS.md`, D-53): zoom e agrupamento de marcas.
