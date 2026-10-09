# Mapa

Fase 6. Como o mapa liga os acontecimentos aos lugares documentados e se mantém em acordo com a lista, a linha do tempo, os filtros, o painel e o endereço. A navegação temporal e o endereço estão em [TIMELINE.md](TIMELINE.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md); a base visual, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## Como abrir

```bash
npm install
npm run dev
```

Endereço local: `http://localhost:3000/politicos/lula/` ou `http://localhost:3000/politicos/flavio-bolsonaro/`. Em tela estreita, o mapa fica na vista **Mapa**.

Endereços que abrem estados do mapa, com a edição 0.1.0:

| O que abre | Endereço |
| --- | --- |
| Um acontecimento com dois lugares, os dois destacados | `/politicos/lula/?acontecimento=lula-2023-intervencao-federal-no-distrito-federal` |
| Um acontecimento de abrangência nacional, sem ponto | `/politicos/lula/?acontecimento=lula-2002-eleito-presidente` |
| Um recorte sem nenhum ponto | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` |
| O mapa de localização de uma página de acontecimento | `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/` |
| A tela de prova, com um lugar fora da área do mapa (só em desenvolvimento) | `/dev/prova/` |

## Base geográfica

MapLibre GL JS 6.13, com uma base local de contornos. Nada do mapa vem de fora do projeto: não há tiles, sprites, glyphs, estilo remoto, chave de API nem serviço pago.

| Recurso | Onde está | O que é |
| --- | --- | --- |
| Contornos de países | `src/features/map/base/terra.geojson` (165 KB) | 32 países e territórios da América do Sul, do Caribe e de parte da América Central, do Natural Earth 1:50 milhões |
| Divisas dos estados | `src/features/map/base/estados-br.geojson` (89 KB) | Os 27 estados do Brasil, da mesma fonte |
| Grade | `src/features/map/graticule.ts` | Meridianos e paralelos a cada 10 graus, gerados no código |
| Estilo | `src/features/map/style.ts` | Mar, grade, terra, Brasil em tom mais claro, divisas e fronteiras. Seis camadas, nenhuma de texto |
| Cores da base | `src/features/map/palette.ts` | Repetem seis tokens de `globals.css`; um teste confere a sincronia |
| Worker do MapLibre | `maplibre-gl/dist/maplibre-gl-worker.mjs` | Publicado pelo build, junto com o site |

**Origem, licença e transformações** estão em [`src/features/map/base/README.md`](../src/features/map/base/README.md): Natural Earth, domínio público, obtido em 8 de outubro de 2026, com seleção pela caixa da América do Sul, coordenadas arredondadas a duas casas e propriedades reduzidas.

Os dois arquivos são os que a fase 4 já usava. Eles servem ao que o mapa precisa mostrar (a posição de um município ou de um estado dentro do país) e foram adotados como base do atlas (D-58). Os arquivos e o worker chegam ao navegador com `new URL(..., import.meta.url)`: o build os publica em `/_next/static/media/`, com o nome marcado pelo conteúdo.

### O que a base sustenta

| Limite | Valor | Onde está |
| --- | --- | --- |
| Área navegável | Longitude de -93 a -30, latitude de -57 a 16: a caixa que a base cobre | `MAP_LIMITS.bounds` |
| Zoom máximo | 6 | `MAP_LIMITS.maxZoom` |
| Zoom mínimo | 2, ou o menor em que a tela ainda cabe na área navegável (perto de 2,9 em tela larga) | `MAP_LIMITS.minZoom` e `minZoomInside` |

A câmera não sai da caixa: fora dela a base não tem terra, e o mapa mostraria mar onde há continente. O zoom para em 6 porque a escala de 1:50 milhões serve à visão do país e das regiões; mais perto, o litoral e as divisas viram segmentos de reta. O botão **Aproximar** fica desativado no limite.

### Como a base é apresentada

- Sem rótulos próprios. Os nomes no mapa são os dos lugares do conteúdo, em HTML, ao lado de cada marcador.
- A legenda diz, por extenso: "Todo ponto é o centro de um município ou de um estado, e não um endereço. A base é de contornos simplificados (Natural Earth, 1:50 milhões), sem cidades nem estradas, e por isso o mapa não se aproxima além da escala regional. Pontos não formam um trajeto."
- O resumo da legenda, sempre à vista, diz "pontos aproximados".

## Do recorte ao mapa

O mapa não filtra. Ele recebe os pontos que a exploração já recortou e os desenha.

```
estado no endereço (pessoa, período, categorias, acontecimento)
        │  selectVisibleEvents            uma regra de filtragem, a mesma da lista
        ▼
visible (acontecimentos do recorte)
        ├─ filterPoints(data.pontos, visible)   pontos do GeoJSON gerado
        │        ▼
        │  buildPlaces → splitByArea → groupPlaces     lugares, área da base, marcadores
        └─ listUnplaced(visible)                acontecimentos sem ponto, com o motivo
```

| Passo | Função | O que faz |
| --- | --- | --- |
| Recorte | `filterPoints` (`src/lib/data/points.ts`) | Mantém os pontos dos acontecimentos visíveis. Um acontecimento com dois lugares mantém os dois |
| Lugares | `buildPlaces` (`src/features/map/places.ts`) | Junta os pontos por `placeId`: um lugar, com os acontecimentos que o citam, em ordem cronológica |
| Área | `splitByArea` e `withoutMarker` | Separa os lugares que a base cobre dos que ficam fora dela e, entre os de fora, os acontecimentos que ficaram sem nenhum marcador |
| Marcadores | `groupPlaces` | Reúne os lugares que, na escala em vigor, ficariam a menos de 44 pixels um do outro |
| Sem ponto | `listUnplaced` (`src/lib/data/points.ts`) | Os acontecimentos de abrangência nacional ou sem lugar documentado |

Os identificadores são os do GeoJSON gerado: `eventId` e `placeId` em cada ponto, `acontecimentoSlug` para a seleção. O `id` de um marcador são os `placeId` que ele reúne, em ordem, unidos por `+`.

**Três contagens que não se misturam:**

| Conta | O que é | Na edição 0.1.0 |
| --- | --- | --- |
| Pontos | Pares de acontecimento e lugar: o que o GeoJSON tem | 27 |
| Lugares | Lugares documentados | 9 |
| Acontecimentos | Registros distintos. Um acontecimento com dois lugares gera dois pontos e conta uma vez | 26 com ponto, 13 sem |

O número de um marcador conta acontecimentos distintos. O nome dele, para leitores de tela, diz "Brasília: 4 acontecimentos".

## Seleção

A seleção é a do estado compartilhado, no endereço (fase 5). O mapa a recebe como `selectedSlug` e a devolve por `onSelect(slug)`.

| De onde vem | O que acontece |
| --- | --- |
| Marcador com um acontecimento | O clique o seleciona: o painel abre, a lista e a linha do tempo o marcam, o endereço ganha `acontecimento=<slug>` |
| Marcador com vários acontecimentos | O clique abre o seletor daquele marcador. Nada é selecionado até a pessoa escolher |
| Item do seletor | Seleciona o acontecimento e fecha o seletor |
| Lista ou linha do tempo | Os marcadores de todos os lugares do acontecimento ganham o anel de acento. A câmera vai até eles só se não estiverem à vista |
| Endereço, recarregar, voltar e avançar | O mesmo: o destaque acompanha `selectedSlug`, e não um gesto |
| Filtro que tira o acontecimento do recorte | A regra da fase 5 desfaz a seleção; o destaque some com ela |
| Acontecimento sem ponto | Nenhum marcador é destacado, a câmera não se move e o mapa diz o motivo |

Não há ciclo entre mapa, estado e endereço, porque o caminho tem um sentido só: o gesto chama `onSelect`, a exploração escreve o endereço, o estado é derivado dele e o mapa recebe o novo `selectedSlug`. O mapa não guarda seleção. Mover a câmera não chama `onSelect`: arrastar, aproximar e usar os controles não alteram o acontecimento selecionado nem o endereço. Arrastar o mapa começando em cima de um marcador move o mapa e não seleciona.

## Pontos sobrepostos

As coordenadas são as do lugar: o centro do município ou do estado. Todos os acontecimentos de um lugar caem exatamente no mesmo ponto. Na edição 0.1.0, Brasília reúne 9 pontos e o estado do Rio de Janeiro, 7. Sobreposição é a regra, e não a exceção.

A solução tem duas partes (D-60):

1. **Um marcador por lugar,** e não um por ponto. O marcador de um lugar com um acontecimento mostra a forma e a cor da categoria; com vários, um disco com a quantidade.
2. **Lugares próximos dividem um marcador** enquanto, na escala em vigor, ficariam a menos de 44 pixels um do outro (a área de toque de um marcador). O agrupamento é refeito ao fim de cada zoom. São Paulo e São Bernardo do Campo, a 20 km, continuam juntos no zoom máximo.

Acionar um marcador com mais de um acontecimento abre o **seletor**: uma lista com um trecho por lugar (nome e precisão da coordenada) e, em cada trecho, os acontecimentos com a data na precisão do registro, o título e a categoria. Nenhum item é escolhido em silêncio, e todos continuam acessíveis em qualquer zoom.

| Regra | Como é garantida |
| --- | --- |
| O número conta acontecimentos, e não pontos | `distinctEvents`: o acontecimento que tem dois lugares no mesmo marcador conta uma vez |
| Lugares com as mesmas coordenadas nunca se separam | A distância entre eles é zero em qualquer escala |
| Dois marcadores nunca ficam mais próximos do que 44 pixels | O lugar com mais acontecimentos puxa os vizinhos, e o marcador fica na posição dele |
| A seleção aparece mesmo quando o lugar está agrupado | O marcador que contém o acontecimento ganha o anel de acento, o nome dele diz "entre eles o que está aberto", e o seletor marca o item |
| Identificadores estáveis | `placeId` e `eventId` do GeoJSON; nada depende da ordem de desenho |

O agrupamento do MapLibre (`cluster` e `point_count`) não foi usado: `point_count` conta pontos, e o atlas precisa contar acontecimentos.

## Câmera

| Momento | O que a câmera faz |
| --- | --- |
| Ao abrir | Enquadra os lugares do recorte com que a página chegou. Sem nenhum ponto, mostra o território brasileiro |
| Ao mudar o recorte | Nada, se todos os lugares continuam à vista. Se algum ficou fora, enquadra o recorte de novo, mas só enquanto a pessoa não tiver movido o mapa |
| Depois que a pessoa move o mapa | O mapa não o recentra ao mudar o recorte. **Enquadrar os lugares do recorte** devolve o enquadramento e volta a acompanhar |
| Ao selecionar | Nada, se os lugares do acontecimento estão à vista. Senão, vai até eles: um lugar, centro e zoom; vários, a caixa que os contém |
| Ao abrir o seletor | Desloca o mínimo para o marcador não ficar debaixo do seletor, sem mudar o zoom |
| Ao desfazer a seleção | Nada |

"À vista" quer dizer dentro da parte livre do mapa, com 32 pixels de folga: o que está sob o cartão do acontecimento (tela estreita) ou sob o seletor não conta. O mapa mede a altura do cartão e enquadra a seleção acima dele.

**Margens do enquadramento.** Um enquadramento deixa 48 pixels de cada lado, e mais dois espaços (`paddingFor`):

| Onde | Quanto a mais | Para quê |
| --- | --- | --- |
| À direita | 56 pixels | O nome de cada lugar fica à direita do marcador, e os controles, no canto direito |
| Em cima | 40 pixels | O botão dos acontecimentos sem ponto e os avisos, que ficam lado a lado nessa faixa |

A faixa de cima só é reservada quando o quadro do mapa tem 320 pixels de altura ou mais. Em um quadro baixo sobraria pouco mapa, e ali um aviso pode cobrir o marcador mais ao norte. Depois que a pessoa move o mapa, nada disso vale: a posição é a que ela escolheu.

**Zoom e precisão.** A câmera não se aproxima sozinha além do que a precisão do lugar sustenta (`PRECISION_ZOOM_CAP`):

| Precisão do lugar | Teto de zoom |
| --- | --- |
| Local específico | 6 |
| Centro do município | 5,5 |
| Unidade da federação | 4,5 |
| País | 3,5 |

Com vários lugares, vale o teto do menos preciso. A pessoa pode aproximar até 6 por conta própria.

**Movimento.** 500 ms, em linha reta. Com `prefers-reduced-motion`, o MapLibre troca o movimento por um salto; o resultado é o mesmo.

**Tamanho.** O MapLibre acompanha o tamanho do contêiner (`trackResize`): redimensionar a janela, abrir a leitura em tablet ou voltar à vista do mapa em celular ajusta o canvas. Com o mapa escondido, as regras de câmera esperam ele voltar à tela.

**Gestos.**

| Onde | Gestos |
| --- | --- |
| Exploração | Arrastar move, roda e pinça aproximam. Em tela estreita o mapa ocupa a tela abaixo do cabeçalho: não há rolagem da página sob o dedo |
| Página do acontecimento | A página rola, então o mapa usa gestos cooperativos: mover pede dois dedos, e aproximar pede Ctrl e a roda. O MapLibre mostra o aviso, em português |
| Teclado, com o foco no mapa | Setas movem; `+` e `-` aproximam e afastam |

Sem rotação e sem inclinação: o mapa é plano, com o norte para cima.

## Precisão geográfica e acontecimentos sem coordenadas

Só entra no mapa o que o conteúdo documenta. Nenhum município é inventado para preencher uma ausência.

| Situação | No mapa | Em texto |
| --- | --- | --- |
| Lugar com centro de município | Marcador de contorno contínuo | No seletor e no painel: "aproximação: centro do município" |
| Lugar conhecido só pelo estado | Marcador de contorno tracejado, no centro do estado | "aproximação: unidade da federação" |
| Abrangência nacional | Sem marcador | Lista **sem ponto no mapa**, trecho "Abrangência nacional"; na lista de acontecimentos, "sem ponto no mapa (abrangência nacional)" |
| Lugar não documentado | Sem marcador | Lista **sem ponto no mapa**, trecho "Lugar não documentado" |
| Lugar fora da área que a base cobre | Sem marcador | Lista **sem ponto no mapa**, com o nome do lugar e "fora da área que este mapa cobre" |
| Acontecimento aberto sem ponto | Aviso no canto do mapa, com o motivo | "O acontecimento aberto não tem ponto no mapa: abrangência nacional." |
| Recorte sem nenhum ponto | Aviso no canto do mapa | "Nenhum acontecimento deste recorte tem ponto no mapa." |

O botão **N sem ponto no mapa**, no canto do mapa, abre o mesmo seletor dos marcadores, com esses acontecimentos agrupados pelo motivo. Eles continuam também na lista, na linha do tempo, nos filtros e no painel.

O número do botão conta os acontecimentos que não têm nenhum marcador (`withoutMarker`). Um acontecimento com um lugar fora da área e outro dentro dela aparece no marcador do lugar de dentro e não entra nessa conta; quando ele é aberto, o mapa avisa do lugar que ficou fora. A edição 0.1.0 não tem lugar fora da área.

Os pontos não são ligados entre si. A ordem cronológica não comprova deslocamento, e o atlas não desenha trajetos.

## Acessibilidade

- **A lista é o acesso completo.** Tudo o que o mapa permite selecionar também se seleciona pela lista e pela linha do tempo, com ou sem mapa.
- **Marcadores são botões,** dentro do contêiner do mapa, na ordem de leitura: de norte a sul. Cada um tem nome ("Curitiba: 3 acontecimentos"), `aria-pressed` quando seleciona um acontecimento e `aria-expanded` quando abre uma lista.
- **Seletor.** Ao abrir, recebe o foco. Tab percorre **Fechar** e os acontecimentos. Esc, **Fechar** e a escolha de um item o fecham e devolvem o foco ao marcador que o abriu. Clicar fora ou mudar um filtro o fecha sem mexer no foco.
- **Controles** com nome: **Aproximar**, **Afastar** e **Enquadrar os lugares do recorte**. 44 pixels em telas estreitas e médias, 36 em tela larga.
- **Seleção e categoria não dependem de cor nem de ponteiro:** anel, estado no botão e texto; forma e nome da categoria.
- **Legenda** com os símbolos que o recorte em vigor usa.
- **Página do acontecimento.** Os marcadores são imagens com nome, e não botões: ali não há o que selecionar.

## Ciclo de vida

| Etapa | O que acontece |
| --- | --- |
| HTML do build | `MapView` sai com "Carregando o mapa…". Nenhum código do MapLibre vai para o HTML |
| Montagem | `MapCanvas` é carregado por `next/dynamic` com `ssr: false`, e só quando a moldura do mapa aparece na tela. Quem fica na lista, em celular, não baixa o pacote do mapa |
| Instância | Criada uma vez, em um efeito sem dependências. Filtros, seleção e seletor não a recriam; um teste confere que o canvas é o mesmo elemento depois de várias mudanças |
| Marcadores | Elementos do React, postos por um portal dentro do contêiner do canvas. Um efeito os mantém sobre a coordenada a cada movimento da câmera, sem passar pelo estado |
| Atualização | Mudou o recorte: os lugares são refeitos. Terminou um zoom: o agrupamento é refeito. Mudou a seleção: os destaques e, se preciso, a câmera |
| Desmontagem | Os temporizadores são cancelados, os ouvintes saem com a instância e `map.remove()` libera o contexto gráfico |

`MapView` é a fronteira: nada fora de `src/features/map/` importa o MapLibre.

## Falhas

Em qualquer falha, a área do mapa mostra uma mensagem e a lista dos lugares do recorte, agrupada por lugar, com coordenada, precisão e os acontecimentos selecionáveis. Filtros, endereço, lista, linha do tempo e painel continuam funcionando.

| Falha | Como é percebida | Mensagem | Saída |
| --- | --- | --- | --- |
| Sem WebGL | O construtor do MapLibre lança | "O mapa não pôde ser exibido neste navegador." | Nenhuma: tentar de novo não muda o navegador |
| Pacote do mapa não chegou | A fronteira de erro pega a falha do import | "O código do mapa não chegou. Pode ser a conexão." | **Recarregar a página** |
| Mapa não termina de carregar | 15 segundos sem o evento `load`, contados só com a aba visível | "Ele não terminou de carregar." | **Tentar de novo** |
| Contornos não carregaram | Erro do MapLibre vindo da fonte `terra` ou `estados` | "Os contornos do mapa não carregaram." | **Tentar de novo** |
| Contexto gráfico perdido | Evento `webglcontextlost` | Primeiro um aviso sobre o mapa: "O navegador interrompeu o desenho do mapa. Tentando retomar…". O MapLibre recria o contexto sozinho quando o navegador o devolve. Sem retomada em 5 segundos, a lista assume | **Tentar de novo** |

**Tentar de novo** monta o mapa do zero. A seleção e o recorte não se perdem, porque não são do mapa.

### Quadros sobre o mapa parado

A legenda aberta tem o fundo quase opaco (98%), e não opaco. No Chromium dos testes, que desenha o mapa sem placa de vídeo, um quadro opaco que aparecia sobre o canvas parado fazia a base sumir ao lado dele: sobrava a cor do mar onde havia terra. Com o fundo quase opaco isso não acontece. Não foi possível conferir se o defeito existe em um navegador com placa de vídeo.

Dois testes comparam o mapa pixel a pixel, antes e depois de abrir a legenda e a lista dos acontecimentos sem ponto. Quem acrescentar outro quadro sobre o mapa deve acrescentar a mesma conferência.

Outros estados:

| Estado | O que aparece |
| --- | --- |
| Carregando | "Carregando o mapa…" sobre a cor do mar. O resto da tela já funciona |
| Recorte sem pontos | O mapa no enquadramento do território, com o aviso e o botão dos acontecimentos sem ponto |

## Verificação

| Verificação | O que cobre |
| --- | --- |
| `tests/map-places.test.ts` | Lugares, agrupamento por proximidade, contagens, seleção e lugares fora da área |
| `tests/map-camera.test.ts` | Limites, tetos por precisão, enquadramento, o que conta como à vista e o deslocamento mínimo |
| `tests/map.test.ts` | Pontos gerados, acontecimentos sem ponto, grade e estilo sem recurso externo |
| `tests/design.test.ts` | Sincronia das cores da base com os tokens |
| `tests/e2e/mapa.spec.ts` | O mapa no navegador, com os dados reais: recorte, seleção nos dois sentidos, sobreposição, câmera, teclado, legenda, base preservada sob os quadros, falhas, layout, celular e página do acontecimento |
| `tests/e2e/prova.spec.ts` | Dados sintéticos: sem WebGL, pacote, worker e lugar fora da área |
| `npm run capture:map` | Capturas de `docs/capturas/fase-6/` |

O teste de navegador roda em um Chromium sem interface, com WebGL por software (`--enable-unsafe-swiftshader`). A perda de contexto é simulada com a extensão `WEBGL_lose_context`.

### Conferência manual

Para o que o ambiente automático não cobre: uma janela visível do Chrome, Firefox, Safari e um celular real.

1. Abrir `/politicos/lula/`. O mapa mostra os lugares do recorte, com os nomes, e a legenda diz "pontos aproximados".
2. Clicar em **Porto Alegre**: o painel abre, e o item fica marcado na lista e na linha do tempo.
3. Clicar em **Brasília**: abre a lista com quatro acontecimentos, sem selecionar nenhum. Escolher um.
4. Escolher na lista "Lula decreta intervenção federal…": Brasília e o marcador de Araraquara ganham o anel.
5. Arrastar e aproximar o mapa: a seleção e o endereço não mudam.
6. Marcar a categoria **Eleições**: os marcadores mudam, e o mapa não se recentra. **Enquadrar** o devolve.
7. Abrir **8 sem ponto no mapa** e escolher um acontecimento nacional: o painel abre, e o mapa diz que ele não tem ponto.
8. Em celular, na vista **Mapa**: tocar em um marcador com número abre a folha embaixo, e o marcador continua à vista; escolher mostra o cartão com **Ler** e **Fechar**.
9. Em `/acontecimentos/lula-2023-intervencao-federal-no-distrito-federal/`: rolar a página com o ponteiro sobre o mapa. A página rola, e o mapa pede Ctrl ou dois dedos.
10. Falha: em `/dev/prova/`, ligar **Simular navegador sem WebGL**. A lista de lugares assume, e a seleção continua.
