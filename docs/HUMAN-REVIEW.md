# Revisão humana: o que conferir, trecho a trecho

Gerado por `npm run review:human` a partir dos dados publicados (edição 0.2.0, data de corte 2026-10-08). Não edite à mão: o teste `tests/human-review.test.ts` confere que este arquivo está em dia. A conferência registrada no conteúdo é toda assistida por IA (0 registros com revisão humana); a política editorial ([EDITORIAL.md](EDITORIAL.md)) condiciona a publicação à revisão por uma pessoa, e a lista abaixo é o roteiro dela.

## Como usar

1. Para cada item, abra as fontes listadas e leia o trecho indicado em **Onde olhar**. Confira o resumo e o contexto palavra a palavra: datas, números, nomes, cargos, placares, penas e o que cada citação diz sustentar.
2. O que estiver errado ou sem apoio no documento vira correção de conteúdo pelo pipeline ([DATA-PIPELINE.md](DATA-PIPELINE.md)): nova entrada em `alteracoes` da edição, com a descrição. Nunca edite `generated/` à mão.
3. Só depois da leitura real, a pessoa que conferiu registra a revisão como humana no conteúdo (`revisao.tipo: "humana"`, com nome e data). O código e os scripts nunca fazem isso sozinhos.
4. Marque a caixa de cada item com o nome e a data. O arquivo gerado é regravado pelo comando; guarde as marcações em cópia própria ou no controle de versão da edição.

Resumo: 39 acontecimentos (10 judiciais, 16 eleitorais, 4 de partidos, 3 de mandatos e funções, 6 demais), 8 filiações, 15 mandatos, 12 decisões políticas (6 votos e 6 atos do Executivo, sobre 7 proposições), 4 declarações de cobertura da pesquisa, 1 identidades institucionais, 78 fontes.

## 1. Episódios judiciais (10 acontecimentos)

Denúncia, decisão liminar, condenação, confirmação, prisão, soltura, anulação e rejeição são coisas diferentes, cada uma com data, autor e efeito. Conferir, em cada registro: quem alegou, o que a defesa disse, quem decidiu, quando, com que placar ou pena, e o desfecho na data de corte. Nenhum registro pode sugerir culpa ou inocência além do que o documento diz.

### 18 de março de 2016: STF suspende a nomeação de Lula para a Casa Civil

- Identificador: `lula-2016-nomeacao-para-a-casa-civil-suspensa` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 18 de março de 2016, o STF informou que o ministro Gilmar Mendes concedeu liminar que suspendeu a eficácia da nomeação de Lula para o cargo de ministro-chefe da Casa Civil.
- **Contexto a conferir:** A decisão foi tomada em mandados de segurança do PPS e do PSDB. Os partidos alegavam que a nomeação, feita pela presidente Dilma Rousseff, teve desvio de finalidade: retirar da 13ª Vara Federal de Curitiba um procedimento criminal contra Lula, já que ministros de Estado têm foro no STF. A liminar também manteve os procedimentos criminais na primeira instância. A notícia do tribunal não informa o dia em que a liminar foi assinada; a data deste registro é a da publicação.
- Fontes:
  - [Ministro suspende nomeação de Lula para Casa Civil e mantém processo na 1ª instância](https://noticias.stf.jus.br/postsnoticias/ministro-suspende-nomeacao-de-lula-para-casa-civil-e-mantem-processo-na-1a-instancia/), Supremo Tribunal Federal. Onde olhar: Texto da notícia e data de publicação. Sustenta: Liminar que suspendeu a nomeação, autores dos mandados de segurança e alegação de desvio de finalidade. A data é a da publicação da notícia.
- [ ] Conferido por: ______ em ____/____/______

### 12 de julho de 2017: Lula é condenado em primeira instância no caso do triplex

- Identificador: `lula-2017-condenacao-em-primeira-instancia` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 12 de julho de 2017, o juiz federal Sérgio Moro condenou Lula a nove anos e seis meses de prisão por corrupção passiva e lavagem de dinheiro, no processo sobre um apartamento triplex em Guarujá (SP). A sentença permitia recorrer em liberdade.
- **Contexto a conferir:** A condenação foi confirmada em segunda instância em janeiro de 2018, com aumento da pena. Em 2021, o STF anulou as decisões da 13ª Vara Federal de Curitiba nas ações contra Lula, por considerar aquele juízo incompetente, e declarou a suspeição do juiz no caso do triplex.
- Fontes:
  - [Moro condena Lula a nove anos e seis meses de prisão no caso triplex](https://agenciabrasil.ebc.com.br/politica/noticia/2017-07/ex-presidente-lula-e-condenado-nove-anos-e-seis-meses-de-prisao), Agência Brasil (Ivan Richard Esposito). Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Condenação, pena, crimes e possibilidade de recorrer em liberdade.
  - [Operação Lava Jato: TRF4 confirma condenação do ex-presidente Luiz Inácio Lula da Silva](https://www.trf4.jus.br/trf4/controlador.php?acao=noticia_visualizar&id_noticia=13418), Tribunal Regional Federal da 4ª Região. Onde olhar: Primeiro parágrafo. Sustenta: Confirmação da condenação em segunda instância em 24 de janeiro de 2018, com aumento da pena.
  - [Fachin anula condenações de Lula e manda ações penais para Justiça Federal do DF](https://noticias.stf.jus.br/postsnoticias/fachin-anula-condenacoes-de-lula-e-manda-acoes-penais-para-justica-federal-do-df/), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo. Sustenta: Anulação das decisões da 13ª Vara Federal de Curitiba, sede do juízo que proferiu a sentença.
  - [STF confirma suspeição de Sergio Moro na ação do triplex do Guarujá](https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=468086&ori=1), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo. Sustenta: Suspeição do ex-juiz no caso do triplex, mantida pelo plenário.
- [ ] Conferido por: ______ em ____/____/______

### 24 de janeiro de 2018: TRF4 confirma a condenação de Lula e aumenta a pena

- Identificador: `lula-2018-tribunal-confirma-condenacao` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 24 de janeiro de 2018, a 8ª Turma do Tribunal Regional Federal da 4ª Região confirmou por unanimidade a condenação de Lula por corrupção passiva e lavagem de dinheiro e elevou a pena de nove anos e seis meses para 12 anos e um mês de reclusão.
- **Contexto a conferir:** No julgamento, o advogado de Lula, Cristiano Zanin, pediu a absolvição e afirmou que o processo era nulo e que a sentença não havia provado a culpa. A condenação em segunda instância foi o fundamento citado no TSE para declarar Lula inelegível em 2018 e precedeu sua prisão, em abril daquele ano. Em abril de 2019, a Quinta Turma do STJ manteve a condenação e reduziu a pena para 8 anos e 10 meses. As condenações foram anuladas pelo STF em 2021.
- Fontes:
  - [Operação Lava Jato: TRF4 confirma condenação do ex-presidente Luiz Inácio Lula da Silva](https://www.trf4.jus.br/trf4/controlador.php?acao=noticia_visualizar&id_noticia=13418), Tribunal Regional Federal da 4ª Região. Onde olhar: Primeiro parágrafo e trecho das sustentações orais. Sustenta: Confirmação unânime da condenação, nova pena e pedido de absolvição feito pela defesa.
  - [Por 3 a 0, desembargadores do TRF4 mantêm condenação de Lula no caso triplex](https://agenciabrasil.ebc.com.br/politica/noticia/2018-01/desembargadores-do-trf4-mantem-condenacao-de-lula-no-caso-triplex), Agência Brasil (Danyele Soares). Onde olhar: Primeiro parágrafo e trecho Como foi o julgamento. Sustenta: Sede do tribunal em Porto Alegre e manifestação da defesa durante o julgamento.
  - [TSE indefere pedido de registro de candidatura de Lula à Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2018/Setembro/tse-indefere-pedido-de-registro-de-candidatura-de-lula-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Trecho sobre o voto do relator. Sustenta: A condenação em segunda instância como fundamento da inelegibilidade.
  - [STJ reduz pena de Lula de 12 para 8 anos de prisão no caso do triplex](https://agenciabrasil.ebc.com.br/justica/noticia/2019-04/maioria-do-stj-decide-reduzir-pena-do-ex-presidente-lula), Agência Brasil (Felipe Pontes e André Richter). Onde olhar: Primeiro parágrafo e parágrafo sobre a prisão. Sustenta: Redução da pena pela Quinta Turma do STJ em 23 de abril de 2019; preso desde abril de 2018.
  - [Fachin anula condenações de Lula e manda ações penais para Justiça Federal do DF](https://noticias.stf.jus.br/postsnoticias/fachin-anula-condenacoes-de-lula-e-manda-acoes-penais-para-justica-federal-do-df/), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo. Sustenta: Anulação das condenações em 2021.
- [ ] Conferido por: ______ em ____/____/______

### 7 de abril de 2018: Lula é preso e levado à Polícia Federal em Curitiba

- Identificador: `lula-2018-prisao-em-curitiba` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 7 de abril de 2018, Lula chegou à Superintendência da Polícia Federal em Curitiba para começar a cumprir a pena do caso do triplex. Ficou preso até 8 de novembro de 2019.
- **Contexto a conferir:** A prisão decorreu da condenação confirmada pelo TRF4 em janeiro de 2018. Lula ficou em uma sala reservada na sede da Polícia Federal. Segundo a Agência Brasil, a prisão durou 580 dias.
- Fontes:
  - [Lula chega à Polícia Federal em Curitiba para começar a cumprir pena](https://agenciabrasil.ebc.com.br/politica/noticia/2018-04/lula-chega-policia-federal-em-curitiba-para-comecar-cumprir-pena), Agência Brasil (Danyele Soares). Onde olhar: Primeiros parágrafos e data de publicação. Sustenta: Chegada à Superintendência da Polícia Federal em Curitiba e sala reservada.
  - [Lula deixa carceragem da PF em Curitiba](https://agenciabrasil.ebc.com.br/justica/noticia/2019-11/lula-deixa-carceragem-da-pf-em-curitiba), Agência Brasil (André Richter). Onde olhar: Primeiro e terceiro parágrafos. Sustenta: Preso desde 7 de abril de 2018, por 580 dias, pela condenação no caso do triplex.
  - [Após decisão do STF, juiz manda soltar ex-presidente Lula](https://agenciabrasil.ebc.com.br/justica/noticia/2019-11/apos-decisao-do-stf-juiz-manda-soltar-ex-presidente-lula), Agência Brasil (André Richter). Onde olhar: Terceiro parágrafo. Sustenta: Condenação confirmada pelo TRF4 em janeiro de 2018.
- [ ] Conferido por: ______ em ____/____/______

### 31 de agosto de 2018: TSE indefere o registro da candidatura de Lula à Presidência

- Identificador: `lula-2018-registro-de-candidatura-indeferido` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em sessão extraordinária iniciada em 31 de agosto de 2018, o plenário do TSE indeferiu, por 6 votos a 1, o registro da candidatura de Lula à Presidência da República, com base na Lei da Ficha Limpa.
- **Contexto a conferir:** O relator, ministro Luís Roberto Barroso, declarou a inelegibilidade de Lula. A defesa alegava que uma medida cautelar do Comitê de Direitos Humanos da ONU havia suspendido a inelegibilidade; o relator rejeitou o argumento. Por 5 votos a 2, o tribunal permitiu à coligação O Povo Feliz de Novo (PT, PCdoB e Pros) substituir o candidato em dez dias e proibiu Lula de praticar atos de campanha. O TSE publicou o resultado na madrugada de 1º de setembro. Fernando Haddad era o candidato a vice na chapa registrada.
- Fontes:
  - [TSE indefere pedido de registro de candidatura de Lula à Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2018/Setembro/tse-indefere-pedido-de-registro-de-candidatura-de-lula-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Primeiros parágrafos, trecho Decisão da ONU, data de publicação e rodapé. Sustenta: Placar, fundamento, alegação da defesa e resposta do relator, substituição do candidato, proibição de atos de campanha e data da sessão.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2018](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/2022802018/280000625869/2018/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: situação, motivos e vice. Sustenta: Registro indeferido por Ficha Limpa, coligação e candidato a vice.
- [ ] Conferido por: ______ em ____/____/______

### 8 de novembro de 2019: Lula deixa a prisão em Curitiba

- Identificador: `lula-2019-saida-da-prisao` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 8 de novembro de 2019, a Justiça Federal em Curitiba determinou a soltura de Lula, que deixou a carceragem da Polícia Federal no mesmo dia.
- **Contexto a conferir:** A decisão, do juiz Danilo Pereira Júnior, atendeu a pedido da defesa baseado no julgamento do STF da véspera, que derrubou a execução provisória de condenações criminais, conhecida como prisão após a segunda instância. Lula estava preso desde 7 de abril de 2018.
- Fontes:
  - [Após decisão do STF, juiz manda soltar ex-presidente Lula](https://agenciabrasil.ebc.com.br/justica/noticia/2019-11/apos-decisao-do-stf-juiz-manda-soltar-ex-presidente-lula), Agência Brasil (André Richter). Onde olhar: Primeiro e segundo parágrafos e data de publicação. Sustenta: Ordem de soltura, juiz responsável e relação com o julgamento do STF da véspera.
  - [Lula deixa carceragem da PF em Curitiba](https://agenciabrasil.ebc.com.br/justica/noticia/2019-11/lula-deixa-carceragem-da-pf-em-curitiba), Agência Brasil (André Richter). Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Saída da carceragem da Polícia Federal no mesmo dia.
- [ ] Conferido por: ______ em ____/____/______

### 4 de novembro de 2020: Ministério Público do Rio denuncia Flávio Bolsonaro no caso das “rachadinhas”

- Identificador: `flavio-bolsonaro-2020-denuncia-do-ministerio-publico` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 4 de novembro de 2020, o Ministério Público do Rio de Janeiro informou ter apresentado denúncia contra Flávio Bolsonaro, o ex-assessor Fabrício Queiroz e outras 15 pessoas ao Órgão Especial do Tribunal de Justiça do Rio. A acusação era de lavagem de dinheiro, peculato, apropriação indébita e organização criminosa.
- **Contexto a conferir:** A investigação tratava de suposto esquema de “rachadinha” na Assembleia Legislativa do Rio de Janeiro no período em que Flávio era deputado estadual; segundo o Ministério Público, os fatos teriam ocorrido entre 2007 e 2018. A denúncia havia sido oferecida em 19 de outubro. A defesa afirmou que a acusação não se sustentava e era desprovida de indício de prova, e o senador declarou que não cometeu irregularidade. A denúncia foi rejeitada pelo Tribunal de Justiça em 2022, a pedido do próprio Ministério Público. Segundo reportagem do Brasil de Fato de 29 de setembro de 2026, ela não chegou a ser julgada no mérito.
- Fontes:
  - [MP do Rio denuncia 17 investigados por lavagem de dinheiro e peculato](https://agenciabrasil.ebc.com.br/justica/noticia/2020-11/mp-do-rio-denuncia-17-investigados-por-lavagem-de-dinheiro-e-peculato), Agência Brasil (Vitor Abdala). Onde olhar: Primeiros cinco parágrafos e data de publicação. Sustenta: Denúncia, denunciados, crimes apontados, período dos fatos, data do oferecimento e manifestações da defesa e do senador.
  - [Justiça do Rio arquiva processo de caso de supostas rachadinhas](https://agenciabrasil.ebc.com.br/politica/noticia/2022-05/justica-do-rio-arquiva-processo-de-caso-de-supostas-rachadinhas), Agência Brasil (Vladimir Platonow). Onde olhar: Primeiro e segundo parágrafos. Sustenta: Rejeição da denúncia em 2022, a pedido do próprio Ministério Público.
  - [Gilmar Mendes mantém quebra de sigilos de investigada por 'rachadinha' em gabinete de Flávio Bolsonaro](https://www.brasildefato.com.br/2026/09/29/gilmar-mendes-mantem-quebra-de-sigilos-de-investigada-por-rachadinha-em-gabinete-de-flavio-bolsonaro/), Brasil de Fato. Onde olhar: Parágrafo sobre a denúncia. Sustenta: A denúncia não foi julgada no mérito.
- [ ] Conferido por: ______ em ____/____/______

### 8 de março de 2021: STF anula as condenações de Lula na Lava Jato

- Identificador: `lula-2021-stf-anula-condenacoes` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 8 de março de 2021, o ministro Edson Fachin, do STF, anulou todas as decisões da 13ª Vara Federal de Curitiba nas ações penais contra Lula, inclusive as condenações, por entender que aquele juízo não era competente para os casos.
- **Contexto a conferir:** A decisão atingiu quatro processos: triplex do Guarujá, sítio de Atibaia, sede do Instituto Lula e doações ao Instituto Lula. Em 15 de abril de 2021, o plenário rejeitou por 8 votos a 3 o recurso da Procuradoria-Geral da República e, em 22 de abril, definiu que os processos caberiam à Justiça Federal do Distrito Federal. Em 23 de março, a Segunda Turma havia declarado a suspeição do ex-juiz Sergio Moro no caso do triplex, entendimento mantido pelo plenário em 23 de junho. Segundo a Agência Senado, com a anulação Lula recuperou os direitos políticos.
- Fontes:
  - [Fachin anula condenações de Lula e manda ações penais para Justiça Federal do DF](https://noticias.stf.jus.br/postsnoticias/fachin-anula-condenacoes-de-lula-e-manda-acoes-penais-para-justica-federal-do-df/), Supremo Tribunal Federal. Onde olhar: Primeiros parágrafos, lista dos processos e data de publicação. Sustenta: Anulação das decisões e das condenações, e os quatro processos atingidos.
  - [STF confirma anulação de condenações do ex-presidente Lula na Lava Jato](https://noticias.stf.jus.br/postsnoticias/stf-confirma-anulacao-de-condenacoes-do-ex-presidente-lula-na-lava-jato/), Supremo Tribunal Federal. Onde olhar: Subtítulo, primeiro parágrafo e data de publicação. Sustenta: Confirmação pelo plenário por 8 votos a 3, em 15 de abril de 2021.
  - [Plenário fixa competência da Justiça Federal do DF para julgar processos contra ex-presidente Lula](https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=464566&ori=1), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Competência da Justiça Federal do Distrito Federal, definida em 22 de abril de 2021.
  - [2ª Turma reconhece parcialidade de ex-juiz Sérgio Moro na condenação de Lula no caso Triplex](https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=462854&ori=1), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Suspeição declarada pela Segunda Turma em 23 de março de 2021.
  - [STF confirma suspeição de Sergio Moro na ação do triplex do Guarujá](https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=468086&ori=1), Supremo Tribunal Federal. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Manutenção da suspeição pelo plenário em 23 de junho de 2021.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Lula. Sustenta: Recuperação dos direitos políticos depois da anulação.
- [ ] Conferido por: ______ em ____/____/______

### 9 de novembro de 2021: STJ anula decisões da primeira instância na investigação das “rachadinhas”

- Identificador: `flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 9 de novembro de 2021, a Quinta Turma do Superior Tribunal de Justiça anulou as decisões da primeira instância da Justiça do Rio de Janeiro nas investigações sobre o suposto esquema de “rachadinha” na Assembleia Legislativa.
- **Contexto a conferir:** O colegiado aceitou recurso da defesa de Flávio Bolsonaro: como ele era deputado estadual na época dos fatos apontados pelo Ministério Público, somente o Tribunal de Justiça do Rio poderia decidir sobre o caso. As decisões anuladas eram do juiz Flavio Itabaiana, da 27ª Vara Criminal. Em fevereiro de 2021, a mesma turma havia anulado, por falta de fundamentação, a quebra de sigilo bancário e fiscal de cerca de 90 investigados; o Ministério Público do Rio recorreu dessa decisão em 20 de março de 2021. O registro não tem ponto no mapa porque a sede do tribunal não consta nos documentos lidos.
- Fontes:
  - [STJ anula decisões de juiz sobre rachadinha na Alerj](https://agenciabrasil.ebc.com.br/justica/noticia/2021-11/stj-anula-decisoes-de-juiz-sobre-rachadinha-na-alerj), Agência Brasil. Onde olhar: Três primeiros parágrafos e data de publicação. Sustenta: Anulação das decisões da primeira instância, juiz responsável, fundamento e decisão anterior de fevereiro.
  - [MPRJ recorre contra decisão do STJ que anulou quebras de sigilo](https://portalsei.mprj.mp.br/web/guest/visualizar?noticiaId=103126), Ministério Público do Estado do Rio de Janeiro. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Recurso do Ministério Público, em 20 de março de 2021, contra a anulação das quebras de sigilo, decidida por quatro votos a um.
- [ ] Conferido por: ______ em ____/____/______

### 16 de maio de 2022: Tribunal de Justiça do Rio rejeita a denúncia contra Flávio Bolsonaro

- Identificador: `flavio-bolsonaro-2022-tribunal-rejeita-denuncia` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 16 de maio de 2022, foi divulgada a decisão do Órgão Especial do Tribunal de Justiça do Rio de Janeiro que rejeitou a denúncia do Ministério Público contra Flávio Bolsonaro no caso das “rachadinhas”.
- **Contexto a conferir:** O próprio Ministério Público havia pedido a extinção da denúncia, depois que as provas usadas na acusação foram anuladas pelo STJ e pelo STF. Segundo a decisão, a rejeição por falta de justa causa não impede a retomada das investigações. A defesa declarou considerar o caso encerrado. De acordo com reportagem da CartaCapital de dezembro de 2025, o Ministério Público recorreu para retomar a apuração, o STJ enviou o recurso ao STF em abril de 2023 e, em fevereiro de 2025, o ministro Gilmar Mendes negou os recursos; o processo tramita em segredo de justiça. Segundo reportagem do Brasil de Fato de 29 de setembro de 2026, a denúncia não chegou a ser julgada no mérito.
- Fontes:
  - [Justiça do Rio arquiva processo de caso de supostas rachadinhas](https://agenciabrasil.ebc.com.br/politica/noticia/2022-05/justica-do-rio-arquiva-processo-de-caso-de-supostas-rachadinhas), Agência Brasil (Vladimir Platonow). Onde olhar: Cinco primeiros parágrafos e data de publicação. Sustenta: Rejeição da denúncia, pedido do Ministério Público, efeito da decisão e manifestação da defesa.
  - [O que aconteceu com o caso da 'rachadinha' de Flávio Bolsonaro, suposto candidato em 2026](https://www.cartacapital.com.br/politica/o-que-aconteceu-com-o-caso-da-rachadinha-de-flavio-bolsonaro-suposto-candidato-em-2026/), CartaCapital. Onde olhar: Parágrafos finais e data de publicação. Sustenta: Recurso do Ministério Público, envio ao STF em abril de 2023, decisão de fevereiro de 2025 e segredo de justiça.
  - [Gilmar Mendes mantém quebra de sigilos de investigada por 'rachadinha' em gabinete de Flávio Bolsonaro](https://www.brasildefato.com.br/2026/09/29/gilmar-mendes-mantem-quebra-de-sigilos-de-investigada-por-rachadinha-em-gabinete-de-flavio-bolsonaro/), Brasil de Fato. Onde olhar: Parágrafo sobre a denúncia. Sustenta: A denúncia não foi julgada no mérito.
- [ ] Conferido por: ______ em ____/____/______

## 2. Dados eleitorais (16 acontecimentos)

Votos, percentuais, turnos, coligações e candidatos a vice. O registro do primeiro turno de 2026 traz a apuração parcial divulgada pelo TSE, com 99,99% das urnas, e não a totalização final: trocar os números é uma atualização de conteúdo, com nova entrada na edição e documento oficial lido, e não uma correção silenciosa.

### 1986: Lula é eleito deputado federal constituinte por São Paulo

- Identificador: `lula-1986-eleito-deputado-federal-constituinte` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 1986, Lula foi eleito deputado federal por São Paulo, pelo PT, para a Assembleia Nacional Constituinte. Segundo a biografia publicada pela Presidência, foi o deputado federal mais votado do país.
- **Contexto a conferir:** Tomou posse em 1º de fevereiro de 1987 e exerceu o mandato na legislatura de 1987 a 1991. Na Constituinte, foi titular da Comissão de Sistematização e suplente da Subcomissão dos Negros, Populações Indígenas, Pessoas Deficientes e Minorias. Foi líder do PT em 1987 e 1988. É o único mandato dele registrado na Câmara dos Deputados.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Oitavo parágrafo da biografia. Sustenta: Eleito em 1986 o deputado federal mais votado do país, para a Assembleia Constituinte.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Seções Mandatos, Atividades partidárias e Assembleia Nacional Constituinte. Sustenta: Mandato de 1987 a 1991 por São Paulo, posse em 1º de fevereiro de 1987, comissões na Constituinte e liderança do PT.
- [ ] Conferido por: ______ em ____/____/______

### 1989: Lula disputa a Presidência pela primeira vez e perde no segundo turno

- Identificador: `lula-1989-primeira-candidatura-a-presidencia` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 1989, na primeira eleição direta para presidente da República em 29 anos, Lula foi o candidato do PT e perdeu a disputa no segundo turno.
- **Contexto a conferir:** A biografia publicada pela Presidência descreve a derrota como ocorrida por pequena diferença de votos. A Agência Senado registra que o adversário no segundo turno foi Fernando Collor. Os dados de candidatura do TSE consultados começam em 1994, e por isso o registro tem precisão de ano.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Nono parágrafo da biografia. Sustenta: Candidatura do PT em 1989, após 29 anos sem eleição direta, e derrota no segundo turno.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Lula. Sustenta: Adversário no segundo turno de 1989.
- [ ] Conferido por: ______ em ____/____/______

### 3 de outubro de 1994: Lula é derrotado por Fernando Henrique Cardoso na eleição presidencial

- Identificador: `lula-1994-derrota-na-eleicao-presidencial` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 3 de outubro de 1994, Lula disputou a Presidência da República pelo PT e não foi eleito. Fernando Henrique Cardoso (PSDB) venceu no primeiro turno.
- **Contexto a conferir:** Foi a segunda candidatura presidencial de Lula. Em 4 de outubro de 1998 ele concorreu de novo, pela coligação União do Povo Muda Brasil, e Fernando Henrique Cardoso voltou a vencer no primeiro turno.
- Fontes:
  - [Repositório de dados eleitorais: candidatos de 1994 (consulta_cand_1994)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_1994.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_1994_BR.csv, linhas dos candidatos a presidente de números 13 e 45. Sustenta: Data da eleição, partido e situação de totalização no primeiro turno: Lula não eleito, Fernando Henrique Cardoso eleito.
  - [Repositório de dados eleitorais: candidatos de 1998 (consulta_cand_1998)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_1998.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_1998_BR.csv, linhas dos candidatos a presidente de números 13 e 45. Sustenta: Eleição de 4 de outubro de 1998: Lula não eleito pela coligação União do Povo Muda Brasil, Fernando Henrique Cardoso eleito no primeiro turno.
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Nono parágrafo da biografia. Sustenta: Candidaturas de 1994 e 1998, ambas com derrota para Fernando Henrique Cardoso.
- [ ] Conferido por: ______ em ____/____/______

### 6 de outubro de 2002: Flávio Bolsonaro é eleito deputado estadual no Rio de Janeiro

- Identificador: `flavio-bolsonaro-2002-eleito-deputado-estadual` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 6 de outubro de 2002, Flávio Bolsonaro foi eleito deputado estadual no Rio de Janeiro pelo PPB. Foi sua primeira eleição.
- **Contexto a conferir:** Os dados de candidatura do TSE registram que ele concorreu com o número 11120, sem coligação, e que teria 21 anos na data da posse. Segundo a Agência Senado, iniciou o mandato de deputado estadual em 2003.
- Fontes:
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Data da eleição, cargo, partido, ausência de coligação, idade na posse e situação de eleito.
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Terceiro parágrafo. Sustenta: Primeira eleição disputada.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Início do mandato em 2003.
- [ ] Conferido por: ______ em ____/____/______

### 27 de outubro de 2002: Lula é eleito presidente da República

- Identificador: `lula-2002-eleito-presidente` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 27 de outubro de 2002, no segundo turno, Lula foi eleito presidente da República, com quase 53 milhões de votos.
- **Contexto a conferir:** Concorreu pela coligação Lula Presidente (PT, PL, PCdoB, PMN e PCB), com o senador José Alencar, do PL de Minas Gerais, como candidato a vice. No primeiro turno, em 6 de outubro, a totalização do TSE registrou a passagem ao segundo turno. Tinha 57 anos. Tomou posse em 1º de janeiro de 2003.
- Fontes:
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_BR.csv, linhas do candidato de número 13 nos dois turnos. Sustenta: Datas dos turnos, coligação e situação de totalização: segundo turno em 6 de outubro e eleito em 27 de outubro.
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Parágrafos sobre a convenção e a eleição de 2002. Sustenta: Votos, idade e candidato a vice.
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Terceiro parágrafo. Sustenta: Início do primeiro mandato em 1º de janeiro de 2003.
- [ ] Conferido por: ______ em ____/____/______

### 2006: Flávio Bolsonaro é reeleito deputado estadual

- Identificador: `flavio-bolsonaro-2006-reeleito-deputado-estadual` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2006, Flávio Bolsonaro foi reeleito deputado estadual no Rio de Janeiro, pelo PP.
- **Contexto a conferir:** Foi a segunda das quatro eleições consecutivas que venceu para a Assembleia Legislativa. A ficha do TSE consultada informa o ano, o cargo, o partido e o resultado, sem a data da votação, e por isso o acontecimento tem precisão de ano.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato: item de 2006. Sustenta: Deputado estadual pelo PP no Rio de Janeiro em 2006, com situação de eleito.
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Terceiro parágrafo. Sustenta: Reeleito em 2006, 2010 e 2014.
- [ ] Conferido por: ______ em ____/____/______

### 29 de outubro de 2006: Lula é reeleito presidente da República

- Identificador: `lula-2006-reeleito-presidente` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 29 de outubro de 2006, Lula foi reeleito presidente da República com mais de 58 milhões de votos, novamente com José Alencar como vice.
- **Contexto a conferir:** Concorreu pela coligação A Força do Povo. O candidato do PSDB naquela eleição foi Geraldo Alckmin, que em 2022 e 2026 seria seu companheiro de chapa. Lula tomou posse do segundo mandato em 1º de janeiro de 2007 e deixou a Presidência em 1º de janeiro de 2011.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Último parágrafo da biografia. Sustenta: Data da reeleição, votos e candidato a vice.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2006](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/14423/23/2006/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: situação e nome do registro da candidatura. Sustenta: Situação de eleito e o nome A Força do Povo no registro da candidatura.
  - [DivulgaCandContas: candidatura de Geraldo Alckmin a presidente em 2006](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/14423/25/2006/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: cargo, partido e situação. Sustenta: Geraldo Alckmin, candidato a presidente pelo PSDB em 2006, não eleito.
  - [Veja a íntegra do discurso de posse do presidente Lula](https://www.camara.leg.br/noticias/93776-veja-a-integra-do-discurso-de-posse-do-presidente-lula), Agência Câmara de Notícias. Onde olhar: Data da publicação e primeiro parágrafo do discurso. Sustenta: Posse do segundo mandato em 1º de janeiro de 2007.
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Primeiro e terceiro parágrafos. Sustenta: Fim do segundo mandato em 1º de janeiro de 2011 e Geraldo Alckmin como vice empossado em 2023.
  - [Flávio Bolsonaro (PL) e Lula (PT) vão disputar o 2º turno para a Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Parágrafo sobre Lula. Sustenta: Geraldo Alckmin como candidato a vice em 2026.
- [ ] Conferido por: ______ em ____/____/______

### 2010: Flávio Bolsonaro é reeleito deputado estadual pela segunda vez

- Identificador: `flavio-bolsonaro-2010-reeleito-deputado-estadual` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2010, Flávio Bolsonaro foi reeleito deputado estadual no Rio de Janeiro, de novo pelo PP.
- **Contexto a conferir:** Foi a terceira eleição seguida para a Assembleia Legislativa. A ficha do TSE consultada informa o ano, o cargo, o partido e o resultado, sem a data da votação, e por isso o acontecimento tem precisão de ano.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato: item de 2010. Sustenta: Deputado estadual pelo PP no Rio de Janeiro em 2010, com situação de eleito.
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Terceiro parágrafo. Sustenta: Reeleito em 2006, 2010 e 2014.
- [ ] Conferido por: ______ em ____/____/______

### 2014: Flávio Bolsonaro conquista o quarto mandato de deputado estadual

- Identificador: `flavio-bolsonaro-2014-reeleito-deputado-estadual` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2014, Flávio Bolsonaro foi reeleito deputado estadual no Rio de Janeiro pelo PP. Na ficha do TSE, a situação registrada é "Eleito por QP".
- **Contexto a conferir:** Foi o quarto mandato consecutivo na Assembleia Legislativa, de onde saiu em 2019 para o Senado. A ficha do TSE consultada não informa a data da votação, e por isso o acontecimento tem precisão de ano.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a deputado estadual em 2014](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/680/190000000095/2014/RJ), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: cargo, partido, número e situação. Sustenta: Deputado estadual pelo PP no Rio de Janeiro em 2014, candidato à reeleição, com situação "Eleito por QP".
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Saída da Assembleia Legislativa em 2019.
- [ ] Conferido por: ______ em ____/____/______

### 2016: Flávio Bolsonaro disputa a Prefeitura do Rio de Janeiro e não é eleito

- Identificador: `flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2016, Flávio Bolsonaro concorreu a prefeito do Rio de Janeiro pelo PSC, com o número 20, e não foi eleito.
- **Contexto a conferir:** A coligação, formada por PSC e PRP, se chamava O Rio Precisa de Força para Mudar. Nos registros do TSE consultados, foi a única candidatura dele a um cargo do Executivo antes de 2026. Dois anos antes, ele havia sido reeleito deputado estadual pelo PP, e seguiu na Assembleia Legislativa até 2019.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a prefeito do Rio de Janeiro em 2016](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2/190000011736/2016/60011), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: cargo, partido, número, coligação e situação. Sustenta: Candidato a prefeito pelo PSC, com o número 20, coligação com o PRP e situação de não eleito.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato. Sustenta: Histórico de candidaturas de 2006 a 2026, com uma única disputa de cargo do Executivo antes de 2026.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Permanência na Assembleia Legislativa até 2019.
- [ ] Conferido por: ______ em ____/____/______

### 2018: Flávio Bolsonaro é eleito senador pelo Rio de Janeiro

- Identificador: `flavio-bolsonaro-2018-eleito-senador` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2018, Flávio Bolsonaro foi eleito senador pelo Rio de Janeiro, pelo PSL. Segundo a Agência Senado, foi o candidato mais votado do estado para o cargo, com 31,3% dos votos válidos.
- **Contexto a conferir:** Concorreu com o número 177, tendo Paulo Marinho e Leonardo Rodrigues como suplentes. O mandato começou em 1º de fevereiro de 2019 e vai até 31 de janeiro de 2027. Em janeiro de 2019, a Agência Senado o apresentava como filho do presidente da República, Jair Bolsonaro.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a senador em 2018](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2022802018/190000614721/2018/RJ), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: cargo, partido, número, suplentes e situação. Sustenta: Eleito senador pelo PSL, com o número 177 e dois suplentes.
  - [Flávio Bolsonaro (PSL)](https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl), Agência Senado. Onde olhar: Parágrafo Eleição/atuação e data de publicação. Sustenta: Mais votado para o Senado no Rio de Janeiro, com 31,3% dos votos válidos; filho do presidente da República.
  - [Dados Abertos do Senado: mandatos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/mandatos), Senado Federal. Onde olhar: Mandato 532: legislaturas e exercícios. Sustenta: Mandato de 1º de fevereiro de 2019 a 31 de janeiro de 2027.
- [ ] Conferido por: ______ em ____/____/______

### 30 de outubro de 2022: Lula é eleito presidente da República pela terceira vez

- Identificador: `lula-2022-eleito-presidente-pela-terceira-vez` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 30 de outubro de 2022, no segundo turno, Lula foi eleito presidente da República com 60.345.999 votos (50,90% dos válidos), contra 58.206.354 (49,10%) de Jair Bolsonaro.
- **Contexto a conferir:** Concorreu pela coligação Brasil da Esperança, com Geraldo Alckmin como vice; a chapa havia sido oficializada pelo PT em 21 de julho de 2022. O TSE proclamou o resultado em 6 de dezembro, depois de aprovar por unanimidade o relatório final de totalização. Lula tomou posse em 1º de janeiro de 2023, em sessão do Congresso Nacional, e se tornou, segundo a Agência Senado, o primeiro governante do Executivo federal com três vitórias em eleições diretas.
- Fontes:
  - [100% das seções totalizadas: confira como ficou o quadro eleitoral após o 2º turno](https://www.tse.jus.br/comunicacao/noticias/2022/Outubro/100-das-secoes-totalizadas-confira-como-ficou-o-quadro-eleitoral-apos-o-2o-turno), Tribunal Superior Eleitoral. Onde olhar: Parágrafo sobre a disputa presidencial. Sustenta: Votos e percentuais finais dos dois candidatos, com todas as seções totalizadas.
  - [TSE proclama eleitos presidente e vice-presidente da República Luiz Inácio Lula da Silva e Geraldo Alckmin](https://www.tse.jus.br/comunicacao/noticias/2022/Dezembro/tse-proclama-eleitos-presidente-e-vice-presidente-da-republica-luiz-inacio-lula-da-silva-e-geraldo-alckmin), Tribunal Superior Eleitoral. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Proclamação dos eleitos em 6 de dezembro de 2022, após aprovação unânime do relatório final.
  - [PT oficializa chapa Lula-Alckmin para disputar a Presidência](https://agenciabrasil.ebc.com.br/politica/noticia/2022-07/pt-oficializa-chapa-lula-alckmin-para-disputar-presidencia), Agência Brasil (Flávia Albuquerque). Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Oficialização da chapa com Geraldo Alckmin em 21 de julho de 2022.
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: Posse em 1º de janeiro de 2023 e três vitórias em eleições diretas.
- [ ] Conferido por: ______ em ____/____/______

### 5 de dezembro de 2025: Flávio Bolsonaro é indicado pelo pai como candidato do PL à Presidência

- Identificador: `flavio-bolsonaro-2025-indicacao-para-a-presidencia` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 5 de dezembro de 2025, tornou-se pública a escolha de Flávio Bolsonaro como candidato do PL à Presidência da República em 2026, por indicação de seu pai, o ex-presidente Jair Bolsonaro.
- **Contexto a conferir:** A data consta de reportagens da CartaCapital, publicada no dia seguinte, e da Gazeta do Povo. Segundo a Gazeta do Povo, a escolha gerou no início dúvidas e críticas de lideranças que defendiam outros nomes da direita, como o governador de São Paulo, Tarcísio de Freitas. A Agência Senado registra que a escolha partiu de Jair Bolsonaro, declarado inelegível pelo TSE e posteriormente condenado pelo STF por tentativa de golpe de Estado. Não foi localizado documento oficial sobre o anúncio; o registro se apoia em jornalismo com data e veículo identificados.
- Fontes:
  - [O que aconteceu com o caso da 'rachadinha' de Flávio Bolsonaro, suposto candidato em 2026](https://www.cartacapital.com.br/politica/o-que-aconteceu-com-o-caso-da-rachadinha-de-flavio-bolsonaro-suposto-candidato-em-2026/), CartaCapital. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Notícia, em 5 de dezembro de 2025, da escolha de Flávio Bolsonaro como candidato.
  - [Da escolha de Bolsonaro à consolidação na direita: como foi construída a candidatura de Flávio](https://www.gazetadopovo.com.br/eleicoes/2026/da-escolha-de-bolsonaro-a-consolidacao-na-direita-como-foi-construida-candidatura-de-flavio/), Gazeta do Povo (Wesley Oliveira). Onde olhar: Primeiros parágrafos e data de publicação. Sustenta: Escolha anunciada em 5 de dezembro e reação inicial de lideranças.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a escolha do candidato. Sustenta: A escolha partiu de Jair Bolsonaro, declarado inelegível pelo TSE e depois condenado pelo STF.
- [ ] Conferido por: ______ em ____/____/______

### 25 de julho de 2026: PL oficializa a candidatura de Flávio Bolsonaro à Presidência

- Identificador: `flavio-bolsonaro-2026-convencao-do-pl` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 25 de julho de 2026, o PL formalizou a candidatura de Flávio Bolsonaro à Presidência da República, em convenção nacional realizada no Mercado Pago Hall, na Arena Pacaembu, em São Paulo.
- **Contexto a conferir:** O candidato a vice é o deputado federal Alfredo Gaspar (PL-AL). Segundo a Agência Brasil, em notícia de 13 de agosto, o presidente do TSE, ministro Nunes Marques, mandou restabelecer a filiação de Flávio ao PL, depois que ele apareceu filiado ao partido Missão no sistema da Justiça Eleitoral; segundo o tribunal, houve uso indevido das credenciais daquela legenda, e não invasão do sistema. O TSE aprovou o registro da chapa por unanimidade em 2 de setembro de 2026.
- Fontes:
  - [PL oficializa candidatura de Flávio Bolsonaro à Presidência](https://agenciabrasil.ebc.com.br/politica/noticia/2026-07/pl-oficializa-candidatura-de-flavio-bolsonaro-presidencia), Agência Brasil (Maura Martins, TV Brasil). Onde olhar: Primeiro e segundo parágrafos e data de publicação. Sustenta: Data e local da convenção que formalizou a candidatura.
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Primeiro parágrafo. Sustenta: Candidato a vice.
  - [TSE determina que filiação de Flávio ao PL seja restabelecida](https://agenciabrasil.ebc.com.br/justica/noticia/2026-08/tse-determina-que-filiacao-de-flavio-ao-pl-seja-restabelecida), Agência Brasil (André Richter). Onde olhar: Primeiros parágrafos, nota do TSE e data de publicação. Sustenta: Ordem para restabelecer a filiação ao PL e explicação do tribunal.
  - [TSE valida seis registros de candidatura à Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Primeiros parágrafos e data de publicação. Sustenta: Aprovação unânime do registro da chapa em 2 de setembro de 2026.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: situação. Sustenta: Registro deferido.
- [ ] Conferido por: ______ em ____/____/______

### 2 de agosto de 2026: PT oficializa a candidatura de Lula à reeleição

- Identificador: `lula-2026-convencao-do-pt` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 2 de agosto de 2026, o PT formalizou a candidatura de Lula à Presidência da República, em convenção no Expo Center Norte, em São Paulo. Geraldo Alckmin (PSB) foi mantido como candidato a vice.
- **Contexto a conferir:** Segundo a Agência Brasil, o PT tem como aliados PSB, PCdoB, PV, PDT, PSOL e Rede. No registro do TSE, a coligação se chama Brasil Pronto Pra Mais. O tribunal aprovou o registro da chapa por unanimidade em 2 de setembro de 2026.
- Fontes:
  - [PT oficializa candidatura de Lula à Presidência](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pt-oficializa-candidatura-de-lula-presidencia), Agência Brasil (Ana Graziela Aguiar, TV Brasil). Onde olhar: Primeiro e segundo parágrafos e data de publicação. Sustenta: Data, local, candidato a vice e partidos aliados.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: coligação e situação. Sustenta: Nome da coligação e registro deferido.
  - [TSE valida seis registros de candidatura à Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Primeiros parágrafos e data de publicação. Sustenta: Aprovação unânime do registro da chapa em 2 de setembro de 2026.
- [ ] Conferido por: ______ em ____/____/______

### 4 de outubro de 2026: Flávio Bolsonaro e Lula passam ao segundo turno da eleição presidencial

- Identificador: `eleicao-2026-primeiro-turno` · Pessoa: Flávio Bolsonaro e Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** No primeiro turno da eleição presidencial, em 4 de outubro de 2026, Flávio Bolsonaro (PL) e Lula (PT) foram os dois mais votados e passaram ao segundo turno. Com 99,99% das urnas apuradas, o TSE registrava 56.104.268 votos para Flávio Bolsonaro (47,03% dos válidos) e 53.876.617 para Lula (45,16%).
- **Contexto a conferir:** Os números são da apuração divulgada pelo TSE à 0h11 de 5 de outubro e podem diferir da totalização final. Flávio Bolsonaro, senador pelo Rio de Janeiro, disputa a Presidência pela primeira vez, com o deputado federal Alfredo Gaspar (PL) como candidato a vice. Lula, que exerce o terceiro mandato, é candidato à reeleição, com Geraldo Alckmin (PSB) como vice. Segundo a Agência Senado, o segundo turno foi marcado para 25 de outubro de 2026, depois da data de corte desta edição.
- Fontes:
  - [Flávio Bolsonaro (PL) e Lula (PT) vão disputar o 2º turno para a Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Primeiros parágrafos e data de publicação. Sustenta: Votos e percentuais com 99,99% das urnas apuradas, candidatos a vice e situação de cada candidato.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: Data do segundo turno.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: situação de totalização. Sustenta: Situação registrada: segundo turno.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: situação de totalização. Sustenta: Situação registrada: segundo turno.
- [ ] Conferido por: ______ em ____/____/______

## 3. Filiações partidárias (4 acontecimentos e 8 filiações)

Datas de filiação e de saída e o partido de origem vêm de dados abertos e de notícias; onde o registro diz que uma informação foi inferida ou que duas fontes divergem, conferir as duas e decidir o que fica escrito.

### 10 de fevereiro de 1980: Lula participa da fundação do Partido dos Trabalhadores

- Identificador: `lula-1980-fundacao-do-pt` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 10 de fevereiro de 1980, Lula fundou o PT, ao lado de outros sindicalistas, intelectuais, políticos e representantes de movimentos sociais, entre eles lideranças rurais e religiosas.
- **Contexto a conferir:** O país vivia um processo de abertura política conduzido pelos militares, ainda no poder. A Câmara dos Deputados registra que Lula presidiu o partido de 1980 a 1988 e de 1990 a 1994. As fontes consultadas não informam onde ocorreu o ato de fundação.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Sétimo parágrafo da biografia. Sustenta: Data da fundação do PT, quem participou e contexto de abertura política.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Lista de atividades partidárias. Sustenta: Presidente do PT de 1980 a 1988 e de 1990 a 1994.
- [ ] Conferido por: ______ em ____/____/______

### 19 de novembro de 2019: Flávio Bolsonaro deixa o PSL

- Identificador: `flavio-bolsonaro-2019-saida-do-psl` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 19 de novembro de 2019, Flávio Bolsonaro se desfiliou do PSL, partido pelo qual havia sido eleito senador no ano anterior, segundo os dados abertos do Senado.
- **Contexto a conferir:** Os mesmos dados o registram como sem partido de 20 de novembro de 2019 a 30 de maio de 2021. Nesse intervalo, porém, a Agência Brasil o identificou como senador do Republicanos, em novembro de 2020, e o Manual de Comunicação do Senado registra a mudança dele do Republicanos para o Patriota. A data de filiação ao Republicanos não foi localizada nas fontes consultadas.
- Fontes:
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiações ao PSL e registro 'S/Partido'. Sustenta: Desfiliação do PSL em 19 de novembro de 2019 e registro sem partido de 20 de novembro de 2019 a 30 de maio de 2021.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a senador em 2018](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2022802018/190000614721/2018/RJ), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Eleito senador pelo PSL em 2018.
  - [MP do Rio denuncia 17 investigados por lavagem de dinheiro e peculato](https://agenciabrasil.ebc.com.br/justica/noticia/2020-11/mp-do-rio-denuncia-17-investigados-por-lavagem-de-dinheiro-e-peculato), Agência Brasil (Vitor Abdala). Onde olhar: Primeiro parágrafo. Sustenta: Identificado como senador do Republicanos em 4 de novembro de 2020.
  - [Flávio Bolsonaro muda do partido REPUBLICANOS para o partido PATRIOTA (registro de modificação do Manual de Comunicação)](https://www12.senado.leg.br/manualdecomunicacao/senadores/modificacoes/flavio-bolsonaro-muda-do-partido-republicanos-para-o-partido-patriota), Senado Federal, Secretaria de Comunicação Social. Onde olhar: Título do registro de modificação. Sustenta: Mudança do Republicanos para o Patriota.
- [ ] Conferido por: ______ em ____/____/______

### 31 de maio de 2021: Flávio Bolsonaro se filia ao Patriota

- Identificador: `flavio-bolsonaro-2021-filiacao-ao-patriota` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 31 de maio de 2021, Flávio Bolsonaro se filiou ao Patriota, segundo os dados abertos do Senado. O Manual de Comunicação do Senado registra a mudança como saída do Republicanos.
- **Contexto a conferir:** Ele foi líder do Patriota no Senado de junho a 29 de novembro de 2021; o registro do Senado traz 4 de junho no campo da data de designação e 7 de junho na observação do mesmo registro. A filiação durou seis meses: em 30 de novembro de 2021 ele passou para o PL.
- Fontes:
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiações ao Patriota e ao PL. Sustenta: Filiação ao Patriota de 31 de maio a 29 de novembro de 2021 e filiação ao PL em 30 de novembro.
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança de Partido no Senado Federal (Patriota). Sustenta: Líder do Patriota até 29 de novembro de 2021. A designação aparece com 4 de junho de 2021 no campo de data e 7 de junho na observação.
  - [Flávio Bolsonaro muda do partido REPUBLICANOS para o partido PATRIOTA (registro de modificação do Manual de Comunicação)](https://www12.senado.leg.br/manualdecomunicacao/senadores/modificacoes/flavio-bolsonaro-muda-do-partido-republicanos-para-o-partido-patriota), Senado Federal, Secretaria de Comunicação Social. Onde olhar: Título do registro de modificação. Sustenta: Mudança do Republicanos para o Patriota.
- [ ] Conferido por: ______ em ____/____/______

### 30 de novembro de 2021: Flávio Bolsonaro se filia ao PL

- Identificador: `flavio-bolsonaro-2021-filiacao-ao-pl` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 30 de novembro de 2021, Flávio Bolsonaro se filiou ao Partido Liberal, legenda pela qual disputa a Presidência em 2026.
- **Contexto a conferir:** A Agência Senado registrou a filiação no dia seguinte, em pronunciamento do senador Carlos Portinho (PL-RJ), que citou também o então presidente Jair Bolsonaro como integrante do partido. Flávio foi líder do PL no Senado de 10 de junho de 2022 a 16 de fevereiro de 2023.
- Fontes:
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiação ao PL. Sustenta: Filiado ao PL desde 30 de novembro de 2021.
  - [Portinho destaca filiação de Flávio Bolsonaro ao Partido Liberal](https://www12.senado.leg.br/noticias/materias/2021/12/01/portinho-destaca-filiacao-de-flavio-bolsonaro-ao-partido-liberal), Agência Senado. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Filiação ao PL no dia anterior ao pronunciamento de 1º de dezembro de 2021; Jair Bolsonaro citado como integrante do partido.
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança de Partido no Senado Federal (PL). Sustenta: Líder do PL de 10 de junho de 2022 a 16 de fevereiro de 2023.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Candidato pelo PL em 2026.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: PSL (Partido Social Liberal), até 19 de novembro de 2019; início não documentado

- Identificador: `flavio-bolsonaro-psl` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a senador em 2018](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2022802018/190000614721/2018/RJ), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Concorreu pelo PSL em 2018. A data de filiação não consta.
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiação ao PSL. Sustenta: Desfiliação em 19 de novembro de 2019. O Senado registra o início em 1º de janeiro de 2019, data posterior à candidatura pelo partido.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Republicanos (Republicanos), até maio de 2021; início não documentado

- Identificador: `flavio-bolsonaro-republicanos` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [MP do Rio denuncia 17 investigados por lavagem de dinheiro e peculato](https://agenciabrasil.ebc.com.br/justica/noticia/2020-11/mp-do-rio-denuncia-17-investigados-por-lavagem-de-dinheiro-e-peculato), Agência Brasil (Vitor Abdala). Onde olhar: Primeiro parágrafo. Sustenta: Identificado como senador do Republicanos em 4 de novembro de 2020.
  - [Flávio Bolsonaro muda do partido REPUBLICANOS para o partido PATRIOTA (registro de modificação do Manual de Comunicação)](https://www12.senado.leg.br/manualdecomunicacao/senadores/modificacoes/flavio-bolsonaro-muda-do-partido-republicanos-para-o-partido-patriota), Senado Federal, Secretaria de Comunicação Social. Onde olhar: Título do registro de modificação. Sustenta: Mudança do Republicanos para o Patriota.
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiação ao Patriota. Sustenta: A filiação ao Patriota, que encerra a passagem pelo Republicanos, é de 31 de maio de 2021. Os dados abertos não registram o Republicanos e mostram 'S/Partido' no período.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Patriota (Patriota), 31 de maio de 2021 a 29 de novembro de 2021

- Identificador: `flavio-bolsonaro-patriota` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiação ao Patriota. Sustenta: Filiado de 31 de maio a 29 de novembro de 2021.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: PL (Partido Liberal), desde 30 de novembro de 2021

- Identificador: `flavio-bolsonaro-pl` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Dados Abertos do Senado: filiações partidárias do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/filiacoes), Senado Federal. Onde olhar: Filiação ao PL. Sustenta: Filiado desde 30 de novembro de 2021, sem data de desfiliação.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Candidato pelo PL em 2026.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: PP (Partido Progressista), período não documentado

- Identificador: `flavio-bolsonaro-pp` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a deputado estadual em 2014](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/680/190000000095/2014/RJ), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Candidato pelo Partido Progressista (PP) em 2014.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato. Sustenta: Concorreu pelo PP também em 2006 e 2010. As datas de filiação e de saída não constam.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: PPB (Partido Progressista Brasileiro), período não documentado

- Identificador: `flavio-bolsonaro-ppb` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Concorreu pelo PPB em 2002. As datas de filiação e de saída não constam.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: PSC (Partido Social Cristão), período não documentado

- Identificador: `flavio-bolsonaro-psc` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a prefeito do Rio de Janeiro em 2016](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2/190000011736/2016/60011), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido. Sustenta: Concorreu pelo Partido Social Cristão (PSC) em 2016. As datas de filiação e de saída não constam.
- [ ] Conferido por: ______ em ____/____/______

### Lula: PT (Partido dos Trabalhadores), desde 10 de fevereiro de 1980

- Identificador: `lula-pt` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Sétimo parágrafo da biografia. Sustenta: Fundou o PT em 10 de fevereiro de 1980.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Ficha do candidato: partido e eleições anteriores. Sustenta: Candidato pelo PT em 2006, 2018, 2022 e 2026.
- [ ] Conferido por: ______ em ____/____/______

## 4. Mandatos e funções (3 acontecimentos e 15 mandatos)

Cargo, instituição e período, inclusive os em curso na data de corte.

### 1975: Lula é eleito presidente do Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema

- Identificador: `lula-1975-eleito-presidente-do-sindicato` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 1975, Lula foi eleito presidente do Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema com 92% dos votos e passou a representar 100 mil trabalhadores.
- **Contexto a conferir:** Ele havia entrado na diretoria do sindicato em 1969, como suplente, e se tornado primeiro-secretário em 1972. Foi reeleito presidente em 1978. As fontes consultadas não informam o dia nem o mês da eleição, e por isso o registro tem precisão de ano.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Quinto parágrafo da biografia. Sustenta: Eleição para presidente do sindicato em 1975, com 92% dos votos e 100 mil trabalhadores representados; cargos anteriores em 1969 e 1972.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Lista de atividades sindicais. Sustenta: Cargos no sindicato em 1969, 1972, 1975 e 1978, com sede em São Bernardo do Campo (SP).
- [ ] Conferido por: ______ em ____/____/______

### 6 de fevereiro de 2019: Flávio Bolsonaro assume a 3ª Secretaria da Mesa do Senado

- Identificador: `flavio-bolsonaro-2019-terceiro-secretario-do-senado` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 6 de fevereiro de 2019, cinco dias depois de iniciar o mandato, Flávio Bolsonaro passou a ocupar o cargo de 3º secretário da Comissão Diretora do Senado Federal.
- **Contexto a conferir:** Os dados abertos do Senado registram o cargo de 6 de fevereiro de 2019 a 14 de dezembro de 2020. No mesmo ano, em 27 de março, ele foi designado relator da comissão mista da Medida Provisória 866, de 2018.
- Fontes:
  - [Dados Abertos do Senado: cargos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), Senado Federal. Onde olhar: Cargos na Comissão Diretora e na comissão mista da MP 866/2018. Sustenta: Período como 3º secretário e designação como relator.
  - [Dados Abertos do Senado: mandatos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/mandatos), Senado Federal. Onde olhar: Mandato 532, bloco Exercicios. Sustenta: Início do exercício do mandato em 1º de fevereiro de 2019.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Rodapé da página. Sustenta: Sede do Senado Federal em Brasília.
- [ ] Conferido por: ______ em ____/____/______

### 19 de fevereiro de 2025: Flávio Bolsonaro assume a presidência da Comissão de Segurança Pública do Senado

- Identificador: `flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 19 de fevereiro de 2025, Flávio Bolsonaro se tornou presidente da Comissão de Segurança Pública do Senado Federal.
- **Contexto a conferir:** Segurança pública é uma das áreas em que a Agência Senado situa sua atuação desde a Assembleia Legislativa do Rio de Janeiro. Em outubro de 2026, a agência ainda o registrava na presidência da comissão.
- Fontes:
  - [Dados Abertos do Senado: cargos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), Senado Federal. Onde olhar: Cargo na Comissão de Segurança Pública (CSP). Sustenta: Presidente desde 19 de fevereiro de 2025.
  - [Flávio Bolsonaro (PSL)](https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl), Agência Senado. Onde olhar: Parágrafo Eleição/atuação. Sustenta: Atuação como deputado estadual nas áreas de segurança pública, administração penitenciária e defesa civil.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Em outubro de 2026 presidia a comissão.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Rodapé da página. Sustenta: Sede do Senado Federal em Brasília.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj), 2003 a 2019

- Identificador: `flavio-bolsonaro-deputado-estadual-2003-2019` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Deputado estadual a partir de 2003; saiu da Assembleia Legislativa em 2019 para o Senado.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato. Sustenta: Eleito deputado estadual em 2006, 2010 e 2014.
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Eleito deputado estadual em 2002.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Senador (RJ), Senado Federal, desde 1º de fevereiro de 2019

- Identificador: `flavio-bolsonaro-senador-2019` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: mandatos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/mandatos), Senado Federal. Onde olhar: Mandato 532: legislaturas e exercícios. Sustenta: Titular pelo Rio de Janeiro nas legislaturas 56 e 57, de 1º de fevereiro de 2019 a 31 de janeiro de 2027, em exercício desde o início.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Quadro Chapa. Sustenta: Em exercício na data de acesso.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: 3º secretário da Comissão Diretora, Senado Federal, 6 de fevereiro de 2019 a 14 de dezembro de 2020

- Identificador: `flavio-bolsonaro-terceiro-secretario-do-senado` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), Senado Federal. Onde olhar: Cargo na Comissão Diretora do Senado Federal (CDIR). Sustenta: 3º secretário de 6 de fevereiro de 2019 a 14 de dezembro de 2020.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Vice-líder do Governo no Congresso Nacional, Congresso Nacional, 6 de abril de 2020 a 31 de janeiro de 2023

- Identificador: `flavio-bolsonaro-vice-lider-do-governo-no-congresso` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança do Governo no Congresso Nacional. Sustenta: Vice-líder de 6 de abril de 2020 a 31 de janeiro de 2023.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Líder do Patriota no Senado, Senado Federal, junho de 2021 a 29 de novembro de 2021

- Identificador: `flavio-bolsonaro-lider-do-patriota-no-senado` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança de Partido no Senado Federal (Patriota). Sustenta: Líder até 29 de novembro de 2021. A designação aparece com 4 de junho de 2021 no campo de data e 7 de junho na observação do mesmo registro; o início fica com a precisão de mês.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Líder do PL no Senado, Senado Federal, 10 de junho de 2022 a 16 de fevereiro de 2023

- Identificador: `flavio-bolsonaro-lider-do-pl-no-senado` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança de Partido no Senado Federal (PL), duas designações seguidas. Sustenta: Líder de 10 de junho de 2022 a 31 de janeiro de 2023 e de 1º a 16 de fevereiro de 2023.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Líder da Minoria no Congresso Nacional, Congresso Nacional, 5 de abril de 2023 a 26 de fevereiro de 2025

- Identificador: `flavio-bolsonaro-lider-da-minoria-no-congresso` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança da Minoria no Congresso Nacional. Sustenta: Líder de 5 de abril de 2023 a 26 de fevereiro de 2025.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Presidente da Comissão de Segurança Pública, Senado Federal, desde 19 de fevereiro de 2025

- Identificador: `flavio-bolsonaro-presidente-da-comissao-de-seguranca-publica` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Dados Abertos do Senado: cargos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), Senado Federal. Onde olhar: Cargo na Comissão de Segurança Pública (CSP). Sustenta: Presidente desde 19 de fevereiro de 2025, sem data de fim registrada.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Em outubro de 2026 presidia a comissão.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente do Sindicato dos Metalúrgicos, Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema, a partir de 1975; fim não documentado

- Identificador: `lula-presidente-do-sindicato-dos-metalurgicos` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Quinto e sexto parágrafos da biografia. Sustenta: Eleito presidente do sindicato em 1975 e reeleito em 1978. O texto não informa quando deixou o cargo.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Lista de atividades sindicais. Sustenta: Presidente do sindicato em 1975 e 1978.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente do PT, Partido dos Trabalhadores (PT), 1980 a 1988

- Identificador: `lula-presidente-do-pt-1980-1988` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Lista de atividades partidárias. Sustenta: Presidente do PT de 1980 a 1988.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Deputado federal constituinte (SP), Câmara dos Deputados, 1º de fevereiro de 1987 a 1991

- Identificador: `lula-deputado-federal-1987-1991` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026: Câmara dos Deputados, pelo mandato de deputado federal. A Assembleia Nacional Constituinte (1987 a 1988) é instituição própria no modelo e não está declarada neste mandato: as decisões da Constituinte, se entrarem, pedem registro próprio.
- Fontes:
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Seção Mandatos (na Câmara dos Deputados) e registro da 48ª Legislatura. Sustenta: Mandato de 1987 a 1991 por São Paulo, pelo PT, com posse em 1º de fevereiro de 1987.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente do PT, Partido dos Trabalhadores (PT), 1990 a 1994

- Identificador: `lula-presidente-do-pt-1990-1994` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Lista de atividades partidárias. Sustenta: Presidente do PT de 1990 a 1994.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente da República (primeiro mandato), Presidência da República, 1º de janeiro de 2003 a 1º de janeiro de 2007

- Identificador: `lula-presidente-da-republica-2003-2007` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Terceiro parágrafo. Sustenta: Esteve à frente do Palácio do Planalto de 1º de janeiro de 2003 a 1º de janeiro de 2011.
  - [Veja a íntegra do discurso de posse do presidente Lula](https://www.camara.leg.br/noticias/93776-veja-a-integra-do-discurso-de-posse-do-presidente-lula), Agência Câmara de Notícias. Onde olhar: Data da publicação e primeiro parágrafo do discurso. Sustenta: Posse do segundo mandato em 1º de janeiro de 2007, quatro anos depois da primeira.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente da República (segundo mandato), Presidência da República, 1º de janeiro de 2007 a 1º de janeiro de 2011

- Identificador: `lula-presidente-da-republica-2007-2011` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Veja a íntegra do discurso de posse do presidente Lula](https://www.camara.leg.br/noticias/93776-veja-a-integra-do-discurso-de-posse-do-presidente-lula), Agência Câmara de Notícias. Onde olhar: Data da publicação e primeiro parágrafo do discurso. Sustenta: Posse do segundo mandato em 1º de janeiro de 2007.
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Terceiro parágrafo. Sustenta: Deixou a Presidência em 1º de janeiro de 2011.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Presidente da República (terceiro mandato), Presidência da República, desde 1º de janeiro de 2023

- Identificador: `lula-presidente-da-republica-2023` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente. Casa declarada em 10 de outubro de 2026, pela instituição já documentada no registro.
- Fontes:
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: Posse em 1º de janeiro de 2023.
  - [Flávio Bolsonaro (PL) e Lula (PT) vão disputar o 2º turno para a Presidência da República](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica), Tribunal Superior Eleitoral. Onde olhar: Parágrafo sobre Lula. Sustenta: Em outubro de 2026 exercia o terceiro mandato.
- [ ] Conferido por: ______ em ____/____/______

## 5. Demais acontecimentos (6 acontecimentos)

Datas na precisão documentada, lugares e o que cada citação sustenta.

### março de 1979: Greve de 170 mil metalúrgicos paralisa o ABC paulista

- Identificador: `lula-1979-greve-dos-metalurgicos-do-abc` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em março de 1979, 170 mil metalúrgicos pararam o ABC paulista. Lula presidia o sindicato da categoria em São Bernardo do Campo e Diadema.
- **Contexto a conferir:** Segundo a biografia publicada pela Presidência da República, as primeiras paralisações ocorreram em 1978, depois de dez anos sem greves operárias no país. O mesmo texto afirma que a repressão policial ao movimento e a falta de representantes dos trabalhadores no Congresso levaram Lula a pensar, pela primeira vez, em criar um partido. O ponto no mapa é o município-sede do sindicato; a fonte situa a greve no ABC paulista, sem indicar um município.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Sexto parágrafo da biografia. Sustenta: Greve de março de 1979 com 170 mil metalúrgicos, primeiras paralisações em 1978 e origem da ideia de criar um partido.
- [ ] Conferido por: ______ em ____/____/______

### 1980: Lula é preso com base na Lei de Segurança Nacional durante greve

- Identificador: `lula-1980-prisao-pela-lei-de-seguranca-nacional` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 1980, uma nova greve dos metalúrgicos levou à intervenção do governo federal no sindicato e à prisão de Lula e de outros dirigentes sindicais, com base na Lei de Segurança Nacional. Ele ficou 31 dias preso.
- **Contexto a conferir:** A prisão ocorreu durante o regime militar, no mesmo ano da fundação do PT. A biografia publicada pela Presidência não informa as datas de início e fim da prisão nem o local, e por isso o registro tem precisão de ano e não tem ponto no mapa.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Sétimo parágrafo da biografia. Sustenta: Intervenção no sindicato, prisão com base na Lei de Segurança Nacional e duração de 31 dias.
- [ ] Conferido por: ______ em ____/____/______

### 10 de junho de 2022: Flávio Bolsonaro assume a liderança do PL no Senado

- Identificador: `flavio-bolsonaro-2022-lider-do-pl-no-senado` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 10 de junho de 2022, Flávio Bolsonaro foi designado líder do PL no Senado Federal.
- **Contexto a conferir:** Os dados abertos do Senado registram duas designações seguidas, na passagem entre legislaturas: de 10 de junho de 2022 a 31 de janeiro de 2023 e de 1º a 16 de fevereiro de 2023. No mesmo período ele era vice-líder do Governo no Congresso Nacional, função registrada de 6 de abril de 2020 a 31 de janeiro de 2023.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Lideranças do PL no Senado e do Governo no Congresso Nacional. Sustenta: Designações como líder do PL e como vice-líder do Governo no Congresso.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Rodapé da página. Sustenta: Sede do Senado Federal em Brasília.
- [ ] Conferido por: ______ em ____/____/______

### 8 de janeiro de 2023: Lula decreta intervenção federal na segurança pública do Distrito Federal

- Identificador: `lula-2023-intervencao-federal-no-distrito-federal` · Pessoa: Lula · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 8 de janeiro de 2023, Lula decretou intervenção federal na área de segurança pública do Distrito Federal, por meio do Decreto 11.377, depois da invasão e depredação das sedes do Congresso Nacional, da Presidência da República e do STF.
- **Contexto a conferir:** Segundo cronologia da Agência Brasil, o decreto foi assinado às 17h50, de Araraquara (SP), onde o presidente estava. O Senado validou a intervenção em 10 de janeiro. A Agência Brasil registra oito votos contrários no Senado, entre eles o do senador Flávio Bolsonaro (PL-RJ).
- Fontes:
  - [Intervenção federal na segurança pública do DF vai a promulgação](https://www12.senado.leg.br/noticias/materias/2023/01/10/intervencao-federal-na-seguranca-publica-do-df-vai-a-promulgacao), Agência Senado. Onde olhar: Primeiro e segundo parágrafos. Sustenta: Decreto 11.377, motivo da intervenção e validação pelo Senado em 10 de janeiro.
  - [Relembre o passo a passo da tentativa de golpe no 8/1](https://agenciabrasil.ebc.com.br/politica/noticia/2024-01/relembre-o-passo-passo-da-tentativa-de-golpe-no-81), Agência Brasil (Gilberto Costa). Onde olhar: Item das 17h50 da cronologia. Sustenta: Horário e local da assinatura do decreto.
  - [Senado confirma intervenção federal na segurança pública do DF](https://agenciabrasil.ebc.com.br/politica/noticia/2023-01/senado-confirma-intervencao-federal-na-seguranca-publica-do-df), Agência Brasil (Karine Melo). Onde olhar: Parágrafo sobre a votação. Sustenta: Oito votos contrários no Senado, entre eles o de Flávio Bolsonaro.
- [ ] Conferido por: ______ em ____/____/______

### 5 de abril de 2023: Flávio Bolsonaro se torna líder da Minoria no Congresso Nacional

- Identificador: `flavio-bolsonaro-2023-lider-da-minoria-no-congresso` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 5 de abril de 2023, Flávio Bolsonaro foi designado líder da Minoria no Congresso Nacional, função que exerceu até 26 de fevereiro de 2025.
- **Contexto a conferir:** A designação ocorreu no primeiro ano do terceiro mandato de Lula na Presidência. Em 10 de março de 2025, ele passou a vice-líder da Minoria no Congresso.
- Fontes:
  - [Dados Abertos do Senado: cargos de liderança do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/composicao/lideranca?codigoParlamentar=5894), Senado Federal. Onde olhar: Liderança da Minoria no Congresso Nacional. Sustenta: Líder de 5 de abril de 2023 a 26 de fevereiro de 2025 e vice-líder desde 10 de março de 2025.
  - [Congresso empossa Lula e Alckmin na Presidência da República](https://www12.senado.leg.br/noticias/materias/2023/01/01/congresso-empossa-lula-e-alckmin-na-presidencia-da-republica), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: Posse de Lula em 1º de janeiro de 2023.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Rodapé da página. Sustenta: Sede do Senado Federal em Brasília.
- [ ] Conferido por: ______ em ____/____/______

### 20 de fevereiro de 2024: Senado aprova projeto relatado por Flávio Bolsonaro que restringe saídas temporárias de presos

- Identificador: `flavio-bolsonaro-2024-relatoria-das-saidas-temporarias` · Pessoa: Flávio Bolsonaro · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-09; observações: Terceira conferência, feita em 9 de outubro de 2026: as fontes foram abertas de novo e o texto foi relido contra os documentos, com assistência de IA. Revisão humana pendente.
- **Resumo a conferir:** Em 20 de fevereiro de 2024, o Senado aprovou o Projeto de Lei 2.253/2022, relatado por Flávio Bolsonaro, que restringe a saída temporária de presos condenados. Foram 62 votos favoráveis, dois contrários e uma abstenção.
- **Contexto a conferir:** O texto previa a revogação total do benefício e foi alterado para manter as saídas de presos que estudam. Segundo a Agência Senado, o projeto resultou na Lei 14.843, de 2024. O presidente Lula vetou parte do texto, e o Congresso derrubou o veto em 28 de maio de 2024.
- Fontes:
  - [Senado aprova restrição a 'saidões' de presos; texto volta para a Câmara](https://www12.senado.leg.br/noticias/materias/2024/02/20/senado-aprova-restricao-as-saidinhas-de-presos-texto-volta-para-a-camara), Agência Senado. Onde olhar: Primeiro parágrafo e data de publicação. Sustenta: Aprovação do projeto, relatoria, alteração do texto e placar.
  - [Pela segunda vez, Congresso acaba com saídas temporárias de presos em feriados](https://www12.senado.leg.br/noticias/materias/2024/05/28/pela-segunda-vez-congresso-acaba-com-saidas-temporarias-de-presos-em-feriados), Agência Senado. Onde olhar: Primeiro e segundo parágrafos e data de publicação. Sustenta: Veto do presidente Lula e derrubada pelo Congresso em 28 de maio de 2024.
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Relator do texto que resultou na Lei 14.843, de 2024.
  - [Perfil do senador Flávio Bolsonaro](https://www25.senado.leg.br/pt_BR/web/senadores/senador/-/perfil/5894), Senado Federal. Onde olhar: Rodapé da página. Sustenta: Sede do Senado Federal em Brasília.
- [ ] Conferido por: ______ em ____/____/______

## 6. Decisões políticas: votos e atos do Executivo (12 decisões, 4 coberturas da pesquisa e 1 identidades institucionais)

Cada decisão é uma amostra documentada, e não o histórico completo. Conferir, no voto: a votação (objeto votado, etapa, modalidade e resultado oficial) contra a ata ou o painel da sessão, e a manifestação registrada com o valor original do acervo. No ato do Executivo: o identificador, a data, o tipo (sanção, veto parcial com os dispositivos, decreto) contra a página oficial e a mensagem de veto. Um voto em requerimento ou em substitutivo não é voto no projeto inteiro, e a posição vale só para o objeto votado. Conferir também a cobertura declarada da pesquisa, com as lacunas, e a classificação de temas, que é decisão editorial.

### 8 de janeiro de 2023: Decreto nº 11.377, de 8 de janeiro de 2023

- Identificador: `planalto-decreto-11377-2023-intervencao-df` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Decreto; Decreto nº 11.377, de 8 de janeiro de 2023; Decreto: 11377/2023
- Fontes:
  - [Decreto nº 11.377, de 8 de janeiro de 2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/D11377.htm), Presidência da República. Onde olhar: Ementa, art. 1º e fecho do decreto. Sustenta: Decreta intervenção federal no Distrito Federal, limitada à área de segurança pública, até 31 de janeiro de 2023; assinado em Brasília em 8 de janeiro de 2023 pelo presidente Luiz Inácio Lula da Silva e pelo ministro da Justiça.
  - [Dados Abertos do Senado Federal: Decreto Legislativo nº 1, de 10 de janeiro de 2023](https://legis.senado.leg.br/dadosabertos/legislacao/36753151), Senado Federal. Onde olhar: Campos normaNome, dataassinatura e ementa. Sustenta: O Decreto Legislativo nº 1, de 10 de janeiro de 2023, aprova a intervenção federal na área de segurança pública do Distrito Federal, nos termos do Decreto nº 11.377.
  - Documento oficial do ato: [Decreto nº 11.377, de 8 de janeiro de 2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/D11377.htm)
- [ ] Conferido por: ______ em ____/____/______

### 21 de junho de 2023: Votação: PLP 93/2023, texto principal

- Identificador: `senado-voto-6714-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-6714`): Texto principal; Votação nominal do Projeto de Lei Complementar nº 39, de 2023,e das emendas, nos termos do parecer, ressalvados os destaques.; etapa: Turno não informado pelo acervo; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** Contra (valor original "Não")
- **Proposição a conferir** (`senado-plp-93-2023`): PLP 93/2023, Senado Federal: Institui regime fiscal sustentável para garantir a estabilidade macroeconômica do País e criar as condições adequadas ao crescimento socioeconômico, com fundamento no art. 6º da Emenda Constitucional nº 126, de 21 de dezembro de 2022, e no inciso VIII do caput e no parágrafo único do art. 163 da Constituição Federal; e altera a Lei Complementar nº 101, de 4 de maio de 2000 (Lei de Responsabilidade Fiscal), e a Lei nº 10.633, de 27 de dezembro de 2002.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 21 de junho de 2023 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-06-21&dataFim=2023-06-21), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=6714. Sustenta: siglaVotoParlamentar: Não
- [ ] Conferido por: ______ em ____/____/______

### 30 de agosto de 2023: Lei Complementar nº 200, de 30 de agosto de 2023

- Identificador: `planalto-lei-complementar-200-2023-regime-fiscal` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Veto parcial; Lei Complementar nº 200, de 30 de agosto de 2023; Mensagem de veto: Mensagem nº 431, de 30 de agosto de 2023; Dispositivos vetados: § 3º do art. 7º do Projeto de Lei Complementar; Art. 11 do Projeto de Lei Complementar, na parte em que altera o § 7º do art. 4º da Lei Complementar nº 101, de 4 de maio de 2000
- **Proposição a conferir** (`senado-plp-93-2023`): PLP 93/2023, Senado Federal: Institui regime fiscal sustentável para garantir a estabilidade macroeconômica do País e criar as condições adequadas ao crescimento socioeconômico, com fundamento no art. 6º da Emenda Constitucional nº 126, de 21 de dezembro de 2022, e no inciso VIII do caput e no parágrafo único do art. 163 da Constituição Federal; e altera a Lei Complementar nº 101, de 4 de maio de 2000 (Lei de Responsabilidade Fiscal), e a Lei nº 10.633, de 27 de dezembro de 2002.
- Fontes:
  - [Lei Complementar nº 200, de 30 de agosto de 2023](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp200.htm), Presidência da República. Onde olhar: Cabeçalho (notas "Mensagem de veto" e "Promulgação partes vetadas"), ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei complementar sancionada em 30 de agosto de 2023 com veto parcial; institui o regime fiscal sustentável e altera a Lei de Responsabilidade Fiscal; a página marca dois dispositivos como vetados e traz a promulgação de parte vetada.
  - [Mensagem nº 431, de 30 de agosto de 2023 (veto parcial ao Projeto de Lei Complementar nº 93, de 2023)](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2023/Msg/Vep/VEP-0431-23.htm), Presidência da República. Onde olhar: Dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 431 veta o § 3º do art. 7º e o art. 11 na parte em que altera o § 7º do art. 4º da Lei Complementar nº 101.
  - Documento oficial do ato: [Lei Complementar nº 200, de 30 de agosto de 2023](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp200.htm)
- [ ] Conferido por: ______ em ____/____/______

### 8 de novembro de 2023: Votação: PEC 45/2019, texto principal

- Identificador: `senado-voto-6777-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-6777`): Texto principal; Votação nominal da Proposta de Emenda à Constituição nº 45, de 2019, nos termos do Parecer, em segundo turno.; etapa: 2º turno; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** Contra (valor original "Não")
- **Proposição a conferir** (`senado-pec-45-2019`): PEC 45/2019, Senado Federal: Altera o Sistema Tributário Nacional.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 8 de novembro de 2023 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-11-08&dataFim=2023-11-08), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=6777. Sustenta: siglaVotoParlamentar: Não
- [ ] Conferido por: ______ em ____/____/______

### 20 de fevereiro de 2024: Votação: PL 2253/2022, texto principal

- Identificador: `senado-voto-6818-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-6818`): Texto principal; Votação nominal do Projeto de Lei nº 2.253, de 2022, nos termos do parecer, ressalvados os destaques.; etapa: Turno não informado pelo acervo; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** A favor (valor original "Sim")
- **Proposição a conferir** (`senado-pl-2253-2022`): PL 2253/2022, Senado Federal: Altera a Lei nº 7.210, de 11 de julho de 1984 (Lei de Execução Penal), para dispor sobre a monitoração eletrônica do preso, prever a realização de exame criminológico para progressão de regime e extinguir o benefício da saída temporária.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 20 de fevereiro de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-02-20&dataFim=2024-02-20), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=6818. Sustenta: siglaVotoParlamentar: Sim
- [ ] Conferido por: ______ em ____/____/______

### 11 de abril de 2024: Lei nº 14.843, de 11 de abril de 2024

- Identificador: `planalto-lei-14843-2024-saidas-temporarias` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Veto parcial; Lei nº 14.843, de 11 de abril de 2024; Mensagem de veto: Mensagem nº 144, de 11 de abril de 2024; Dispositivos vetados: Art. 2º do Projeto de Lei, na parte em que altera os incisos I e III do caput do art. 122 da Lei nº 7.210, de 11 de julho de 1984; Inciso I do caput do art. 3º do Projeto de Lei
- **Proposição a conferir** (`senado-pl-2253-2022`): PL 2253/2022, Senado Federal: Altera a Lei nº 7.210, de 11 de julho de 1984 (Lei de Execução Penal), para dispor sobre a monitoração eletrônica do preso, prever a realização de exame criminológico para progressão de regime e extinguir o benefício da saída temporária.
- Fontes:
  - [Lei nº 14.843, de 11 de abril de 2024](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14843.htm), Presidência da República. Onde olhar: Cabeçalho (nota "Mensagem de veto" e "Promulgação partes vetadas"), dispositivos marcados (VETADO) e fecho. Sustenta: Lei sancionada em 11 de abril de 2024 com veto parcial: a página marca como vetados os incisos I e III do art. 122 da Lei de Execução Penal e o inciso I do art. 3º, e traz a promulgação das partes vetadas em 12 de junho de 2024, assinada pelo vice-presidente no exercício do cargo.
  - [Mensagem nº 144, de 11 de abril de 2024 (veto parcial ao Projeto de Lei nº 2.253, de 2022)](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/Msg/Vep/VEP-144-24.htm), Presidência da República. Onde olhar: Dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 144 veta o art. 2º na parte em que altera os incisos I e III do caput do art. 122 da Lei nº 7.210 e o inciso I do caput do art. 3º do projeto, por inconstitucionalidade.
  - Documento oficial do ato: [Lei nº 14.843, de 11 de abril de 2024](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14843.htm)
- [ ] Conferido por: ______ em ____/____/______

### 16 de abril de 2024: Votação: PEC 45/2023, texto principal

- Identificador: `senado-voto-6825-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-6825`): Texto principal; Votação nominal da Proposta de Emenda à Constituição nº 45, de 2023, nos termos do parecer (2º Turno).; etapa: 2º turno; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** A favor (valor original "Sim")
- **Proposição a conferir** (`senado-pec-45-2023`): PEC 45/2023, Senado Federal: Altera o art. 5º da Constituição Federal, para prever como mandado de criminalização a posse e o porte de entorpecentes e drogas afins sem autorização ou em desacordo com determinação legal ou regulamentar.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 16 de abril de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-04-16&dataFim=2024-04-16), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=6825. Sustenta: siglaVotoParlamentar: Sim
- [ ] Conferido por: ______ em ____/____/______

### 12 de dezembro de 2024: Votação: PLP 68/2024, substitutivo

- Identificador: `senado-voto-6899-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-6899`): Substitutivo (Emenda nº 2.171 (Substitutivo)); Votação nominal da Emenda nº 2.171(Substitutivo) ao PLP 68/24 com Emendas e supressão, nos termos dos pareceres, ressalvados os destaques.; etapa: Turno não informado pelo acervo; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** Contra (valor original "Não")
- **Proposição a conferir** (`senado-plp-68-2024`): PLP 68/2024, Senado Federal: Institui o Imposto sobre Bens e Serviços (IBS), a Contribuição Social sobre Bens e Serviços (CBS) e o Imposto Seletivo (IS); e dá outras providências.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 12 de dezembro de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-12-12&dataFim=2024-12-12), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=6899. Sustenta: siglaVotoParlamentar: Não
- [ ] Conferido por: ______ em ____/____/______

### 16 de janeiro de 2025: Lei Complementar nº 214, de 16 de janeiro de 2025

- Identificador: `planalto-lei-complementar-214-2025-ibs-cbs` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Veto parcial; Lei Complementar nº 214, de 16 de janeiro de 2025; Mensagem de veto: Mensagem nº 88, de 16 de janeiro de 2025; Dispositivos vetados: Incisos V e X do caput do art. 26; Inciso III do § 1º do art. 26; § 5º e § 6º do art. 26; § 8º do art. 26; § 2º do art. 36; § 4º do art. 138; Inciso II do § 9º do art. 138; § 4º do art. 183; Inciso III do § 1º do art. 231; Inciso III do § 1º do art. 252; § 2º do art. 332; Art. 334; Inciso I do caput do art. 413; § 4º do art. 429; § 5º do art. 444; Inciso II do § 1º do art. 454; § 5º do art. 462; Art. 494; Art. 495; Art. 517, na parte em que inclui a alínea "b" do inciso XII-A do § 1º do art. 13 da Lei Complementar nº 123, de 2006; Art. 536; Itens 1.4, 1.5, 1.8 e 1.9 do Anexo XI
- **Proposição a conferir** (`senado-plp-68-2024`): PLP 68/2024, Senado Federal: Institui o Imposto sobre Bens e Serviços (IBS), a Contribuição Social sobre Bens e Serviços (CBS) e o Imposto Seletivo (IS); e dá outras providências.
- Fontes:
  - [Lei Complementar nº 214, de 16 de janeiro de 2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm), Presidência da República. Onde olhar: Cabeçalho (notas "Mensagem de veto" e "Promulgação partes vetadas"), ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei complementar sancionada em 16 de janeiro de 2025 com veto parcial; institui o IBS, a CBS e o Imposto Seletivo e cria o Comitê Gestor do IBS.
  - [Mensagem nº 88, de 16 de janeiro de 2025 (veto parcial ao Projeto de Lei Complementar nº 68, de 2024)](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2025/Msg/Vep/VEP-88-25.htm), Presidência da República. Onde olhar: Lista de dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 88 relaciona os dispositivos do Projeto de Lei Complementar nº 68/2024 vetados, a começar pelos incisos V e X do caput do art. 26.
  - Documento oficial do ato: [Lei Complementar nº 214, de 16 de janeiro de 2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm)
- [ ] Conferido por: ______ em ____/____/______

### 26 de novembro de 2025: Lei nº 15.270, de 26 de novembro de 2025

- Identificador: `planalto-lei-15270-2025-imposto-de-renda` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Sanção expressa; Lei nº 15.270, de 26 de novembro de 2025
- **Proposição a conferir** (`senado-pl-1087-2025`): PL 1087/2025, Senado Federal: Altera as Leis nºs 9.250, de 26 de dezembro de 1995, e 9.249, de 26 de dezembro de 1995, para instituir a redução do imposto sobre a renda devido nas bases de cálculo mensal e anual e a tributação mínima para as pessoas físicas que auferem altas rendas; e dá outras providências.
- Fontes:
  - [Lei nº 15.270, de 26 de novembro de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15270.htm), Presidência da República. Onde olhar: Cabeçalho (sem nota de mensagem de veto), art. 1º, tabela de redução e fecho. Sustenta: Lei sancionada em 26 de novembro de 2025, sem dispositivo marcado como vetado na página; altera as Leis nºs 9.250 e 9.249 para instituir a redução do imposto sobre a renda, com imposto zero até R$ 5.000,00 mensais, e a tributação mínima de altas rendas.
  - [Dados Abertos do Senado Federal: ficha da matéria PL 1087/2025](https://legis.senado.leg.br/dadosabertos/materia/PL/1087/2025), Senado Federal. Onde olhar: Campo NormaGerada da ficha da matéria. Sustenta: A ficha do PL 1087/2025 registra como norma gerada a Lei nº 15.270, de 26 de novembro de 2025, publicada no Diário Oficial da União de 27 de novembro de 2025.
  - Documento oficial do ato: [Lei nº 15.270, de 26 de novembro de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15270.htm)
- [ ] Conferido por: ______ em ____/____/______

### 10 de dezembro de 2025: Votação: PL 5582/2025, substitutivo

- Identificador: `senado-voto-7037-5894` · Pessoa: Flávio Bolsonaro · Voto parlamentar · Senado Federal · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Votação a conferir** (`senado-votacao-7037`): Substitutivo (Emenda nº 117 (Substitutivo)); Votação nominal da Emenda nº 117 (Substitutivo) ao Projeto de Lei nº 5.582, de 2025, nos termos do parecer.; etapa: Turno não informado pelo acervo; Plenário, nominal; resultado oficial: aprovado (valor original "A").
- **Manifestação a conferir:** A favor (valor original "Sim")
- **Proposição a conferir** (`senado-pl-5582-2025`): PL 5582/2025, Senado Federal: Institui o marco legal do combate ao crime organizado no Brasil; tipifica os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado; e altera os Decretos-Leis nºs 2.848, de 7 de dezembro de 1940 (Código Penal), e 3.689, de 3 de outubro de 1941 (Código de Processo Penal), e as Leis nºs 8.072, de 25 de julho de 1990 (Lei dos Crimes Hediondos), 7.210, de 11 de julho de 1984 (Lei de Execução Penal), 11.343, de 23 de agosto de 2006, 10.826, de 22 de dezembro de 2003, 9.613, de 3 de março de 1998, e 4.737, de 15 de julho de 1965 (Código Eleitoral).
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 10 de dezembro de 2025 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2025-12-10&dataFim=2025-12-10), Senado Federal. Onde olhar: votos[] com codigoParlamentar=5894, no item com codigoSessaoVotacao=7037. Sustenta: siglaVotoParlamentar: Sim
- [ ] Conferido por: ______ em ____/____/______

### 24 de março de 2026: Lei nº 15.358, de 24 de março de 2026

- Identificador: `planalto-lei-15358-2026-crime-organizado` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Veto parcial; Lei nº 15.358, de 24 de março de 2026; Mensagem de veto: Mensagem nº 216, de 24 de março de 2026; Dispositivos vetados: § 3º do art. 2º do Projeto de Lei; Art. 33 do Projeto de Lei, na parte em que altera o inciso II do caput do art. 91 do Decreto-Lei nº 2.848, de 7 de dezembro de 1940 (Código Penal); Art. 43 do Projeto de Lei
- **Proposição a conferir** (`senado-pl-5582-2025`): PL 5582/2025, Senado Federal: Institui o marco legal do combate ao crime organizado no Brasil; tipifica os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado; e altera os Decretos-Leis nºs 2.848, de 7 de dezembro de 1940 (Código Penal), e 3.689, de 3 de outubro de 1941 (Código de Processo Penal), e as Leis nºs 8.072, de 25 de julho de 1990 (Lei dos Crimes Hediondos), 7.210, de 11 de julho de 1984 (Lei de Execução Penal), 11.343, de 23 de agosto de 2006, 10.826, de 22 de dezembro de 2003, 9.613, de 3 de março de 1998, e 4.737, de 15 de julho de 1965 (Código Eleitoral).
- Fontes:
  - [Lei nº 15.358, de 24 de março de 2026](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Lei/L15358.htm), Presidência da República. Onde olhar: Cabeçalho (nota "Mensagem de veto"), ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei sancionada em 24 de março de 2026 com veto parcial; institui o Marco Legal do Combate ao Crime Organizado e marca três dispositivos como vetados.
  - [Mensagem nº 216, de 24 de março de 2026 (veto parcial ao Projeto de Lei nº 5.582, de 2025)](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Msg/Vep/VEP-216-26.htm), Presidência da República. Onde olhar: Dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 216 veta o § 3º do art. 2º, o art. 33 na parte que altera o inciso II do caput do art. 91 do Código Penal e o art. 43 do projeto.
  - Documento oficial do ato: [Lei nº 15.358, de 24 de março de 2026](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Lei/L15358.htm)
- [ ] Conferido por: ______ em ____/____/______

### Cobertura da pesquisa: Flávio Bolsonaro, Economia, 1º de janeiro de 2023 a 8 de outubro de 2026

- Identificador: `cobertura-flavio-bolsonaro-economia-2023-2026` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Declaração da pesquisa feita para a amostra de decisões da edição 0.2.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: até doze decisões no total dos dois perfis, nos temas Economia e Segurança pública, de 1º de janeiro de 2023 à data de corte, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem olhar se a decisão favorece ou prejudica alguém. A triagem completa, os registros excluídos e as lacunas estão em research/selecao-decisoes-2026-10.md.
- Acervo: [Dados Abertos do Senado Federal, votações nominais do Plenário por parlamentar](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-01-01&dataFim=2026-10-08), consultado em 2026-10-10; recorte: codigoParlamentar=5894, sete janelas semestrais de 2023-01-01 a 2026-10-08: 423 votações na resposta, 183 nominais abertas (145 com posição) e 240 secretas; consulta completa.
- Lacuna declarada: Só as votações escolhidas para a amostra foram registradas; as demais votações da triagem por tema ficaram fora e estão listadas na pesquisa.
- Lacuna declarada: Votações secretas (indicações de autoridades) registram só a participação, sem a posição.
- Lacuna declarada: Votações simbólicas e votações em comissão não aparecem no acervo consultado.
- Lacuna declarada: Sessões do Congresso Nacional (vetos, orçamento) não aparecem na consulta por parlamentar.
- [ ] Conferido por: ______ em ____/____/______

### Cobertura da pesquisa: Flávio Bolsonaro, Segurança pública, 1º de janeiro de 2023 a 8 de outubro de 2026

- Identificador: `cobertura-flavio-bolsonaro-seguranca-publica-2023-2026` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Declaração da pesquisa feita para a amostra de decisões da edição 0.2.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: até doze decisões no total dos dois perfis, nos temas Economia e Segurança pública, de 1º de janeiro de 2023 à data de corte, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem olhar se a decisão favorece ou prejudica alguém. A triagem completa, os registros excluídos e as lacunas estão em research/selecao-decisoes-2026-10.md.
- Acervo: [Dados Abertos do Senado Federal, votações nominais do Plenário por parlamentar](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-01-01&dataFim=2026-10-08), consultado em 2026-10-10; recorte: codigoParlamentar=5894, sete janelas semestrais de 2023-01-01 a 2026-10-08: 423 votações na resposta, 183 nominais abertas (145 com posição) e 240 secretas; consulta completa.
- Lacuna declarada: Só as votações escolhidas para a amostra foram registradas; as demais votações da triagem por tema ficaram fora e estão listadas na pesquisa.
- Lacuna declarada: Votações secretas (indicações de autoridades) registram só a participação, sem a posição.
- Lacuna declarada: Votações simbólicas e votações em comissão não aparecem no acervo consultado.
- Lacuna declarada: Sessões do Congresso Nacional (vetos, orçamento) não aparecem na consulta por parlamentar.
- Lacuna declarada: A votação de 10 de janeiro de 2023 sobre o Decreto Legislativo nº 1/2023 (intervenção federal no Distrito Federal) não aparece no acervo consultado para o parlamentar; sem a linha do acervo, nenhum voto foi registrado para ela.
- [ ] Conferido por: ______ em ____/____/______

### Cobertura da pesquisa: Lula, Economia, 1º de janeiro de 2023 a 8 de outubro de 2026

- Identificador: `cobertura-lula-economia-2023-2026` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Declaração da pesquisa feita para a amostra de decisões da edição 0.2.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: até doze decisões no total dos dois perfis, nos temas Economia e Segurança pública, de 1º de janeiro de 2023 à data de corte, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem olhar se a decisão favorece ou prejudica alguém. A triagem completa, os registros excluídos e as lacunas estão em research/selecao-decisoes-2026-10.md.
- Acervo: [Portal da Legislação (Planalto), páginas estáticas de leis, leis complementares, medidas provisórias, decretos e mensagens de veto](https://www.planalto.gov.br/ccivil_03/), consultado em 2026-10-10; recorte: Índices anuais de 2023 a 2026 e páginas dos atos candidatos; 31 atos do tema confirmados na triagem (research/candidatos-atos-presidenciais-2023-2026.md); consulta incompleta.
- Lacuna declarada: Só os atos escolhidos para a amostra foram registrados; os demais atos da triagem estão listados na pesquisa.
- Lacuna declarada: Atos assinados pelo vice-presidente no exercício do cargo não são atribuídos ao presidente.
- Lacuna declarada: A derrubada de vetos e a promulgação de partes vetadas pelo Congresso não são atos do Executivo e não entram como decisão dele.
- [ ] Conferido por: ______ em ____/____/______

### Cobertura da pesquisa: Lula, Segurança pública, 1º de janeiro de 2023 a 8 de outubro de 2026

- Identificador: `cobertura-lula-seguranca-publica-2023-2026` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Declaração da pesquisa feita para a amostra de decisões da edição 0.2.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: até doze decisões no total dos dois perfis, nos temas Economia e Segurança pública, de 1º de janeiro de 2023 à data de corte, escolhidas por abrangência, efeito institucional e qualidade da evidência, sem olhar se a decisão favorece ou prejudica alguém. A triagem completa, os registros excluídos e as lacunas estão em research/selecao-decisoes-2026-10.md.
- Acervo: [Portal da Legislação (Planalto), páginas estáticas de leis, leis complementares, medidas provisórias, decretos e mensagens de veto](https://www.planalto.gov.br/ccivil_03/), consultado em 2026-10-10; recorte: Índices anuais de 2023 a 2026 e páginas dos atos candidatos; 22 atos do tema confirmados na triagem (research/candidatos-atos-presidenciais-2023-2026.md); consulta incompleta.
- Lacuna declarada: Só os atos escolhidos para a amostra foram registrados; os demais atos da triagem estão listados na pesquisa.
- Lacuna declarada: Atos assinados pelo vice-presidente no exercício do cargo não são atribuídos ao presidente.
- Lacuna declarada: A derrubada de vetos e a promulgação de partes vetadas pelo Congresso não são atos do Executivo e não entram como decisão dele.
- [ ] Conferido por: ______ em ____/____/______

### Identidade institucional: Flávio Bolsonaro em Senado Federal

- Identificador: `identidade-flavio-bolsonaro-senado-5894` · Provedor: senado · Identificador externo: 5894 · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Identificador conferido no endereço do serviço de mandatos do senador e nas respostas do webservice de votações, em 10 de outubro de 2026, com assistência de IA. Revisão humana pendente.
- Fontes:
  - [Dados Abertos do Senado: mandatos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/mandatos), Senado Federal. Onde olhar: Endereço do serviço (/senador/5894/mandatos) e campo CodigoParlamentar. Sustenta: O código 5894 identifica o senador no serviço de dados abertos do Senado Federal.
- [ ] Conferido por: ______ em ____/____/______
