# Base provisória do mapa

Dois arquivos de contorno, só para dar referência geográfica à prévia da fase 4. A base cartográfica definitiva (resolução, rótulos, limites de zoom) é trabalho da fase 6 do plano.

| Arquivo | Conteúdo | Tamanho |
|---|---|---|
| `terra.geojson` | Países dentro da caixa da América do Sul e parte da América Central, como polígonos. Propriedades: `iso` e `nome` | 165 KB |
| `estados-br.geojson` | Os 27 estados do Brasil, como polígonos. Propriedades: `uf` e `nome` | 89 KB |

Origem: Natural Earth, escala 1:50 milhões, arquivos `ne_50m_admin_0_countries` e `ne_50m_admin_1_states_provinces`, obtidos em 8 de outubro de 2026 do repositório `nvkelso/natural-earth-vector`.

Preparação: recorte pela caixa de longitude -93 a -30 e latitude -57 a 16, coordenadas arredondadas para duas casas decimais (cerca de 1 km) e propriedades reduzidas às listadas acima.

Licença: domínio público. O Natural Earth dispensa crédito e sugere, para quem quiser citar, "Made with Natural Earth".

Limites desta base:

- Fora da caixa não há terra desenhada: só o mar e a grade.
- A escala de 1:50 milhões serve à visão do país e das regiões. Em zoom de cidade o litoral fica grosseiro.
- Não há rótulos: nomes de lugares aparecem na lista e no painel.
