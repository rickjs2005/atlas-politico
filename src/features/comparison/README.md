# features/comparison

Espaço reservado. Entra na fase 7.

Responsabilidade: exibir as duas trajetórias no mesmo período e na mesma escala de tempo.

O que o modelo de dados já garante para esta pasta:

- `Edicao.cobertura` informa o período que o conjunto cobre para cada pessoa. É o que permite dizer "sem dados no atlas" em vez de sugerir "sem atividade".
- Mandatos e filiações têm período com início e fim explícitos, inclusive desconhecidos e em curso.
- No estado central, `comparar: true` faz os seletores trazerem os acontecimentos das duas pessoas.

Limites:

- A comparação mostra cargos, filiações e acontecimentos de cada pessoa no recorte. Não calcula nota, placar ou ranking, e não trata quantidade de registros como medida de desempenho.
- Cargos diferentes não são equiparados. Cada cargo aparece com sua instituição e seu período.
