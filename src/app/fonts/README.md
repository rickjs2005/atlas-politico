# Fontes tipográficas

Arquivos locais, carregados por `next/font/local` em `src/app/layout.tsx`. Nenhuma fonte é buscada na rede, nem no build nem no navegador.

| Arquivo | Família | Estilo | Pesos | Uso |
|---|---|---|---|---|
| `newsreader-latin.woff2` | Newsreader | Romano | 200 a 800, com tamanho óptico | Títulos, nomes e texto de leitura |
| `libre-franklin-latin.woff2` | Libre Franklin | Romano | 100 a 900 | Interface, rótulos, datas e números da cronologia |

A Libre Franklin é pré-carregada pelo `<head>` de cada página. A Newsreader não: medido na fase 8, o pré-carregamento não adianta a chegada do arquivo e atrasa o primeiro desenho das páginas de texto (docs/PERFORMANCE.md, seção Fontes). Enquanto ela não chega, o texto aparece em um substituto de medidas ajustadas.

O itálico da Newsreader (143 KB) saiu do projeto na fase 8: nenhum texto das páginas o usa. O itálico que aparece em notas curtas é o da sem serifa, sintetizado pelo navegador. Se um texto serifado em itálico passar a existir, o arquivo volta da mesma origem.

Origem: Google Fonts, subconjunto latino das versões variáveis (Newsreader v26 e Libre Franklin v20), baixado em 8 de outubro de 2026. O subconjunto cobre o português e a pontuação tipográfica.

Licença: SIL Open Font License 1.1, nos arquivos `OFL-Newsreader.txt` e `OFL-LibreFranklin.txt`. A licença permite usar, embutir e redistribuir as fontes, e exige que o texto da licença acompanhe os arquivos.

- Newsreader: Copyright 2020 The Newsreader Project Authors (github.com/productiontype/Newsreader).
- Libre Franklin: Copyright 2020 The Libre Franklin Project Authors (github.com/googlefonts/Libre-Franklin).
