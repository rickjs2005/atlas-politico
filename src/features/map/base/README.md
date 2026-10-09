# Base do mapa

Dois arquivos de contorno, que dão referência geográfica aos lugares do atlas. É a base adotada desde a fase 6 (`docs/MAP.md`, `docs/DECISIONS.md` D-58). Não há outro recurso de mapa no projeto: sem tiles, sem sprites, sem glyphs e sem pedido a terceiros.

| Arquivo | Conteúdo | Tamanho |
|---|---|---|
| `terra.geojson` | 32 países e territórios da América do Sul, do Caribe e de parte da América Central, como polígonos. Propriedades: `iso` e `nome` | 165 KB |
| `estados-br.geojson` | Os 27 estados do Brasil, como polígonos. Propriedades: `uf` e `nome` | 89 KB |

**Origem.** Natural Earth, escala 1:50 milhões, arquivos `ne_50m_admin_0_countries` e `ne_50m_admin_1_states_provinces`, obtidos em 8 de outubro de 2026 do repositório público do projeto, `nvkelso/natural-earth-vector`.

**Licença.** Domínio público. O Natural Earth dispensa crédito e sugere, para quem quiser citar, "Made with Natural Earth". O atlas cita a base na legenda do mapa.

**Transformações.** Seleção dos polígonos que tocam a caixa de longitude -93 a -30 e latitude -57 a 16 (o que a atravessa entra inteiro, e por isso os arquivos têm vértices fora dela); coordenadas arredondadas para duas casas decimais (cerca de 1 km); propriedades reduzidas às listadas acima. Nenhuma generalização além da que a escala de origem já tem.

**Como chega ao navegador.** `MapCanvas.tsx` resolve os dois endereços com `new URL(..., import.meta.url)`, e o build publica os arquivos em `/_next/static/media/`, com o nome marcado pelo conteúdo. O MapLibre os pede ao próprio site.

**O que a base sustenta, e os limites que saem daí** (`src/features/map/camera.ts`):

| Limite | Valor | Motivo |
|---|---|---|
| Área navegável | A própria caixa do recorte | Fora dela não há terra desenhada: a câmera não sai, para o mapa não mostrar mar onde há continente |
| Zoom máximo | 6 | A escala de 1:50 milhões serve à visão do país e das regiões. Acima disso o litoral e as divisas viram segmentos de reta |
| Zoom mínimo | 2, ou o menor em que a tela cabe na caixa | Em tela larga o piso fica perto de 2,9 |

**O que a base não tem.** Cidades, estradas, rios, relevo e rótulos. Os nomes que aparecem no mapa são os dos lugares do conteúdo, escritos em HTML ao lado de cada marcador. As ilhas oceânicas a leste de 30° O ficam fora da caixa.

**Lugares fora da caixa.** Um lugar documentado fora da América do Sul não é desenhado. Ele aparece na lista "sem ponto no mapa", com o nome e o aviso "fora da área que este mapa cobre". Nenhum lugar da edição 0.1.0 está nessa situação. Cobrir o mundo pede um contorno a mais (por exemplo, `ne_110m_land`, também de domínio público) e a caixa de `MAP_LIMITS` ampliada.

**Para trocar a base.** Substitua os dois arquivos mantendo as propriedades `iso` (com `BR` para o Brasil) e `uf`, e ajuste `MAP_LIMITS` em `camera.ts`. `buildBaseStyle` recebe só os endereços: quem usa o mapa não muda.
