# Evidências

Quatro arquivos:

| Arquivo | O que é |
| --- | --- |
| `provas-2026-10-11.json` | Os trechos das citações dos registros que a edição 0.3.0 acrescentou: fatos biográficos, conceitos, propostas eleitorais, atos de 2003 a 2010 com as proposições deles, atuações legislativas, a data de início de um mandato e os dois rascunhos de acontecimento. Conferidos nos documentos baixados em 11 de outubro de 2026 |
| `provas-2026-10-09.json` | A lista em vigor para os registros da edição 0.1.1: os trechos de cada citação, conferidos nas cópias de 9 de outubro de 2026 |
| `conferencia-2026-10-09.json` | O registro do acesso a cada fonte nesse dia: como foi lida, o que o servidor respondeu, quantos trechos foram encontrados e as limitações |
| `provas-2026-10-08.json` | A lista da segunda passagem, da edição 0.1.0. Fica como histórico |

Cada item liga um registro a uma fonte e traz os trechos literais que sustentam a citação:

```json
{
  "registro": "acontecimento:lula-2002-eleito-presidente",
  "fonteId": "planalto-biografia-lula",
  "prova": ["Em 27 de outubro de 2002, aos 57 anos de idade, com quase 53 milhões de votos"]
}
```

Como usar na revisão humana: abra a fonte pelo endereço cadastrado em `content/published/fontes.json` e procure o trecho na página. Em fontes de dados (TSE, Senado), o trecho é o par de campo e valor, como `"DataDesfiliacao": "2019-11-19"`.

Limites:

- A lista é uma fotografia de 8 de outubro de 2026. Páginas mudam; um trecho que sumiu indica que a fonte precisa ser relida.
- Em 8 de outubro de 2026, os 382 trechos das 166 citações foram encontrados nas cópias baixadas dos documentos. Essas cópias não estão no repositório.
- Em 9 de outubro de 2026, os documentos foram baixados de novo. Dos 382 trechos, 380 continuavam lá. Os 2 que faltaram eram da citação da candidatura de Geraldo Alckmin em 2006, que apontava para a ficha de Lula; a citação passou a apontar para a ficha certa. A lista nova tem 169 citações e 398 trechos, todos encontrados.
- Na lista nova, os trechos do serviço de lideranças do Senado usam os nomes de campo do serviço substituto (`dataDesignacao`, `dataTermino`).
- Em 11 de outubro de 2026, a lista da edição 0.3.0 foi montada junto com os registros: são 236 citações, com 390 trechos, todos encontrados nos documentos baixados nesse dia. Cinquenta deles, os das oito leis estaduais, foram conferidos também na página do portal da Alerj em conexão segura. O que "conferido" quer dizer está em `research/trilha-2026-10.md`, seção Método: o trecho existe no documento baixado; não quer dizer que o texto do atlas interpreta bem o documento. Os documentos baixados e os roteiros de conferência não estão no repositório, porque os arquivos do TSE e da Câmara trazem dados pessoais.
- As 32 citações dos registros de decisão da edição 0.2.0 (as proposições, as votações, os votos, os atos de 2023 em diante e a identidade institucional) não têm lista de trechos aqui: a evidência delas são as capturas brutas em `research/capturas/` e as páginas do Portal da Legislação citadas em cada registro. `npm run data:report` lista essas citações uma a uma.
- Os trechos de reportagens são citações curtas, só para localizar a evidência.
- Os arquivos não são lidos pelo site nem pelo build. `npm run data:report` lê as listas de trechos só para contar quantas citações publicadas têm trecho registrado.
