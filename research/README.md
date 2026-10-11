# Pesquisa: capturas e pacotes de importação

Pasta de pesquisa, fora das raízes editoriais que o pipeline lê (`content/`). Nada aqui chega às páginas por si; o que entra no site passa por `content/drafts/`, pela revisão e por `content/published/` ([DATA-PIPELINE.md](../docs/DATA-PIPELINE.md)).

| Pasta | O que guarda | Quem escreve |
| --- | --- | --- |
| `capturas/` | Respostas brutas dos acervos oficiais, uma por requisição: URL, instante, status, tamanho, resumo SHA-256 e a resposta como chegou. Os registros importados apontam para elas por `capturaId` | `npm run importar:decisoes` |
| `pacotes/` | O pacote JSON normalizado de cada importação, no formato que `npm run data:import` aceita, antes de entrar em `content/drafts/` | `npm run importar:decisoes` |

O resumo SHA-256 permite conferir a integridade do que foi guardado; não prova, sozinho, a veracidade do documento. Uma captura do Senado com todas as votações de um mandato tem perto de 2,6 MB: use `--de` e `--ate` para recortar, e apague capturas repetidas antes de versionar.
