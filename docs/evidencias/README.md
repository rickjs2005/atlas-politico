# Evidências

`provas-2026-10-08.json` é a lista de trechos usada na segunda passagem de conferência da edição 0.1.0.

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
- Os trechos de reportagens são citações curtas, só para localizar a evidência.
- O arquivo não é lido pelo site nem pelo build.
