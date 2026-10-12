# Critérios editoriais

Regras de seleção, redação, revisão e correção do conteúdo do atlas. Valem igualmente para os dois perfis. A situação de cada item está em [CONTENT-REVIEW.md](CONTENT-REVIEW.md) e as fontes em [SOURCES.md](SOURCES.md).

## O que o atlas registra

A trajetória pública de cada pessoa: cargos, eleições, partidos, atos institucionais e episódios que mudaram o rumo da carreira. Não registra opinião, pesquisa de intenção de voto nem declaração isolada. Da vida fora dos cargos, só o que documentos oficiais trazem sobre origem, família, formação e trabalho.

Desde a edição 0.3.0 o atlas registra também, fora da linha do tempo, três coisas que a trilha do jogo usa: fatos biográficos de origem, formação e trabalho antes da vida pública; a definição simples de termos; e as propostas que cada candidatura registrou na Justiça Eleitoral. As regras de cada uma estão na seção Origem, termos, fases e propostas.

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

Publicação: o conjunto atual tem só revisão assistida por IA. O repositório é público desde 10 de outubro de 2026, por decisão do responsável pelo projeto, e por isso o conteúdo pode ser lido nos arquivos. Em 11 de outubro de 2026, também por decisão dele, o site passou a responder em um endereço provisório da Vercel, sem indexação: todas as páginas levam `noindex`, o `robots.txt` bloqueia tudo, e as telas dizem "Revisão humana pendente" (D-147, [DEPLOY.md](DEPLOY.md)). Nenhuma revisão humana foi feita, e a regra continua escrita como estava: a publicação da edição final depende de revisão humana do conjunto. A fase 9 do plano refez a conferência com assistência de IA e deixou o roteiro da revisão humana pronto ([EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md)); a lista do que conferir, trecho a trecho e por prioridade, é gerada dos dados em [HUMAN-REVIEW.md](HUMAN-REVIEW.md) (`npm run review:human`). Ela continua pendente. A regra tem uma barreira no código: `npm run verify:release` recusa a publicação enquanto houver registro factual sem revisão humana, e continua recusando. É uma régua diferente da do build, que aceita o conjunto em conferência para o desenvolvimento seguir. Mudar esta regra, ou dizer que o endereço provisório é a publicação, é decisão do responsável pelo projeto, registrada aqui, e não um ajuste no comando: a redação deste parágrafo sobre o endereço provisório diz o fato e fica à espera da confirmação dele.

A regra que decide, a partir do estado e da pasta, o que entra nos dados do site está em [DATA-PIPELINE.md](DATA-PIPELINE.md), seção "Estados editoriais e elegibilidade". O mesmo documento diz como promover um rascunho e como tirar um registro do ar.

## Decisões políticas: votos, atos e atuação legislativa

Desde 10 de outubro de 2026 o modelo aceita proposições, votações, votos, atos do Executivo, cobertura da pesquisa e identidades institucionais; desde a edição 0.3.0, também a atuação legislativa, que é a autoria ou a relatoria de uma matéria ([DATA_MODEL.md](DATA_MODEL.md), seção Decisões políticas). As regras de seleção acima continuam valendo; estas se somam a elas:

1. **Voto é fato com documento.** Um voto entra só com a lista nominal, a ata ou o painel que o registra, citados com o trecho. A falta de uma linha no acervo não vira ausência: a ausência é um registro, com o documento que a traz (licença, missão, comunicação). Orientação de bancada não é voto individual.
2. **"A favor" é a favor do objeto votado.** Uma votação diz o que foi posto em votação: texto principal, substitutivo, emenda, destaque, requerimento. Um voto favorável a um requerimento de urgência não é apoio ao mérito, e um voto em uma emenda não é voto no projeto inteiro. O registro nunca converte isso em "favorável à segurança" ou "contra a educação".
3. **Os três estados não bastam.** Além de favor, contra e ausência, o modelo conserva abstenção, obstrução, não voto com motivo documentado e "outro registro" (o valor original do acervo, até a revisão classificar). A consulta comparativa distingue ainda "não se aplica" (a pessoa não ocupava cargo com competência), "competência não confirmada", "sem registro individual" (a fonte não individualiza) e "pesquisa pendente" (o conjunto ainda não procurou). Nenhum desses é juízo sobre a pessoa; o jogo não premia interpretar uma ausência como desinteresse.
4. **Presidência é outro tipo de histórico.** Sanção expressa ou tácita, veto total ou parcial (com os dispositivos), medida provisória, decreto e iniciativa são atos próprios, atribuídos a quem o documento diz que os praticou. Não há "voto presidencial" nem "sanção de PEC". Sanção tácita é efeito do procedimento, não declaração de apoio.
5. **Tema é decisão editorial.** A classificação nos sete temas (economia, segurança pública, saúde, educação, reforma do Estado, meio ambiente, direitos das mulheres) é feita na revisão e justificada; um registro pode ter mais de um tema. "Não localizado em um tema" não significa "nunca atuou nele".
6. **Cobertura declarada, não prometida.** Cada recorte pesquisado tem um registro de cobertura (pessoa, tema, período, acervos, critérios, estado, lacunas). Não se chama uma amostra editorial de "todas as votações", e não se calcula percentual de cobertura sem um inventário como denominador.
7. **Mesma régua para os dois.** Os mesmos contratos, critérios, campos, acesso às fontes e explicações para as duas trajetórias; os mandatos são comparáveis por tema, não por contagem. A Constituinte é identificada separadamente da Câmara; a Alerj entra no recorte de Flávio Bolsonaro. Sem pontuação, vencedor ou percentual a partir de mandatos incomparáveis e amostras incompletas.
8. **Importação não publica.** O que chega dos acervos entra como rascunho, com a captura bruta guardada e as pendências escritas; revisão humana só é registrada quando uma pessoa a fez. A barreira de release vale para estas coleções como para as demais.
9. **Amostra declarada, com a seleção registrada.** A edição 0.2.0 publica uma amostra de até doze decisões, nos temas Economia e Segurança pública, de 2023 à data de corte, escolhidas por abrangência, efeito institucional e qualidade da evidência (D-128). A escolha nunca olha se a decisão favorece ou prejudica alguém, e o que ficou de fora é listado com o motivo em `research/selecao-decisoes-2026-10.md`. O mesmo registro diz o que ele comprova e o que não comprova sobre a escolha (seção A regra aplicada): a amostra ficou com três decisões por pessoa e tema, e conferir se essa divisão pesou além do que o recorte permite é parte da revisão humana. Toda tela de decisões diz que é amostra; a cobertura de cada pessoa e tema fica declarada como parcial, com as lacunas. Atos assinados pelo vice-presidente no exercício do cargo não são atribuídos ao presidente; a derrubada de vetos pelo Congresso não é ato do Executivo.
10. **O jogo não interpreta por ninguém.** A atividade de uma fase pergunta o que a explicação acabou de dizer e o que os registros apontados documentam; nenhuma pede opinião nem juízo sobre as pessoas. O Escrivão, guia fictício, não fala das pessoas retratadas nem repete fato, e as falas de humor dele são sobre papelada e sobre ele mesmo, iguais para os dois personagens e desligáveis (D-127, D-133). Nas fases e nos registros de contexto sensível (processo judicial, prisão, violência), o humor fica de fora sem a pessoa precisar desligar; a lista desses registros é por identificador, a mesma para os dois, e a aprovação dela e do tom é de uma pessoa (D-129, D-142).
11. **O que falta e o que diverge ficam à vista.** Quando dois documentos divergem sobre o objeto de uma votação, o registro diz o que cada um diz e o que o atlas adotou (`divergenciaDocumentada`), e o cartão mostra junto do objeto; a fonte não é corrigida em silêncio, e as notas internas da revisão não vão para a tela. Quando o texto submetido à votação não está ligado ao registro, o cartão diz que não está (D-132).
12. **Propor ou relatar não é votar.** A atuação legislativa diz que a pessoa é autora de uma matéria, ou que foi designada relatora dela, e o destino documentado da matéria: lei sancionada, lei promulgada pelo Legislativo, norma gerada ou destino não documentado. Não diz como a pessoa votou, se o parecer foi aprovado nem o que a norma produziu. A autoria é a da ficha do acervo; coautoria não é registrada como autoria individual. As páginas das leis promulgadas pela Assembleia citam os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que não foram lidos: o registro diz isso e não escreve que houve veto derrubado (D-136, D-149).
13. **Cada parte da amostra tem a regra escrita.** A edição 0.3.0 acrescentou onze atos de 2003 a 2010, oito leis estaduais e uma relatoria, cada parte com a regra de escolha na cobertura declarada e a lista do que foi conferido, do que entrou e do que ficou de fora em `research/trilha-2026-10.md`. Para as leis estaduais e a relatoria a regra é mecânica e não olha o assunto. Para os atos de 2003 a 2010, a escolha entre candidatos da mesma área não ficou escrita no momento em que foi feita: é o primeiro ponto a refazer na revisão humana. Nenhuma tela dá um critério só para a amostra inteira (D-143).

## Origem, termos, fases e propostas

Regras do conteúdo que a edição 0.3.0 acrescentou para a trilha do jogo ([GAME-TRAIL.md](GAME-TRAIL.md), [DATA_MODEL.md](DATA_MODEL.md), seções Conteúdo educativo e Propostas eleitorais). Valem igualmente para os dois perfis.

1. **Fato biográfico só com documento oficial ou de agência pública.** Nascimento, família, mudança de cidade, formação e trabalho antes da vida pública entram com a biografia de um órgão público, um registro de candidatura, os dados abertos de uma casa legislativa ou uma agência pública de notícias. Material de campanha, verbete de dicionário biográfico, enciclopédia aberta e cópia de página guardada por terceiro não são fonte, e o que só eles trazem fica de fora.
2. **Divergência é registrada, e não escondida.** Quando os documentos divergem sobre um dia, um lugar ou um nome, o registro escreve o que cada um diz. Onde há uma precisão em que todos concordam, fica com ela: o nascimento de Lula está registrado no mês, porque os documentos divergem no dia. Onde o texto adota uma das versões, o registro diz qual: o lugar de nascimento de Flávio Bolsonaro é o dos dados do Senado e do registro mais recente no TSE, e os nomes dos cargos de Lula no sindicato são os da biografia da Presidência. Escolher entre versões é decisão editorial, à espera da revisão humana.
3. **Sem data, sem data.** Fato que o documento não data fica sem data: o texto não escreve ano nenhum, e diz que os documentos não o trazem.
4. **Sem cena de infância e sem adjetivo.** O fato biográfico diz o que o documento diz, em uma ou duas frases. Não narra, não descreve e não qualifica. Fica fora da linha do tempo e do mapa.
5. **Termo explicado com o texto oficial.** A definição simples de um termo tem até 45 palavras, cita o texto oficial que a sustenta (a Constituição, uma lei, um glossário de órgão público) e diz o que ela simplifica. Não é fato sobre nenhuma das pessoas. Termo que nenhum documento oficial lido define não ganha definição: "rachadinha" aparece entre aspas, como nos títulos dos registros.
6. **O texto de uma fase não é fonte.** A explicação é escrita para o jogo, em 60 a 100 palavras, e cada bloco aponta os registros publicados que o sustentam. Todo ano e todo número escritos em uma fase estão em um registro que ela aponta. Fato que não está em registro nenhum entra antes, como registro, com documento lido. Número que vem só de fonte ligada à instituição da própria pessoa (a biografia publicada pela Presidência, a agência de notícias do Senado) leva o nome da fonte, em frase própria, nas duas trilhas (D-149). Número de dado primário, como o resultado do TSE, o texto de uma lei ou o registro de uma votação, fica fora dessa regra. A fase escreve cada número como o registro o escreve.
7. **A atividade pergunta o que a explicação disse.** Uma pergunta com três opções ou uma ordenação pelas datas. A ordenação só existe quando as datas decidem a ordem. Nenhuma pergunta pede opinião, e nenhuma alternativa traz juízo.
8. **Cada tipo de registro é dito como o que é.** Voto, ato do Executivo, atuação legislativa, proposta e resultado de eleição não se confundem no texto de uma fase. Nas fases de voto, o texto separa o voto da pessoa do resultado da votação.
9. **Toda fase declara o que não foi pesquisado.** Uma lacuna da pesquisa não é uma afirmação sobre a pessoa.
10. **Proposta eleitoral é frase de documento registrado.** A fonte é o documento que a candidatura registrou no TSE, com a página. O texto começa por "O documento", tem até 45 palavras e diz o que o documento propõe, sem acrescentar número, prazo ou valor que a frase não traga, sem cortar a condição da medida e com todas as medidas que a frase propõe. O que a frase diz sobre meios, apoios, finalidade ou justificativa pode ficar de fora, nos dois documentos. O resumo é de uma frase do documento, ou de duas frases seguidas da mesma página quando a segunda completa a primeira. O atlas não anota, frase a frase, se ela é precisa ou vaga: esse aviso é um só, no texto fixo das telas, igual para as duas candidaturas. Quando o resumo usa um trecho de outra página, a citação traz a localização dos dois, e uma segunda formulação com outro alcance é dita no texto, com a página. O campo ressalva ficou sem uso nesta edição (D-149). Proposta não é ato, voto nem resultado: não entra entre as decisões, não entra na linha do tempo e nunca é marco de fase (D-138).
11. **O mesmo número de frases para as duas candidaturas.** Três por área, nas sete áreas. A escolha das frases é editorial e está à espera da revisão humana. A tela diz que três frases não são o documento inteiro e que a falta de uma proposta no atlas não quer dizer que a candidatura não a faz.
12. **Mesma forma para as duas trilhas.** O mesmo número de fases, as mesmas etapas e tamanho de texto parecido. Na revisão, o teste é o mesmo da redação: trocar os nomes e ver se a frase ainda soaria neutra.

## Correção

1. **Quem aponta.** Qualquer pessoa. O canal público ainda não foi definido; é uma decisão pendente do responsável pelo projeto.
2. **Como se confere.** O apontamento é checado contra a fonte citada e, se preciso, contra uma fonte nova, que entra no catálogo.
3. **Como se registra.** Toda correção entra em `alteracoes` de `content/published/edicao.json`, com data, descrição e os registros afetados. O texto antigo não é apagado do histórico do repositório.
4. **Versão do conteúdo.** Correção de registro existente sobe o terceiro número da versão (0.1.0 para 0.1.1). Inclusão de acontecimentos sobe o segundo (0.1.0 para 0.2.0). A versão 1.0.0 fica reservada para a primeira edição com revisão humana completa.
5. **Sem promessa de prazo.** O atlas informa a data da última revisão e a data de corte de cada edição.
