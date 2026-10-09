# features/comparison

As trajetórias no mesmo período e na mesma escala de tempo. A base é da fase 4; a fase 7 ligou a tela ao estado e ao endereço. A especificação está em `docs/COMPARISON.md`.

| Arquivo | Responsabilidade |
| --- | --- |
| `TrajectoryLanes.tsx` | Uma faixa por pessoa sobre o mesmo eixo de anos: marcas dos acontecimentos, cargos e, no modo completo, partidos. Recebe o recorte em vigor, para apagar o que ficou fora dele, e a função que dá o endereço de cada acontecimento (`hrefOf`). Usada na comparação e, em resumo, na entrada |

A tela de comparação em si fica em `src/app/comparar/` (`page.tsx` e `Comparison.tsx`): o recorte (período e categorias), os avisos de leitura, as faixas e uma coluna por pessoa. O estado é o do endereço: `AtlasUrlStateProvider`, com `pessoa={null}` e `comparar`, e o seletor `selectComparison`, em `src/lib/state/selectors.ts`.

O que a faixa não pode sugerir:

- Que um trecho vazio é falta de atividade. O trecho anterior à cobertura da edição aparece hachurado e escrito como "fora da cobertura desta edição"; as lacunas dentro da cobertura, como "sem registros".
- Que as pessoas são medidas uma contra a outra. As faixas têm a mesma altura mínima, a mesma escala e as mesmas marcas. Não há total, barra de quantidade nem cor por pessoa.

O que as consultas entregam:

- `compareTrajectories(data, { periodo, categorias })`, em `src/lib/data/queries.ts`: uma trajetória por pessoa no mesmo recorte, com acontecimentos, mandatos, filiações e a cobertura declarada, mais a lista dos acontecimentos compartilhados.
- `listSourcesOf(data, registros)`, no mesmo arquivo: os documentos que sustentam um conjunto de registros, cada um uma vez, com a quantidade de registros que o citam.
- `getCoveredSpan`, `listGaps` e `getSharedSpan`, em `src/lib/data/coverage.ts`: o intervalo que a edição cobre para cada pessoa, as lacunas de quatro anos ou mais e a escala comum.
- Mandatos e filiações voltam com `situacao`: `documentada`, quando as datas conhecidas provam que o período toca o recorte, ou `incerta`, quando depende de um limite não documentado. A coluna da pessoa escreve a diferença.
- Um recorte sem registros devolve as trajetórias com listas vazias, e não erro.

Limites:

- A comparação mostra cargos, filiações e acontecimentos de cada pessoa no recorte. Não calcula nota, placar ou ranking, e toda quantidade é dita como acontecimentos cadastrados: é o acervo da edição.
- Cargos diferentes não são equiparados. Cada cargo aparece com sua instituição e seu período.
- A ordem das pessoas é a de `PROFILES`, alfabética.

A comparação não abre acontecimento: cada marca e cada item da lista levam à página dele, com o recorte e `origem=comparar` no endereço, e a página oferece **Voltar à comparação**. Os endereços são montados em `src/lib/state/links.ts`.
