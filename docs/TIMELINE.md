# Linha do tempo e navegação temporal

Fase 5. Como a exploração de uma trajetória funciona: escolher a pessoa, consultar um ano ou um intervalo, filtrar categorias, selecionar um acontecimento e ler os detalhes, com a consulta inteira guardada no endereço. As telas e a composição por largura estão em [UX.md](UX.md); a base visual, em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md).

## Como abrir

```bash
npm install
npm run dev
```

Endereço local: `http://localhost:3000/`. A exploração de cada pessoa fica em `/politicos/lula/` e `/politicos/flavio-bolsonaro/`.

Endereços de exemplo, com a edição 0.1.0:

| O que abre | Endereço |
| --- | --- |
| Um ano | `/politicos/lula/?de=2018&ate=2018` |
| Um intervalo | `/politicos/lula/?de=2003&ate=2010` |
| Do ano escolhido até o fim da cobertura | `/politicos/flavio-bolsonaro/?de=2019` |
| Intervalo e duas categorias | `/politicos/lula/?de=2016&ate=2022&categorias=eleicoes,marcos-historicos` |
| Um acontecimento aberto | `/politicos/lula/?acontecimento=lula-2018-prisao-em-curitiba` |
| Intervalo, categoria e acontecimento | `/politicos/lula/?de=2016&ate=2019&categorias=marcos-historicos&acontecimento=lula-2018-prisao-em-curitiba` |
| Um ano com mudança de partido | `/politicos/flavio-bolsonaro/?de=2021&ate=2021` |
| Período sem registros | `/politicos/lula/?de=1996&ate=2001` |
| Acontecimento que é dos dois perfis | `/politicos/flavio-bolsonaro/?acontecimento=eleicao-2026-primeiro-turno` |
| Endereço com erro, corrigido no lugar | `/politicos/lula/?de=abcd&acontecimento=nao-existe` |

## Componentes e responsabilidades

| Parte | Arquivo | Responsabilidade |
| --- | --- | --- |
| Página do perfil | `src/app/politicos/[slug]/page.tsx` | Roda no build. Recorta os dados da pessoa e informa, de cada perfil, o `id` e os anos cobertos, que a troca de pessoa usa |
| `Explorer` | `src/app/politicos/[slug]/Explorer.tsx` | Junta as partes. Guarda só o que é apresentação: vista ativa, leitura aberta ou fechada, filtros à vista e bloco de cargos aberto |
| `AtlasUrlStateProvider` | `src/lib/state/AtlasUrlStateProvider.tsx` | Deriva o estado do endereço e transforma cada ação em um endereço novo. Único lugar que fala com `window.history` |
| Regras do endereço | `src/lib/state/url-state.ts` | Funções puras: restaurar o estado, escrever a forma canônica, levar o recorte na troca de pessoa e decidir entre nova entrada e substituição |
| Parâmetros | `src/lib/state/url-params.ts` | Leitura tolerante e escrita canônica de `de`, `ate`, `categorias` e `acontecimento` |
| Estado e seletores | `src/lib/state/atlas-state.ts`, `selectors.ts` | Ações, ajuste do período à cobertura e a regra de que a seleção sempre pertence ao recorte |
| `Timeline` | `src/features/timeline/Timeline.tsx` | Marcas, eixo, hachura do período e faixas de cargos e partidos. Mede a própria largura para distribuir as marcas |
| `EventMarks` | `src/features/timeline/EventMarks.tsx` | Uma marca por acontecimento do recorte, em fileiras, com teclado |
| `PeriodBrush` | `src/features/timeline/PeriodBrush.tsx` | Clique e arraste sobre o eixo. Só avisa o recorte ao soltar |
| `PeriodControl` | `src/features/timeline/PeriodControl.tsx` | Os dois campos de ano. Caminho de teclado, de leitor de tela e de toque |
| `CategoryFilter` | `src/features/timeline/CategoryFilter.tsx` | Um botão de alternância por categoria, com a quantidade no período |
| `PeriodContext` | `src/features/timeline/PeriodContext.tsx` | Cargos e partidos do período, por extenso, com a presença incerta à parte |
| `EventList` | `src/features/events/EventList.tsx` | Lista cronológica, com as lacunas do conjunto e os avisos de data parcial |
| Linhas da lista | `src/features/events/chronology.ts` | Funções puras: onde entram as lacunas e quais registros têm a ordem em aberto |
| `EventPanel` | `src/features/events/EventPanel.tsx` | Leitura do acontecimento. Não mudou nesta fase |
| `PersonSwitch` | `src/components/PersonSwitch.tsx` | Os perfis, em ordem alfabética, com o que está aberto marcado |
| Geometria | `src/components/time/scale.ts` | Datas e períodos em posições do eixo, e o caminho inverso: da posição ao ano |

Quem consulta os dados são as funções da fase 3 (`src/lib/data/queries.ts`): `filterEvents`, `listMandates`, `listAffiliations` e `listMandatesAt`. Nenhuma regra de filtragem foi reescrita na interface.

## Estado inicial e troca de pessoa

**Estado inicial.** Ao abrir `/politicos/<slug>/` sem parâmetros: todo o período que a edição cobre para a pessoa, todas as categorias e nenhum acontecimento aberto.

**De onde vem o período.** Os anos que podem ser consultados são a cobertura da edição para a pessoa: do início declarado em `edicao.cobertura` até o ano da data de corte (`getCoveredSpan`). Na edição 0.1.0, de 1975 a 2026 para Lula e de 2002 a 2026 para Flávio Bolsonaro. São os limites dos campos de ano, do eixo e do que o endereço aceita.

**Troca de pessoa.** A exploração mostra os perfis em ordem alfabética, com o que está aberto marcado (`aria-current="page"`). Em tela larga a troca fica sob o nome; nas demais, dentro de **Filtros**. O link para o outro perfil leva o recorte:

| Parte do recorte | O que acontece na troca |
| --- | --- |
| Categorias | Seguem como estão |
| Período dentro da cobertura do outro perfil | Segue como está |
| Período que atravessa o começo da cobertura do outro perfil | O lado de fora fica aberto: de 1997 a 2007, para um perfil coberto desde 2002, vira "até 2007" |
| Período inteiro fora da cobertura do outro perfil | É descartado: o outro perfil abre com todo o período |
| Acontecimento aberto que é só de uma pessoa | A seleção é desfeita |
| Acontecimento aberto que é dos dois perfis | Continua aberto |

A regra é uma função pura, `carryToPerson`, testada em `tests/url-state.test.ts`. Os links do menu levam ao perfil sem recorte, inclusive de dentro dele.

O que é só apresentação (vista ativa, bloco de cargos aberto) não é herdado: outra pessoa é outra exploração.

## Filtros

Pessoa, período e categorias se combinam como no contrato das consultas ([DATA-PIPELINE.md](DATA-PIPELINE.md), seção Consultas): dimensões diferentes se somam (E), valores da mesma dimensão se alternam (OU).

| Filtro | Significado |
| --- | --- |
| Nenhuma categoria marcada | Todas as categorias. É o estado inicial, e não "nenhum resultado" |
| Uma categoria marcada | Só os acontecimentos daquela categoria |
| Várias categorias marcadas | Os acontecimentos de qualquer uma delas |
| Período | Anos, com as duas pontas inclusas. Um ano só é o mesmo ano nas duas pontas |
| Um lado do período em aberto | Do começo da cobertura, ou até o fim dela |

**Período e cobertura.** Um lado igual ao limite da cobertura, ou além dele, fica aberto. Assim há uma forma só de dizer "desde o começo" e "até o fim": o período de 1975 a 2010, para Lula, é "até 2010". Um lado aberto acompanha a edição: quando uma edição nova cobrir 2027, "desde 2019" passa a incluir 2027.

**Três formas de escolher o período**, todas disparando a mesma ação, `setPeriod`:

| Forma | Como | Para quem |
| --- | --- | --- |
| Campos **De** e **Até** | Dois campos de seleção com os anos da cobertura | Teclado, leitor de tela e toque |
| Clique em um ano do eixo | Escolhe só aquele ano. Clicar de novo no ano que já está escolhido desfaz o período | Ponteiro e toque |
| Arraste sobre o eixo | Escolhe do ano em que começou ao ano em que terminou, em qualquer sentido. Esc desfaz o arraste | Mouse e caneta; toque onde a faixa não rola |

Durante o arraste só o desenho acompanha: a hachura e um rótulo com o intervalo. A lista, o mapa e o endereço mudam uma vez, ao soltar.

**Contagem das categorias.** O número em cada botão é a quantidade de registros daquela categoria no período em vigor.

**Limpar.** **Todo o período** desfaz o período; **Mostrar todas**, as categorias; **Limpar filtros** desfaz os dois de uma vez e volta ao recorte inicial. Limpar filtros não fecha o acontecimento aberto, porque ele continua no recorte.

**O que a tela diz sobre o recorte.** Acima da lista: o período, a quantidade ("N registros do atlas"), se é todo o período coberto ou um recorte dele, e as categorias marcadas. No fim da lista: de que ano a que data a edição cobre.

### Cargos e partidos do período

O bloco **Cargos e partidos em (período)** fica acima da lista, recolhido, com o resumo à vista ("3 cargos e funções · 3 partidos · 3 com presença incerta"). Aberto, mostra:

- **Cargos e funções** e **Partidos** cujas datas provam que tocam o período, cada um com as próprias datas, na precisão das fontes. Quando o intervalo atravessa uma mudança de cargo ou de partido, os períodos aparecem em sequência.
- **Presença incerta no período**: os registros que têm o início ou o fim desconhecido, e cujas datas conhecidas não dizem se eles tocam o período. Ficam à parte, com borda tracejada. Um limite desconhecido não vira data.

A classificação é da camada de dados (`listMandates` e `listAffiliations`, com `situacao` igual a `documentada` ou `incerta`). Sem período escolhido, entram todos os registros da pessoa.

Em telas médias e largas, as faixas de cargos e de partidos sob o eixo mostram os mesmos registros em desenho, e a hachura do período passa por cima delas. O bloco é o equivalente por extenso, e o único em tela estreita, onde as faixas não aparecem.

## Datas

- **A precisão é a do registro:** ano, mês ou dia. Nada é completado.
- **Na lista,** a data parcial diz o que falta, sob o ano: "só o ano" ou "sem o dia". Leitores de tela recebem a frase inteira ("1975. Só o ano está documentado.").
- **Na linha do tempo,** uma data parcial ganha um traço sob a marca, do primeiro ao último dia que ela pode representar, e a marca fica no meio do traço.
- **Ordem.** A lista segue a ordem da camada de dados: primeiro quem pode ter começado antes. Um registro só com o ano abre o ano. Isso é regra de ordenação, e não fato: quando as datas de dois registros se cruzam (o mesmo dia, ou uma data parcial que contém a outra), o menos preciso recebe o aviso "ordem dentro de (ano) não documentada". Na edição 0.1.0 isso acontece em 1980, na trajetória de Lula.
- **Filtro por período.** Toda data, de qualquer precisão, cai dentro de um único ano. Por isso o recorte em anos nunca precisa inventar um dia.

### Marcas próximas

As marcas ficam em fileiras. Cada marca reserva no eixo o espaço do próprio botão, 26 pixels, e a que não cabe ao lado da anterior sobe uma fileira. O espaço é calculado com a largura real do eixo, medida no navegador: em uma coluna estreita há mais fileiras, e em uma larga, menos. Um teste confere, em computador e em tablet, que nenhuma marca cobre outra.

O eixo não muda com os filtros nem tem zoom: o que fica fora do período é hachurado, e a hachura passa por baixo das marcas do recorte. Em tela estreita a faixa tem largura mínima e rola para o lado; com um período escolhido, ela rola sozinha até o trecho em claro.

### Lacunas

Um período de quatro anos ou mais sem nenhum registro da pessoa é uma lacuna do conjunto (`listGaps`). Ela aparece em quatro lugares, sempre como falta de registro:

| Onde | Como |
| --- | --- |
| Lista | Uma linha hachurada no lugar dos anos: "1981–1985 · sem registros do atlas nesta edição". Com um período escolhido, só o trecho dentro dele |
| Recorte vazio | "Nenhum registro do atlas neste recorte. Isso indica falta de registro nesta edição, e não falta de atividade pública no período." |
| Fim da lista | "Trecho sem registro é lacuna da pesquisa, e não ausência de atividade." |
| Cargos e partidos | "Nenhum cargo ou função com datas neste período." e a seção de presença incerta |

As lacunas são do conjunto inteiro da pessoa, e não do filtro: marcar uma categoria não cria lacunas novas na lista.

## Seleção e painel

Há uma seleção só, no estado compartilhado. Lista, linha do tempo, mapa e painel leem o mesmo `selected`.

| Ação | Efeito |
| --- | --- |
| Escolher um item na lista ou uma marca na linha do tempo | O acontecimento fica marcado nas quatro partes e abre no painel. O endereço ganha `acontecimento=<slug>` |
| Escolher de novo o item selecionado | Desfaz a seleção |
| **Fechar**, ou Esc com o foco na leitura | Desfaz a seleção e mantém os filtros. O foco volta ao item da lista; em tela estreita, na vista do mapa, volta à aba **Mapa** |
| Mudar o recorte de modo que o acontecimento saia dele | A seleção é desfeita, o painel volta ao perfil e a lista avisa: "O acontecimento que estava aberto ficou fora deste recorte e foi fechado." Leitores de tela recebem o mesmo aviso |
| Mudar o recorte mantendo o acontecimento dentro dele | Nada muda no painel |
| Trocar de vista para **Lista** ou **Mapa**, em tela estreita ou média | A leitura fecha e o acontecimento continua marcado. Acionar o item marcado abre a leitura de novo |

O painel mostra, nesta ordem: categoria, data na precisão conhecida (com o aviso de data parcial), título, pessoas, imagem com crédito quando houver, resumo, contexto, cargos na época, lugares com a precisão da coordenada, fontes com a evidência de cada citação, revisão e o link para a página do acontecimento. O texto é o do conjunto revisado.

Casos parciais:

| Caso | O que aparece |
| --- | --- |
| Sem imagem | O texto sobe; não há espaço vazio. Nenhum registro da edição 0.1.0 tem imagem |
| Sem coordenadas | Aviso na lista ("sem ponto no mapa", com o motivo) e frase no painel |
| Data parcial | Só o que se sabe, com a frase de precisão |
| Sem cargo que as datas provem para a data | A seção "Cargos na época" não aparece |

A lista, a linha do tempo e o painel não dependem do mapa. Com o mapa indisponível, a consulta, a seleção e o endereço funcionam do mesmo jeito (teste "leitura independente do mapa").

## Endereço

A rota diz quem; a query string diz o recorte e a seleção.

| Parâmetro | Valor | Exemplo |
| --- | --- | --- |
| (rota) | Slug da pessoa | `/politicos/lula/` |
| `de` | Ano com quatro dígitos | `de=2003` |
| `ate` | Ano com quatro dígitos | `ate=2010` |
| `categorias` | Identificadores separados por vírgula | `categorias=eleicoes,marcos-historicos` |
| `acontecimento` | Slug do acontecimento aberto | `acontecimento=lula-2018-prisao-em-curitiba` |

**O endereço é a fonte do estado.** O estado não é guardado em outro lugar: é derivado da query string a cada renderização (`stateFromSearch`), e uma ação vira um endereço novo. Abrir um link, recarregar, voltar e avançar passam pelo mesmo caminho, e não existe sincronização entre duas cópias que possa entrar em ciclo.

**Forma canônica.** Ordem fixa (`de`, `ate`, `categorias`, `acontecimento`), categorias na ordem do atlas, valores padrão omitidos. O mesmo estado gera sempre o mesmo endereço. Parâmetros que o atlas não conhece, como os de campanha (`utm_*`), são mantidos depois dos seus.

**Leitura tolerante.** Um endereço fora da forma canônica abre do mesmo jeito e é corrigido no lugar, sem criar entrada no histórico:

| Endereço recebido | Tratamento |
| --- | --- |
| Ano fora do formato, categoria desconhecida, slug malformado | O parâmetro é descartado sozinho; os outros valem |
| Período ao contrário (`de=2012&ate=2000`) | Lido na ordem certa |
| Lado do período no limite da cobertura, ou além dele | Aquele lado fica aberto |
| Período inteiro fora da cobertura | Descartado |
| Acontecimento que não existe, que é de outro perfil ou que é rascunho | Não abre; o painel fica no perfil e os filtros valem |
| Acontecimento fora do período ou das categorias pedidas | Não abre; os filtros valem |

### Histórico

| O que a pessoa faz | Entrada no histórico |
| --- | --- |
| Selecionar ou fechar um acontecimento | Nova |
| Marcar ou desmarcar uma categoria, **Mostrar todas**, **Limpar filtros** | Nova |
| Clique ou arraste no eixo | Uma, ao soltar. Durante o arraste o endereço não muda |
| Mudar um campo de ano | Nova. Mudanças seguidas no período, com menos de um segundo entre elas, substituem a entrada: percorrer os anos com as setas do teclado cria uma entrada só |
| Correção de um endereço fora da forma canônica | Substitui |
| Trocar de pessoa, abrir a página de um acontecimento | Nova, pelo roteador do Next |

Voltar desfaz a última escolha, e avançar a refaz. Depois de voltar ou avançar, o próximo ajuste de período sempre cria uma entrada, para não apagar aquela a que se voltou. A regra é `chooseHistoryMode`, testada sem navegador.

### Exportação estática

O site é de arquivos estáticos, e a página de cada perfil é gerada no build, sem query string.

- O HTML gerado traz a exploração inteira no estado inicial: os 20 acontecimentos, as lacunas e as marcas de cada perfil estão no arquivo. Conferido em `out/`.
- No navegador, a hidratação acontece com esse mesmo estado, e o endereço real é lido logo depois, com `useSyncExternalStore`. Quem chega por um link com consulta vê o estado inicial por um instante, até o JavaScript carregar.
- A escrita usa `window.history.pushState` e `replaceState`, que a documentação do Next 16.4 descreve como integrados ao roteador ("Native History API").
- `useSearchParams` tira da pré-renderização tudo o que estiver até o `Suspense` mais próximo. Por isso ele fica isolado em um componente sem saída visual (`RouterWatcher`), que só avisa das navegações feitas pelo roteador do Next, como o clique no menu para o perfil que já está aberto. Essas navegações não disparam `popstate`.
- Fronteira: `page.tsx` é Server Component e roda no build; `Explorer` e tudo abaixo dele são Client Components que recebem os dados por props.

## Contrato com o mapa

A linha do tempo e o mapa não se conhecem. Os dois leem o mesmo provider, por `useAtlas()`:

| Campo | Tipo | O que é |
| --- | --- | --- |
| `state.pessoa` | slug | A pessoa da rota |
| `state.periodo` | `{ de, ate }` | O período, em anos, com lado aberto em `null` |
| `state.categorias` | lista | As categorias marcadas; vazia significa todas |
| `state.acontecimento` | slug ou `null` | O acontecimento selecionado |
| `visible` | `Acontecimento[]` | Os acontecimentos do recorte, em ordem cronológica |
| `visibleIds` | `string[]` | Os `id` dos mesmos acontecimentos, na mesma ordem |
| `selected` | `Acontecimento` ou `null` | O acontecimento selecionado, sempre dentro de `visible` |
| `dispatch` | função | `selectEvent`, `setPeriod`, `toggleCategory`, `clearCategories`, `clearFilters` |

Como o mapa consome o contrato, desde a fase 6 ([MAP.md](MAP.md)):

- **Pontos do recorte:** `filterPoints(data.pontos, visible)` devolve a coleção GeoJSON só com os pontos dos acontecimentos visíveis. Cada ponto tem `eventId`, `placeId` e `acontecimentoSlug`. O mapa junta os pontos por lugar e desenha um marcador por lugar; não usa `visibleIds`, que continua exposto para quem precisar filtrar sem refazer a coleção.
- **Acontecimentos sem ponto:** `listUnplaced(visible)` devolve os do recorte que não geram ponto, com o motivo. O mapa dá acesso a eles pelo botão **sem ponto no mapa**.
- **Seleção para o mapa:** `state.acontecimento`, entregue a `MapView` como `selectedSlug`.
- **Seleção vinda do mapa:** `MapView` chama `onSelect(slug)`, e a exploração despacha `selectEvent`. É o mesmo caminho da lista e da linha do tempo, com a mesma entrada no histórico.
- **Garantias que o mapa assume:** o selecionado sempre está em `visible`; um acontecimento aparece uma vez em `visible`, mesmo com vários lugares; `visible` muda uma vez por ação, inclusive no arraste de período.
- **O que o mapa não faz:** não filtra, não guarda seleção e não escreve no endereço. A câmera e o seletor de lugares são estado local dele e não vão para o endereço.

## Verificações

Comandos, em `npm run check` e `npm run test:e2e`:

| Verificação | O que cobre nesta fase |
| --- | --- |
| `tests/url-state.test.ts` | Restauração do endereço, cobertura, forma canônica, troca de pessoa e regra do histórico |
| `tests/url-params.test.ts` | Leitura, escrita e parâmetros alheios |
| `tests/state.test.ts` | Ações, ajuste do período e seleção dentro do recorte |
| `tests/chronology.test.ts` | Ordem em aberto e posição das lacunas |
| `tests/timeline.test.ts` | Geometria do eixo, inclusive da posição ao ano |
| `tests/e2e/linha-do-tempo.spec.ts` | A jornada no navegador, com os dados reais: 40 testes |
| `npm run capture:timeline` | Capturas de `docs/capturas/fase-5/` |

Os resultados de cada execução, o que foi quebrado de propósito para testar os testes e o que não foi verificado estão em [STATUS.md](STATUS.md), seção da fase 5.
