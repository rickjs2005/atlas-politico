# Critérios editoriais

Regras de seleção, redação, revisão e correção do conteúdo do atlas. Valem igualmente para os dois perfis. A situação de cada item está em [CONTENT-REVIEW.md](CONTENT-REVIEW.md) e as fontes em [SOURCES.md](SOURCES.md).

## O que o atlas registra

A trajetória pública de cada pessoa: cargos, eleições, partidos, atos institucionais e episódios que mudaram o rumo da carreira. Não registra opinião, vida privada, pesquisa de intenção de voto nem declaração isolada.

## Seleção

Um fato vira acontecimento quando se encaixa em um destes cinco motivos, que correspondem às categorias do conteúdo:

| Motivo | Categoria | Exemplos |
| --- | --- | --- |
| Mudança de cargo ou função | Mandatos e funções | Eleição para a presidência de um sindicato, cargo na Mesa do Senado, presidência de comissão, nomeação suspensa |
| Eleição disputada, vencida ou perdida | Eleições | Candidatura, resultado, registro indeferido, convenção que oficializa a candidatura |
| Filiação, saída de partido ou aliança | Partidos e alianças | Fundação de partido, mudança de legenda |
| Ato institucional documentado | Atuação institucional | Decreto, liderança partidária, relatoria de projeto aprovado |
| Episódio que alterou a trajetória | Marcos históricos | Greve, prisão, condenação, anulação, denúncia e seu desfecho |

Regras que valem para os dois perfis:

1. **Mesmo critério, mesma hierarquia de fontes.** Um tipo de fato que entra para uma pessoa entra para a outra, se estiver documentado.
2. **Limite de 15 a 20 acontecimentos por pessoa.** É um limite de escopo, não uma meta a preencher. Fato sem sustentação suficiente fica em rascunho, com a pendência escrita.
3. **Fatos encadeados são reunidos.** A posse entra no contexto da eleição correspondente. O registro da candidatura entra no contexto da convenção. Duas eleições perdidas em sequência podem ficar em um acontecimento, com a segunda no contexto. O período de cada cargo fica na tabela de mandatos.
4. **Episódio em andamento não entra.** Investigação ou controvérsia sem decisão e sem documento oficial fica na lista de candidatos, fora do conjunto.
5. **Cada seleção tem motivo registrado.** A coluna "Por que entrou" de CONTENT-REVIEW.md diz o motivo de cada acontecimento.
6. **Carreiras de duração diferente não são niveladas.** O atlas não estica nem comprime uma trajetória para caber na outra. A diferença aparece na cobertura da edição e deve aparecer na comparação.

## Redação

- **Título:** diz quem fez o quê, sem adjetivo. Exemplo: "TSE indefere o registro da candidatura de Lula à Presidência".
- **Resumo:** uma ou duas frases com o fato, a data e o órgão ou a instituição.
- **Contexto:** a relação do fato com a trajetória, os desdobramentos relevantes até a data de corte e os limites do registro (por que a data é parcial, por que não há lugar).
- **Texto próprio.** Nada é copiado das fontes além de expressões curtas entre aspas, quando a expressão é o próprio dado, como a situação "Eleito por QP" no registro do TSE.
- **Atribuição.** O que é declaração ou avaliação aparece com autor: "a defesa afirmou", "os partidos alegavam", "segundo a Agência Senado".
- **Precisão da data.** A data tem a precisão que a fonte sustenta. Se a fonte só dá o ano, o registro fica com o ano e o contexto explica.
- **Data do fato e data da publicação.** São coisas diferentes. Quando o documento diz o dia do fato ("nesta quarta-feira (12)"), vale esse dia. Quando só há a data em que a notícia foi publicada, o registro usa essa data e o texto diz que é a da publicação ou da divulgação.
- **Nome do cargo.** O nome se explica sozinho, sem a instituição: "Presidente do PT", e não "Presidente". A página do acontecimento e a linha do tempo escrevem só o nome do cargo, e o mesmo nome em instituições diferentes deixaria a leitura por conta de quem lê. Um teste recusa o nome repetido entre instituições da mesma pessoa.
- **Sem qualificar.** O atlas não diz se uma decisão foi justa, se um resultado foi bom ou se uma pessoa tem razão.
- **Ordem dos nomes.** Em acontecimento compartilhado, os nomes vêm em ordem alfabética.
- **Mesma régua.** Os textos dos dois perfis seguem a mesma estrutura e o mesmo tom. Na revisão, o teste é trocar os nomes e ver se a frase ainda soaria neutra.

## Episódios judiciais

1. O texto diz quem decidiu, em que instância e em que data.
2. Investigação, denúncia, condenação e anulação são palavras diferentes e não se substituem.
3. Toda acusação vem com a manifestação da defesa, quando a fonte a traz.
4. Todo registro de condenação ou de denúncia informa o desfecho conhecido até a data de corte: confirmada, reduzida, anulada, rejeitada, sem julgamento de mérito.
5. Quando o desfecho vem de jornalismo, o texto diz qual veículo informa e quando.
6. O que não foi verificado até a data de corte é dito como tal, e não presumido.

## Lugares

- O lugar é o do fato documentado. Uma sequência de acontecimentos não é um trajeto.
- Eleição nacional não tem ponto municipal. Eleição estadual usa o ponto do estado. Eleição municipal usa o município.
- Decisão de tribunal usa o município-sede, quando ele aparece no documento lido.
- Sem lugar no documento, o registro fica sem ponto e o contexto diz por quê.
- Toda coordenada é uma aproximação declarada: centro do município ou do estado, pela API de malhas do IBGE.

## Revisão

Estados de um registro:

| Estado | Significado | Onde fica | Aparece no site |
| --- | --- | --- | --- |
| `rascunho` | Em pesquisa, com pendências escritas | `content/drafts/` | Não |
| `em-revisao` | Texto pronto, aguardando conferência | `content/drafts/` | Não |
| `revisado` | Conferido contra as fontes | `content/published/` | Sim |

Tipos de revisão, no campo `revisao.tipo`:

| Tipo | Quando se usa |
| --- | --- |
| `assistida-por-ia` | A conferência contra as fontes foi feita por um modelo de IA. O site mostra "Revisão humana pendente" |
| `humana` | Uma pessoa abriu as fontes, conferiu os trechos e aprovou o texto. Só é registrada quando isso aconteceu de fato, com nome e data |

O que a conferência verifica em cada registro:

1. Datas, nomes, cargo, instituição e lugar.
2. Sustentação de cada afirmação do resumo e do contexto em um trecho de uma fonte.
3. Coerência entre resumo, contexto e fontes.
4. Separação entre fato, declaração, investigação, acusação e decisão.
5. Em episódio judicial, o estado na época e os desdobramentos até a data de corte.
6. Divergências entre documentos, com registro do que foi adotado.
7. O endereço de cada fonte, aberto como um leitor o abriria. Um endereço que responde não basta: a página precisa mostrar o conteúdo citado.

Publicação: o conjunto atual, todo com revisão assistida por IA, serve ao desenvolvimento. O repositório é público desde 10 de outubro de 2026, por decisão do responsável pelo projeto, e por isso o conteúdo pode ser lido nos arquivos; o site não foi publicado e continua com `noindex`. A publicação do site depende de revisão humana do conjunto final. A fase 9 do plano refez a conferência com assistência de IA e deixou o roteiro da revisão humana pronto ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md)); a lista do que conferir, trecho a trecho e por prioridade, é gerada dos dados em [HUMAN-REVIEW.md](HUMAN-REVIEW.md) (`npm run review:human`). Ela continua pendente.

A regra que decide, a partir do estado e da pasta, o que entra nos dados do site está em [DATA-PIPELINE.md](DATA-PIPELINE.md), seção "Estados editoriais e elegibilidade". O mesmo documento diz como promover um rascunho e como tirar um registro do ar.

## Correção

1. **Quem aponta.** Qualquer pessoa. O canal público ainda não foi definido; é uma decisão pendente do responsável pelo projeto.
2. **Como se confere.** O apontamento é checado contra a fonte citada e, se preciso, contra uma fonte nova, que entra no catálogo.
3. **Como se registra.** Toda correção entra em `alteracoes` de `content/published/edicao.json`, com data, descrição e os registros afetados. O texto antigo não é apagado do histórico do repositório.
4. **Versão do conteúdo.** Correção de registro existente sobe o terceiro número da versão (0.1.0 para 0.1.1). Inclusão de acontecimentos sobe o segundo (0.1.0 para 0.2.0). A versão 1.0.0 fica reservada para a primeira edição com revisão humana completa.
5. **Sem promessa de prazo.** O atlas informa a data da última revisão e a data de corte de cada edição.
