# Revisão editorial

Registro da revisão do conteúdo publicado feita na fase 9, em 9 de outubro de 2026: o que foi revisto, como, o que cada fonte sustenta, o que foi corrigido e o que continua pendente.

**Quem fez.** A revisão foi feita por uma IA (Claude, modelo da Anthropic), em uma sessão de trabalho pedida pelo responsável pelo projeto. Nenhuma pessoa refez a conferência. Os registros continuam marcados como revisão assistida por IA, e a revisão humana continua pendente. O roteiro para ela está no fim deste documento.

**O que não mudou.** A data de corte da edição continua sendo 8 de outubro de 2026. Nenhum acontecimento foi incluído nem retirado. A versão do conteúdo passou de 0.1.0 para 0.1.1, que é o que a regra de versão pede para correção de registro existente.

## Resultado

| O que o plano pede | Situação |
| --- | --- |
| Informações publicadas com sustentação identificada | Atendido com assistência de IA: as 60 fontes foram abertas, e os 398 trechos de evidência das 169 citações foram encontrados nos documentos do dia |
| Divergências registradas | Três divergências novas, todas com a versão adotada e o motivo ([CONTENT-REVIEW.md](CONTENT-REVIEW.md), seção Divergências entre documentos) |
| Informação sem sustentação volta ao estado apropriado | Nenhum registro precisou voltar a rascunho. Duas evidências sem apoio no documento citado ganharam a fonte certa |
| Revisão humana | **Pendente.** Não foi feita por ninguém |

## Conjunto revisado

| Coleção | Registros | O que foi conferido |
| --- | --- | --- |
| Acontecimentos | 39 (20 de cada pessoa, 1 compartilhado) | Título, resumo, contexto, data e precisão, pessoas, lugares, categoria e cada citação |
| Cargos e funções | 15 | Nome do cargo, instituição, início, fim e cada citação |
| Filiações partidárias | 8 | Partido, início, fim e cada citação |
| Perfis | 2 | Resumo, nome completo e cada citação |
| Lugares | 9 | Nome, coordenada e precisão declarada |
| Fontes | 60 | Endereço, título, autoria, data do documento e conteúdo |
| Imagens | 2 | Autoria, origem, condições de uso e crédito |
| Edição | 1 | Versão, data de corte, cobertura declarada e registro de alterações |

Os 5 rascunhos de `content/drafts/` não foram revistos. Eles não entram no site, e as pendências de cada um continuam escritas no próprio registro.

## Como a revisão foi feita

1. **Fontes abertas de novo.** Cada um dos endereços do catálogo foi baixado em 9 de outubro de 2026. Todos responderam com o documento.
2. **Trechos procurados no documento do dia.** A lista de 8 de outubro tinha 382 trechos literais. Eles foram procurados nas cópias novas: 380 estavam lá, e os 2 que faltaram levaram à correção do acontecimento de 2006 (abaixo).
3. **Leitura de cada registro contra os trechos.** Cada resumo, contexto, data, cargo e filiação foi relido ao lado dos trechos que o sustentam, à procura de afirmação sem apoio, de data com precisão maior que a da fonte e de declaração sem autor. Nos arquivos de candidatos do TSE de 1994, 1998 e 2002, a linha do candidato foi lida no CSV.
4. **Catálogo contra as páginas.** Título, autoria e data de cada fonte foram comparados com o que a página mostra.
5. **Endereços abertos como um leitor abriria.** As fichas do TSE foram abertas em um navegador comum. Foi assim que apareceu o defeito dos sete endereços que respondiam, mas mostravam uma página de erro.
6. **Lugares.** As coordenadas dos 9 lugares foram comparadas de novo com a API de localidades do IBGE. Nenhuma mudou.
7. **Imagens.** As páginas de origem dos dois retratos, no Wikimedia Commons, foram lidas de novo, com a licença e a autoria.
8. **Apresentação com os dados reais.** As telas do build foram lidas com o conteúdo final, à procura de leitura enganosa criada pela forma de mostrar, e não pelo texto. Dois problemas apareceram assim (correções 13 e 14).
9. **Pipeline.** Toda mudança de conteúdo passou por `npm run data:validate` e `npm run data:build`, e entrou em `alteracoes` de `content/published/edicao.json`.

O que esta revisão não é: a conferência mecânica prova que o trecho existe no documento, e a leitura assistida por IA procura afirmações sem apoio. Nenhuma das duas substitui uma pessoa que leia a fonte inteira e julgue se o atlas a interpreta bem.

As ferramentas de baixar e de comparar foram escritas para a sessão e não estão no repositório. O que fica registrado são as duas listas em [evidencias/](evidencias/README.md): `provas-2026-10-09.json`, com os trechos de cada citação, e `conferencia-2026-10-09.json`, com o acesso a cada fonte.

## Fontes

Data real da conferência: **9 de outubro de 2026**. É a data que o campo `acessadoEm` de cada fonte passou a trazer.

| Medida | Resultado |
| --- | --- |
| Fontes no catálogo | 60 (59 da edição anterior e 1 nova) |
| Fontes com o conteúdo acessado | 60 |
| Fontes que sustentam todas as citações que apontam para elas | 60 |
| Citações conferidas | 169: 163 de registros publicados e 6 de rascunhos |
| Trechos de evidência encontrados | 398 de 398 |
| Fontes com alguma limitação registrada | 27 |

Como cada tipo de fonte foi lido:

- **Página (44 fontes):** o HTML foi baixado e o texto, extraído.
- **Ficha do DivulgaCandContas, do TSE (8):** a página é montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que a ficha aparece.
- **Serviço de dados do Senado (5):** devolve a versão do dia da consulta.
- **Arquivo de dados do TSE (3):** arquivo compactado, com a linha do candidato lida no CSV indicado na citação.

Limitações que valem para mais de uma fonte:

- O servidor do TSE recusa pedidos sem os cabeçalhos de um navegador comum. Para um leitor isso não muda nada; para uma conferência automática, o pedido precisa levar esses cabeçalhos.
- Seis fontes são documentos vivos, com data de 9 de outubro de 2026, posterior à data de corte: a ficha de Flávio Bolsonaro de 2026 no TSE e os cinco serviços de dados do Senado. O que o atlas cita delas são fatos anteriores ao corte. Uma releitura futura pode encontrar outro conteúdo.
- Três páginas não têm data: o manual do Senado, a biografia da Câmara e o perfil do Senado.

### Fonte por fonte

"Sustenta" quer dizer que todos os trechos de evidência das citações que apontam para a fonte foram encontrados no documento aberto em 9 de outubro. O mesmo quadro, com o endereço lido e a hora do acesso, está em `docs/evidencias/conferencia-2026-10-09.json`.

| Fonte | Como foi lida | Acesso | Citações | Trechos conferidos | Sustenta | Limitação |
| --- | --- | --- | --- | --- | --- | --- |
| `planalto-biografia-lula` | página | sim (200) | 14 | 32 de 32 | sim | Nenhuma |
| `camara-biografia-lula` | página | sim (200) | 8 | 15 de 15 | sim | A página não tem data. A data de nascimento não aparece nela: está nos dados abertos da Câmara, que não são fonte do catálogo. |
| `tse-candidatos-1994` | arquivo de dados | sim (200) | 1 | 4 de 4 | sim | Arquivo compactado de dados. A linha de cada candidato foi lida no CSV indicado na citação. |
| `tse-candidatos-1998` | arquivo de dados | sim (200) | 1 | 3 de 3 | sim | Arquivo compactado de dados. A linha de cada candidato foi lida no CSV indicado na citação. |
| `tse-candidatos-2002` | arquivo de dados | sim (200) | 4 | 12 de 12 | sim | Arquivo compactado de dados. A linha de cada candidato foi lida no CSV indicado na citação. |
| `tse-divulgacand-2006-lula` | interface de dados da página | sim (200) | 1 | 2 de 2 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. A ficha chama a candidatura de A Força do Povo no campo do nome da coligação e a classifica como partido isolado, sem composição. |
| `tse-divulgacand-2006-alckmin` | interface de dados da página | sim (200) | 1 | 3 de 3 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2018-lula` | interface de dados da página | sim (200) | 1 | 4 de 4 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2026-lula` | interface de dados da página | sim (200) | 4 | 7 de 7 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2014-flavio` | interface de dados da página | sim (200) | 2 | 6 de 6 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2016-flavio` | interface de dados da página | sim (200) | 2 | 9 de 9 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2018-flavio` | interface de dados da página | sim (200) | 3 | 7 de 7 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-divulgacand-2026-flavio` | interface de dados da página | sim (200) | 9 | 16 de 16 | sim | Página montada por JavaScript. O conteúdo foi lido na interface de dados que a própria página consulta, e o endereço cadastrado foi aberto em um navegador para confirmar que carrega. O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-noticia-2018-registro-lula` | página | sim (200) | 2 | 9 de 9 | sim | O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-noticia-2022-totalizacao` | página | sim (200) | 1 | 4 de 4 | sim | O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-noticia-2022-proclamacao` | página | sim (200) | 1 | 3 de 3 | sim | O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-noticia-2026-registros` | página | sim (200) | 2 | 6 de 6 | sim | O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `tse-noticia-2026-primeiro-turno` | página | sim (200) | 4 | 10 de 10 | sim | O servidor recusa pedidos sem os cabeçalhos de um navegador comum. |
| `stf-noticia-2016-casa-civil` | página | sim (200) | 1 | 5 de 5 | sim | Nenhuma |
| `stf-noticia-2021-fachin-anula` | página | sim (200) | 4 | 10 de 10 | sim | Nenhuma |
| `stf-noticia-2021-plenario-confirma` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `stf-noticia-2021-competencia-df` | página | sim (200) | 1 | 2 de 2 | sim | Nenhuma |
| `stf-noticia-2021-segunda-turma-suspeicao` | página | sim (200) | 1 | 2 de 2 | sim | Nenhuma |
| `stf-noticia-2021-plenario-suspeicao` | página | sim (200) | 2 | 3 de 3 | sim | Nenhuma |
| `trf4-noticia-2018-apelacao` | página | sim (200) | 2 | 5 de 5 | sim | Nenhuma |
| `agencia-brasil-2017-sentenca-triplex` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2018-trf4` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2018-chegada-pf` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2019-stj-reduz-pena` | página | sim (200) | 1 | 4 de 4 | sim | Nenhuma |
| `agencia-brasil-2019-juiz-manda-soltar` | página | sim (200) | 2 | 5 de 5 | sim | Nenhuma |
| `agencia-brasil-2019-deixa-carceragem` | página | sim (200) | 2 | 4 de 4 | sim | Nenhuma |
| `agencia-brasil-2022-chapa-lula-alckmin` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-senado-2023-posse` | página | sim (200) | 8 | 11 de 11 | sim | Nenhuma |
| `agencia-senado-2023-intervencao` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2023-senado-confirma-intervencao` | página | sim (200) | 1 | 1 de 1 | sim | Nenhuma |
| `agencia-brasil-2024-cronologia-8-de-janeiro` | página | sim (200) | 1 | 1 de 1 | sim | Nenhuma |
| `agencia-camara-2007-discurso-de-posse` | página | sim (200) | 3 | 6 de 6 | sim | Nenhuma |
| `agencia-brasil-2026-convencao-pt` | página | sim (200) | 1 | 4 de 4 | sim | Nenhuma |
| `agencia-brasil-2026-convencao-pl` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2026-filiacao-restabelecida` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2026-perfil-flavio` | página | sim (200) | 5 | 7 de 7 | sim | Nenhuma |
| `agencia-senado-2026-segundo-turno` | página | sim (200) | 11 | 13 de 13 | sim | Nenhuma |
| `senado-dados-abertos-flavio` | serviço de dados | sim (200) | 1 | 3 de 3 | sim | Serviço de dados, que devolve a versão do dia da consulta. |
| `senado-dados-abertos-flavio-mandatos` | serviço de dados | sim (200) | 4 | 8 de 8 | sim | Serviço de dados, que devolve a versão do dia da consulta. |
| `senado-dados-abertos-flavio-filiacoes` | serviço de dados | sim (200) | 7 | 19 de 19 | sim | Serviço de dados, que devolve a versão do dia da consulta. |
| `senado-dados-abertos-flavio-cargos` | serviço de dados | sim (200) | 4 | 14 de 14 | sim | Serviço de dados, que devolve a versão do dia da consulta. |
| `senado-dados-abertos-flavio-liderancas` | serviço de dados | sim (200) | 8 | 27 de 27 | sim | Serviço de dados, que devolve a versão do dia da consulta. O endereço antigo (senador/5894/liderancas) é anunciado pelo Senado como descontinuado e ainda respondia em 9 de outubro de 2026; o catálogo passou a apontar para o substituto indicado, que traz os mesmos seis registros. |
| `senado-perfil-flavio` | página | sim (200) | 6 | 6 de 6 | sim | A página não tem data. |
| `agencia-senado-2019-perfil-flavio` | página | sim (200) | 3 | 6 de 6 | sim | Nenhuma |
| `agencia-senado-2021-filiacao-pl` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `senado-manual-republicanos-patriota` | página | sim (200) | 4 | 4 de 4 | sim | A página não tem data. |
| `agencia-senado-2024-saidas-temporarias` | página | sim (200) | 1 | 5 de 5 | sim | Nenhuma |
| `agencia-senado-2024-veto-saidas-temporarias` | página | sim (200) | 1 | 4 de 4 | sim | Nenhuma |
| `agencia-brasil-2020-denuncia-mprj` | página | sim (200) | 4 | 11 de 11 | sim | Nenhuma |
| `mprj-2021-recurso-stj` | página | sim (200) | 1 | 3 de 3 | sim | Nenhuma |
| `agencia-brasil-2021-stj-anula-decisoes` | página | sim (200) | 1 | 5 de 5 | sim | Nenhuma |
| `agencia-brasil-2022-tjrj-rejeita-denuncia` | página | sim (200) | 2 | 8 de 8 | sim | Nenhuma |
| `cartacapital-2025-caso-rachadinha` | página | sim (200) | 3 | 7 de 7 | sim | Reportagem. O atlas a cita com o nome do veículo e a data. |
| `brasil-de-fato-2026-quebra-de-sigilos` | página | sim (200) | 2 | 2 de 2 | sim | Reportagem. Informa também uma ação cível de 2023, que o atlas não registra por estar em andamento e sem documento oficial lido. |
| `gazeta-do-povo-2026-candidatura-flavio` | página | sim (200) | 1 | 4 de 4 | sim | Reportagem. A página tem dois títulos: o da aba do navegador e o que aparece no texto; o catálogo passou a usar o segundo. |

### Fontes substituídas ou com endereço novo

Nenhuma fonte ficou indisponível. Oito tiveram o endereço trocado, e uma foi acrescentada. Em todos os casos o conteúdo foi lido no endereço novo antes da troca.

| Fonte | O que havia | O que ficou | Conteúdo confirmado |
| --- | --- | --- | --- |
| Sete fichas do DivulgaCandContas (Lula em 2006, 2018 e 2026; Flávio Bolsonaro em 2014, 2016, 2018 e 2026) | Endereço no formato antigo, que o próprio serviço ainda informa em um de seus campos. Ele respondia, mas a página mostrava "Erro ao carregar a página" | Endereço no formato atual: região, unidade da federação, eleição, candidato, ano e unidade eleitoral | Cada endereço foi aberto em um navegador comum, e a ficha do candidato apareceu |
| Lideranças de Flávio Bolsonaro, nos dados abertos do Senado | Serviço que o Senado anuncia como descontinuado. Ainda respondia em 9 de outubro | O serviço substituto que o próprio Senado indica | Os mesmos seis registros, com outros nomes de campo. Os trechos de evidência foram reescritos com os nomes novos |
| Ficha de Geraldo Alckmin em 2006, no TSE | Não existia no catálogo | Fonte nova | Nome de urna, partido e situação lidos na ficha |

## Correções

Cada linha diz a causa, o que mudou e como a mudança foi conferida. Todas estão em `alteracoes` de `content/published/edicao.json`, na entrada de 9 de outubro de 2026, com os 32 registros afetados. O texto anterior de cada registro está no histórico do repositório.

| Nº | Registro | Causa | Mudança | Verificação |
| --- | --- | --- | --- | --- |
| 1 | Sete fichas do TSE no catálogo | O endereço cadastrado abria uma página de erro | Endereço no formato atual | Aberto em navegador; ficha visível |
| 2 | Lula é reeleito presidente da República (2006) | Dois trechos sobre a candidatura de Geraldo Alckmin eram atribuídos à ficha de Lula, onde não estão. Vinham da lista de candidatos | A citação da ficha de Lula diz só o que ela traz, e a ficha de Alckmin entrou como fonte própria | Os trechos das duas citações foram encontrados cada um na sua ficha |
| 3 | Ficha de Lula em 2006 | A data do documento estava como desconhecida, e a ficha informa a data da última atualização | Data de atualização informada pelo TSE | Lida no campo da ficha |
| 4 | Lideranças no Senado | Serviço anunciado como descontinuado | Endereço do substituto | Os seis registros conferem |
| 5 | Reportagem da Gazeta do Povo | A página tem dois títulos, e o catálogo usava o da aba do navegador | Título que aparece no texto | Lido na página |
| 6 | Cinco notícias da Agência Brasil | A autoria estava incompleta | Nomes que assinam cada texto | Lidos em cada página |
| 7 | STF suspende a nomeação de Lula para a Casa Civil (2016) | A data do registro é a da notícia do tribunal, e o texto dava a entender que era a da decisão | O resumo passou a dizer que o STF informou a decisão naquele dia, e o contexto, que a notícia não traz o dia da assinatura | Relido contra a notícia |
| 8 | Lula é condenado em primeira instância (2017) | O contexto diz que a condenação foi confirmada em segunda instância, com aumento da pena, e nenhuma citação do registro sustentava a frase | Citação acrescentada: a notícia do TRF4 sobre o julgamento da apelação | Trechos encontrados na notícia |
| 9 | TRF4 confirma a condenação (2018) | A regra dos episódios judiciais pede a manifestação da defesa quando a fonte a traz, e ela não estava no texto | O contexto passou a abrir com o que a defesa pediu e afirmou no julgamento | Trechos da notícia do TRF4 e da Agência Brasil |
| 10 | TSE indefere o registro da candidatura (2018) | O mesmo | O contexto passou a dizer o que a defesa alegava e que o relator rejeitou o argumento | Trechos da notícia do TSE |
| 11 | Denúncia de 2020 e rejeição de 2022, de Flávio Bolsonaro | A informação de que a denúncia não foi julgada no mérito vem de uma reportagem, e o texto não dizia de quem | Atribuição ao veículo, com a data da reportagem | Relido contra a reportagem |
| 12 | Cinco ajustes menores | Nome de um juiz escrito de forma diferente da fonte; notícia de agosto de 2026 sem atribuição; perfil de Lula sem o nascimento, que o perfil de Flávio Bolsonaro traz; início da liderança do Patriota com um dia que os dois campos do registro do Senado não confirmam; condições de uso dos retratos incompletas | Nome como a fonte escreve; atribuição à Agência Brasil com a data; mês e ano de nascimento no resumo, com a ficha do TSE citada ao lado da biografia; início com precisão de mês e os dois dias escritos no texto; licença com endereço e a condição sobre obras derivadas | Trechos encontrados; páginas de origem dos retratos lidas |
| 13 | Três cargos de Lula escritos só como "Presidente" | A página do acontecimento e a linha do tempo mostram o nome do cargo sem a instituição. Nas páginas de 1975, 1980 e 1986, a ficha dizia "Lula: Presidente", e a linha do tempo trazia uma barra "Presidente" nos anos 1980 | "Presidente do Sindicato dos Metalúrgicos" e "Presidente do PT". Períodos, fontes e citações não mudaram. Regra nova em [EDITORIAL.md](EDITORIAL.md) | As fontes já citadas usam esses nomes; trecho com o nome do sindicato acrescentado à lista; teste novo recusa nome de cargo repetido entre instituições; páginas relidas no build |
| 14 | Nota dos cargos na página do acontecimento | A nota dizia "na data do acontecimento" também quando só o ano está documentado. Nesse caso, o cargo listado é o de algum momento do ano | A nota acompanha a precisão: "na data", "no mês" ou "no ano" | Teste das páginas de acontecimento, nas três precisões |

As correções 13 e 14 são de apresentação. Nenhum fato do conteúdo estava errado, mas a tela deixava uma leitura errada possível.

## Divergências registradas nesta revisão

A política editorial pede que a divergência seja registrada e que o atlas diga qual versão adotou. As três estão na tabela de [CONTENT-REVIEW.md](CONTENT-REVIEW.md).

| Assunto | O que os documentos dizem | O que o atlas mostra |
| --- | --- | --- |
| Dia do nascimento de Lula | A biografia da Presidência e a ficha do TSE de 2026 trazem dias diferentes do mesmo mês | Só o mês e o ano. As duas fontes estão citadas no perfil, com a diferença escrita |
| Designação de Flávio Bolsonaro como líder do Patriota | O registro do Senado traz um dia no campo da data e outro na observação | Início com precisão de mês, e os dois dias escritos no contexto do acontecimento |
| Nome da candidatura de Lula em 2006 | A ficha do TSE traz um nome no campo da coligação e classifica o registro como partido isolado, sem composição | O texto usa o nome como o campo registra e não informa composição |

## Achados sem mudança no conteúdo

- **Ação cível noticiada em 2026.** A reportagem do Brasil de Fato usada no caso das "rachadinhas" informa também uma ação cível de 2023. Ela não entrou: está em andamento, e nenhum documento oficial foi lido. É a regra do episódio em andamento.
- **Fim da filiação ao Republicanos.** O mês vem da combinação de dois documentos: o manual do Senado, que registra a mudança de partido, e os dados abertos, que trazem a data da filiação seguinte. Nenhum documento lido traz a data de saída. A citação diz isso. Fica para a decisão da revisão humana se o limite deve continuar como data ou virar "fim não documentado".
- **Sentença de 2017 sem manifestação da defesa.** A notícia usada não traz uma. O registro não inventa uma.
- **Página da Câmara sem a data de nascimento.** A biografia citada não traz a data. Ela está nos dados abertos da Câmara, que não são fonte do catálogo, e por isso a citação do perfil aponta para a ficha do TSE.
- **Primeiro turno de 2026.** Os números são os da apuração divulgada pelo TSE, e o texto diz isso. A totalização final não foi procurada.
- **Cargo em ano de data parcial.** Para um acontecimento de que só se sabe o ano, a página lista os cargos de qualquer momento daquele ano. A regra já estava documentada; a nota da página passou a dizê-la (correção 14).

## Pendências

Nenhuma destas pendências deixa uma afirmação publicada sem fonte identificada. Elas limitam o quanto se pode confiar na leitura, e a primeira decide a publicação.

1. **Revisão humana do conjunto.** Não foi feita. A política do projeto é que a publicação depende dela ([EDITORIAL.md](EDITORIAL.md)).
2. **Decisão sobre o fim da filiação ao Republicanos**, descrita acima.
3. **Totalização final do primeiro turno de 2026**, se o responsável quiser trocar os números da apuração pelos definitivos. Isso é uma atualização de conteúdo, e não uma correção.
4. **Os 5 rascunhos**, com as pendências escritas em cada um.
5. **Canal público de correção**, ainda não definido. A página de metodologia diz que está pendente.
6. **Ferramenta de conferência no repositório.** Hoje a conferência das fontes depende de ferramentas escritas na sessão. Se o atlas for atualizado com frequência, vale transformar isso em um comando do projeto.

## Revisão humana

Para quem for revisar. Leva o conjunto de "revisão assistida por IA" a "revisão humana", registro por registro. A lista do que conferir, trecho a trecho e por prioridade (episódios judiciais, dados eleitorais, filiações, mandatos, demais), com as fontes de cada item e a caixa para assinar, é gerada dos dados em [HUMAN-REVIEW.md](HUMAN-REVIEW.md) (`npm run review:human`); este roteiro diz como ler cada item.

1. Abra a lista de trechos: `docs/evidencias/provas-2026-10-09.json`. Cada item tem o registro, a fonte e os trechos literais que sustentam a citação.
2. Para cada acontecimento, abra a página em `/acontecimentos/<slug>/`. A página mostra as fontes na ordem do registro, com "Onde" e "O que sustenta".
3. Abra cada fonte pelo endereço da página e procure o trecho. Nas fichas do TSE, os dados aparecem na tela da ficha; nos serviços do Senado, o trecho é o par de campo e valor.
4. Leia o resumo e o contexto ao lado da fonte. As perguntas são três: o texto diz só o que a fonte sustenta? A data tem a precisão da fonte, e é a do fato ou a da publicação? O que é declaração tem autor?
5. Troque mentalmente os nomes das duas pessoas e veja se a frase continua neutra. É o teste da mesma régua de [EDITORIAL.md](EDITORIAL.md).
6. Nos episódios judiciais, confira quem decidiu, em que instância, a manifestação da defesa quando a fonte a traz e o desfecho até a data de corte.
7. Faça o mesmo com os 15 cargos e as 8 filiações, que aparecem no perfil de cada pessoa com as próprias fontes.
8. Decida as divergências da tabela e a pendência 2.
9. Ao aprovar um registro, troque `revisao.tipo` para `humana`, com o seu nome e a data, e rode `npm run data:validate` e `npm run data:build`. O teste "não registra revisão humana que não aconteceu" precisa ser ajustado nesse momento, porque hoje ele recusa qualquer registro marcado como revisão humana.
10. Registre o que mudou em `alteracoes` de `content/published/edicao.json`. A versão 1.0.0 fica reservada para a primeira edição com revisão humana completa.

Não marque como revisão humana um registro que você não conferiu contra a fonte.
