# Comparação

Fase 7. Como a tela `/comparar/` põe as duas trajetórias no mesmo período, com as mesmas categorias e na mesma escala de anos, com a consulta guardada no endereço. As páginas de perfil e de acontecimento, o compartilhamento e a metodologia estão em [PAGES.md](PAGES.md); a navegação temporal de uma trajetória, em [TIMELINE.md](TIMELINE.md); o comportamento de cada controle, em [INTERACTIONS.md](INTERACTIONS.md).

## Como abrir

```bash
npm install
npm run dev
```

Endereço local: `http://localhost:3000/comparar/`.

Endereços de exemplo, com a edição 0.1.0:

| O que abre | Endereço |
| --- | --- |
| Todo o período, todas as categorias | `/comparar/` |
| Um intervalo | `/comparar/?de=2003&ate=2010` |
| Intervalo e uma categoria | `/comparar/?de=2016&ate=2022&categorias=eleicoes` |
| Período em que uma trajetória está fora da cobertura e a outra tem lacuna | `/comparar/?de=1996&ate=2001` |
| Um ano | `/comparar/?de=2021&ate=2021` |
| Endereço com erro, corrigido no lugar | `/comparar/?de=abcd&ate=2012&categorias=inventada,eleicoes` |

## O que a tela mostra

Nesta ordem, de cima para baixo:

| Parte | O que traz |
| --- | --- |
| Abertura | O que a tela é: as duas trajetórias no mesmo intervalo, com o que o atlas registra para cada pessoa |
| Recorte | Período (campos **De** e **Até**), categorias, **Limpar filtros** e **Copiar link**. Fica preso ao topo da página |
| Como ler esta comparação | Quatro avisos, escritos com os dados do recorte: mesmo recorte, cargos diferentes, cobertura diferente, acervo e não desempenho |
| Linha do tempo das trajetórias | Uma faixa por pessoa sobre o mesmo eixo: marcas dos acontecimentos, cargos e partidos, com o período em claro e o resto hachurado |
| Uma coluna por pessoa | Seis seções, na mesma ordem para as duas (abaixo) |

Seções de cada coluna:

| Seção | Conteúdo |
| --- | --- |
| Cabeçalho | Retrato, nome e **Explorar esta trajetória no mesmo recorte** |
| Cobertura desta edição | Desde quando a edição cobre a pessoa, a observação da edição, o trecho do recorte que fica fora da cobertura e as lacunas dentro dele |
| Cargos e funções no período | Cada cargo com instituição e intervalo, na precisão do registro, e as fontes dele |
| Partidos no período | Cada filiação com sigla, nome, intervalo e fontes |
| Acontecimentos no período | A lista cronológica do recorte, com a quantidade cadastrada. Cada item leva à página do acontecimento |
| Fontes deste recorte | Os documentos que sustentam o que a coluna mostra, sem repetição |

As pessoas aparecem em ordem alfabética, como no resto do atlas (D-38).

## Estado e endereço

A comparação usa o estado compartilhado da exploração, e não um estado próprio. A rota diz que as duas trajetórias entram; a query string diz o recorte.

| Campo do estado | Na comparação |
| --- | --- |
| `pessoa` | `null`: não há pessoa em foco |
| `comparar` | `true`, dito pela rota |
| `periodo` | `de` e `ate`, como na exploração |
| `categorias` | `categorias`, como na exploração |
| `acontecimento` | Sempre `null`: a comparação não abre acontecimento. Cada um tem a própria página |

O provider é o mesmo da exploração, `AtlasUrlStateProvider`, com `pessoa={null}` e `comparar`. O contexto do endereço (`UrlContext`) ganhou esses dois valores; a leitura, a forma canônica e a regra do histórico não mudaram.

```
/comparar/?de=2016&ate=2022&categorias=eleicoes
        │  stateFromSearch(search, { pessoa: null, comparar: true, data, cobertura: escala comum })
        ▼
estado { periodo, categorias, comparar: true }
        │  selectComparison(data, estado)  →  compareTrajectories(data, { periodo, categorias })
        ▼
uma trajetória por pessoa: acontecimentos, cargos, filiações e cobertura
```

**A filtragem existe em um lugar só.** `selectComparison` (`src/lib/state/selectors.ts`) entrega o período e as categorias do estado a `compareTrajectories` (`src/lib/data/queries.ts`), que chama `filterEvents`, `listMandates` e `listAffiliations` uma vez por pessoa. São as mesmas consultas da exploração. Um teste confere que a união das duas trajetórias é o recorte que `selectVisibleEvents` devolve com `comparar` ligado.

**Nenhuma pessoa é excluída pelo recorte.** O filtro de pessoa da exploração não se aplica aqui. Um período em que só uma das trajetórias tem cobertura continua valendo: a outra coluna diz que está fora da cobertura.

### Parâmetros

| Parâmetro | Valor | Tratamento |
| --- | --- | --- |
| `de`, `ate` | Ano com quatro dígitos | Ajustados à escala comum. Um lado no limite da escala fica aberto; um período inteiro fora dela é descartado; informado ao contrário, é lido na ordem certa |
| `categorias` | Identificadores separados por vírgula | Categoria desconhecida cai sozinha |
| `acontecimento` | Qualquer | Descartado e retirado do endereço |
| Outros (`utm_*`) | Qualquer | Mantidos depois dos parâmetros do atlas |

A **escala comum** é o menor intervalo que contém a cobertura das duas pessoas (`getSharedSpan`): na edição 0.1.0, de 1975 a 2026. É o domínio dos campos de ano e do eixo.

### Histórico

A regra é a da exploração (`chooseHistoryMode`):

| O que a pessoa faz | Entrada no histórico |
| --- | --- |
| Marcar ou desmarcar uma categoria, **Mostrar todas**, **Limpar filtros** | Nova |
| Mudar um campo de ano | Nova. Mudanças seguidas, com menos de um segundo entre elas, substituem a entrada |
| Correção de um endereço fora da forma canônica | Substitui |

Recarregar, voltar e avançar restauram a mesma consulta. Não há ciclo entre endereço e estado, porque o estado é derivado do endereço a cada renderização e uma ação só escreve um endereço novo.

### Exportação estática

A página é gerada no build sem query string. O HTML traz as duas trajetórias inteiras, no recorte inicial, e o endereço é lido depois da hidratação. Quem chega por um link com consulta vê as trajetórias encobertas, com o aviso "Abrindo a consulta do endereço…", até o endereço ser lido: a tela aparece já no recorte pedido (DECISIONS.md, D-83). É o mesmo comportamento da exploração (D-49).

## Mesma escala, mesmo recorte

- **Um eixo só.** As duas faixas dividem o eixo de anos de calendário, do começo ao fim da escala comum. Um teste confere que as duas têm a mesma posição e a mesma largura.
- **Os mesmos limites.** O período escolhido vale para as duas colunas e aparece no título de cada seção ("Cargos e funções em 2003–2010").
- **Fora do recorte, apagado.** Na faixa, as marcas fora do período ou das categorias ficam esmaecidas e deixam de ser link. O eixo não muda de escala com o filtro.
- **Seções alinhadas.** Em tela larga, cada seção começa na mesma altura nas duas colunas (`grid-template-rows: subgrid`), para a leitura paralela.

## Datas e intervalos

As regras são as da camada de dados, sem reescrita na interface:

| Caso | Tratamento |
| --- | --- |
| Acontecimento só com o ano ou sem o dia | Entra pelo ano. Na lista, a data diz o que falta: "só o ano" ou "sem o dia" |
| Cargo ou filiação com datas completas | Entra quando o intervalo toca o período (`classifyOverlap`) |
| Início ou fim não documentado | O registro diz "início não documentado" ou "fim não documentado". Quando as datas conhecidas não provam que ele toca o período, entra com o aviso "presença no período não documentada" ou "incerta no período" |
| Cargo ou filiação em curso | Vale até a data de corte da edição e leva a marca **em curso** |
| Sem período escolhido | Entram todos os cargos e todas as filiações da pessoa |

## Acontecimento das duas pessoas

Um acontecimento ligado às duas pessoas aparece nas duas colunas e nas duas faixas, com a nota "nas duas trajetórias". É o mesmo registro: o mesmo `id`, o mesmo endereço e uma página só. No recorte visível do estado ele conta uma vez. Na edição 0.1.0 há um: o primeiro turno de 2026.

## O que a comparação explica, e o que ela não faz

O bloco **Como ler esta comparação** é escrito com os dados do recorte:

| Aviso | De onde vem |
| --- | --- |
| Mesmo recorte | O período em vigor |
| Cargos diferentes | Texto fixo. Os cargos de cada pessoa estão na coluna dela, com instituição e datas |
| Cobertura diferente | `edicao.cobertura` de cada pessoa e, quando o período começa antes da cobertura de alguém, os anos que ficam fora dela |
| Acervo, e não desempenho | Texto fixo, com o limite de 15 a 20 acontecimentos por pessoa (EDITORIAL.md) |

Regras de linguagem:

- A quantidade é dita como **acontecimentos cadastrados**: é o acervo da edição.
- Recorte vazio: "Nenhum acontecimento cadastrado neste recorte. Isso indica falta de registro nesta edição, e não falta de atividade pública."
- Trecho anterior à cobertura: "o atlas não cobre esta trajetória. Não há registro porque o período não foi pesquisado."
- Lacuna dentro da cobertura: "São lacunas da pesquisa, e não ausência de atividade."

A tela não soma, não ordena, não calcula média nem densidade, não escreve uma quantidade contra a outra e não usa cor por pessoa. A região de anúncio para leitores de tela diz só o recorte. Um teste lê o texto da página e falha se aparecerem palavras de ranking.

## Fontes

- **De cada cargo e de cada filiação:** o item traz "N fontes", que abre a lista com o documento, quem publicou, as datas, onde está o trecho e o que ele sustenta.
- **De cada acontecimento:** na página dele, para onde o item leva.
- **Do recorte:** a seção **Fontes deste recorte** conta e lista os documentos que sustentam os registros da coluna, sem repetição, com a quantidade de registros que citam cada um (`listSourcesOf`).

## De uma tela para outra

| De | Para | O que segue |
| --- | --- | --- |
| Comparação | Página de um acontecimento | `de`, `ate`, `categorias` e `origem=comparar`. A página oferece **Voltar à comparação** com o mesmo recorte |
| Comparação | Exploração de uma pessoa | Período ajustado à cobertura da pessoa (`carryFromComparison`) e categorias |
| Exploração de uma pessoa | Comparação | Período e categorias. O lado aberto do período recebe o limite da cobertura da pessoa, para o intervalo consultado continuar o mesmo (`carryToComparison`) |

**Copiar link** copia o endereço da comparação com o recorte ([PAGES.md](PAGES.md), seção Copiar link).

## Composição por largura

| | Estreita (até 767 px) | Média (768 a 1279 px) | Larga (1280 px ou mais) |
| --- | --- | --- | --- |
| Recorte | Preso ao topo, com o período e as categorias escritos. Os controles ficam atrás do botão **Filtros** | O mesmo | Controles em linha, sempre à vista. **Limpar filtros** fica na linha dos rótulos, e a barra não muda de altura |
| Faixas | Rolam para o lado, começando pelos anos recentes. Com um período, rolam até ele | Inteiras à vista | Inteiras à vista |
| Colunas | Uma abaixo da outra, com atalho para cada uma | Uma abaixo da outra, com atalho | Lado a lado (a partir de 1024 px), com as seções na mesma altura |

Em tela estreita as referências de tempo continuam à vista: o período fica escrito na barra presa ao topo e no título de cada seção, e as faixas mantêm o eixo de anos.

## Arquivos

| Parte | Arquivo |
| --- | --- |
| Rota | `src/app/comparar/page.tsx` |
| Tela | `src/app/comparar/Comparison.tsx` |
| Faixas | `src/features/comparison/TrajectoryLanes.tsx` |
| Seletor | `selectComparison`, em `src/lib/state/selectors.ts` |
| Consulta | `compareTrajectories` e `listSourcesOf`, em `src/lib/data/queries.ts` |
| Contexto do endereço | `UrlContext`, `stateFromSearch` e `stateAfter`, em `src/lib/state/url-state.ts` |
| Endereços entre telas | `src/lib/state/links.ts` |
| Listas de cargos e partidos | `src/components/PeriodRecords.tsx` |
| Fontes | `src/components/SourceList.tsx` e `src/components/RecordSources.tsx` |

## Verificação

| Verificação | O que cobre |
| --- | --- |
| `tests/comparison.test.ts` | Estado a partir do endereço, ações, mesma consulta para as duas pessoas, acontecimento compartilhado, recorte vazio, interseção de intervalos e fontes de um conjunto |
| `tests/links.test.ts` | Endereços entre telas e o retorno |
| `tests/e2e/comparacao.spec.ts` | A tela no navegador, com os dados reais: recorte, endereço, histórico, cargos e partidos, recorte vazio, linguagem, fontes, cópia do link, celular |
| `npm run capture:pages` | Capturas de `docs/capturas/fase-7/` |

### Conferência manual

1. Abrir `/comparar/`. As duas faixas usam o mesmo eixo, e o trecho anterior a 2002 da faixa de Flávio Bolsonaro aparece como fora da cobertura.
2. Escolher de 2003 a 2010. O título de cada seção passa a dizer o período, e o endereço ganha `?de=2003&ate=2010`.
3. Marcar **Eleições**. As duas listas se recortam juntas.
4. Recarregar a página, voltar e avançar: a consulta volta.
5. Abrir um acontecimento e usar **Voltar à comparação**: o recorte é o de antes.
6. Escolher de 1996 a 2001: nenhuma das colunas diz que faltou atividade.
7. Abrir as fontes de um cargo e os documentos do recorte.
8. **Copiar link**, colar em outra aba: abre a mesma consulta.
9. Em celular: o recorte fica escrito no topo ao rolar, e **Filtros** abre os controles.
