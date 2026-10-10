# Páginas, fontes e compartilhamento

Fase 7. O que as páginas de perfil, de acontecimento e de metodologia mostram, como as fontes e os créditos são apresentados, como funcionam **Copiar link** e o retorno à exploração, e o que ainda depende de configuração. A comparação tem documento próprio, [COMPARISON.md](COMPARISON.md). A navegação temporal está em [TIMELINE.md](TIMELINE.md), e os critérios editoriais, em [EDITORIAL.md](EDITORIAL.md).

## Como abrir

```bash
npm install
npm run dev
```

| Página | Endereço local |
| --- | --- |
| Perfil de Flávio Bolsonaro | `http://localhost:3000/politicos/flavio-bolsonaro/` |
| Perfil de Lula | `http://localhost:3000/politicos/lula/` |
| Um acontecimento, por link direto | `http://localhost:3000/acontecimentos/lula-2018-prisao-em-curitiba/` |
| O mesmo, vindo de uma consulta | `/acontecimentos/lula-2018-prisao-em-curitiba/?de=2016&ate=2019&categorias=marcos-historicos` |
| Acontecimento das duas pessoas, vindo da comparação | `/acontecimentos/eleicao-2026-primeiro-turno/?de=2019&categorias=eleicoes&origem=comparar` |
| Metodologia | `http://localhost:3000/metodologia/` |
| Modelo de correção já com o registro | `/metodologia/?acontecimento=lula-2018-prisao-em-curitiba#correcao` |

Para conferir os links diretos na saída estática: `npm run build` e `npm run preview` (porta 4311).

## Perfis

As rotas `/politicos/flavio-bolsonaro/` e `/politicos/lula/` são a própria exploração: recorte, lista, mapa, linha do tempo e painel. O perfil é o que o painel de leitura mostra enquanto nenhum acontecimento está aberto, e a aba **Perfil** em telas estreitas e médias. Não existe uma segunda página de perfil: seria a mesma informação em dois lugares, com dois endereços para o mesmo perfil (D-67).

O painel (`ProfilePanel`) tem as mesmas seções, na mesma ordem, para os dois perfis:

| Seção | Conteúdo | De onde vem |
| --- | --- | --- |
| Cabeçalho | Retrato na moldura comum e nome | `pessoas`, `imagens` |
| Apresentação | O resumo do perfil, sem acréscimo | `pessoa.resumo` |
| Caminhos | **Comparar no mesmo recorte**, **Copiar link desta consulta** e **Metodologia e fontes** | Estado da exploração |
| Cargos e funções | Todos os registros da pessoa, com instituição, intervalo e fontes de cada um | `mandatos` |
| Partidos | Todas as filiações, com sigla, nome, intervalo e fontes de cada uma | `filiacoes` |
| Cobertura desta edição | Desde quando a edição cobre a pessoa e a observação da edição | `edicao.cobertura` |
| Fontes do perfil | As fontes do texto de apresentação, com o trecho e o que ele sustenta | `pessoa.fontes` |
| Rodapé | Revisão, versão e data de corte da edição, crédito do retrato com origem e caminho para as condições de uso | `pessoa.editorial`, `edicao`, `imagens` |

**Períodos.** Cada cargo e cada filiação traz o próprio intervalo, na precisão do registro. O que está em vigor na data de corte da edição leva a marca **em curso**; o que tem fim documentado mostra as duas datas; o que tem um limite desconhecido diz "início não documentado" ou "fim não documentado". A ordem é a cronológica da camada de dados.

**Só conteúdo elegível.** A página recebe os dados gerados, já recortados para a pessoa (`sliceForPerson`). Rascunho não chega a ela.

**No HTML do build.** A exploração sai pré-renderizada no estado inicial, e por isso o perfil inteiro está no arquivo gerado, com o título da página igual ao nome e a descrição igual ao resumo.

## Página do acontecimento

Uma página por acontecimento dos dados gerados: 39 na edição 0.1.0. `generateStaticParams` devolve os slugs do conjunto publicado, e `dynamicParams = false` recusa qualquer outro. Rascunho não gera página.

| Parte | Conteúdo |
| --- | --- |
| Retorno | Um link por pessoa ligada, para a exploração com o acontecimento aberto; e **Voltar à comparação**, para quem veio dela |
| Cabeçalho | Categoria, data por extenso na precisão do registro (com "Só o ano está documentado" ou "O dia não está documentado", quando for o caso), título e **Copiar link** |
| Resumo | O fato, no texto do registro |
| Contexto | A relação com a trajetória e os limites do registro |
| Fontes | Lista numerada: título com link, quem publicou, data do documento, data de acesso, onde está o trecho e o que ele sustenta |
| Revisão e edição | Quem conferiu, quando, o aviso de revisão humana pendente, a versão e a data de corte, **Como o atlas é feito** e **Sugerir uma correção** |
| Continuar no atlas | A exploração de cada pessoa ligada, a comparação e a metodologia |
| Ficha | Pessoas com os cargos que as datas provam para aquele dia, lugares com a precisão da coordenada, mapa de localização e créditos |

- **Link direto.** A página não depende de estado nem de página anterior: abre em uma aba nova e continua igual depois de recarregar.
- **Sem o mapa.** O texto é HTML do build. O mapa é carregado à parte, só no navegador; se ele falha, a lista de lugares assume, e a leitura não muda. Acontecimento sem ponto não desenha mapa e diz o motivo.
- **Slug que não existe.** A resposta é 404, com a página 404 do atlas: no servidor de desenvolvimento, pelo Next; na saída estática, pela hospedagem, que serve `404.html`. Vale também para o slug de um rascunho.
- **Título e descrição.** O título da página é o título do registro, e a descrição é o resumo. Nada é escrito a mais. O endereço canônico depende do domínio público e fica para a fase 10.

## Fontes e créditos

| Componente | Onde aparece | O que mostra |
| --- | --- | --- |
| `SourceList` | Página e painel do acontecimento, perfil, fontes de um cargo ou de uma filiação | O documento (título com link, quem publicou, domínio, data do documento, data de acesso) e a citação: onde está o trecho e o que ele sustenta naquele registro |
| `RecordSources` | Cada cargo e cada filiação, no perfil e na comparação | "N fontes", que abre a `SourceList` daquele registro. Elemento nativo de abrir e fechar |
| `SourceCatalog` | Comparação (fontes do recorte) e metodologia (fontes da edição) | Cada documento uma vez, com a quantidade de registros que o citam |
| `PortraitCredit` | Entrada, perfil | Crédito do retrato, o tratamento aplicado e, no perfil, a origem e o caminho para as condições de uso |

Regras de apresentação:

- **A relação entre fonte e afirmação é a do registro.** Cada citação é mostrada com o registro que a usa, com os campos `localizacao` ("Onde") e `evidencia` ("O que sustenta"). O catálogo, que não tem citação, diz quantos registros citam o documento e aponta para onde o trecho está.
- **Natureza da informação.** O conteúdo não tem um campo que classifique a fonte. Quem diz a origem é a autoria registrada (um tribunal, o Senado, uma agência, um veículo), sempre à vista. A separação entre fato, declaração atribuída e contexto está no texto revisado: a página mostra resumo e contexto em seções com nome e não reescreve nenhum dos dois.
- **Data ausente é dita.** Fonte sem data do documento aparece como "data do documento desconhecida". São 3 das 60, desde a edição 0.1.1.
- **Nada inventado.** Revisor e data de revisão são os do registro. A revisão assistida por IA nunca é dita com as palavras da revisão humana.
- **Imagens.** Crédito ao lado da imagem; autoria, condições de uso e página de origem em **Metodologia, Créditos**. O tratamento (tons de cinza, recorte) é dito.

### Conferência dos links

Feita nesta fase, sobre os dados gerados:

| Verificação | Resultado |
| --- | --- |
| Citações que apontam para fonte inexistente | Nenhuma |
| Fontes publicadas sem nenhuma citação | Nenhuma |
| Endereços ou títulos repetidos entre fontes | Nenhum |
| Endereços sem `https` | Nenhum |
| Links de fonte de cada uma das 39 páginas iguais aos do registro, sem link a mais | Conferido por teste |
| Catálogo da metodologia com todas as fontes e os endereços publicados (59 na edição 0.1.0, 60 na 0.1.1) | Conferido por teste |

Uma diferença de contagem foi encontrada e registrada: [SOURCES.md](SOURCES.md) dizia 166 citações, e as páginas mostram 160. As 6 que faltam são de rascunhos, que não entram na publicação. O catálogo de SOURCES.md passou a dizer isso. Nenhum registro de conteúdo foi alterado.

O que não foi feito na fase 7: abrir cada endereço para saber se ainda responde. Isso foi feito na fase 9, em 9 de outubro de 2026, e mudou o endereço de oito fontes ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md), seção Fontes).

## Copiar link

**Copiar link** (`CopyLink`) existe em quatro lugares:

| Onde | O que copia |
| --- | --- |
| Página do acontecimento | O endereço da página, sem o contexto de quem chegou: `/acontecimentos/<slug>/` |
| Comparação | O endereço com o recorte: `/comparar/?de=…&ate=…&categorias=…` |
| Exploração, sobre a lista e no perfil | O endereço com o recorte e, se houver, o acontecimento aberto |
| Exploração, no painel do acontecimento | O mesmo: o recorte e a seleção |

Regras:

- **O endereço é o do ambiente em execução.** O domínio vem de `window.location.origin`. Nenhum domínio público é suposto: quando o atlas for publicado, o endereço copiado será o do domínio em que ele estiver.
- **Só os parâmetros do atlas.** O link sai na forma canônica. Parâmetros alheios, como os de campanha, não são copiados.
- **A confirmação vem depois do sucesso.** O botão só passa a dizer "Link copiado" quando a cópia foi feita, e volta ao normal em 4 segundos. Leitores de tela recebem o aviso.
- **Sem conseguir copiar, o link aparece.** Se o navegador não oferece a área de transferência (página fora de contexto seguro) ou recusa a cópia, a tela mostra o endereço em um campo, já selecionado, com o aviso "Não foi possível copiar daqui. Selecione o link e copie". Nada é confirmado.
- **Outro endereço é outra cópia.** Mudar o recorte desfaz a confirmação ou o campo da cópia anterior.

## Retorno à exploração

A página de um acontecimento abre sozinha. Quando a pessoa chega a ela por dentro do atlas, o link leva junto o recorte de onde ela veio, e a página o usa para montar o caminho de volta. O histórico do navegador não entra nisso.

### Contexto no endereço da página

| Parâmetro | Valor | Quem escreve |
| --- | --- | --- |
| `de`, `ate` | Ano com quatro dígitos | A exploração e a comparação |
| `categorias` | Identificadores separados por vírgula | As duas |
| `origem` | `comparar` | Só a comparação |

São os parâmetros de sempre, lidos pelo mesmo `parseAtlasParams`, mais `origem`. A pessoa não precisa de parâmetro: os links de retorno vão para cada pessoa ligada ao acontecimento.

### O que cada link devolve

| Situação | Link para a exploração de cada pessoa | **Voltar à comparação** |
| --- | --- | --- |
| Acesso direto, sem contexto | `/politicos/<slug>/?acontecimento=<slug>` | Não aparece |
| Vindo da exploração, com recorte | O mesmo recorte, ajustado à cobertura da pessoa, e o acontecimento aberto. O link diz "com o recorte de antes: 2016–2019 · marcos históricos" | Não aparece |
| Vindo da comparação | O recorte da comparação, ajustado à cobertura de cada pessoa, e o acontecimento aberto | `/comparar/` com o mesmo recorte |
| Recorte que não contém o acontecimento, ou inválido | Só o acontecimento. O retorno nunca deixa de abrir o registro | Com o que sobrar de válido |

As regras são funções puras em `src/lib/state/links.ts` (`profileReturn`, `comparisonReturn`), testadas sem navegador.

**Links previsíveis.** Além do retorno, a seção **Continuar no atlas** e a ficha lateral sempre levam à exploração de cada pessoa com o acontecimento aberto, à comparação e à metodologia, sem depender de contexto.

**Exportação estática.** O HTML do build sai com os links sem recorte. O endereço é lido depois da hidratação (`useOwnSearch`), e os links passam a levar o contexto. Recarregar mantém o contexto, porque ele está no endereço.

## Metodologia

`/metodologia/` é a explicação pública do atlas. O texto segue EDITORIAL.md, SOURCES.md e CONTENT-REVIEW.md; os números e as datas vêm dos dados gerados.

| Seção | O que explica | O que vem dos dados |
| --- | --- | --- |
| Objetivo e escopo | O que o atlas registra e o que não registra | Quantidade de acontecimentos, cargos, filiações e fontes; data de corte |
| Seleção dos acontecimentos | Os cinco motivos, um por categoria, e as regras que valem para os dois perfis | |
| Fontes | Que a evidência vem do documento lido, a ordem de preferência e o uso restrito de jornalismo | Quantidade de documentos e de citações |
| Revisão | O processo que de fato aconteceu: conferência assistida por IA, o que ela prova e o que não prova | Tipo, autor e data da revisão; nota da edição |
| Datas | Precisão, datas parciais, ordem, períodos com limite desconhecido e recorte por anos | |
| Lugares | Aproximações, acontecimentos sem ponto e pontos que não formam trajeto | |
| Lacunas e limites da comparação | Quantidade como acervo, lacunas, cargos não equiparados e coberturas diferentes | Cobertura de cada pessoa, com a observação da edição; anos mínimos de uma lacuna |
| Edição e atualização | Versão, data de corte, como a versão muda e o registro de alterações | `edicao` |
| Como sugerir uma correção | Quem pode apontar, como se confere, e o modelo para copiar | Canal configurado, ou o aviso de que está pendente |
| Créditos | Imagens, com autoria, condições de uso e origem; mapa e tipografia | `imagens` |
| Fontes desta edição | Todos os documentos, agrupados por quem publicou | `fontes`, com a quantidade de registros que citam cada uma |

**A revisão descrita é a real.** O trecho "O que foi feito nesta edição" só aparece quando a revisão registrada é assistida por IA, e diz que nenhuma pessoa revisou o conjunto. Com uma revisão humana registrada, o texto passa a dizer quem revisou e quando.

**Sugestão de correção.** O modelo (`CorrectionTemplate`) tem três campos: link do acontecimento, informação a corrigir e fonte proposta, mais a edição consultada. Quem chega por **Sugerir uma correção**, na página de um acontecimento, traz `?acontecimento=<slug>`, e o modelo já vem com o link e o título daquele registro. Um slug que não é de acontecimento publicado não entra no modelo. **Copiar o modelo** segue as regras de **Copiar link**: confirma só depois do sucesso e, na falha, deixa o texto selecionado.

## Configuração pendente

| Item | Situação | Onde configurar |
| --- | --- | --- |
| Canal público de correção | **Pendente.** É decisão do responsável pelo projeto. A metodologia diz "Canal ainda não definido" e oferece o modelo | `SITE.correctionChannel`, em `src/lib/site.ts`: `{ rotulo, href }`. Com o valor preenchido, a página troca o aviso pelo link |
| Domínio público | **Não definido.** Não é necessário para **Copiar link**, que usa o endereço em execução | Endereço canônico, `metadataBase` e sitemap entram na fase 10 |
| Indexação | Bloqueada (`robots: noindex`), porque o conteúdo não tem revisão humana | `src/app/layout.tsx`, na fase 10 |

## Arquivos

| Parte | Arquivo |
| --- | --- |
| Perfil | `src/components/ProfilePanel.tsx`, dentro de `src/app/politicos/[slug]/Explorer.tsx` |
| Cargos e partidos com fontes | `src/components/PeriodRecords.tsx`, `src/components/RecordSources.tsx` |
| Página do acontecimento | `src/app/acontecimentos/[slug]/page.published.tsx`, `EventReturn.tsx`, `EventLocator.tsx` |
| Fontes | `src/components/SourceList.tsx` (`SourceList` e `SourceCatalog`) |
| Copiar link | `src/components/CopyLink.tsx` (`CopyLink` e `useCopy`) |
| Endereços entre telas e retorno | `src/lib/state/links.ts` |
| Leitura do endereço no navegador | `src/lib/state/location.tsx` |
| Metodologia | `src/app/metodologia/page.tsx`, `CorrectionTemplate.tsx` |
| Configuração pendente | `src/lib/site.ts` |
| Identificação da edição | `EditionTag`, em `src/components/EditionStatus.tsx` |

## Verificação

| Verificação | O que cobre |
| --- | --- |
| `tests/links.test.ts` | Endereços das telas, contexto, retorno à exploração e à comparação, recorte por extenso |
| `tests/comparison.test.ts` | Fontes de um conjunto de registros, sem repetição |
| `tests/e2e/paginas.spec.ts` | Perfis, páginas de acontecimento, links de fonte de todas as páginas, leitura sem o mapa, 404 para slug inexistente e para slug de rascunho, retorno, cópia do link com sucesso e com falha, metodologia, catálogo, créditos e modelo de correção |
| `npm run verify:export` | Saída estática: uma página por acontecimento publicado, nenhuma de rascunho |
| `npm run capture:pages` | Capturas de `docs/capturas/fase-7/` |

### Conferência manual

1. Abrir `/politicos/lula/`. O painel traz o perfil: apresentação, cargos com "em curso" onde cabe, partidos, cobertura, fontes, edição e crédito do retrato.
2. Abrir as fontes de um cargo: aparecem o documento, onde está o trecho e o que ele sustenta.
3. Escolher de 2016 a 2019 e **Marcos históricos**, abrir um acontecimento e **Abrir a página do acontecimento**. O endereço leva o recorte.
4. Na página, usar **Trajetória de Lula**: a exploração volta com o mesmo recorte e o mesmo acontecimento aberto.
5. Abrir a mesma página em uma aba nova, só com `/acontecimentos/<slug>/`: os links de retorno levam ao acontecimento, sem recorte.
6. **Copiar link** e colar: o endereço é o da página. Em uma página servida por `http` em outro computador da rede, o link aparece em um campo.
7. **Sugerir uma correção**: a metodologia abre no modelo, já com o link e o título.
8. Em `/metodologia/`, conferir a seção Revisão e a lista **Fontes desta edição**.
9. Com `npm run preview`, abrir um endereço de acontecimento que não existe: a página 404 do atlas.
