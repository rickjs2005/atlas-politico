# Revisão humana: o que conferir, trecho a trecho

Gerado por `npm run review:human` a partir dos dados publicados (edição 0.4.0, data de corte 2026-10-08). Não edite à mão: o teste `tests/human-review.test.ts` confere que este arquivo está em dia. A conferência registrada no conteúdo é toda assistida por IA (0 registros com revisão humana); a política editorial ([EDITORIAL.md](EDITORIAL.md)) condiciona a publicação à revisão por uma pessoa, e a lista abaixo é o roteiro dela.

## Como usar

1. Para cada item, abra as fontes listadas e leia o trecho indicado em **Onde olhar**. Confira o resumo e o contexto palavra a palavra: datas, números, nomes, cargos, placares, penas e o que cada citação diz sustentar.
2. O que estiver errado ou sem apoio no documento vira correção de conteúdo pelo pipeline ([DATA-PIPELINE.md](DATA-PIPELINE.md)): nova entrada em `alteracoes` da edição, com a descrição. Nunca edite `generated/` à mão.
3. Só depois da leitura real, a pessoa que conferiu registra a revisão como humana no conteúdo (`revisao.tipo: "humana"`, com nome e data). O código e os scripts nunca fazem isso sozinhos.
4. Marque a caixa de cada item com o nome e a data. O arquivo gerado é regravado pelo comando; guarde as marcações em cópia própria ou no controle de versão da edição.

Resumo: 39 acontecimentos (10 judiciais, 16 eleitorais, 4 de partidos, 3 de mandatos e funções, 6 demais), 8 filiações, 15 mandatos, 32 decisões políticas (6 votos, 17 atos do Executivo e 9 atuações legislativas; 15 proposições), 7 declarações de cobertura da pesquisa, 1 identidades institucionais, 42 propostas eleitorais, 24 fases do jogo, 14 fatos biográficos, 26 conceitos, 152 fontes.

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

### Flávio Bolsonaro: Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj), 1º de fevereiro de 2003 a 2019

- Identificador: `flavio-bolsonaro-deputado-estadual-2003-2019` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Início do mandato precisado em 11 de outubro de 2026, com assistência de IA: a data é a da posse da legislatura de 2003 a 2007, informada pela Alerj no documento que lista os deputados dela, entre eles Flávio Bolsonaro; o documento não traz termo de posse individual. Os demais campos são os da conferência de 9 de outubro de 2026, com a casa declarada em 10 de outubro de 2026 pela instituição já documentada no registro, e não foram relidos nesta passagem. Revisão humana pendente.
- Fontes:
  - [Flávio Bolsonaro e Lula disputam o segundo turno das eleições para presidente](https://www12.senado.leg.br/noticias/materias/2026/10/04/flavio-bolsonaro-e-lula-disputam-o-segundo-turno-das-eleicoes-para-presidente), Agência Senado. Onde olhar: Parágrafo sobre a carreira de Flávio Bolsonaro. Sustenta: Deputado estadual a partir de 2003; saiu da Assembleia Legislativa em 2019 para o Senado.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de eleições anteriores da ficha do candidato. Sustenta: Eleito deputado estadual em 2006, 2010 e 2014.
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Eleito deputado estadual em 2002.
  - [Alerj: 8ª legislatura (2003-2007), lista de deputados](https://www2.alerj.rj.gov.br/biblioteca/assets/documentos/pdf/legislaturas/deputados/8aLegislatura.pdf), Assembleia Legislativa do Estado do Rio de Janeiro, Biblioteca. Onde olhar: Cabeçalho do documento e item 32 da lista de deputados. Sustenta: Posse da legislatura de 2003 a 2007 em 1º de fevereiro de 2003; o deputado Flávio Bolsonaro consta da lista.
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

## 6. Decisões políticas: votos, atos do Executivo e atuação legislativa (32 decisões, 15 proposições, 7 coberturas da pesquisa e 1 identidades institucionais)

Cada decisão é uma amostra documentada, e não o histórico completo. Conferir, no voto: a votação (objeto votado, etapa, modalidade e resultado oficial) contra a ata ou o painel da sessão, e a manifestação registrada com o valor original do acervo. No ato do Executivo: o identificador, a data, o tipo (sanção, veto parcial com os dispositivos, decreto) contra a página oficial e a mensagem de veto. Na atuação legislativa: a autoria ou a relatoria contra a página da lei ou da matéria, a ementa, quem mais assina e o destino documentado (lei sancionada, lei promulgada pelo Legislativo, norma gerada). Um voto em requerimento ou em substitutivo não é voto no projeto inteiro, e a posição vale só para o objeto votado; propor ou relatar uma matéria não diz como a pessoa votou nela. Conferir também a cobertura declarada da pesquisa, com as lacunas, e a classificação de temas, que é decisão editorial.

### 30 de abril de 2003: Proposta de Emenda à Constituição nº 40, de 2003

- Identificador: `camara-pec-40-2003-iniciativa` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Reforma do Estado · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Iniciativa de proposição; Proposta de Emenda à Constituição nº 40, de 2003
- **Proposição a conferir** (`camara-pec-40-2003`): PEC 40/2003, Câmara dos Deputados: Modifica os arts. 37, 40, 42, 48, 96, 142 e 149 da Constituição Federal, o art. 8º da Emenda Constitucional nº 20, de 15 de dezembro de 1998, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PEC 40/2003](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PEC&numero=40&ano=2003), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano, ementa e dataApresentacao. Sustenta: PEC 40/2003, apresentada em 30 de abril de 2003.
  - [Dados Abertos da Câmara: autores da proposição 113716 (PEC 40/2003)](https://dadosabertos.camara.leg.br/api/v2/proposicoes/113716/autores), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos nome e tipo do primeiro autor. Sustenta: O autor registrado da proposta é o Poder Executivo.
  - [Emenda Constitucional nº 41, de 2003: dados da norma](https://www2.camara.leg.br/legin/fed/emecon/2003/emendaconstitucional-41-19-dezembro-2003-497025-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A PEC 40/2003 é a proposição de origem da Emenda Constitucional nº 41, de 2003.
  - [Emenda Constitucional nº 41, de 19 de dezembro de 2003](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc41.htm), Presidência da República (Portal da Legislação). Onde olhar: Preâmbulo. Sustenta: A Emenda Constitucional nº 41 foi promulgada pelas Mesas da Câmara dos Deputados e do Senado Federal: a promulgação não é ato do presidente.
  - Documento oficial do ato: [Dados Abertos da Câmara: proposição PEC 40/2003](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PEC&numero=40&ano=2003)
- [ ] Conferido por: ______ em ____/____/______

### 20 de outubro de 2003: Medida Provisória nº 132, de 20 de outubro de 2003

- Identificador: `planalto-mpv-132-2003-bolsa-familia` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Edição de medida provisória; Medida Provisória nº 132, de 20 de outubro de 2003; Medida provisória: 132/2003; Versão: Texto original da edição, de 20 de outubro de 2003. A página do ato registra que a medida foi convertida na Lei nº 10.836, de 2004.
- **Proposição a conferir** (`camara-mpv-132-2003`): MPV 132/2003, Câmara dos Deputados: Cria o programa Bolsa Família e dá outras providências.
- Fontes:
  - [Medida Provisória nº 132, de 20 de outubro de 2003](https://www.planalto.gov.br/ccivil_03/mpv/antigas_2003/132.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa, anotação de conversão e fecho. Sustenta: Medida provisória de 20 de outubro de 2003, que cria o Programa Bolsa Família; assinada em Brasília pelo presidente Luiz Inácio Lula da Silva; convertida na Lei nº 10.836, de 2004.
  - Documento oficial do ato: [Medida Provisória nº 132, de 20 de outubro de 2003](https://www.planalto.gov.br/ccivil_03/mpv/antigas_2003/132.htm)
- [ ] Conferido por: ______ em ____/____/______

### 22 de dezembro de 2003: Lei nº 10.826, de 22 de dezembro de 2003

- Identificador: `planalto-lei-10826-2003-armas-de-fogo` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Sanção expressa; Lei nº 10.826, de 22 de dezembro de 2003
- **Proposição a conferir** (`camara-pl-1555-2003`): PL 1555/2003, Câmara dos Deputados: Dispõe sobre registro, posse e comercialização de armas de fogo e munição, sobre o Sistema Nacional de Armas - SINARM, define crimes e dá outras providências.
- Fontes:
  - [Lei nº 10.826, de 22 de dezembro de 2003](https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, início da ementa, fórmula de sanção e fecho. Sustenta: Lei de 22 de dezembro de 2003, sobre registro, posse e comercialização de armas de fogo e munição e sobre o Sistema Nacional de Armas; decretada pelo Congresso Nacional e sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Dados Abertos da Câmara: situação da proposição 125878 (PL 1555/2003)](https://dadosabertos.camara.leg.br/api/v2/proposicoes/125878), Câmara dos Deputados (Dados Abertos). Onde olhar: Campo statusProposicao.despacho. Sustenta: O PL 1555/2003 foi transformado na Lei 10.826/2003.
  - Documento oficial do ato: [Lei nº 10.826, de 22 de dezembro de 2003](https://www.planalto.gov.br/ccivil_03/leis/2003/l10.826.htm)
- [ ] Conferido por: ______ em ____/____/______

### 29 de dezembro de 2003: Autoria da Lei estadual 4.250/2003, sobre ingresso no serviço público

- Identificador: `alerj-lei-4250-2003-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 492/2003, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dispõe sobre a não exigência de certidão negativa emitida por entidades de proteção ao crédito para ingresso no serviço público estadual.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, sancionada pelo chefe do Executivo (Lei estadual nº 4.250, de 29 de dezembro de 2003, do Rio de Janeiro). Sancionada pela governadora Rosinha Garotinho: o texto traz a fórmula "decreta e eu sanciono" e a assinatura. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 4250, de 2003, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzFmOTYwOGQ0Mzk2ZTY3ZGU4MzI1NmUwYzAwNjdiYmY1P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (cabeçalho, ementa, fórmula de sanção e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 4250, de 29 de dezembro de 2003: ementa; sancionada pela governadora Rosinha Garotinho; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 492/2003; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 9 de janeiro de 2004: Lei nº 10.836, de 9 de janeiro de 2004

- Identificador: `planalto-lei-10836-2004-bolsa-familia` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Sanção expressa; Lei nº 10.836, de 9 de janeiro de 2004
- **Proposição a conferir** (`camara-mpv-132-2003`): MPV 132/2003, Câmara dos Deputados: Cria o programa Bolsa Família e dá outras providências.
- Fontes:
  - [Lei nº 10.836, de 9 de janeiro de 2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.836.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa, anotação de conversão, fórmula de sanção e fecho. Sustenta: Lei de 9 de janeiro de 2004, que cria o Programa Bolsa Família; conversão da Medida Provisória nº 132, de 2003; decretada pelo Congresso Nacional e sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Lei nº 10.836, de 9 de janeiro de 2004: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2004/lei-10836-9-janeiro-2004-490604-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campos Proposição Originária e Ementa da ficha da norma. Sustenta: A ficha aponta a MPV 132/2003 como origem, pelo PLV 28/2003, e traz uma ementa mais longa que a da página do Planalto.
  - Documento oficial do ato: [Lei nº 10.836, de 9 de janeiro de 2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.836.htm)
- [ ] Conferido por: ______ em ____/____/______

### 20 de maio de 2004: Decreto nº 5.090, de 20 de maio de 2004

- Identificador: `planalto-decreto-5090-2004-farmacia-popular` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Saúde · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Decreto; Decreto nº 5.090, de 20 de maio de 2004; Decreto: 5090/2004
- Fontes:
  - [Decreto nº 5.090, de 20 de maio de 2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5090.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa e fecho. Sustenta: Decreto de 20 de maio de 2004, que regulamenta a Lei nº 10.858, de 13 de abril de 2004, e institui o programa "Farmácia Popular do Brasil"; assinado em Brasília pelo presidente Luiz Inácio Lula da Silva.
  - Documento oficial do ato: [Decreto nº 5.090, de 20 de maio de 2004](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5090.htm)
- [ ] Conferido por: ______ em ____/____/______

### 13 de janeiro de 2005: Lei nº 11.096, de 13 de janeiro de 2005

- Identificador: `planalto-lei-11096-2005-prouni` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Educação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Veto parcial; Lei nº 11.096, de 13 de janeiro de 2005; Mensagem de veto: Mensagem nº 14, de 13 de janeiro de 2005; Dispositivos vetados: Art. 17 do Projeto de Lei de Conversão nº 59, de 2004
- **Proposição a conferir** (`camara-mpv-213-2004`): MPV 213/2004, Câmara dos Deputados: Institui o Programa Universidade para Todos - PROUNI, regula a atuação de entidades beneficentes de assistência social no ensino superior, e dá outras providências.
- Fontes:
  - [Lei nº 11.096, de 13 de janeiro de 2005](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11096.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa, anotação de conversão, fórmula de sanção e fecho. Sustenta: Lei de 13 de janeiro de 2005, que institui o Programa Universidade para Todos (Prouni); conversão da Medida Provisória nº 213, de 2004; sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Mensagem nº 14, de 13 de janeiro de 2005 (veto parcial)](https://www.planalto.gov.br/ccivil_03/_Ato2004-2006/2005/Msg/Vep/VEP-0014-05.htm), Presidência da República (Portal da Legislação). Onde olhar: Primeiro parágrafo e título do dispositivo vetado. Sustenta: Veto parcial, por contrariedade ao interesse público, ao Projeto de Lei de Conversão nº 59, de 2004 (MP nº 213/04): art. 17.
  - [Lei nº 11.096, de 13 de janeiro de 2005: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2005/lei-11096-13-janeiro-2005-535381-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A ficha aponta a MPV 213/2004 como origem, pelo PLV 59/2004.
  - Documento oficial do ato: [Lei nº 11.096, de 13 de janeiro de 2005](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2005/lei/l11096.htm)
- [ ] Conferido por: ______ em ____/____/______

### 7 de agosto de 2006: Lei nº 11.340, de 7 de agosto de 2006

- Identificador: `planalto-lei-11340-2006-violencia-contra-a-mulher` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Direitos das mulheres, Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (primeiro mandato), Presidência da República (`lula-presidente-da-republica-2003-2007`)
- **Ato a conferir:** Sanção expressa; Lei nº 11.340, de 7 de agosto de 2006
- **Proposição a conferir** (`camara-pl-4559-2004`): PL 4559/2004, Câmara dos Deputados: Cria mecanismos para coibir a violência doméstica e familiar contra a mulher, nos termos do § 8º do art. 226 da Constituição Federal, e dá outras providências.
- Fontes:
  - [Lei nº 11.340, de 7 de agosto de 2006](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa, fórmula de sanção e fecho. Sustenta: Lei de 7 de agosto de 2006, que cria mecanismos para coibir a violência doméstica e familiar contra a mulher; decretada pelo Congresso Nacional e sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Lei nº 11.340, de 7 de agosto de 2006: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2006/lei-11340-7-agosto-2006-545133-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A ficha aponta o PL 4559/2004 como origem.
  - Documento oficial do ato: [Lei nº 11.340, de 7 de agosto de 2006](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm)
- [ ] Conferido por: ______ em ____/____/______

### 8 de dezembro de 2006: Autoria da Lei estadual 4.916/2006, sobre laqueadura e vasectomia gratuitas

- Identificador: `alerj-lei-4916-2006-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: Saúde · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 1700/2004, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dispõe sobre a laqueadura e vasectomia gratuita nos estabelecimentos de saúde vinculados ao Estado.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, sancionada pelo chefe do Executivo (Lei estadual nº 4.916, de 8 de dezembro de 2006, do Rio de Janeiro). Sancionada pela governadora Rosinha Garotinho: o texto traz a fórmula "decreta e eu sanciono" e a assinatura. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 4916, de 2006, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2UzNjRlYzkxZjM4ZjViZDM4MzI1NzI0MjAwNjg2OGE2P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (cabeçalho, ementa, fórmula de sanção e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 4.916, de 8 de dezembro de 2006: ementa; sancionada pela governadora Rosinha Garotinho; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 1700/2004; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 22 de janeiro de 2007: Decreto nº 6.025, de 22 de janeiro de 2007

- Identificador: `planalto-decreto-6025-2007-pac` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (segundo mandato), Presidência da República (`lula-presidente-da-republica-2007-2011`)
- **Ato a conferir:** Decreto; Decreto nº 6.025, de 22 de janeiro de 2007; Decreto: 6025/2007
- Fontes:
  - [Decreto nº 6.025, de 22 de janeiro de 2007](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6025.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa e fecho. Sustenta: Decreto de 22 de janeiro de 2007, que institui o Programa de Aceleração do Crescimento (PAC) e o seu Comitê Gestor; assinado em Brasília pelo presidente Luiz Inácio Lula da Silva.
  - Documento oficial do ato: [Decreto nº 6.025, de 22 de janeiro de 2007](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6025.htm)
- [ ] Conferido por: ______ em ____/____/______

### 19 de abril de 2007: Autoria da Lei estadual 5.019/2007, sobre policiais e bombeiros militares em serviço na Alerj e no Tribunal de Justiça

- Identificador: `alerj-lei-5019-2007-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 2786-B/2005, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dá nova redação ao artigo 1º da Lei nº 4043, de 30 de dezembro de 2002.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, sancionada pelo chefe do Executivo (Lei estadual nº 5.019, de 19 de abril de 2007, do Rio de Janeiro). Sancionada pelo governador Sérgio Cabral: o texto traz a fórmula "decreta e eu sanciono" e a assinatura. A ementa não diz o assunto. O texto inclui em outra lei dois grupos: os policiais militares e bombeiros militares lotados na Coordenadoria Militar e da Brigada de Incêndio da Presidência da Assembleia Legislativa, e os oficiais superiores da Polícia Militar e do Corpo de Bombeiros em exercício na Coordenadoria Militar do Tribunal de Justiça. O registro não explica o efeito dessa inclusão: a lei alterada não foi lida. A ficha técnica registra que foi aprovado o substitutivo da Comissão de Constituição e Justiça, e não o texto original do projeto. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 5019, de 2007, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzcxODIyMDU2ZDRmNjQwNmU4MzI1NzJkNjAwNzU1NGE5P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (cabeçalho, ementa, fórmula de sanção e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 5.019, de 19 de abril de 2007: ementa; os dois grupos de militares que o texto inclui; sancionada pelo governador Sérgio Cabral; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 2786-B/2005, aprovado na forma do substitutivo da Comissão de Constituição e Justiça; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 16 de julho de 2008: Lei nº 11.738, de 16 de julho de 2008

- Identificador: `planalto-lei-11738-2008-piso-do-magisterio` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Educação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (segundo mandato), Presidência da República (`lula-presidente-da-republica-2007-2011`)
- **Ato a conferir:** Veto parcial; Lei nº 11.738, de 16 de julho de 2008; Mensagem de veto: Mensagem nº 508, de 16 de julho de 2008; Dispositivos vetados: Inciso I do art. 3º; Art. 7º
- **Proposição a conferir** (`camara-pl-7431-2006`): PL 7431/2006, Câmara dos Deputados: Autoriza o Poder Executivo a instituir o Piso Salarial Profissional dos Educadores Públicos, na forma prevista no art. 206, V, e 212 da Constituição Federal, e dá outras providências.
- Fontes:
  - [Lei nº 11.738, de 16 de julho de 2008](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11738.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa original, fórmula de sanção e fecho. Sustenta: Lei de 16 de julho de 2008, que institui o piso salarial profissional nacional para os profissionais do magistério público da educação básica; sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Mensagem nº 508, de 16 de julho de 2008 (veto parcial)](https://www.planalto.gov.br/ccivil_03/_Ato2007-2010/2008/Msg/VEP-508-08.htm), Presidência da República (Portal da Legislação). Onde olhar: Primeiro parágrafo e títulos dos dispositivos vetados. Sustenta: Veto parcial, por contrariedade ao interesse público, ao Projeto de Lei nº 59, de 2004 (nº 7.431/06 na Câmara dos Deputados): inciso I do art. 3º e art. 7º.
  - [Lei nº 11.738, de 16 de julho de 2008: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2008/lei-11738-16-julho-2008-578202-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A ficha aponta o PL 7431/2006 como origem.
  - [Dados Abertos da Câmara: autores da proposição 332750 (PL 7431/2006)](https://dadosabertos.camara.leg.br/api/v2/proposicoes/332750/autores), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos nome e tipo do primeiro autor. Sustenta: O autor registrado do projeto é o Senado Federal (senador Cristovam Buarque).
  - Documento oficial do ato: [Lei nº 11.738, de 16 de julho de 2008](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11738.htm)
- [ ] Conferido por: ______ em ____/____/______

### 29 de dezembro de 2009: Lei nº 12.187, de 29 de dezembro de 2009

- Identificador: `planalto-lei-12187-2009-mudanca-do-clima` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Meio ambiente · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (segundo mandato), Presidência da República (`lula-presidente-da-republica-2007-2011`)
- **Ato a conferir:** Veto parcial; Lei nº 12.187, de 29 de dezembro de 2009; Mensagem de veto: Mensagem nº 1.123, de 29 de dezembro de 2009; Dispositivos vetados: Inciso VI do art. 3º; Inciso III do art. 4º; Art. 10
- **Proposição a conferir** (`camara-pl-18-2007`): PL 18/2007, Câmara dos Deputados: Dispõe sobre a obrigatoriedade da adoção de medidas por parte do Poder Público, objetivando a redução das emissões dos gases responsáveis pelo efeito estufa.
- Fontes:
  - [Lei nº 12.187, de 29 de dezembro de 2009](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12187.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, ementa, fórmula de sanção e fecho. Sustenta: Lei de 29 de dezembro de 2009, que institui a Política Nacional sobre Mudança do Clima (PNMC); sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Mensagem nº 1.123, de 29 de dezembro de 2009 (veto parcial)](https://www.planalto.gov.br/ccivil_03/_Ato2007-2010/2009/Msg/VEP-1123-09.htm), Presidência da República (Portal da Legislação). Onde olhar: Primeiro parágrafo e títulos dos dispositivos vetados. Sustenta: Veto parcial, por contrariedade ao interesse público e inconstitucionalidade, ao Projeto de Lei nº 18, de 2007: inciso VI do art. 3º, inciso III do art. 4º e art. 10.
  - [Lei nº 12.187, de 29 de dezembro de 2009: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2009/lei-12187-29-dezembro-2009-599441-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A ficha aponta o PL 18/2007 como origem.
  - Documento oficial do ato: [Lei nº 12.187, de 29 de dezembro de 2009](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/lei/l12187.htm)
- [ ] Conferido por: ______ em ____/____/______

### 15 de janeiro de 2010: Autoria da Lei estadual 5.646/2010, sobre o Ano do Planejamento Familiar

- Identificador: `alerj-lei-5646-2010-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: Saúde · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 2760/2009, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Institui no calendário oficial do Estado do Rio de Janeiro o ano de 2010 como o Ano do Planejamento Familiar no Estado do Rio de Janeiro.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, sancionada pelo chefe do Executivo (Lei estadual nº 5.646, de 15 de janeiro de 2010, do Rio de Janeiro). Sancionada pelo governador Sérgio Cabral: o texto traz a fórmula "decreta e eu sanciono" e a assinatura. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 5646, de 2010, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2VmYzY5YTU0MDM4Y2ZkZTc4MzI1NzZiZTAwNjMyZGUzP09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (cabeçalho, ementa, fórmula de sanção e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 5646, de 15 de janeiro de 2010: ementa; sancionada pelo governador Sérgio Cabral; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 2760/2009; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 22 de dezembro de 2010: Lei nº 12.351, de 22 de dezembro de 2010

- Identificador: `planalto-lei-12351-2010-partilha-do-pre-sal` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Presidente da República (segundo mandato), Presidência da República (`lula-presidente-da-republica-2007-2011`)
- **Ato a conferir:** Veto parcial; Lei nº 12.351, de 22 de dezembro de 2010; Mensagem de veto: Mensagem nº 707, de 22 de dezembro de 2010; Dispositivos vetados: § 2º do art. 47; Art. 64
- **Proposição a conferir** (`camara-pl-5940-2009`): PL 5940/2009, Câmara dos Deputados: Cria o Fundo Social - FS, e dá outras providências.
- Fontes:
  - [Lei nº 12.351, de 22 de dezembro de 2010](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12351.htm), Presidência da República (Portal da Legislação). Onde olhar: Cabeçalho, início da ementa, fórmula de sanção e fecho. Sustenta: Lei de 22 de dezembro de 2010, sobre a exploração e a produção de petróleo e gás natural sob o regime de partilha de produção, em áreas do pré-sal e em áreas estratégicas; sancionada pelo presidente Luiz Inácio Lula da Silva.
  - [Mensagem nº 707, de 22 de dezembro de 2010 (veto parcial)](https://www.planalto.gov.br/ccivil_03/_Ato2007-2010/2010/Msg/VEP-707-10.htm), Presidência da República (Portal da Legislação). Onde olhar: Primeiro parágrafo e títulos dos dispositivos vetados. Sustenta: Veto parcial, por contrariedade ao interesse público, ao Projeto de Lei nº 5.940, de 2009: § 2º do art. 47 e art. 64.
  - [Lei nº 12.351, de 22 de dezembro de 2010: dados da norma](https://www2.camara.leg.br/legin/fed/lei/2010/lei-12351-22-dezembro-2010-609797-norma-pl.html), Câmara dos Deputados (Legislação Informatizada). Onde olhar: Campo Proposição Originária da ficha da norma. Sustenta: A ficha aponta o PL 5940/2009 como origem.
  - Documento oficial do ato: [Lei nº 12.351, de 22 de dezembro de 2010](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12351.htm)
- [ ] Conferido por: ______ em ____/____/______

### 4 de abril de 2011: Autoria da Lei estadual 5.938/2011, sobre exame psicológico em concursos públicos

- Identificador: `alerj-lei-5938-2011-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 2727/2009, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dispõe sobre o acesso do candidato aos motivos de sua reprovação em exame psicológico para cargo ou emprego na administração pública estadual e dá outras providências.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, promulgada pelo Legislativo (Lei estadual nº 5.938, de 4 de abril de 2011, do Rio de Janeiro). Promulgada pelo presidente da Assembleia Legislativa, deputado Paulo Melo, e não sancionada pelo governador. A página diz que a promulgação seguiu os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu. A página traz a nota de que a norma foi submetida a uma ação de inconstitucionalidade e não informa o resultado dela. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 5938, de 2011, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzVkYTc5ZWM0Y2NiNTJjNDc4MzI1Nzg2ODAwNzFhZjFmP09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (parágrafo de promulgação, cabeçalho, ementa e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 5938, de 4 de abril de 2011: ementa; promulgada pelo presidente da Alerj, deputado Paulo Melo; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 2727/2009; nota de que a norma foi submetida a ação de inconstitucionalidade; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 22 de maio de 2014: Autoria da Lei estadual 6.785/2014, sobre condenados por abuso sexual contra menor em cargos públicos

- Identificador: `alerj-lei-6785-2014-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 1876-A/2012, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dispõe sobre a impossibilidade de investidura em cargo público da administração pública direta, indireta, autarquias e fundações, no âmbito do Estado do Rio de Janeiro, ante a existência de condenação, com trânsito em julgado, pela prática de qualquer modalidade de abuso sexual contra menor (pedofilia).; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, sancionada pelo chefe do Executivo (Lei estadual nº 6.785, de 22 de maio de 2014, do Rio de Janeiro). Sancionada pelo governador Luiz Fernando de Souza: o texto traz a fórmula "decreta e eu sanciono" e a assinatura. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 6785, de 2014, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2E3N2FhM2Q2NDU0ZDZiNDg4MzI1N2NlMTAwNmE2OTQ1P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (cabeçalho, ementa, fórmula de sanção e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 6785, de 22 de maio de 2014: ementa; sancionada pelo governador Luiz Fernando de Souza; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 1876-A/2012; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 19 de maio de 2015: Autoria da Lei estadual 7.008/2015, sobre mensagens de texto de utilidade pública

- Identificador: `alerj-lei-7008-2015-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 2305-A/2013, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Dispõe sobre o envio de mensagens de texto, do tipo SMS, de utilidade pública, por prestadoras de serviços de telecomunicações, sem ônus para o poder público ou usuários, através de convênio celebrado entre as partes.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, promulgada pelo Legislativo (Lei estadual nº 7.008, de 19 de maio de 2015, do Rio de Janeiro). Promulgada pelo presidente da Assembleia Legislativa, deputado Jorge Picciani, e não sancionada pelo governador. A página diz que a promulgação seguiu os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 7008, de 2015, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2RiNGMzYmE4ZTc4NGRkMmM4MzI1N2U0YjAwNzA5YzY1P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (parágrafo de promulgação, cabeçalho, ementa e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 7008, de 19 de maio de 2015: ementa; promulgada pelo presidente da Alerj, deputado Jorge Picciani; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 2305-A/2013; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 2 de março de 2018: Autoria da Lei estadual 7.877/2018, sobre recifes artificiais

- Identificador: `alerj-lei-7877-2018-autoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Assembleia Legislativa do Estado do Rio de Janeiro · Temas: Meio ambiente · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Deputado estadual (quatro mandatos consecutivos), Assembleia Legislativa do Estado do Rio de Janeiro (Alerj) (`flavio-bolsonaro-deputado-estadual-2003-2019`)
- **Atuação a conferir:** Autoria de proposição; matéria: Projeto de Lei nº 1126/2015, da Assembleia Legislativa do Estado do Rio de Janeiro; ementa: Autoriza o poder público a criar o Programa Estadual de Criação de Recifes Artificiais – Programa “Costa Viva” e dá outras providências.; autoria da matéria: Flávio Bolsonaro, único nome no campo Autoria da ficha técnica da lei
- **Destino da matéria a conferir:** Virou lei, promulgada pelo Legislativo (Lei estadual nº 7.877, de 2 de março de 2018, do Rio de Janeiro). Promulgada pelo 2º vice-presidente da Assembleia Legislativa no exercício da Presidência, deputado André Ceciliano, e não sancionada pelo governador. A página diz que a promulgação seguiu os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu. A página da lei no acervo da Alerj traz a situação "Em Vigor". A ementa registrada é a da lei, como aparece na página dela: o texto do projeto, a tramitação e o efeito prático da lei não foram pesquisados.
- Fontes:
  - [Lei nº 7877, de 2018, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2Q1ZThiYmU5ODJiNjVmY2M4MzI1ODI0ODAwNTdhN2FmP09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Texto da lei (parágrafo de promulgação, cabeçalho, ementa e assinatura) e ficha técnica (projeto de origem, autoria e situação). Sustenta: Lei nº 7877, de 2 de março de 2018: ementa; promulgada pelo 2º vice-presidente da Alerj no exercício da Presidência, deputado André Ceciliano; autoria de Flávio Bolsonaro, pelo Projeto de Lei nº 1126/2015; situação "Em Vigor".
- [ ] Conferido por: ______ em ____/____/______

### 2019: Relatoria da Medida Provisória 866/2018, sobre a criação da NAV Brasil

- Identificador: `congresso-mpv-866-2018-relatoria` · Pessoa: Flávio Bolsonaro · Atuação legislativa · Congresso Nacional · Temas: Reforma do Estado · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11
- **Cargo a conferir:** Senador (RJ), Senado Federal (`flavio-bolsonaro-senador-2019`)
- **Atuação a conferir:** Relatoria de proposição; matéria: Medida Provisória nº 866, de 2018 (MPV 866/2018); ementa: Autoriza a criação da empresa pública NAV Brasil Serviços de Navegação Aérea S.A.; autoria da matéria: Presidência da República
- **Destino da matéria a conferir:** A matéria gerou uma norma (Lei nº 13.903, de 19 de novembro de 2019). Ele foi o relator da medida na comissão mista do Congresso que a examinou. O acervo do Senado registra a situação "Transformada em norma jurídica" e a norma gerada. Esse desfecho é da matéria: os serviços consultados não dizem se o parecer do relator foi aprovado. A matéria não é de autoria dele, e o texto da lei não foi lido.
- **Divergência a conferir:** A data de início da relatoria varia entre os serviços do Senado: o cadastro de cargos registra 27 de março de 2019, e o serviço de relatorias, a designação em 4 de abril de 2019. O atlas registra o ano, em que os dois concordam.
- Fontes:
  - [Dados Abertos do Senado: cargos do senador Flávio Bolsonaro](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), Senado Federal. Onde olhar: Cargos.Cargo[], item da comissão CMMPV 866/2018. Sustenta: Cargo de relator na Comissão Mista da Medida Provisória nº 866, de 2018, com início em 27 de março de 2019.
  - [Dados Abertos do Senado: matérias de relatoria do senador de código 5894](https://legis.senado.leg.br/dadosabertos/senador/5894/relatorias), Senado Federal, Dados Abertos Legislativos. Onde olhar: Relatorias.Relatoria[], item MPV 866/2018. Sustenta: Designação como relator da MPV 866/2018 em 4 de abril de 2019.
  - [Dados Abertos do Senado: processo legislativo da MPV 866/2018](https://legis.senado.leg.br/dadosabertos/processo/7708078), Senado Federal, Dados Abertos Legislativos. Onde olhar: Campos conteudo.ementa, autoria, situacaoAtual e normaGerada. Sustenta: Ementa da medida; autoria da Presidência da República; situação "Transformada em norma jurídica"; norma gerada: Lei nº 13.903, de 19 de novembro de 2019.
- [ ] Conferido por: ______ em ____/____/______

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
  - [Lei Complementar nº 200, de 30 de agosto de 2023](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp200.htm), Presidência da República. Onde olhar: Cabeçalho, com as indicações "Mensagem de veto" e "Promulgação partes vetadas", ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei complementar sancionada em 30 de agosto de 2023 com veto parcial; institui o regime fiscal sustentável e altera a Lei de Responsabilidade Fiscal; a página marca dois dispositivos como vetados e traz a promulgação de parte vetada.
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
  - [Lei nº 14.843, de 11 de abril de 2024](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14843.htm), Presidência da República. Onde olhar: Cabeçalho, com as indicações "Mensagem de veto" e "Promulgação partes vetadas", dispositivos marcados (VETADO) e fecho. Sustenta: Lei sancionada em 11 de abril de 2024 com veto parcial: a página marca como vetados os incisos I e III do art. 122 da Lei de Execução Penal e o inciso I do art. 3º, e traz a promulgação das partes vetadas em 12 de junho de 2024, assinada pelo vice-presidente no exercício do cargo.
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
  - [Lei Complementar nº 214, de 16 de janeiro de 2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm), Presidência da República. Onde olhar: Cabeçalho, com as indicações "Mensagem de veto" e "Promulgação partes vetadas", ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei complementar sancionada em 16 de janeiro de 2025 com veto parcial; institui o IBS, a CBS e o Imposto Seletivo e cria o Comitê Gestor do IBS.
  - [Mensagem nº 88, de 16 de janeiro de 2025 (veto parcial ao Projeto de Lei Complementar nº 68, de 2024)](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2025/Msg/Vep/VEP-88-25.htm), Presidência da República. Onde olhar: Lista de dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 88 relaciona os dispositivos do Projeto de Lei Complementar nº 68/2024 vetados, a começar pelos incisos V e X do caput do art. 26.
  - Documento oficial do ato: [Lei Complementar nº 214, de 16 de janeiro de 2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp214.htm)
- [ ] Conferido por: ______ em ____/____/______

### 26 de novembro de 2025: Lei nº 15.270, de 26 de novembro de 2025

- Identificador: `planalto-lei-15270-2025-imposto-de-renda` · Pessoa: Lula · Ato do Executivo · Presidência da República · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10
- **Cargo a conferir:** Presidente da República (terceiro mandato), Presidência da República (`lula-presidente-da-republica-2023`)
- **Ato a conferir:** Sanção expressa; Lei nº 15.270, de 26 de novembro de 2025
- **Proposição a conferir** (`senado-pl-1087-2025`): PL 1087/2025, Senado Federal: Altera as Leis nºs 9.250, de 26 de dezembro de 1995, e 9.249, de 26 de dezembro de 1995, para instituir a redução do imposto sobre a renda devido nas bases de cálculo mensal e anual e a tributação mínima para as pessoas físicas que auferem altas rendas; e dá outras providências.
- Fontes:
  - [Lei nº 15.270, de 26 de novembro de 2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15270.htm), Presidência da República. Onde olhar: Cabeçalho, sem indicação de mensagem de veto, art. 1º, tabela de redução e fecho. Sustenta: Lei sancionada em 26 de novembro de 2025, sem dispositivo marcado como vetado na página; altera as Leis nºs 9.250 e 9.249 para instituir a redução do imposto sobre a renda, com imposto zero até R$ 5.000,00 mensais, e a tributação mínima de altas rendas.
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
  - [Lei nº 15.358, de 24 de março de 2026](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Lei/L15358.htm), Presidência da República. Onde olhar: Cabeçalho, com a indicação "Mensagem de veto", ementa, dispositivos marcados (VETADO) e fecho. Sustenta: Lei sancionada em 24 de março de 2026 com veto parcial; institui o Marco Legal do Combate ao Crime Organizado e marca três dispositivos como vetados.
  - [Mensagem nº 216, de 24 de março de 2026 (veto parcial ao Projeto de Lei nº 5.582, de 2025)](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Msg/Vep/VEP-216-26.htm), Presidência da República. Onde olhar: Dispositivos vetados e razões do veto. Sustenta: A Mensagem nº 216 veta o § 3º do art. 2º, o art. 33 na parte que altera o inciso II do caput do art. 91 do Código Penal e o art. 43 do projeto.
  - Documento oficial do ato: [Lei nº 15.358, de 24 de março de 2026](https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2026/Lei/L15358.htm)
- [ ] Conferido por: ______ em ____/____/______

### Proposição: MPV 132/2003, Câmara dos Deputados

- Identificador: `camara-mpv-132-2003` · Temas: nenhum · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Cria o programa Bolsa Família e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição MPV 132/2003](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=MPV&numero=132&ano=2003), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 138604 no acervo da Câmara; MPV 132/2003; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: MPV 213/2004, Câmara dos Deputados

- Identificador: `camara-mpv-213-2004` · Temas: Educação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Institui o Programa Universidade para Todos - PROUNI, regula a atuação de entidades beneficentes de assistência social no ensino superior, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição MPV 213/2004](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=MPV&numero=213&ano=2004), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 264231 no acervo da Câmara; MPV 213/2004; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PEC 40/2003, Câmara dos Deputados

- Identificador: `camara-pec-40-2003` · Temas: Reforma do Estado · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Modifica os arts. 37, 40, 42, 48, 96, 142 e 149 da Constituição Federal, o art. 8º da Emenda Constitucional nº 20, de 15 de dezembro de 1998, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PEC 40/2003](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PEC&numero=40&ano=2003), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 113716 no acervo da Câmara; PEC 40/2003; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 1555/2003, Câmara dos Deputados

- Identificador: `camara-pl-1555-2003` · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Dispõe sobre registro, posse e comercialização de armas de fogo e munição, sobre o Sistema Nacional de Armas - SINARM, define crimes e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PL 1555/2003](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=1555&ano=2003), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 125878 no acervo da Câmara; PL 1555/2003; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 18/2007, Câmara dos Deputados

- Identificador: `camara-pl-18-2007` · Temas: Meio ambiente · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Dispõe sobre a obrigatoriedade da adoção de medidas por parte do Poder Público, objetivando a redução das emissões dos gases responsáveis pelo efeito estufa.
- Fontes:
  - [Dados Abertos da Câmara: proposição PL 18/2007](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=18&ano=2007), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 339977 no acervo da Câmara; PL 18/2007; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 4559/2004, Câmara dos Deputados

- Identificador: `camara-pl-4559-2004` · Temas: Direitos das mulheres, Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Cria mecanismos para coibir a violência doméstica e familiar contra a mulher, nos termos do § 8º do art. 226 da Constituição Federal, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PL 4559/2004](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=4559&ano=2004), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 272058 no acervo da Câmara; PL 4559/2004; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 5940/2009, Câmara dos Deputados

- Identificador: `camara-pl-5940-2009` · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Cria o Fundo Social - FS, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PL 5940/2009](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=5940&ano=2009), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 447936 no acervo da Câmara; PL 5940/2009; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 7431/2006, Câmara dos Deputados

- Identificador: `camara-pl-7431-2006` · Temas: Educação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 na resposta do serviço de dados abertos da Câmara dos Deputados, com assistência de IA: identificador, tipo, número, ano e ementa. A ementa registrada é a original da proposição; o serviço traz também as ementas das redações posteriores. O tema é classificação editorial pela ementa. Revisão humana pendente.
- **Ementa a conferir:** Autoriza o Poder Executivo a instituir o Piso Salarial Profissional dos Educadores Públicos, na forma prevista no art. 206, V, e 212 da Constituição Federal, e dá outras providências.
- Fontes:
  - [Dados Abertos da Câmara: proposição PL 7431/2006](https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=7431&ano=2006), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos id, siglaTipo, numero, ano e ementa. Sustenta: Identificador 332750 no acervo da Câmara; PL 7431/2006; ementa.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PEC 45/2019, Senado Federal

- Identificador: `senado-pec-45-2019` · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (política fiscal e tributária). Revisão humana pendente.
- **Ementa a conferir:** Altera o Sistema Tributário Nacional.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 8 de novembro de 2023 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-11-08&dataFim=2023-11-08), Senado Federal. Onde olhar: item com codigoSessaoVotacao=6773. Sustenta: identificacao: PEC 45/2019; ementa: Altera o Sistema Tributário Nacional.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PEC 45/2023, Senado Federal

- Identificador: `senado-pec-45-2023` · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (direito penal, execução penal e segurança pública). Revisão humana pendente.
- **Ementa a conferir:** Altera o art. 5º da Constituição Federal, para prever como mandado de criminalização a posse e o porte de entorpecentes e drogas afins sem autorização ou em desacordo com determinação legal ou regulamentar.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 16 de abril de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-04-16&dataFim=2024-04-16), Senado Federal. Onde olhar: item com codigoSessaoVotacao=6824. Sustenta: identificacao: PEC 45/2023; ementa: Altera o art. 5º da Constituição Federal, para prever como mandado de criminalização a posse e o porte de entorpecentes e drogas afins sem autorização ou em desacordo com determinação legal ou regulamentar.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 1087/2025, Senado Federal

- Identificador: `senado-pl-1087-2025` · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Ficha da matéria lida no webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC). O webservice de votações nominais não traz votação deste projeto com registro do senador 5894: não há registro individual a importar. Tema classificado pela ementa (imposto de renda). Revisão humana pendente.
- **Ementa a conferir:** Altera as Leis nºs 9.250, de 26 de dezembro de 1995, e 9.249, de 26 de dezembro de 1995, para instituir a redução do imposto sobre a renda devido nas bases de cálculo mensal e anual e a tributação mínima para as pessoas físicas que auferem altas rendas; e dá outras providências.
- Fontes:
  - [Dados Abertos do Senado Federal: ficha da matéria PL 1087/2025](https://legis.senado.leg.br/dadosabertos/materia/PL/1087/2025), Senado Federal. Onde olhar: Campos IdentificacaoMateria, DadosBasicosMateria, SituacaoAtual e NormaGerada. Sustenta: PL 1087/2025, de origem na Câmara dos Deputados, apresentado ao Senado em 7 de outubro de 2025; aprovado pelo Plenário em 5 de novembro de 2025 e remetido à sanção; norma gerada: Lei nº 15.270, de 26 de novembro de 2025.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 2253/2022, Senado Federal

- Identificador: `senado-pl-2253-2022` · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (direito penal, execução penal e segurança pública). Revisão humana pendente.
- **Ementa a conferir:** Altera a Lei nº 7.210, de 11 de julho de 1984 (Lei de Execução Penal), para dispor sobre a monitoração eletrônica do preso, prever a realização de exame criminológico para progressão de regime e extinguir o benefício da saída temporária.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 20 de fevereiro de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-02-20&dataFim=2024-02-20), Senado Federal. Onde olhar: item com codigoSessaoVotacao=6818. Sustenta: identificacao: PL 2253/2022; ementa: Altera a Lei nº 7.210, de 11 de julho de 1984 (Lei de Execução Penal), para dispor sobre a monitoração eletrônica do preso, prever a realização de exame criminológico para progressão de regime e extinguir o benefício da saída temporária.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PL 5582/2025, Senado Federal

- Identificador: `senado-pl-5582-2025` · Temas: Segurança pública · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (direito penal, execução penal e segurança pública). Revisão humana pendente.
- **Ementa a conferir:** Institui o marco legal do combate ao crime organizado no Brasil; tipifica os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado; e altera os Decretos-Leis nºs 2.848, de 7 de dezembro de 1940 (Código Penal), e 3.689, de 3 de outubro de 1941 (Código de Processo Penal), e as Leis nºs 8.072, de 25 de julho de 1990 (Lei dos Crimes Hediondos), 7.210, de 11 de julho de 1984 (Lei de Execução Penal), 11.343, de 23 de agosto de 2006, 10.826, de 22 de dezembro de 2003, 9.613, de 3 de março de 1998, e 4.737, de 15 de julho de 1965 (Código Eleitoral).
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 10 de dezembro de 2025 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2025-12-10&dataFim=2025-12-10), Senado Federal. Onde olhar: item com codigoSessaoVotacao=7037. Sustenta: identificacao: PL 5582/2025; ementa: Institui o marco legal do combate ao crime organizado no Brasil; tipifica os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado; e altera os Decretos-Leis nºs 2.848, de 7 de dezembro de 1940 (Código Penal), e 3.689, de 3 de outubro de 1941 (Código de Processo Penal), e as Leis nºs 8.072, de 25 de julho de 1990 (Lei dos Crimes Hediondos), 7.210, de 11 de julho de 1984 (Lei de Execução Penal), 11.343, de 23 de agosto de 2006, 10.826, de 22 de dezembro de 2003, 9.613, de 3 de março de 1998, e 4.737, de 15 de julho de 1965 (Código Eleitoral).
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PLP 68/2024, Senado Federal

- Identificador: `senado-plp-68-2024` · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (política fiscal e tributária). Revisão humana pendente.
- **Ementa a conferir:** Institui o Imposto sobre Bens e Serviços (IBS), a Contribuição Social sobre Bens e Serviços (CBS) e o Imposto Seletivo (IS); e dá outras providências.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 12 de dezembro de 2024 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2024-12-12&dataFim=2024-12-12), Senado Federal. Onde olhar: item com codigoSessaoVotacao=6899. Sustenta: identificacao: PLP 68/2024; ementa: Institui o Imposto sobre Bens e Serviços (IBS), a Contribuição Social sobre Bens e Serviços (CBS) e o Imposto Seletivo (IS); e dá outras providências.
- [ ] Conferido por: ______ em ____/____/______

### Proposição: PLP 93/2023, Senado Federal

- Identificador: `senado-plp-93-2023` · Temas: Economia · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-10; observações: Importado do webservice de dados abertos do Senado em 11 de outubro de 2026 (UTC); identificação, número, ano e ementa conferidos na resposta do acervo. O tema é classificação editorial pela ementa (política fiscal e tributária). Revisão humana pendente.
- **Ementa a conferir:** Institui regime fiscal sustentável para garantir a estabilidade macroeconômica do País e criar as condições adequadas ao crescimento socioeconômico, com fundamento no art. 6º da Emenda Constitucional nº 126, de 21 de dezembro de 2022, e no inciso VIII do caput e no parágrafo único do art. 163 da Constituição Federal; e altera a Lei Complementar nº 101, de 4 de maio de 2000 (Lei de Responsabilidade Fiscal), e a Lei nº 10.633, de 27 de dezembro de 2002.
- Fontes:
  - [Dados Abertos do Senado Federal: votações nominais do Plenário de 21 de junho de 2023 com registro do senador 5894](https://legis.senado.leg.br/dadosabertos/votacao?codigoParlamentar=5894&dataInicio=2023-06-21&dataFim=2023-06-21), Senado Federal. Onde olhar: item com codigoSessaoVotacao=6714. Sustenta: identificacao: PLP 93/2023; ementa: Institui regime fiscal sustentável para garantir a estabilidade macroeconômica do País e criar as condições adequadas ao crescimento socioeconômico, com fundamento no art. 6º da Emenda Constitucional nº 126, de 21 de dezembro de 2022, e no inciso VIII do caput e no parágrafo único do art. 163 da Constituição Federal; e altera a Lei Complementar nº 101, de 4 de maio de 2000 (Lei de Responsabilidade Fiscal), e a Lei nº 10.633, de 27 de dezembro de 2002.
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

### Cobertura da pesquisa: Flávio Bolsonaro, todos os temas, 2003 a 2018

- Identificador: `cobertura-flavio-bolsonaro-geral-2003-2018` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Declaração da pesquisa feita para a amostra de leis estaduais da edição 0.3.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: oito leis estaduais de autoria individual, duas por legislatura, pela regra fixa "entre as leis conferidas, a de menor número do primeiro e do último ano de cada legislatura com lei conferida", sem olhar o assunto da lei. A lista das conferidas, as que ficaram de fora e o motivo estão em research/trilha-2026-10.md.
- Acervo: [Portal da Alerj, Processo Legislativo: leis estaduais (base CONTLEI), busca por texto e visão por autor](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53), consultado em 2026-10-11; recorte: Busca por "bolsonaro" nas leis ordinárias e complementares; 25 páginas de lei abertas e conferidas (texto, ato e autoria); 27 leis vistas só na lista da busca, sem abrir a página; consulta incompleta.
- Acervo: [Portal da Alerj: cadastro de proposições por legislatura e ficha do deputado](https://www.alerj.rj.gov.br/Deputados/PerfilDeputado/275), consultado em 2026-10-11; recorte: Listas de proposições do deputado nas legislaturas de 2003 a 2019 e ficha do deputado; a base respondeu devagar e com falhas nas visões paginadas; consulta incompleta.
- Lacuna declarada: As leis de que ele é coautor não entraram na amostra.
- Lacuna declarada: Vinte e sete leis da lista da busca não tiveram a página aberta.
- Lacuna declarada: Os projetos que não viraram lei não foram contados nem registrados.
- Lacuna declarada: Os votos dele no Plenário e nas comissões da Alerj não foram pesquisados.
- Lacuna declarada: A composição das comissões da Alerj e as datas em que ele as integrou ou presidiu não foram localizadas em ato oficial.
- Lacuna declarada: A tramitação dos projetos que viraram lei (pareceres, votações e vetos) não foi pesquisada: quando a lei foi promulgada pela Assembleia, a página cita os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu.
- [ ] Conferido por: ______ em ____/____/______

### Cobertura da pesquisa: Flávio Bolsonaro, todos os temas, 1º de fevereiro de 2019 a 8 de outubro de 2026

- Identificador: `cobertura-flavio-bolsonaro-geral-2019-2026` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Declaração da pesquisa feita para a amostra de atuação legislativa no Senado da edição 0.3.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: uma relatoria, a de designação mais antiga entre as seis conferidas cuja matéria gerou norma, sem olhar o assunto da matéria. A relatoria do Projeto de Lei nº 2.253, de 2022, já estava no atlas como acontecimento. A lista das conferidas e o motivo estão em research/trilha-2026-10.md.
- Acervo: [Dados Abertos do Senado Federal: matérias de relatoria por parlamentar](https://legis.senado.leg.br/dadosabertos/senador/5894/relatorias), consultado em 2026-10-11; recorte: codigoParlamentar=5894: 166 designações na resposta; seis conferidas com a matéria e o destino dela, em comissões e anos diferentes; consulta incompleta.
- Acervo: [Dados Abertos do Senado Federal: cargos por parlamentar](https://legis.senado.leg.br/dadosabertos/senador/5894/cargos), consultado em 2026-10-11; recorte: codigoParlamentar=5894: cargos lidos; os de direção já eram mandatos publicados, e os demais não foram registrados um a um; consulta incompleta.
- Lacuna declarada: As demais relatorias dele no Senado e no Congresso não foram registradas: o serviço lista 166 designações.
- Lacuna declarada: O resultado do parecer do relator não está nos serviços consultados: os pareceres e as atas das comissões não foram baixados.
- Lacuna declarada: As matérias de que ele é autor ou coautor no Senado não foram registradas nesta edição.
- Lacuna declarada: As comissões de que ele participou no Senado foram lidas e não têm registro próprio.
- Lacuna declarada: Os votos dele de 2019 a 2022 não foram pesquisados; os de 2023 à data de corte têm declaração própria, por tema.
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

### Cobertura da pesquisa: Lula, todos os temas, 1º de janeiro de 2003 a 1º de janeiro de 2011

- Identificador: `cobertura-lula-geral-2003-2010` · Estado: parcial · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Declaração da pesquisa feita para a amostra de atos de 2003 a 2010 da edição 0.3.0, com assistência de IA. Revisão humana pendente.
- **Critérios a conferir:** Amostra, e não histórico completo: onze atos dos dois primeiros mandatos, escolhidos entre os trinta conferidos para que cada um dos sete temas da comparação tenha ao menos um ato de alcance nacional quando a pesquisa encontrou um, com tipos de ato diferentes (medida provisória, sanção, sanção com veto parcial, decreto e iniciativa de emenda à Constituição), sem olhar se o ato favorece ou prejudica alguém. A lista dos conferidos e dos que ficaram de fora está em research/trilha-2026-10.md; a escolha entre atos do mesmo tema não ficou escrita quando foi feita.
- Acervo: [Portal da Legislação (Planalto): páginas dos atos e das mensagens de veto](https://www.planalto.gov.br/ccivil_03/), consultado em 2026-10-11; recorte: 30 atos abertos e conferidos (20 leis, 7 medidas provisórias, 2 decretos e 1 emenda constitucional), a partir de uma lista de pistas por tema; não é varredura dos atos do período; consulta incompleta.
- Acervo: [Dados Abertos da Câmara dos Deputados: proposições e autores; fichas da norma (Legislação Informatizada)](https://dadosabertos.camara.leg.br/api/v2/proposicoes), consultado em 2026-10-11; recorte: Proposição de origem e autor registrado de cada ato conferido; consulta incompleta.
- Lacuna declarada: Os atos do período não foram varridos: a pesquisa partiu de uma lista de pistas, e atos fora dela não foram procurados.
- Lacuna declarada: Em Saúde, a amostra tem só o decreto que institui o programa Farmácia Popular do Brasil; a lei que ele regulamenta (Lei nº 10.858, de 2004) e a medida provisória que deu origem a ela (nº 154, de 2003) foram lidas na pesquisa e não têm registro próprio nem trecho guardado nas evidências.
- Lacuna declarada: O resultado da apreciação dos vetos pelo Congresso não foi pesquisado.
- Lacuna declarada: As razões dos vetos não foram transcritas.
- Lacuna declarada: Os votos e as proposições de Lula como deputado federal constituinte, de 1987 a 1991, não foram pesquisados.
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

## 7. Propostas eleitorais registradas no TSE (42 propostas)

Cada texto resume um trecho do documento que a candidatura registrou no Tribunal Superior Eleitoral. Proposta é o que o documento diz que pretende fazer: não é ato, não é voto e não é resultado. Conferir, em cada uma: se o resumo diz só o que a página citada diz, sem verbo de promessa cumprida e sem adjetivo; se o resumo não acrescenta número, prazo ou valor que o trecho não traz, e se as marcas de distância ('o que chama de', 'descrita como') e a menção a um segundo trecho do documento seguem a mesma régua nas duas candidaturas; e se a escolha das três propostas por área, que é decisão editorial, deixou de fora algo que mude o sentido da área. As duas pessoas têm o mesmo número de propostas por área, de propósito.

### Flávio Bolsonaro · Economia · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-economia-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe rever e redimensionar a reforma tributária em curso e o que chama de majoração de impostos do atual governo, para reduzir a carga sobre a produção e o consumo.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 30, capítulo Brasil Mais Barato, seção Menos imposto no que você consome. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Economia · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-economia-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe reformular as regras fiscais atuais, com foco na estabilização e na redução da dívida pública.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 71, capítulo Brasil que Não Volta Atrás, seção Contas em ordem para juros e inflação menores (a seção começa na página 70). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Economia · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-economia-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento fixa a meta de crescimento sustentado de 4% ao ano ao longo da próxima década.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 49, capítulo Brasil que Cresce, texto de abertura. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Segurança pública · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-seguranca-publica-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe declarar PCC, CV, milícias e as demais facções como organizações narcoterroristas.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 13, capítulo Brasil sem Medo, seção Terrorista vai ser tratado como terrorista. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Segurança pública · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-seguranca-publica-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe apoiar e sancionar a redução da maioridade penal de 18 para 16 anos.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 13, capítulo Brasil sem Medo, seção O crime do menor não é menor. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Segurança pública · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-seguranca-publica-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe cinco novos presídios de segurança máxima, no modelo adotado por El Salvador.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 14, capítulo Brasil sem Medo, seção Mais presídios, menos bandidos soltos. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Saúde · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-saude-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe garantir as condições para a correção efetiva da tabela SUS.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 37, capítulo Brasil que Prepara, seção Saúde que cuida antes de a doença chegar. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Saúde · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-saude-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe implantar o prontuário eletrônico único, vinculado ao CPF e integrado ao Gov.br, interoperável entre as redes pública e privada, observados o consentimento do paciente, a LGPD, o sigilo médico e os protocolos de segurança.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 26, capítulo Brasil sem Fila, seção Saúde digital e prontuário eletrônico único (a seção começa na página 25). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Saúde · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-saude-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe contratar serviços e exames na rede privada nos horários ociosos.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 37, capítulo Brasil que Prepara, seção Saúde que cuida antes de a doença chegar. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Educação · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-educacao-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe priorizar o método fônico na alfabetização.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 35, capítulo Brasil que Prepara, seção Ensinar de verdade (a seção começa na página 34). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Educação · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-educacao-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe ampliar as Escolas Cívico-Militares e garantir atendimento ao aluno com altas habilidades, tirando do papel a política nacional sobre o tema.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 35, capítulo Brasil que Prepara, seção Ensinar de verdade. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Educação · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-educacao-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe um voucher educacional para a família matricular o filho em outra escola onde faltar vaga na rede pública.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 36, capítulo Brasil que Prepara, seção Ensinar de verdade. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Reforma do Estado · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-reforma-do-estado-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe dar continuidade à reforma administrativa, para modernizar o funcionamento do Estado e a carreira do servidor.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 69, capítulo Brasil que Não Volta Atrás, seção Enxugar a Máquina e Profissionalizar a Gestão Pública. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Reforma do Estado · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-reforma-do-estado-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe cortar no mínimo dez ministérios, reduzir cargos comissionados e despesas administrativas e combater o que chama de penduricalhos e supersalários.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 69, capítulo Brasil que Não Volta Atrás, seção Enxugar a Máquina e Profissionalizar a Gestão Pública. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Reforma do Estado · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-reforma-do-estado-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe retomar o Programa Nacional de Desestatização, com avaliação caso a caso.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 70, capítulo Brasil que Não Volta Atrás, seção Enxugar a Máquina e Profissionalizar a Gestão Pública (a seção começa na página 69). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Meio ambiente · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-meio-ambiente-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento fixa a meta de zerar o desmatamento ilegal até 2029 e propõe combater as queimadas ilegais, com mais prevenção, monitoramento e fiscalização.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 58, capítulo Brasil que Cresce, seção Meio ambiente: o ativo verde do Brasil (a seção começa na página 57). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Meio ambiente · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-meio-ambiente-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe consolidar o mercado regulado de carbono, com segurança jurídica, e impulsionar a bioeconomia.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 57, capítulo Brasil que Cresce, seção Meio ambiente: o ativo verde do Brasil. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Meio ambiente · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-meio-ambiente-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe criar mecanismos de incentivo econômico à preservação e ampliar o pagamento por serviços ambientais.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 57, capítulo Brasil que Cresce, seção Meio ambiente: o ativo verde do Brasil. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe monitorar com tornozeleira eletrônica os agressores de mulheres com medida protetiva; em outro trecho, na página 19, fala nos agressores sob medida protetiva de maior risco.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 14, capítulo Brasil sem Medo, seção Tolerância zero para o feminicídio; o outro trecho está na página 19, capítulo Brasil por Elas, seção Denúncia facilitada (a seção começa na página 18). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe a Central da Mulher, descrita como um espaço físico onde a mulher resolve a vida sem perder tempo nem percorrer a cidade inteira.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 17, capítulo Brasil por Elas, seção Central da Mulher. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe um voucher-creche para acesso à rede privada credenciada onde não houver vaga na rede pública, até a vaga pública surgir.
- Fontes:
  - [Diretrizes do Plano de Governo 2027-2030 (proposta de governo registrada no TSE pela candidatura de Flávio Bolsonaro em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017104726), Partido Liberal (candidatura de Flávio Bolsonaro à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 21, capítulo Brasil por Elas, seção Creche garantida para toda criança. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Economia · eleição de 2026

- Identificador: `proposta-lula-2026-economia-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe criar condições para uma redução sustentada das taxas de juros, com inflação controlada e política fiscal responsável, e manter o novo arcabouço fiscal.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 49, seção 8, Promover uma Economia Mais Sustentável, Produtiva e Digital, Para Todas e Todos, subseção Crescimento com Inclusão e Estabilidade. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Economia · eleição de 2026

- Identificador: `proposta-lula-2026-economia-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe elevar a taxa de investimento da economia e ampliar os investimentos em infraestrutura logística e em infraestrutura social.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 48, seção 8, Promover uma Economia Mais Sustentável, Produtiva e Digital, Para Todas e Todos, subseção Crescimento com Inclusão e Estabilidade. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Economia · eleição de 2026

- Identificador: `proposta-lula-2026-economia-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento põe como objetivo central do próximo ciclo de governo aprimorar e fortalecer o que chama de neoindustrialização.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 50, seção 8, Promover uma Economia Mais Sustentável, Produtiva e Digital, Para Todas e Todos, subseção Indústria ainda mais forte, inovadora e verde. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Segurança pública · eleição de 2026

- Identificador: `proposta-lula-2026-seguranca-publica-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe criar o Ministério da Segurança Pública depois de aprovada a PEC da Segurança Pública, proposta pelo Executivo.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 30, seção 3, Proteger a vida com uma segurança pública mais eficiente e integrada. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Segurança pública · eleição de 2026

- Identificador: `proposta-lula-2026-seguranca-publica-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe manter uma política de controle de armas e munições.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 28, seção 3, Proteger a vida com uma segurança pública mais eficiente e integrada. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Segurança pública · eleição de 2026

- Identificador: `proposta-lula-2026-seguranca-publica-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe fortalecer o Programa Brasil Contra o Crime Organizado e avançar, com estados e municípios, em: enfrentamento ao tráfico de armas, munições, acessórios e explosivos; asfixia financeira do crime organizado e das milícias; investigação de homicídios; retomada de territórios; segurança no sistema prisional.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 27, seção 3, Proteger a vida com uma segurança pública mais eficiente e integrada. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Saúde · eleição de 2026

- Identificador: `proposta-lula-2026-saude-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe impulsionar o programa Agora Tem Especialistas, com mais terceiro turno nos serviços de saúde, Carretas da Saúde e mutirões de atendimento.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 37, seção 5, Fortalecer a saúde com equidade, inovação e soberania. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Saúde · eleição de 2026

- Identificador: `proposta-lula-2026-saude-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe manter o programa Farmácia Popular 100% gratuito, com revisão contínua dos medicamentos ofertados e continuidade da distribuição de fraldas geriátricas.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 36, seção 5, Fortalecer a saúde com equidade, inovação e soberania. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Saúde · eleição de 2026

- Identificador: `proposta-lula-2026-saude-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe acelerar a consolidação do prontuário único do cidadão, por meio da Rede Nacional de Dados em Saúde.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 35, seção 5, Fortalecer a saúde com equidade, inovação e soberania. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Educação · eleição de 2026

- Identificador: `proposta-lula-2026-educacao-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe dar prioridade absoluta ao fomento à expansão da educação em tempo integral.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 31, seção 4, Garantir o Direito à Educação para Transformar Vidas e o País. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Educação · eleição de 2026

- Identificador: `proposta-lula-2026-educacao-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe seguir com as ações combinadas com estados e municípios para chegar à meta de 80% das crianças alfabetizadas na idade certa.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 31, seção 4, Garantir o Direito à Educação para Transformar Vidas e o País. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Educação · eleição de 2026

- Identificador: `proposta-lula-2026-educacao-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe dar continuidade ao programa Pé-de-Meia e fortalecê-lo.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 32, seção 4, Garantir o Direito à Educação para Transformar Vidas e o País. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Reforma do Estado · eleição de 2026

- Identificador: `proposta-lula-2026-reforma-do-estado-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe aprofundar a política de valorização e diálogo com os servidores públicos, a partir da Mesa Nacional de Negociação Permanente.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 16, seção 1, Fortalecer a Democracia, a Participação Social e Modernizar o Estado, subseção Gestão e Modernização do Estado. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Reforma do Estado · eleição de 2026

- Identificador: `proposta-lula-2026-reforma-do-estado-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe continuar investindo na universalização dos serviços públicos digitais e em infraestruturas públicas digitais.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 17, seção 1, Fortalecer a Democracia, a Participação Social e Modernizar o Estado, subseção Gestão e Modernização do Estado. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Reforma do Estado · eleição de 2026

- Identificador: `proposta-lula-2026-reforma-do-estado-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe dar sequência às medidas de controle e integridade da administração pública e ao combate à corrupção.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 18, seção 1, Fortalecer a Democracia, a Participação Social e Modernizar o Estado, subseção Gestão e Modernização do Estado. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Meio ambiente · eleição de 2026

- Identificador: `proposta-lula-2026-meio-ambiente-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento reafirma a meta de desmatamento líquido zero até 2030.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 70, seção 11, Promover a Sustentabilidade Ambiental e Climática. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Meio ambiente · eleição de 2026

- Identificador: `proposta-lula-2026-meio-ambiente-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe articular as políticas e mobilizar governo, setor privado e sociedade civil para cumprir a nova NDC, que descreve como a meta de reduzir de 59% a 67% as emissões líquidas de gases de efeito estufa até 2035, em relação a 2005.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 71, seção 11, Promover a Sustentabilidade Ambiental e Climática; a descrição da NDC está na página 69, no começo da mesma seção. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Meio ambiente · eleição de 2026

- Identificador: `proposta-lula-2026-meio-ambiente-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe avançar na destinação de terras públicas para unidades de conservação, territórios indígenas e quilombolas ou assentamentos, e reforçar a regularização fundiária.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 70, seção 11, Promover a Sustentabilidade Ambiental e Climática. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-lula-2026-direitos-das-mulheres-1` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe dar sequência ao Pacto de Enfrentamento ao Feminicídio e concluir 30 Casas da Mulher Brasileira e 15 Centros de Referência da Mulher Brasileira.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 21, seção 2, Combater as desigualdades (a seção começa na página 18). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-lula-2026-direitos-das-mulheres-2` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe avançar na equivalência de remuneração entre mulheres e homens, fortalecendo a aplicação da Lei de Igualdade Salarial.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 75, seção 12, Valorizar o Trabalho em suas Múltiplas Formas (a seção começa na página 73). Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Direitos das mulheres · eleição de 2026

- Identificador: `proposta-lula-2026-direitos-das-mulheres-3` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Conferido em 11 de outubro de 2026 no arquivo que a ficha da candidatura no DivulgaCandContas, do TSE, traz como proposta de governo, com assistência de IA: a frase foi localizada no texto do PDF, na página indicada, e o resumo foi escrito para não trocar o sentido dela. São três frases por área, escolhidas entre as que nomeiam uma medida; não é o documento inteiro, e a escolha é editorial. Os números que aparecem são afirmações do documento. O atlas não acrescenta número, prazo nem valor que a frase não traga, e não avalia se a frase é precisa: essa regra é a mesma para as duas candidaturas. O serviço do TSE não informa versão nem data de entrega do arquivo. Revisão humana pendente.
- **Texto a conferir:** O documento propõe fortalecer o planejamento reprodutivo, com mais acesso a métodos contraceptivos modernos e de longa duração, distribuídos gratuitamente no SUS.
- Fontes:
  - [Programa de Governo. Diretrizes para o Programa de Transformação do Brasil: um país soberano, democrático, desenvolvido, sustentável e criativo (proposta de governo registrada no TSE pela candidatura de Lula em 2026)](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/doc/280017016005), Coligação Brasil Pronto pra Mais (candidatura de Lula à Presidência em 2026); arquivo publicado pelo Tribunal Superior Eleitoral no DivulgaCandContas. Onde olhar: página 38, seção 5, Fortalecer a saúde com equidade, inovação e soberania. Sustenta: A frase do documento que o texto resume.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Lista de arquivos da ficha da candidatura, item de codTipo 5. Sustenta: O arquivo é o único documento do tipo proposta de governo na lista de arquivos da candidatura. A lista foi consultada em 11 de outubro de 2026, depois do acesso à ficha registrado nesta fonte.
- [ ] Conferido por: ______ em ____/____/______

## 8. Conteúdo educativo do jogo: fases, fatos biográficos e conceitos (24 fases, 14 fatos biográficos e 26 conceitos)

O texto de cada fase é explicação nova, escrita para quem conhece pouco de política. Conferir, em cada bloco: se ele diz só o que os registros apontados sustentam, se a simplificação não muda o sentido e se nenhum adjetivo entrou. Na atividade: se a pergunta só usa o que a explicação acabou de dizer, se a opção certa está certa e se as erradas não são certas por outro caminho. Nos episódios judiciais, a leitura curta precisa trazer juntos a acusação, a defesa, a decisão e o desfecho na data de corte. Nos fatos biográficos: datas, lugares e nomes contra o documento, e as divergências entre documentos. Nos conceitos: se a definição simples é fiel ao texto oficial citado e se o aviso de simplificação basta.

### Flávio Bolsonaro · Aprofundamento: Economia · Fase 1: Economia: três votos de Flávio Bolsonaro no Senado (2023 a 2026)

- Identificador: `flavio-bolsonaro-economia` · Marco: `decisao:senado-voto-6714-5894` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver como ele votou em três propostas de economia e o que cada uma era.
- **Explicação a conferir** (92 palavras):
  1. Em 21 de junho de 2023, o Senado votou o projeto de lei complementar que institui o regime fiscal sustentável. Flávio Bolsonaro votou não; o projeto foi aprovado. Aponta: `decisao:senado-voto-6714-5894`.
  2. Em novembro de 2023, votou não, em segundo turno, na PEC que altera o sistema tributário. Em dezembro de 2024, votou não no projeto de lei complementar que institui os tributos IBS, CBS e Imposto Seletivo. As duas propostas foram aprovadas. Aponta: `decisao:senado-voto-6777-5894`, `decisao:senado-voto-6899-5894`.
  3. Nos três casos, o registro mostra o voto dele naquele texto e o resultado da votação. Não diz, sozinho, o motivo do voto. Aponta: `decisao:senado-voto-6714-5894`.
- Conceitos definidos nesta fase: `lei-complementar`, `pec`
- **Pergunta a conferir:** Como Flávio Bolsonaro votou nas três propostas de economia que o atlas registra, de 2023 e 2024?
  - (certa) Votou não nas três, e as três foram aprovadas.
  - Votou sim nas três.
  - Não participou de nenhuma.
- **Explicação da resposta a conferir:** O acervo do Senado registra o voto "não" dele nas três votações, e as três propostas foram aprovadas: o regime fiscal, em junho de 2023; a PEC do sistema tributário, em novembro de 2023; e o projeto dos tributos IBS, CBS e Imposto Seletivo, em dezembro de 2024. Aponta: `decisao:senado-voto-6714-5894`, `decisao:senado-voto-6777-5894`, `decisao:senado-voto-6899-5894`.
- Para explorar no período (opcional no jogo): `proposta:proposta-flavio-bolsonaro-2026-economia-1`, `proposta:proposta-flavio-bolsonaro-2026-economia-2`, `proposta:proposta-flavio-bolsonaro-2026-economia-3`
- Lacuna declarada: Os votos dele em economia de 2019 a 2022 não foram pesquisados.
- Lacuna declarada: Os votos dele na Alerj, de 2003 a 2018, não foram pesquisados.
- Lacuna declarada: É uma amostra de três votações: não é a lista de como ele votou na área.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 1: Origem e formação (1981 a 2001)

- Identificador: `flavio-bolsonaro-origem` · Marco: `fato:flavio-bolsonaro-nascimento` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** saber onde Flávio Bolsonaro nasceu, de que família vem e o que estudou.
- **Explicação a conferir** (90 palavras):
  1. Flávio Bolsonaro nasceu em 30 de abril de 1981, em Resende, no estado do Rio de Janeiro. O nome completo dele é Flávio Nantes Bolsonaro. É o filho mais velho de Jair Bolsonaro; a mãe é Rogéria Bolsonaro. Aponta: `fato:flavio-bolsonaro-nascimento`.
  2. Estudou direito na Universidade Cândido Mendes, no Rio de Janeiro. Os documentos lidos não dizem em que ano se formou. Aponta: `fato:flavio-bolsonaro-formacao`.
  3. A ficha dele na Assembleia Legislativa registra um curso técnico em eletrônica e dois estágios: no Instituto Militar de Engenharia, em 1998, e na Defensoria Pública do estado, de 2000 a 2001. Aponta: `fato:flavio-bolsonaro-formacao`, `fato:flavio-bolsonaro-estagios`.
- **Pergunta a conferir:** Onde Flávio Bolsonaro fez estágio antes da primeira eleição, segundo a ficha dele na Assembleia Legislativa?
  - (certa) No Instituto Militar de Engenharia e na Defensoria Pública do estado.
  - No Senado Federal e no TSE.
  - Em um hospital e em uma escola.
- **Explicação da resposta a conferir:** A ficha dele na Alerj registra os dois estágios: no Instituto Militar de Engenharia, de março a dezembro de 1998, e na Defensoria Pública do Estado do Rio de Janeiro, de agosto de 2000 a outubro de 2001. Aponta: `fato:flavio-bolsonaro-estagios`.
- Lacuna declarada: A infância, a escola básica e a cidade em que ele cresceu: nenhum documento oficial lido traz.
- Lacuna declarada: O ano em que ele concluiu cada curso.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 2: A primeira eleição (2002 a 2003)

- Identificador: `flavio-bolsonaro-primeira-eleicao` · Marco: `acontecimento:flavio-bolsonaro-2002-eleito-deputado-estadual` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender o que faz um deputado estadual e como Flávio Bolsonaro chegou ao cargo.
- **Explicação a conferir** (95 palavras):
  1. Em 2002, Flávio Bolsonaro se candidatou a deputado estadual pelo Rio de Janeiro, pelo PPB. Nos dados do TSE sobre essa candidatura, a ocupação informada é a de estudante, bolsista ou estagiário. O pai, Jair Bolsonaro, concorreu a deputado federal na mesma eleição. Aponta: `fato:flavio-bolsonaro-registro-da-primeira-candidatura`.
  2. Em 6 de outubro de 2002, foi eleito. Tinha 21 anos na data da posse e começou o mandato em 2003, na Assembleia Legislativa do Estado do Rio de Janeiro, a Alerj. Aponta: `acontecimento:flavio-bolsonaro-2002-eleito-deputado-estadual`, `fato:flavio-bolsonaro-registro-da-primeira-candidatura`, `mandato:flavio-bolsonaro-deputado-estadual-2003-2019`.
  3. Em 2003, o PPB mudou de nome e passou a se chamar PP. Era o mesmo partido, com outro nome. Aponta: `fato:flavio-bolsonaro-partido-muda-de-nome`.
- Conceitos definidos nesta fase: `partido-politico`, `deputado-estadual`, `deputado-federal`
- **Pergunta a conferir:** O que faz a assembleia legislativa, onde trabalha um deputado estadual?
  - (certa) Faz, discute e aprova as leis do estado.
  - Julga os crimes cometidos no estado.
  - Escolhe o presidente da República.
- **Explicação da resposta a conferir:** A assembleia legislativa é o Poder Legislativo de cada estado: seus membros, os deputados estaduais, são eleitos pelo povo e fazem as leis estaduais. Flávio Bolsonaro foi eleito para a do Rio de Janeiro em 2002. Aponta: `conceito:deputado-estadual`, `acontecimento:flavio-bolsonaro-2002-eleito-deputado-estadual`.
- Para explorar no período (opcional no jogo): `filiacao:flavio-bolsonaro-ppb`, `filiacao:flavio-bolsonaro-pp`
- Lacuna declarada: O número de votos de 2002: esta edição não localizou documento oficial com o total já somado.
- Lacuna declarada: A data de filiação ao PPB.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 3: Na Alerj: como um projeto vira lei (2003 a 2010)

- Identificador: `flavio-bolsonaro-alerj-primeiros-mandatos` · Marco: `decisao:alerj-lei-4250-2003-autoria` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver, com exemplos, como um projeto de deputado vira lei estadual.
- **Explicação a conferir** (91 palavras):
  1. Uma das tarefas de um deputado é propor leis. O projeto é votado pela assembleia e, se aprovado, vai ao governador, que pode sancionar. Aponta: `conceito:projeto-de-lei`, `mandato:flavio-bolsonaro-deputado-estadual-2003-2019`.
  2. A lei mais antiga de autoria de Flávio Bolsonaro que o atlas registra é de 29 de dezembro de 2003: trata da não exigência de certidão negativa de entidades de proteção ao crédito para entrar no serviço público estadual. Em 2006, virou lei um projeto dele sobre laqueadura e vasectomia gratuitas na rede de saúde do estado. Aponta: `decisao:alerj-lei-4250-2003-autoria`, `decisao:alerj-lei-4916-2006-autoria`.
  3. Ele foi reeleito deputado estadual em 2006 e em 2010. Aponta: `acontecimento:flavio-bolsonaro-2006-reeleito-deputado-estadual`, `acontecimento:flavio-bolsonaro-2010-reeleito-deputado-estadual`.
- Conceitos definidos nesta fase: `projeto-de-lei`, `sancao`
- **Pergunta a conferir:** Depois que a assembleia aprova um projeto de lei, quem pode sancioná-lo para que vire lei estadual?
  - (certa) O governador do estado.
  - O presidente da República.
  - O próprio deputado que escreveu o projeto.
- **Explicação da resposta a conferir:** No estado, o projeto aprovado pela assembleia vai ao governador. A Lei 4.250, de 2003, traz as palavras "decreta e eu sanciono" e a assinatura da governadora. Aponta: `decisao:alerj-lei-4250-2003-autoria`, `conceito:projeto-de-lei`.
- Para explorar no período (opcional no jogo): `decisao:alerj-lei-5019-2007-autoria`, `decisao:alerj-lei-5646-2010-autoria`
- Lacuna declarada: O atlas registra oito leis de autoria individual dele, duas por legislatura, por regra fixa. O acervo da Alerj lista outras.
- Lacuna declarada: Os projetos que não viraram lei, os votos dele e as comissões de que participou na Alerj.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 4: Na Alerj: os últimos mandatos (2011 a 2018)

- Identificador: `flavio-bolsonaro-alerj-ultimos-mandatos` · Marco: `decisao:alerj-lei-5938-2011-autoria` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver que uma lei também pode nascer sem a sanção do governador e acompanhar os últimos anos dele na Alerj.
- **Explicação a conferir** (98 palavras):
  1. Nem toda lei é sancionada pelo governador. Em abril de 2011, uma lei de autoria de Flávio Bolsonaro, sobre o acesso do candidato aos motivos da reprovação em exame psicológico de concurso, virou lei por ato do presidente da Assembleia: é a promulgação. A página cita, como base, o artigo 115 da Constituição do Estado. Aponta: `decisao:alerj-lei-5938-2011-autoria`.
  2. Reeleito em 2014 pelo PP, ele concorreu em 2016 a prefeito do Rio de Janeiro, já pelo PSC. Não foi eleito e continuou deputado estadual. Aponta: `acontecimento:flavio-bolsonaro-2014-reeleito-deputado-estadual`, `acontecimento:flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio`.
  3. Em 2018, a Assembleia promulgou outra lei de autoria dele, que autoriza um programa estadual de recifes artificiais. Aponta: `decisao:alerj-lei-7877-2018-autoria`.
- **Pergunta a conferir:** O que aconteceu em 2016, quando Flávio Bolsonaro concorreu a prefeito do Rio de Janeiro?
  - (certa) Não foi eleito e continuou deputado estadual.
  - Foi eleito prefeito.
  - Desistiu antes da votação.
- **Explicação da resposta a conferir:** Em 2016, ele concorreu a prefeito do Rio de Janeiro pelo PSC e não foi eleito. Seguiu na Assembleia Legislativa até 2019. Aponta: `acontecimento:flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio`.
- Para explorar no período (opcional no jogo): `decisao:alerj-lei-6785-2014-autoria`, `decisao:alerj-lei-7008-2015-autoria`, `filiacao:flavio-bolsonaro-psc`, `filiacao:flavio-bolsonaro-psl`
- Lacuna declarada: Por que cada lei foi promulgada pela Assembleia, e não sancionada pelo governador: a página cita os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu, e a tramitação não foi pesquisada.
- Lacuna declarada: O resultado da ação de inconstitucionalidade a que a Lei 5.938 foi submetida.
- Lacuna declarada: As datas de entrada dele no PSC e no PSL.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 5: Do Rio de Janeiro para o Senado (2018 a 2019)

- Identificador: `flavio-bolsonaro-senado` · Marco: `acontecimento:flavio-bolsonaro-2018-eleito-senador` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender o que é um senador e como Flávio Bolsonaro chegou ao Senado.
- **Explicação a conferir** (91 palavras):
  1. Em 2018, Flávio Bolsonaro foi eleito senador pelo Rio de Janeiro, pelo PSL. Segundo a Agência Senado, foi o mais votado do estado para o cargo, com 31,3% dos votos válidos. Aponta: `acontecimento:flavio-bolsonaro-2018-eleito-senador`.
  2. O mandato começou em 1º de fevereiro de 2019 e vai até 31 de janeiro de 2027. Cinco dias depois do início do mandato, ele assumiu o cargo de 3º secretário da Comissão Diretora do Senado. Aponta: `acontecimento:flavio-bolsonaro-2018-eleito-senador`, `acontecimento:flavio-bolsonaro-2019-terceiro-secretario-do-senado`, `mandato:flavio-bolsonaro-senador-2019`.
  3. Ainda em 2019, foi relator de uma medida provisória que autoriza a criação de uma empresa pública de navegação aérea. A medida virou lei. Aponta: `decisao:congresso-mpv-866-2018-relatoria`.
- Conceitos definidos nesta fase: `senador`, `relator`, `medida-provisoria`
- **Pergunta a conferir:** Quanto tempo dura o mandato de um senador?
  - (certa) Oito anos.
  - Quatro anos.
  - Dois anos.
- **Explicação da resposta a conferir:** O mandato de senador dura oito anos, e cada estado tem três senadores. O de Flávio Bolsonaro começou em 1º de fevereiro de 2019 e vai até 31 de janeiro de 2027. Aponta: `conceito:senador`, `acontecimento:flavio-bolsonaro-2018-eleito-senador`.
- Para explorar no período (opcional no jogo): `mandato:flavio-bolsonaro-terceiro-secretario-do-senado`
- Lacuna declarada: O número de votos de 2018 não está no registro: o atlas traz o percentual informado pela Agência Senado.
- Lacuna declarada: As comissões de que ele participou no Senado foram lidas na pesquisa e não têm registro próprio nesta edição.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 6: Denúncia, anulação e rejeição (2019 a 2025)

- Identificador: `flavio-bolsonaro-processos` · Marco: `acontecimento:flavio-bolsonaro-2022-tribunal-rejeita-denuncia` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** acompanhar, na ordem, o que a Justiça decidiu sobre a denúncia contra Flávio Bolsonaro e entender o que é rejeitar uma denúncia.
- **Explicação a conferir** (96 palavras):
  1. Em outubro de 2020, o Ministério Público do Rio denunciou Flávio Bolsonaro e outras pessoas por lavagem de dinheiro, peculato, apropriação indébita e organização criminosa, em um suposto esquema de "rachadinha" na Assembleia. A defesa disse que a acusação não se sustentava. Aponta: `acontecimento:flavio-bolsonaro-2020-denuncia-do-ministerio-publico`.
  2. Em novembro de 2021, o STJ anulou as decisões do juiz do caso: só o Tribunal de Justiça poderia decidir. Aponta: `acontecimento:flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao`, `conceito:anulacao`.
  3. Em 2022, a pedido do próprio Ministério Público, o Tribunal de Justiça rejeitou a denúncia. Aponta: `acontecimento:flavio-bolsonaro-2022-tribunal-rejeita-denuncia`, `conceito:rejeicao-da-denuncia`.
  4. Segundo a CartaCapital, o Ministério Público recorreu, e um ministro do STF negou os recursos em fevereiro de 2025. Aponta: `acontecimento:flavio-bolsonaro-2022-tribunal-rejeita-denuncia`.
- Conceitos definidos nesta fase: `denuncia`, `anulacao`, `rejeicao-da-denuncia`
- **Ordenação a conferir:** Ponha em ordem, do mais antigo para o mais recente, três decisões e fatos do caso. Registros: `acontecimento:flavio-bolsonaro-2022-tribunal-rejeita-denuncia`, `acontecimento:flavio-bolsonaro-2020-denuncia-do-ministerio-publico`, `acontecimento:flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao`. A ordem certa é a das datas dos registros.
- **Explicação da resposta a conferir:** Primeiro veio a denúncia do Ministério Público, apresentada em outubro de 2020 e divulgada em 4 de novembro. Depois o STJ anulou as decisões do juiz do caso, em 2021. Por fim, em 2022, o Tribunal de Justiça rejeitou a denúncia; segundo a decisão, isso não impede a retomada das investigações. Rejeitar a denúncia não é condenar nem absolver: a acusação não chegou a ser julgada.
- Para explorar no período (opcional no jogo): `acontecimento:flavio-bolsonaro-2019-saida-do-psl`, `acontecimento:flavio-bolsonaro-2021-filiacao-ao-patriota`, `mandato:flavio-bolsonaro-lider-do-patriota-no-senado`, `acontecimento:flavio-bolsonaro-2021-filiacao-ao-pl`, `filiacao:flavio-bolsonaro-republicanos`
- Lacuna declarada: O que aconteceu no caso depois de fevereiro de 2025: o processo tramita em segredo de justiça, e o andamento depois de 2022 vem de reportagens citadas na ficha do atlas.
- Lacuna declarada: A data de filiação dele ao Republicanos.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 7: Líder, relator e presidente de comissão (2022 a 2025)

- Identificador: `flavio-bolsonaro-funcoes-no-senado` · Marco: `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender três funções que um senador pode ter: líder, relator e presidente de comissão.
- **Explicação a conferir** (100 palavras):
  1. Em 2022, Flávio Bolsonaro foi designado líder do PL no Senado. Em abril de 2023, com Lula na Presidência, tornou-se líder da Minoria no Congresso, até fevereiro de 2025. Aponta: `acontecimento:flavio-bolsonaro-2022-lider-do-pl-no-senado`, `acontecimento:flavio-bolsonaro-2023-lider-da-minoria-no-congresso`, `conceito:lider-e-minoria`.
  2. Em 2024, foi o relator do projeto que restringe as saídas temporárias de presos. O relator estuda o projeto e recomenda aprovar ou rejeitar. O Senado aprovou o texto em 20 de fevereiro. Segundo a Agência Senado, foram 62 votos a 2. O projeto virou lei; o presidente vetou uma parte, e o Congresso derrubou o veto. Aponta: `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias`, `conceito:relator`.
  3. Em fevereiro de 2025, passou a presidir a Comissão de Segurança Pública do Senado. Aponta: `acontecimento:flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica`, `conceito:comissao`.
- Conceitos definidos nesta fase: `lider-e-minoria`, `comissao`, `veto`, `relator`
- **Pergunta a conferir:** O que faz o relator de um projeto?
  - (certa) Estuda o projeto e recomenda que seja aprovado ou rejeitado.
  - Decide sozinho se o projeto vira lei.
  - Sanciona ou veta o projeto.
- **Explicação da resposta a conferir:** O relator estuda a proposta e escreve um parecer que recomenda a aprovação ou a rejeição. Ele não decide sozinho: o projeto das saídas temporárias, relatado por Flávio Bolsonaro, foi votado pelo Senado. Aponta: `conceito:relator`, `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias`.
- Para explorar no período (opcional no jogo): `mandato:flavio-bolsonaro-vice-lider-do-governo-no-congresso`, `mandato:flavio-bolsonaro-lider-do-pl-no-senado`, `mandato:flavio-bolsonaro-lider-da-minoria-no-congresso`, `mandato:flavio-bolsonaro-presidente-da-comissao-de-seguranca-publica`
- Lacuna declarada: O Senado lista outras relatorias dele e as comissões de que participou: o atlas registra duas relatorias e os cargos de direção.
- Lacuna declarada: Se o parecer dele foi aprovado em cada relatoria: os serviços consultados não dizem.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 8: Como ler um voto no Senado (2023 a 2025)

- Identificador: `flavio-bolsonaro-decisoes-no-senado` · Marco: `decisao:senado-voto-6777-5894` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ler um voto nominal: o que foi votado, como ele votou e qual foi o resultado.
- **Explicação a conferir** (92 palavras):
  1. Em uma votação nominal, o voto de cada senador fica registrado com o nome dele. Em 8 de novembro de 2023, o Senado votou em segundo turno a PEC 45, de 2019, que altera o sistema tributário. Flávio Bolsonaro votou não; a proposta foi aprovada. Aponta: `decisao:senado-voto-6777-5894`, `conceito:pec`.
  2. Nas seis votações que o atlas registra, de 2023 a 2025, ele votou não em três, de economia, e sim em três, de segurança pública. As seis propostas foram aprovadas. Aponta: `decisao:senado-voto-6714-5894`, `decisao:senado-voto-6777-5894`, `decisao:senado-voto-6899-5894`, `decisao:senado-voto-6818-5894`, `decisao:senado-voto-6825-5894`, `decisao:senado-voto-7037-5894`.
  3. O registro mostra como ele votou naquele texto, naquele dia. Não diz, sozinho, o motivo do voto. Aponta: `decisao:senado-voto-6777-5894`.
- Conceitos definidos nesta fase: `pec`
- **Pergunta a conferir:** Em novembro de 2023, o Senado aprovou a PEC 45, de 2019, e Flávio Bolsonaro votou não. O que o registro mostra?
  - (certa) Duas coisas: o voto dele foi contra aquele texto, e a proposta foi aprovada.
  - Que a proposta foi rejeitada.
  - Que ele não participou da votação.
- **Explicação da resposta a conferir:** O registro traz duas informações diferentes: o voto individual (não) e o resultado da votação (aprovada). Uma PEC precisa de três quintos dos votos dos senadores para passar. Aponta: `decisao:senado-voto-6777-5894`, `conceito:pec`.
- Para explorar no período (opcional no jogo): `decisao:senado-voto-6714-5894`, `decisao:senado-voto-6899-5894`, `decisao:senado-voto-6818-5894`, `decisao:senado-voto-6825-5894`, `decisao:senado-voto-7037-5894`
- Lacuna declarada: O atlas registra seis votos, em economia e segurança pública, de 2023 a 2025. Os demais temas e os anos de 2019 a 2022 não foram pesquisados.
- Lacuna declarada: Votações secretas e simbólicas não registram a posição de cada senador.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Trajetória · Fase 9: A eleição de 2026 (2025 a 2026)

- Identificador: `flavio-bolsonaro-eleicao-2026` · Marco: `acontecimento:eleicao-2026-primeiro-turno` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** saber como estava a eleição de 2026 em 8 de outubro, até onde este atlas vai, e onde ler o que a candidatura propõe.
- **Explicação a conferir** (99 palavras):
  1. Em 25 de julho de 2026, a convenção do PL oficializou a candidatura dele à Presidência, com Alfredo Gaspar como vice. O TSE aprovou o registro em 2 de setembro. Aponta: `acontecimento:flavio-bolsonaro-2026-convencao-do-pl`, `conceito:convencao-e-registro-de-candidatura`.
  2. No primeiro turno, em 4 de outubro, Flávio Bolsonaro teve 47,03% dos votos válidos e Lula, 45,16%, com 99,99% das urnas apuradas. Ninguém passou da metade: os dois foram ao segundo turno. Aponta: `acontecimento:eleicao-2026-primeiro-turno`, `conceito:turnos-da-eleicao`.
  3. A candidatura entregou ao TSE um documento com propostas. O atlas traz três por área, cada uma com a página. Aponta: `conceito:proposta-de-governo`, `proposta:proposta-flavio-bolsonaro-2026-economia-1`.
  4. O atlas vai até 8 de outubro de 2026 e não traz o resultado do segundo turno. Aponta: `acontecimento:eleicao-2026-primeiro-turno`.
- Conceitos definidos nesta fase: `convencao-e-registro-de-candidatura`, `turnos-da-eleicao`, `proposta-de-governo`
- **Pergunta a conferir:** O que é uma proposta de governo registrada no TSE?
  - (certa) O que a candidatura diz que pretende fazer se vencer.
  - Uma lei que já está valendo.
  - O resultado de uma votação no Congresso.
- **Explicação da resposta a conferir:** Proposta de governo é o documento com o que a candidatura diz que pretende fazer. Não é lei, voto nem resultado: por isso cada frase do atlas começa por "O documento", com a página, e nunca diz "vai fazer". Aponta: `conceito:proposta-de-governo`.
- Para explorar no período (opcional no jogo): `acontecimento:flavio-bolsonaro-2025-indicacao-para-a-presidencia`, `proposta:proposta-flavio-bolsonaro-2026-economia-1`, `proposta:proposta-flavio-bolsonaro-2026-seguranca-publica-1`, `proposta:proposta-flavio-bolsonaro-2026-saude-1`, `proposta:proposta-flavio-bolsonaro-2026-educacao-1`, `proposta:proposta-flavio-bolsonaro-2026-reforma-do-estado-1`, `proposta:proposta-flavio-bolsonaro-2026-meio-ambiente-1`, `proposta:proposta-flavio-bolsonaro-2026-direitos-das-mulheres-1`
- Lacuna declarada: O atlas registra três frases por área de cada documento. O documento inteiro tem outras propostas e capítulos fora das sete áreas.
- Lacuna declarada: O segundo turno ficou marcado para depois da data de corte desta edição.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Missão: O documento diz o quê? · Fase 1: O documento diz o quê? Três votos no Senado (2007 a 2024)

- Identificador: `flavio-bolsonaro-investigacao` · Marco: `decisao:senado-voto-6777-5894` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-17; observações: Fase da missão de investigação, escrita em 17 de outubro de 2026, com assistência de IA. Cada ficha e cada bloco foram conferidos contra os campos dos registros que apontam (data, instituição, cargo, objeto e ação): nada diz o que os registros não dizem. A escolha dos documentos, dos distratores e dos trechos destacados é decisão editorial. Revisão humana pendente.
- **Objetivo a conferir:** ler três documentos, montar um dossiê e relacionar cada ficha ao documento que a sustenta.
- **Explicação a conferir** (93 palavras):
  1. Nos três documentos das fichas, Flávio Bolsonaro votou como senador: votou não, em segundo turno, na PEC que altera o sistema tributário, em 2023; votou sim no projeto de lei sobre a execução penal, em 2024; e votou não no substitutivo ao projeto de lei complementar dos tributos IBS, CBS e Imposto Seletivo, em 2024, e os três textos foram aprovados. Aponta: `decisao:senado-voto-6777-5894`, `decisao:senado-voto-6818-5894`, `decisao:senado-voto-6899-5894`.
  2. O voto vale para o objeto votado, e não para um tema. A ficha só vale com o documento que a sustenta: a data, o objeto e a manifestação distinguem registros parecidos. Aponta: `decisao:senado-voto-6777-5894`, `decisao:senado-voto-6818-5894`, `decisao:senado-voto-6899-5894`.
- Conceitos definidos nesta fase: `senador`, `pec`, `projeto-de-lei`, `lei-complementar`
- **Dossiê a conferir:** Relacione cada ficha ao documento que a sustenta e aponte, no documento, o campo que sustenta o trecho destacado. Cada ficha diz só o que o documento apontado registra; conferir o texto contra os campos do cartão (data, instituição, cargo, objeto e ação) e se o trecho destacado é sustentado pelo campo dito.
  - Ficha `pec-tributaria`: Em novembro de 2023, no Senado, voto não, em segundo turno, na PEC que altera o sistema tributário. Documento: `decisao:senado-voto-6777-5894`. Trecho destacado: "em segundo turno" (campo: objeto).
  - Ficha `execucao-penal`: Em fevereiro de 2024, voto sim no projeto de lei sobre a execução penal, que extingue a saída temporária. Documento: `decisao:senado-voto-6818-5894`. Trecho destacado: "voto sim" (campo: acao).
  - Ficha `ibs-cbs`: Em dezembro de 2024, voto não no substitutivo ao projeto de lei complementar que institui o IBS, a CBS e o Imposto Seletivo. Documento: `decisao:senado-voto-6899-5894`. Trecho destacado: "dezembro de 2024" (campo: data).
  - Documentos da gaveta que não sustentam ficha (distratores): `decisao:senado-voto-6714-5894`, `decisao:senado-voto-6825-5894`, `decisao:alerj-lei-5019-2007-autoria`.
- **Explicação da resposta a conferir:** Cada ficha se sustenta em um só registro de votação, e a data, o objeto e a manifestação distinguem os parecidos: um substitutivo é um texto que substitui o projeto. Os outros documentos da gaveta são o voto de junho de 2023 no projeto do regime fiscal, o voto de abril de 2024 em outra PEC, também em segundo turno, e a autoria de uma lei estadual na Alerj, em 2007, que não é voto.
- Lacuna declarada: É uma amostra de cinco votações no Senado e uma lei estadual, e não a lista de como ele votou.
- Lacuna declarada: O registro do voto não diz, sozinho, o motivo do voto, e o atlas não o pesquisou.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro · Aprofundamento: Segurança pública · Fase 1: Segurança pública: três votos de Flávio Bolsonaro no Senado (2024 a 2026)

- Identificador: `flavio-bolsonaro-seguranca-publica` · Marco: `decisao:senado-voto-6818-5894` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver como ele votou em três propostas de segurança pública e o que cada uma era.
- **Explicação a conferir** (85 palavras):
  1. Em 20 de fevereiro de 2024, o Senado aprovou o projeto que restringe as saídas temporárias de presos. Flávio Bolsonaro era o relator do projeto e votou sim. Aponta: `decisao:senado-voto-6818-5894`, `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias`.
  2. Em abril de 2024, votou sim, em segundo turno, na PEC sobre a posse e o porte de drogas. Em dezembro de 2025, votou sim no projeto do marco legal do combate ao crime organizado. As duas propostas foram aprovadas no Senado. Aponta: `decisao:senado-voto-6825-5894`, `decisao:senado-voto-7037-5894`.
  3. Em fevereiro de 2025, ele passou a presidir a Comissão de Segurança Pública do Senado. Aponta: `acontecimento:flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica`.
- Conceitos definidos nesta fase: `pec`, `relator`, `comissao`
- **Pergunta a conferir:** No projeto das saídas temporárias, em 2024, qual era o papel de Flávio Bolsonaro, além de votar?
  - (certa) Era o relator do projeto.
  - Era o presidente da República.
  - Era o juiz do caso.
- **Explicação da resposta a conferir:** Ele foi o relator do projeto, o de número 2.253, de 2022. O Senado aprovou o projeto em 20 de fevereiro de 2024, e ele votou sim. Aponta: `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias`, `decisao:senado-voto-6818-5894`.
- Para explorar no período (opcional no jogo): `proposta:proposta-flavio-bolsonaro-2026-seguranca-publica-1`, `proposta:proposta-flavio-bolsonaro-2026-seguranca-publica-2`, `proposta:proposta-flavio-bolsonaro-2026-seguranca-publica-3`
- Lacuna declarada: Os votos dele em segurança pública de 2019 a 2022 não foram pesquisados.
- Lacuna declarada: Os votos dele na Alerj, de 2003 a 2018, não foram pesquisados.
- Lacuna declarada: É uma amostra de três votações: não é a lista de como ele votou na área.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Aprofundamento: Economia · Fase 1: Economia: cinco atos de Lula na Presidência (2007 a 2026)

- Identificador: `lula-economia` · Marco: `decisao:planalto-lei-complementar-200-2023-regime-fiscal` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver cinco atos de Lula na área de economia e de que tipo é cada um.
- **Explicação a conferir** (92 palavras):
  1. No segundo mandato, Lula assinou em 2007 o decreto que instituiu o Programa de Aceleração do Crescimento, o PAC. Em 2010, sancionou com veto parcial a lei sobre a exploração de petróleo e gás no pré-sal pelo regime de partilha de produção. Aponta: `decisao:planalto-decreto-6025-2007-pac`, `decisao:planalto-lei-12351-2010-partilha-do-pre-sal`.
  2. No terceiro mandato, sancionou com veto parcial duas leis complementares: a do regime fiscal, em 2023, e a que institui os tributos IBS, CBS e Imposto Seletivo, em 2025. Também em 2025, sancionou a lei que reduz o imposto de renda, com imposto zero até 5 mil reais por mês. Aponta: `decisao:planalto-lei-complementar-200-2023-regime-fiscal`, `decisao:planalto-lei-complementar-214-2025-ibs-cbs`, `decisao:planalto-lei-15270-2025-imposto-de-renda`.
- Conceitos definidos nesta fase: `decreto`, `sancao`, `veto`, `lei-complementar`
- **Pergunta a conferir:** O PAC, de 2007, foi instituído por qual tipo de ato?
  - (certa) Um decreto do presidente.
  - Uma emenda à Constituição.
  - Um voto no Senado.
- **Explicação da resposta a conferir:** O Programa de Aceleração do Crescimento foi instituído pelo Decreto 6.025, de 22 de janeiro de 2007. Decreto é um ato do próprio presidente. Uma lei, diferente dele, é aprovada pelo Congresso e depois sancionada ou vetada. Aponta: `decisao:planalto-decreto-6025-2007-pac`, `conceito:decreto`.
- Para explorar no período (opcional no jogo): `proposta:proposta-lula-2026-economia-1`, `proposta:proposta-lula-2026-economia-2`, `proposta:proposta-lula-2026-economia-3`
- Lacuna declarada: O atlas não registra cargo público de Lula entre 2011 e 2022.
- Lacuna declarada: Os atos de economia de 2003 a 2006 conferidos na pesquisa não entraram na amostra desta edição.
- Lacuna declarada: É uma amostra de cinco atos: não é a lista do que o governo decidiu na área.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 1: De Garanhuns a São Paulo (1945 a 1956)

- Identificador: `lula-origem` · Marco: `fato:lula-nascimento` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** saber onde Lula nasceu e como a família dele foi parar em São Paulo.
- **Explicação a conferir** (98 palavras):
  1. Lula nasceu em outubro de 1945, em Garanhuns, no interior de Pernambuco. O nome completo dele é Luiz Inácio Lula da Silva. Segundo a biografia publicada pela Presidência, foi o sétimo de oito irmãos. Aponta: `fato:lula-nascimento`.
  2. Em dezembro de 1952, a mãe e os filhos foram para o litoral do estado de São Paulo. Segundo as biografias da Presidência, a viagem durou 13 dias, de caminhão, e a família fugia da seca e da fome. Aponta: `fato:lula-mudanca-para-o-litoral-paulista`.
  3. Em 1956, a família se mudou para a cidade de São Paulo e passou a morar em um único cômodo, nos fundos de um bar. Aponta: `fato:lula-mudanca-para-a-cidade-de-sao-paulo`.
- **Pergunta a conferir:** Como a família de Lula viajou para São Paulo, em dezembro de 1952?
  - (certa) De caminhão, em uma viagem de 13 dias.
  - De trem, em uma viagem de três dias.
  - De navio, até o porto de Santos.
- **Explicação da resposta a conferir:** A biografia da Presidência registra a viagem de 13 dias em um caminhão, em dezembro de 1952. Os documentos divergem sobre a cidade de chegada, e o atlas guarda as duas versões. Aponta: `fato:lula-mudanca-para-o-litoral-paulista`.
- Para explorar no período (opcional no jogo): `fato:lula-escola`
- Lacuna declarada: A infância em Pernambuco, antes de 1952: os documentos oficiais lidos trazem só o nascimento e a mudança.
- Lacuna declarada: Os anos em que Lula estudou e os endereços da família: os documentos lidos não trazem datas.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 2: Da fábrica ao sindicato (1956 a 1979)

- Identificador: `lula-sindicato` · Marco: `acontecimento:lula-1975-eleito-presidente-do-sindicato` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender o que é um sindicato e como Lula chegou à presidência de um.
- **Explicação a conferir** (91 palavras):
  1. Lula fez o curso de torneiro mecânico do Senai, tornou-se metalúrgico e trabalhou em várias fábricas, entre elas as Indústrias Villares, em São Bernardo do Campo. Aponta: `fato:lula-curso-no-senai`, `fato:lula-trabalho-na-villares`.
  2. Na Villares, conheceu o movimento sindical por meio de um irmão. Em 1969 entrou na diretoria do sindicato dos metalúrgicos, como suplente. Em 1975 foi eleito presidente. Segundo a biografia publicada pela Presidência, teve 92% dos votos. Aponta: `fato:lula-trabalho-na-villares`, `fato:lula-entrada-na-diretoria-do-sindicato`, `acontecimento:lula-1975-eleito-presidente-do-sindicato`.
  3. Reeleito em 1978, estava à frente do sindicato quando os metalúrgicos do ABC paulista entraram em greve, em março de 1979. Segundo a mesma biografia, eram 170 mil. Aponta: `fato:lula-reeleicao-no-sindicato`, `acontecimento:lula-1979-greve-dos-metalurgicos-do-abc`.
- Conceitos definidos nesta fase: `sindicato`, `greve`
- **Ordenação a conferir:** Ponha em ordem, do mais antigo para o mais recente, três momentos de Lula no sindicato. Registros: `acontecimento:lula-1979-greve-dos-metalurgicos-do-abc`, `fato:lula-entrada-na-diretoria-do-sindicato`, `acontecimento:lula-1975-eleito-presidente-do-sindicato`. A ordem certa é a das datas dos registros.
- **Explicação da resposta a conferir:** Primeiro ele entrou na diretoria, como suplente, em 1969. Depois foi eleito presidente do sindicato, em 1975. A greve de março de 1979 aconteceu quando ele já presidia o sindicato.
- Para explorar no período (opcional no jogo): `fato:lula-primeiros-trabalhos`, `mandato:lula-presidente-do-sindicato-dos-metalurgicos`
- Lacuna declarada: Os anos em que Lula fez o curso do Senai e entrou na Villares: os documentos oficiais lidos não trazem.
- Lacuna declarada: Quando ele deixou a presidência do sindicato: os documentos lidos não informam, e o atlas registra o fim como desconhecido.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 3: Um partido e uma Constituição (1980 a 1988)

- Identificador: `lula-partido-e-constituinte` · Marco: `acontecimento:lula-1986-eleito-deputado-federal-constituinte` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver como um líder sindical entrou na política: fundou um partido e foi eleito deputado.
- **Explicação a conferir** (82 palavras):
  1. Em 1980, o país ainda era governado por militares. Em fevereiro, Lula e outros sindicalistas, intelectuais e políticos fundaram o PT, o Partido dos Trabalhadores. No mesmo ano, durante uma greve, ele foi preso com base na Lei de Segurança Nacional. Segundo a biografia publicada pela Presidência, ficou 31 dias na prisão. Aponta: `acontecimento:lula-1980-fundacao-do-pt`, `acontecimento:lula-1980-prisao-pela-lei-de-seguranca-nacional`.
  2. Em 1986, foi eleito deputado federal por São Paulo, pelo PT, para a Assembleia Nacional Constituinte, que escreveu a Constituição de 1988. Tomou posse em 1º de fevereiro de 1987. Aponta: `acontecimento:lula-1986-eleito-deputado-federal-constituinte`, `conceito:assembleia-constituinte`.
- Conceitos definidos nesta fase: `partido-politico`, `deputado-federal`, `assembleia-constituinte`
- **Pergunta a conferir:** Para que serve uma Assembleia Constituinte, como a de que Lula participou?
  - (certa) Para escrever a Constituição do país.
  - Para escolher o presidente da República.
  - Para julgar processos da Justiça.
- **Explicação da resposta a conferir:** Assembleia constituinte é a assembleia convocada para escrever a Constituição. Lula foi eleito para ela em 1986, como deputado federal por São Paulo. A Constituição em vigor é de 1988. Aponta: `conceito:assembleia-constituinte`, `acontecimento:lula-1986-eleito-deputado-federal-constituinte`.
- Para explorar no período (opcional no jogo): `mandato:lula-deputado-federal-1987-1991`, `mandato:lula-presidente-do-pt-1980-1988`, `filiacao:lula-pt`
- Lacuna declarada: Os votos e as propostas de Lula como deputado constituinte, de 1987 a 1991.
- Lacuna declarada: Não há acontecimentos registrados de 1981 a 1985 e em 1987 e 1988.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 4: Quatro disputas pela Presidência (1989 a 2002)

- Identificador: `lula-disputas-pela-presidencia` · Marco: `acontecimento:lula-2002-eleito-presidente` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender o que são primeiro e segundo turno, pelas eleições que Lula disputou até vencer.
- **Explicação a conferir** (79 palavras):
  1. Lula disputou a Presidência da República três vezes sem vencer. Em 1989, perdeu no segundo turno. Em 1994 e em 1998, Fernando Henrique Cardoso venceu já no primeiro turno. Aponta: `acontecimento:lula-1989-primeira-candidatura-a-presidencia`, `acontecimento:lula-1994-derrota-na-eleicao-presidencial`.
  2. Em 2002, a eleição foi ao segundo turno, que é disputado só pelos dois mais votados do primeiro. Em 27 de outubro de 2002, Lula foi eleito presidente da República. Segundo a biografia publicada pela Presidência, teve quase 53 milhões de votos. Tomou posse em 1º de janeiro de 2003. Aponta: `acontecimento:lula-2002-eleito-presidente`, `conceito:turnos-da-eleicao`.
- Conceitos definidos nesta fase: `turnos-da-eleicao`, `presidente-da-republica`
- **Pergunta a conferir:** Quando uma eleição para presidente vai ao segundo turno?
  - (certa) Quando nenhum candidato passa da metade dos votos válidos no primeiro turno.
  - Sempre: toda eleição para presidente tem dois turnos.
  - Quando o Congresso decide repetir a votação.
- **Explicação da resposta a conferir:** Só há segundo turno se ninguém passar da metade dos votos válidos no primeiro. Em 1994 e 1998, Fernando Henrique Cardoso venceu no primeiro turno. Em 1989 e 2002, a eleição foi ao segundo. Aponta: `conceito:turnos-da-eleicao`, `acontecimento:lula-1989-primeira-candidatura-a-presidencia`, `acontecimento:lula-1994-derrota-na-eleicao-presidencial`, `acontecimento:lula-2002-eleito-presidente`.
- Para explorar no período (opcional no jogo): `mandato:lula-presidente-do-pt-1990-1994`
- Lacuna declarada: Não há acontecimentos registrados de 1990 a 1993 e de 1995 a 2001.
- Lacuna declarada: A eleição de 1998 não tem registro próprio: aparece no contexto da de 1994, sem o número de votos.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 5: O primeiro governo (2003 a 2006)

- Identificador: `lula-primeiro-governo` · Marco: `decisao:planalto-mpv-132-2003-bolsa-familia` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender o que é uma medida provisória e como ela vira lei.
- **Explicação a conferir** (76 palavras):
  1. Presidente desde 1º de janeiro de 2003, Lula passou a chefiar o governo federal. Uma das ferramentas do cargo é a medida provisória: uma regra com força de lei, que o Congresso precisa aprovar para virar lei de vez. Aponta: `mandato:lula-presidente-da-republica-2003-2007`, `conceito:presidente-da-republica`, `conceito:medida-provisoria`.
  2. Em 20 de outubro de 2003, ele assinou a Medida Provisória 132, que criou o Programa Bolsa Família. O Congresso aprovou, e em 9 de janeiro de 2004 a medida virou a Lei 10.836, sancionada por Lula. Aponta: `decisao:planalto-mpv-132-2003-bolsa-familia`, `decisao:planalto-lei-10836-2004-bolsa-familia`.
- Conceitos definidos nesta fase: `medida-provisoria`, `sancao`
- **Pergunta a conferir:** O que acontece com uma medida provisória depois que o presidente a assina?
  - (certa) Vai ao Congresso, que decide se ela vira lei.
  - Vira lei para sempre, sem passar pelo Congresso.
  - Só começa a valer depois de um plebiscito.
- **Explicação da resposta a conferir:** A medida provisória tem força de lei desde que é editada, mas tem de ser enviada ao Congresso e perde a validade se não virar lei no prazo. A do Bolsa Família virou a Lei 10.836, em janeiro de 2004. Aponta: `conceito:medida-provisoria`, `decisao:planalto-lei-10836-2004-bolsa-familia`.
- Para explorar no período (opcional no jogo): `decisao:camara-pec-40-2003-iniciativa`, `decisao:planalto-lei-10826-2003-armas-de-fogo`, `decisao:planalto-decreto-5090-2004-farmacia-popular`, `decisao:planalto-lei-11096-2005-prouni`, `decisao:planalto-lei-11340-2006-violencia-contra-a-mulher`, `acontecimento:lula-2006-reeleito-presidente`
- Lacuna declarada: O atlas registra sete atos de 2003 a 2006, escolhidos como amostra. Não é a lista do que o governo fez.
- Lacuna declarada: Os efeitos de cada lei e o resultado dos vetos no Congresso.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 6: O segundo governo (2007 a 2010)

- Identificador: `lula-segundo-governo` · Marco: `decisao:planalto-lei-11738-2008-piso-do-magisterio` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** entender a diferença entre sancionar e vetar um projeto aprovado pelo Congresso.
- **Explicação a conferir** (79 palavras):
  1. Lula começou o segundo mandato de presidente em 1º de janeiro de 2007. Aponta: `mandato:lula-presidente-da-republica-2007-2011`.
  2. Quando o Congresso aprova um projeto de lei, o presidente escolhe: sanciona, e o projeto vira lei, ou veta, e recusa o projeto inteiro ou uma parte dele. Aponta: `conceito:sancao`, `conceito:veto`.
  3. Em 16 de julho de 2008, Lula sancionou a lei que criou o piso salarial nacional dos profissionais do magistério da educação básica pública. O projeto tinha vindo do Senado. Ele vetou dois trechos: o veto foi parcial. Aponta: `decisao:planalto-lei-11738-2008-piso-do-magisterio`.
- Conceitos definidos nesta fase: `veto`, `projeto-de-lei`
- **Pergunta a conferir:** Lula sancionou a lei do piso do magistério e vetou dois trechos dela. Como se chama esse tipo de veto?
  - (certa) Veto parcial: só uma parte do projeto é recusada.
  - Veto total: o projeto inteiro é recusado.
  - Medida provisória.
- **Explicação da resposta a conferir:** No veto parcial, o presidente recusa só uma parte do projeto, e o resto vira lei. Na Lei 11.738, de 2008, foram vetados o inciso I do artigo 3º e o artigo 7º, segundo a mensagem de veto. Aponta: `decisao:planalto-lei-11738-2008-piso-do-magisterio`, `conceito:veto`.
- Para explorar no período (opcional no jogo): `decisao:planalto-decreto-6025-2007-pac`, `decisao:planalto-lei-12187-2009-mudanca-do-clima`, `decisao:planalto-lei-12351-2010-partilha-do-pre-sal`
- Lacuna declarada: O atlas registra quatro atos de 2007 a 2010, escolhidos como amostra. Não é a lista do que o governo fez.
- Lacuna declarada: Se o Congresso manteve ou derrubou cada veto.
- Lacuna declarada: Não há acontecimentos registrados de 2011 a 2015.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 7: Condenação, prisão e anulação (2016 a 2021)

- Identificador: `lula-processos` · Marco: `acontecimento:lula-2021-stf-anula-condenacoes` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** acompanhar, na ordem, o que a Justiça decidiu nos processos contra Lula e entender o que é anular uma decisão.
- **Explicação a conferir** (100 palavras):
  1. Em julho de 2017, um juiz federal de Curitiba condenou Lula por corrupção passiva e lavagem de dinheiro, no caso do triplex do Guarujá. Em janeiro de 2018, a segunda instância confirmou a condenação, com pena maior. A defesa pediu a absolvição e disse que o processo era nulo. Aponta: `acontecimento:lula-2017-condenacao-em-primeira-instancia`, `acontecimento:lula-2018-tribunal-confirma-condenacao`.
  2. Lula ficou preso de abril de 2018 a novembro de 2019, e o TSE negou o registro da candidatura dele em 2018. Aponta: `acontecimento:lula-2018-prisao-em-curitiba`, `acontecimento:lula-2019-saida-da-prisao`, `acontecimento:lula-2018-registro-de-candidatura-indeferido`.
  3. Em março de 2021, o STF anulou as condenações: entendeu que o juízo de Curitiba não era o competente. Também declarou a suspeição do juiz no caso do triplex. Aponta: `acontecimento:lula-2021-stf-anula-condenacoes`, `conceito:anulacao`.
- Conceitos definidos nesta fase: `condenacao-e-recurso`, `anulacao`
- **Ordenação a conferir:** Ponha em ordem, do mais antigo para o mais recente, três decisões e fatos dos processos contra Lula. Registros: `acontecimento:lula-2021-stf-anula-condenacoes`, `acontecimento:lula-2017-condenacao-em-primeira-instancia`, `acontecimento:lula-2018-prisao-em-curitiba`. A ordem certa é a das datas dos registros.
- **Explicação da resposta a conferir:** Primeiro veio a condenação em primeira instância, em 2017. Depois, com a condenação confirmada em segunda instância, a prisão, em 2018. Por fim, em 2021, o STF anulou as condenações, e os processos foram à Justiça Federal do Distrito Federal. Anular não é absolver nem condenar: é declarar inválidas as decisões.
- Para explorar no período (opcional no jogo): `acontecimento:lula-2016-nomeacao-para-a-casa-civil-suspensa`
- Lacuna declarada: O que aconteceu com cada processo depois de enviado à Justiça Federal do Distrito Federal.
- Lacuna declarada: Três dos quatro processos atingidos pela anulação não têm registro próprio no atlas.
- Lacuna declarada: Quem apresentou a acusação que levou à condenação de 2017: os registros desta edição não dizem.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 8: De volta à Presidência (2022 a 2026)

- Identificador: `lula-retorno` · Marco: `acontecimento:lula-2022-eleito-presidente-pela-terceira-vez` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver como Lula voltou à Presidência e o que são um decreto e uma intervenção federal.
- **Explicação a conferir** (96 palavras):
  1. Em 30 de outubro de 2022, Lula foi eleito presidente pela terceira vez, no segundo turno, com 50,90% dos votos válidos, contra 49,10% de Jair Bolsonaro. Tomou posse em 1º de janeiro de 2023. Aponta: `acontecimento:lula-2022-eleito-presidente-pela-terceira-vez`.
  2. Em 8 de janeiro de 2023, as sedes do Congresso, da Presidência e do STF foram invadidas e depredadas. No mesmo dia, Lula assinou um decreto de intervenção federal na segurança pública do Distrito Federal, e o Congresso aprovou a medida. Aponta: `acontecimento:lula-2023-intervencao-federal-no-distrito-federal`, `decisao:planalto-decreto-11377-2023-intervencao-df`, `conceito:intervencao-federal`.
  3. No cargo, ele também sancionou leis e vetou partes de leis sobre economia e segurança pública. Esses atos estão nos aprofundamentos. Aponta: `decisao:planalto-lei-complementar-200-2023-regime-fiscal`, `decisao:planalto-lei-14843-2024-saidas-temporarias`, `decisao:planalto-lei-15270-2025-imposto-de-renda`.
- Conceitos definidos nesta fase: `decreto`, `intervencao-federal`
- **Pergunta a conferir:** O que foi a intervenção federal de 8 de janeiro de 2023?
  - (certa) Um decreto do presidente, limitado à segurança pública do Distrito Federal e com prazo para acabar.
  - Uma lei do Congresso que fechou o governo do Distrito Federal.
  - Uma decisão do STF que anulou a eleição.
- **Explicação da resposta a conferir:** A intervenção foi feita por decreto do presidente, limitada à área de segurança pública do Distrito Federal e com prazo até 31 de janeiro de 2023. O Congresso examinou e aprovou o decreto. Aponta: `decisao:planalto-decreto-11377-2023-intervencao-df`, `conceito:intervencao-federal`.
- Para explorar no período (opcional no jogo): `mandato:lula-presidente-da-republica-2023`, `decisao:planalto-lei-complementar-214-2025-ibs-cbs`, `decisao:planalto-lei-15358-2026-crime-organizado`
- Lacuna declarada: O atlas registra seis atos do terceiro mandato, só em economia e segurança pública. Saúde, educação, meio ambiente e os demais temas não foram pesquisados neste período.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Trajetória · Fase 9: A eleição de 2026 (2026)

- Identificador: `lula-eleicao-2026` · Marco: `acontecimento:eleicao-2026-primeiro-turno` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** saber como estava a eleição de 2026 em 8 de outubro, até onde este atlas vai, e onde ler o que a candidatura propõe.
- **Explicação a conferir** (100 palavras):
  1. Em 2 de agosto de 2026, a convenção do PT oficializou a candidatura de Lula à Presidência, com Geraldo Alckmin como vice. O TSE aprovou o registro em 2 de setembro. Aponta: `acontecimento:lula-2026-convencao-do-pt`, `conceito:convencao-e-registro-de-candidatura`.
  2. No primeiro turno, em 4 de outubro, Lula teve 45,16% dos votos válidos e Flávio Bolsonaro, 47,03%, com 99,99% das urnas apuradas. Ninguém passou da metade: os dois foram ao segundo turno. Aponta: `acontecimento:eleicao-2026-primeiro-turno`.
  3. A candidatura entregou ao TSE um documento com propostas. O atlas traz três por área, cada uma com a página. Aponta: `conceito:proposta-de-governo`, `proposta:proposta-lula-2026-economia-1`.
  4. O atlas vai até 8 de outubro de 2026 e não traz o resultado do segundo turno. Aponta: `acontecimento:eleicao-2026-primeiro-turno`.
- Conceitos definidos nesta fase: `convencao-e-registro-de-candidatura`, `proposta-de-governo`
- **Pergunta a conferir:** O que é uma proposta de governo registrada no TSE?
  - (certa) O que a candidatura diz que pretende fazer se vencer.
  - Uma lei que já está valendo.
  - O resultado de uma votação no Congresso.
- **Explicação da resposta a conferir:** Proposta de governo é o documento com o que a candidatura diz que pretende fazer. Não é lei, voto nem resultado: por isso cada frase do atlas começa por "O documento", com a página, e nunca diz "vai fazer". Aponta: `conceito:proposta-de-governo`.
- Para explorar no período (opcional no jogo): `proposta:proposta-lula-2026-economia-1`, `proposta:proposta-lula-2026-seguranca-publica-1`, `proposta:proposta-lula-2026-saude-1`, `proposta:proposta-lula-2026-educacao-1`, `proposta:proposta-lula-2026-reforma-do-estado-1`, `proposta:proposta-lula-2026-meio-ambiente-1`, `proposta:proposta-lula-2026-direitos-das-mulheres-1`
- Lacuna declarada: O atlas registra três frases por área de cada documento. O documento inteiro tem outras propostas e capítulos fora das sete áreas.
- Lacuna declarada: O segundo turno ficou marcado para depois da data de corte desta edição.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Missão: O documento diz o quê? · Fase 1: O documento diz o quê? Três atos na Presidência (2007 a 2025)

- Identificador: `lula-investigacao` · Marco: `decisao:planalto-lei-complementar-200-2023-regime-fiscal` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-17; observações: Fase da missão de investigação, escrita em 17 de outubro de 2026, com assistência de IA. Cada ficha e cada bloco foram conferidos contra os campos dos registros que apontam (data, instituição, cargo, objeto e ação): nada diz o que os registros não dizem. A escolha dos documentos, dos distratores e dos trechos destacados é decisão editorial. Revisão humana pendente.
- **Objetivo a conferir:** ler três documentos, montar um dossiê e relacionar cada ficha ao documento que a sustenta.
- **Explicação a conferir** (99 palavras):
  1. Um ato do Executivo tem data, instituição, cargo, objeto e tipo. Nos três documentos das fichas, Lula agiu como presidente da República: sancionou com veto parcial duas leis complementares, a do regime fiscal, em 2023, e a dos tributos IBS, CBS e Imposto Seletivo, em 2025, e sancionou, com sanção expressa, em 2025, a lei que reduz o imposto de renda. Aponta: `decisao:planalto-lei-complementar-200-2023-regime-fiscal`, `decisao:planalto-lei-complementar-214-2025-ibs-cbs`, `decisao:planalto-lei-15270-2025-imposto-de-renda`.
  2. Veto parcial e sanção expressa são tipos de ato diferentes, e a data distingue duas leis complementares vetadas em parte. A ficha só vale com o documento que a sustenta: a gaveta tem mais documentos do que fichas. Aponta: `decisao:planalto-lei-complementar-200-2023-regime-fiscal`, `decisao:planalto-lei-complementar-214-2025-ibs-cbs`, `decisao:planalto-lei-15270-2025-imposto-de-renda`, `conceito:veto`, `conceito:sancao`.
- Conceitos definidos nesta fase: `veto`, `sancao`, `lei-complementar`
- **Dossiê a conferir:** Relacione cada ficha ao documento que a sustenta e aponte, no documento, o campo que sustenta o trecho destacado. Cada ficha diz só o que o documento apontado registra; conferir o texto contra os campos do cartão (data, instituição, cargo, objeto e ação) e se o trecho destacado é sustentado pelo campo dito.
  - Ficha `regime-fiscal`: Em agosto de 2023, na Presidência da República, veto parcial à lei complementar do regime fiscal sustentável. Documento: `decisao:planalto-lei-complementar-200-2023-regime-fiscal`. Trecho destacado: "lei complementar do regime fiscal sustentável" (campo: objeto).
  - Ficha `ibs-cbs`: Em janeiro de 2025, veto parcial à lei complementar que institui o IBS, a CBS e o Imposto Seletivo. Documento: `decisao:planalto-lei-complementar-214-2025-ibs-cbs`. Trecho destacado: "janeiro de 2025" (campo: data).
  - Ficha `imposto-de-renda`: Em novembro de 2025, sanção expressa da lei que reduz o imposto de renda. Documento: `decisao:planalto-lei-15270-2025-imposto-de-renda`. Trecho destacado: "sanção expressa" (campo: acao).
  - Documentos da gaveta que não sustentam ficha (distratores): `decisao:planalto-decreto-6025-2007-pac`, `decisao:planalto-lei-12351-2010-partilha-do-pre-sal`, `decisao:planalto-lei-14843-2024-saidas-temporarias`.
- **Explicação da resposta a conferir:** Cada ficha se sustenta em um só documento. A Lei Complementar 200, de 2023, e a Lei Complementar 214, de 2025, foram sancionadas com veto parcial, e a data as distingue; a Lei 15.270, de 2025, teve sanção expressa. Os outros três documentos da gaveta são de 2007, 2010 e 2024, ou tratam de outro assunto.
- Lacuna declarada: É uma amostra de seis atos do Executivo, e não a lista do que a Presidência decidiu.
- Lacuna declarada: O atlas não registra o que cada lei produziu depois de sancionada, nem se o Congresso derrubou algum veto.
- [ ] Conferido por: ______ em ____/____/______

### Lula · Aprofundamento: Segurança pública · Fase 1: Segurança pública: cinco atos de Lula na Presidência (2003 a 2026)

- Identificador: `lula-seguranca-publica` · Marco: `decisao:planalto-lei-14843-2024-saidas-temporarias` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Texto da fase escrito em 11 de outubro de 2026, com assistência de IA, para leitura por quem conhece pouco de política. Cada bloco foi conferido contra os registros que aponta: datas, números, nomes e a ordem dos fatos são os dos registros, e o que eles não dizem ficou de fora. A escolha do marco e a redação são decisões editoriais. Revisão humana pendente.
- **Objetivo a conferir:** ver cinco atos de Lula na área de segurança pública e o que acontece quando o Congresso derruba um veto.
- **Explicação a conferir** (92 palavras):
  1. No primeiro mandato, Lula sancionou em 2003 a lei sobre registro, posse e venda de armas de fogo e, em 2006, a lei que cria mecanismos para coibir a violência doméstica e familiar contra a mulher. Aponta: `decisao:planalto-lei-10826-2003-armas-de-fogo`, `decisao:planalto-lei-11340-2006-violencia-contra-a-mulher`.
  2. No terceiro mandato, decretou em 2023 a intervenção federal na segurança pública do Distrito Federal. Em 2024, sancionou com veto parcial a lei que restringe as saídas temporárias de presos; os trechos vetados foram promulgados depois, e passaram a valer. Em 2026, sancionou com veto parcial a lei do marco legal do combate ao crime organizado. Aponta: `decisao:planalto-decreto-11377-2023-intervencao-df`, `decisao:planalto-lei-14843-2024-saidas-temporarias`, `decisao:planalto-lei-15358-2026-crime-organizado`.
- Conceitos definidos nesta fase: `sancao`, `veto`, `decreto`, `intervencao-federal`
- **Pergunta a conferir:** Lula vetou trechos da lei das saídas temporárias, em 2024, e o veto foi derrubado. O que aconteceu com os trechos vetados?
  - (certa) Passaram a fazer parte da lei.
  - Foram apagados para sempre.
  - Ficaram suspensos até a eleição seguinte.
- **Explicação da resposta a conferir:** Quando o Congresso derruba um veto, o trecho vetado passa a fazer parte da lei. Na Lei 14.843, as partes vetadas foram promulgadas em 12 de junho de 2024. Aponta: `decisao:planalto-lei-14843-2024-saidas-temporarias`, `conceito:veto`.
- Para explorar no período (opcional no jogo): `proposta:proposta-lula-2026-seguranca-publica-1`, `proposta:proposta-lula-2026-seguranca-publica-2`, `proposta:proposta-lula-2026-seguranca-publica-3`
- Lacuna declarada: O atlas não registra cargo público de Lula entre 2011 e 2022.
- Lacuna declarada: Os atos de segurança pública de 2007 a 2010 conferidos na pesquisa não entraram na amostra desta edição.
- Lacuna declarada: É uma amostra de cinco atos: não é a lista do que o governo decidiu na área.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Flávio Bolsonaro faz estágios antes da vida pública (1998)

- Identificador: `flavio-bolsonaro-estagios` · Tipo: Trabalho · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir da ficha do deputado no portal da Alerj, baixada nesse dia, com assistência de IA. A ficha é a única fonte dos dois estágios: não foi localizado documento do Instituto Militar de Engenharia nem da Defensoria Pública que os confirme, e por isso o texto os atribui à ficha. A data do registro é a do início do primeiro estágio. Revisão humana pendente.
- **Texto a conferir:** A ficha de Flávio Bolsonaro na Assembleia Legislativa registra dois estágios antes da primeira eleição: no Instituto Militar de Engenharia, de março a dezembro de 1998, e na Defensoria Pública do Estado do Rio de Janeiro, de agosto de 2000 a outubro de 2001.
- Fontes:
  - [Deputados / Ficha completa: Flávio Bolsonaro](https://www.alerj.rj.gov.br/Deputados/PerfilDeputado/275), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Seção Estágios. Sustenta: Estágio no Instituto Militar de Engenharia, de março a dezembro de 1998, e na Defensoria Pública Geral do Estado do Rio de Janeiro, de agosto de 2000 a outubro de 2001.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Flávio Bolsonaro se forma em direito (sem data documentada)

- Identificador: `flavio-bolsonaro-formacao` · Tipo: Formação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O registro traz só o que as páginas dizem hoje. A página da Agência Senado registra modificação em 12 de agosto de 2026, e cópias antigas dela e da ficha da Alerj, guardadas por terceiro (Internet Archive), mencionavam uma pós-graduação em ciências políticas que não está mais nas páginas; nenhum documento lido explica a mudança, e por isso o registro não afirma nem nega esse curso. O caso está descrito em research/trilha-2026-10.md, para decisão editorial. Revisão humana pendente.
- **Texto a conferir:** Flávio Bolsonaro é bacharel em direito pela Universidade Cândido Mendes, no Rio de Janeiro. A ficha dele na Assembleia Legislativa registra também um curso técnico em eletrônica, e a Agência Senado, especializações em políticas públicas e em empreendedorismo. Os documentos lidos não dizem em que ano ele concluiu cada curso.
- Fontes:
  - [Flávio Bolsonaro (PSL)](https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: Bacharel em direito pela Universidade Cândido Mendes; especializações em políticas públicas (Iuperj) e em empreendedorismo (FGV).
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Segundo parágrafo. Sustenta: Formado em direito pela Universidade Cândido Mendes, com especialização nas áreas de políticas públicas e empreendedorismo.
  - [Deputados / Ficha completa: Flávio Bolsonaro](https://www.alerj.rj.gov.br/Deputados/PerfilDeputado/275), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Seção Cursos Acadêmicos. Sustenta: Curso técnico em eletrônica pela Escola Técnica Rezende Rammel e bacharelado em direito pela Universidade Cândido Mendes, no Rio de Janeiro.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Flávio Bolsonaro nasce em Resende, no estado do Rio de Janeiro (30 de abril de 1981)

- Identificador: `flavio-bolsonaro-nascimento` · Tipo: Nascimento · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O material de campanha do candidato foi lido e não foi usado como fonte: o que só ele traz ficou de fora. As fichas do TSE trazem dados pessoais (CPF e título de eleitor), que não foram copiados. Revisão humana pendente.
- **Texto a conferir:** Flávio Nantes Bolsonaro nasceu em 30 de abril de 1981, em Resende, no estado do Rio de Janeiro. É o filho mais velho de Jair Bolsonaro; a mãe é Rogéria Bolsonaro.
- **Divergência a conferir:** O lugar varia: os dados abertos do Senado e os registros de candidatura de 2002 e de 2026 no TSE dizem Resende; os registros de candidatura de 2014, 2016 e 2018 no TSE dizem Rio de Janeiro. A data é a mesma em todos. O atlas registra Resende, como o Senado e o registro mais recente do TSE.
- Fontes:
  - [Dados Abertos do Senado: detalhe do senador Flávio Bolsonaro (código 5894)](https://legis.senado.leg.br/dadosabertos/senador/5894), Senado Federal. Onde olhar: Parlamentar.IdentificacaoParlamentar e Parlamentar.DadosBasicosParlamentar. Sustenta: Nome completo; nascimento em 30 de abril de 1981; naturalidade Resende (RJ).
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Registro de candidatura de 2002: município de nascimento Resende (RJ), data de nascimento 30/04/1981.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002551544/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Campos nomeMunicipioNascimento e dataDeNascimento. Sustenta: Registro de candidatura de 2026: município de nascimento Resende (RJ), data de nascimento 30 de abril de 1981.
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a deputado estadual em 2014](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/680/190000000095/2014/RJ), Tribunal Superior Eleitoral. Onde olhar: Campos sgUfNascimento e nomeMunicipioNascimento. Sustenta: Registro de candidatura de 2014: município de nascimento Rio de Janeiro (RJ).
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a prefeito do Rio de Janeiro em 2016](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2/190000011736/2016/60011), Tribunal Superior Eleitoral. Onde olhar: Campos sgUfNascimento e nomeMunicipioNascimento. Sustenta: Registro de candidatura de 2016: município de nascimento Rio de Janeiro (RJ).
  - [DivulgaCandContas: candidatura de Flávio Bolsonaro a senador em 2018](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/RJ/2022802018/190000614721/2018/RJ), Tribunal Superior Eleitoral. Onde olhar: Campos sgUfNascimento e nomeMunicipioNascimento. Sustenta: Registro de candidatura de 2018: município de nascimento Rio de Janeiro (RJ).
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Primeiro parágrafo. Sustenta: É o filho mais velho do ex-presidente Jair Bolsonaro.
  - [Flávio e Lula votam no 1º turno; acompanhe voto dos demais candidatos](https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/flavio-e-lula-votam-no-1o-turno-saiba-candidatos-que-ja-votaram), Agência Brasil. Onde olhar: Trecho sobre Flávio Bolsonaro, parágrafo que começa com "Flávio foi acompanhado". Sustenta: A mãe do candidato é Rogéria Bolsonaro.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: O partido de Flávio Bolsonaro muda de nome: de PPB para PP (2003)

- Identificador: `flavio-bolsonaro-partido-muda-de-nome` · Tipo: Outro registro biográfico · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir da página do partido no TSE e da lista de deputados da Alerj, baixadas nesse dia, com assistência de IA. O cadastro de filiações do atlas guarda PPB e PP em registros separados; este fato existe para dizer que é o mesmo partido com outro nome. Revisão humana pendente.
- **Texto a conferir:** Em 2003, o Partido Progressista Brasileiro (PPB), pelo qual Flávio Bolsonaro tinha sido eleito, passou a se chamar Partido Progressista (PP). O TSE registra a mudança de nome e de sigla do mesmo partido. A lista de deputados da legislatura de 2003 a 2007, publicada pela Alerj, já o traz como do PP.
- Fontes:
  - [Progressistas (partidos registrados no TSE)](https://www.tse.jus.br/partidos/partidos-registrados-no-tse/partido-progressista), Tribunal Superior Eleitoral. Onde olhar: Lista de estatutos, item do estatuto de 4 de abril de 2003. Sustenta: Estatuto aprovado em 29 de maio de 2003: mudança de nomenclatura e sigla de Partido Progressista Brasileiro (PPB) para Partido Progressista (PP).
  - [Alerj: 8ª legislatura (2003-2007), lista de deputados](https://www2.alerj.rj.gov.br/biblioteca/assets/documentos/pdf/legislaturas/deputados/8aLegislatura.pdf), Assembleia Legislativa do Estado do Rio de Janeiro, Biblioteca. Onde olhar: Item 32 da lista de deputados. Sustenta: Deputado Flávio Bolsonaro, com a sigla PP.
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linha do candidato de número 11120. Sustenta: Candidatura de 2002 pelo PPB.
- [ ] Conferido por: ______ em ____/____/______

### Flávio Bolsonaro: Flávio Bolsonaro se candidata a deputado estadual (2002)

- Identificador: `flavio-bolsonaro-registro-da-primeira-candidatura` · Tipo: Outro registro biográfico · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O material de campanha do candidato foi lido e não foi usado como fonte: o que só ele traz ficou de fora. As fichas do TSE trazem dados pessoais (CPF e título de eleitor), que não foram copiados. Revisão humana pendente.
- **Texto a conferir:** Em 2002, Flávio Bolsonaro se candidatou a deputado estadual pelo Rio de Janeiro, pelo Partido Progressista Brasileiro (PPB). No registro da candidatura, nos dados publicados pelo TSE, a ocupação informada é a de estudante, bolsista ou estagiário, o grau de instrução é superior incompleto, e a idade na data da posse é de 21 anos. Na mesma eleição, o pai dele, Jair Bolsonaro, concorreu a deputado federal.
- Fontes:
  - [Repositório de dados eleitorais: candidatos de 2002 (consulta_cand_2002)](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2002.zip), Tribunal Superior Eleitoral. Onde olhar: Arquivo consulta_cand_2002_RJ.csv, linhas dos candidatos de números 11120 (deputado estadual) e 1120 (deputado federal). Sustenta: Candidatura a deputado estadual pelo PPB, deferida; ocupação, grau de instrução e idade na data da posse; candidatura de Jair Messias Bolsonaro a deputado federal na mesma eleição.
  - [Filho mais velho de Bolsonaro, Flávio disputa a Presidência pelo PL](https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/filho-mais-velho-de-bolsonaro-flavio-disputa-presidencia-pelo-pl), Agência Brasil (Pedro Peduzzi). Onde olhar: Primeiro parágrafo. Sustenta: O parentesco: é o filho mais velho de Jair Bolsonaro.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula se forma torneiro mecânico no Senai (sem data documentada)

- Identificador: `lula-curso-no-senai` · Tipo: Formação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Lula fez o curso de torneiro mecânico do Senai, o Serviço Nacional de Aprendizagem Industrial. O curso durou três anos, e com ele Lula se tornou metalúrgico. Os documentos oficiais lidos não dizem em que ano ele se formou.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Terceiro parágrafo da biografia. Sustenta: Vaga no curso de torneiro mecânico do Senai; o curso durou três anos, e Lula se tornou metalúrgico.
  - [Biografia do Presidente da República](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biografia-do-presidente), Presidência da República. Onde olhar: Quinto parágrafo. Sustenta: O diploma de torneiro mecânico foi o primeiro da vida dele.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Seção Estudos e Cursos Diversos. Sustenta: Curso de formação de torneiro mecânico no Senai.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula entra para a diretoria do sindicato dos metalúrgicos (1969)

- Identificador: `lula-entrada-na-diretoria-do-sindicato` · Tipo: Atuação sindical · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Em 1969, o Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema elegeu nova diretoria, e Lula foi eleito suplente. Na eleição seguinte, em 1972, tornou-se primeiro-secretário.
- **Divergência a conferir:** Os nomes dos cargos variam: para 1969, a biografia da Presidência diz suplente, e a da Câmara dos Deputados, diretor; para 1972, a Presidência e a Câmara dizem primeiro-secretário, e a Agência Senado, em 2002, secretário-geral. O atlas usa os nomes da biografia da Presidência.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Quinto parágrafo da biografia. Sustenta: Eleição da diretoria em 1969, com Lula eleito suplente; primeiro-secretário na eleição de 1972.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Seção Atividades Sindicais, Representativas de Classe, Associativas e Conselhos. Sustenta: Diretor do sindicato em 1969 e primeiro-secretário em 1972.
  - [Do agreste ao Planalto Central - a trajetória do novo Presidente da República](https://www12.senado.leg.br/noticias/materias/2002/12/30/do-agreste-ao-planalto-central-a-trajetoria-do-novo-presidente-da-republica), Agência Senado. Onde olhar: Terceiro parágrafo. Sustenta: Em 1969, concorreu ao primeiro cargo no sindicato e ficou como suplente; três anos depois, foi eleito secretário-geral.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula é alfabetizado e faz o ensino primário (sem data documentada)

- Identificador: `lula-escola` · Tipo: Formação · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Lula foi alfabetizado no Grupo Escolar Marcílio Dias, segundo a biografia da Presidência da República. Os documentos lidos não dizem em que anos ele estudou.
- **Divergência a conferir:** A escolaridade é descrita com palavras diferentes: a Câmara dos Deputados registra primário; o registro de candidatura de 2026 no TSE, ensino fundamental completo; a Agência Senado, em 2002, diz que ele estudou até a 5ª série. O atlas não escolhe.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Segundo parágrafo da biografia. Sustenta: Alfabetização no Grupo Escolar Marcílio Dias.
  - [Biografia do deputado federal Luiz Inácio Lula da Silva](https://www.camara.leg.br/deputados/139289/biografia), Câmara dos Deputados. Onde olhar: Campo Escolaridade. Sustenta: Escolaridade registrada: primário.
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Campo grauInstrucao. Sustenta: Grau de instrução declarado no registro de candidatura de 2026: ensino fundamental completo.
  - [Do agreste ao Planalto Central - a trajetória do novo Presidente da República](https://www12.senado.leg.br/noticias/materias/2002/12/30/do-agreste-ao-planalto-central-a-trajetoria-do-novo-presidente-da-republica), Agência Senado. Onde olhar: Segundo parágrafo. Sustenta: Estudou até a 5ª série do ensino fundamental.
- [ ] Conferido por: ______ em ____/____/______

### Lula: A família se muda para a cidade de São Paulo (1956)

- Identificador: `lula-mudanca-para-a-cidade-de-sao-paulo` · Tipo: Mudança de cidade · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Em 1956, a família se mudou para a cidade de São Paulo e passou a morar em um único cômodo, nos fundos de um bar.
- **Divergência a conferir:** O bairro varia: a biografia da Presidência diz Ipiranga; a Agência Senado, em 2002, diz Vila Carioca. Nenhum dos dois documentos diz se um bairro fica dentro do outro.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Segundo parágrafo da biografia. Sustenta: Mudança para São Paulo em 1956; um único cômodo, nos fundos de um bar, no bairro do Ipiranga.
  - [Do agreste ao Planalto Central - a trajetória do novo Presidente da República](https://www12.senado.leg.br/noticias/materias/2002/12/30/do-agreste-ao-planalto-central-a-trajetoria-do-novo-presidente-da-republica), Agência Senado. Onde olhar: Segundo parágrafo. Sustenta: Na capital, a família morou em um quarto nos fundos de um bar, na Vila Carioca.
- [ ] Conferido por: ______ em ____/____/______

### Lula: A família de Lula se muda para o litoral de São Paulo (dezembro de 1952)

- Identificador: `lula-mudanca-para-o-litoral-paulista` · Tipo: Mudança de cidade · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Em dezembro de 1952, a mãe de Lula e os oito filhos migraram para o litoral do estado de São Paulo, em uma viagem de 13 dias de caminhão. A biografia oficial da Presidência da República diz que a família fugia da seca e da fome.
- **Divergência a conferir:** A cidade de chegada varia: a biografia da Presidência diz que a família foi morar em Vicente de Carvalho, no Guarujá; o Arquivo Nacional e a Agência Senado dizem Santos. O atlas registra o litoral paulista, como a biografia da Presidência, e não escolhe a cidade.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Primeiro parágrafo da biografia. Sustenta: Em dezembro de 1952, a família migrou para o litoral paulista, em viagem de 13 dias de caminhão, e foi morar em Vicente de Carvalho, no Guarujá.
  - [Biografia do Presidente da República](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biografia-do-presidente), Presidência da República. Onde olhar: Segundo parágrafo. Sustenta: Quem migrou: a mãe e os oito filhos; o motivo, como a biografia o afirma; a família morou de início na periferia de Guarujá.
  - [Luiz Inácio Lula da Silva (biografias do Centro de Referência de Acervos Presidenciais)](https://presidentes.an.gov.br/index.php/centro-de-referencia-de-acervos-presidenciais/assuntos/biografias/204-luiz-inacio-lula-da-silva), Arquivo Nacional. Onde olhar: Primeiro parágrafo. Sustenta: A família se estabeleceu primeiro em Santos e depois na capital.
  - [Lula é eleito presidente da República pela terceira vez](https://www12.senado.leg.br/noticias/materias/2022/10/30/lula-e-eleito-presidente-da-republica-pela-terceira-vez), Agência Senado. Onde olhar: Parágrafo de perfil, na parte final da matéria. Sustenta: Aos sete anos, migrou com a família para Santos (SP).
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula nasce em Garanhuns, no interior de Pernambuco (outubro de 1945)

- Identificador: `lula-nascimento` · Tipo: Nascimento · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Luiz Inácio Lula da Silva nasceu em outubro de 1945, em Garanhuns, no interior de Pernambuco. É o sétimo dos oito filhos de Aristides Inácio da Silva e Eurídice Ferreira de Mello.
- **Divergência a conferir:** O dia varia: a biografia da Presidência da República e a do Arquivo Nacional dizem 27 de outubro de 1945; os dados abertos da Câmara dos Deputados e o registro de candidatura de 2026 no TSE dizem 6 de outubro de 1945. O atlas registra o mês e o ano, em que todos concordam. O lugar também varia: os documentos oficiais dizem Garanhuns, e a Agência Senado, em 2002, situou o nascimento em Vargem Grande, no atual município de Caetés. O IBGE registra que Caetés era distrito de Garanhuns em 1950 e virou município em 1963.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Primeiro parágrafo da biografia. Sustenta: Nascimento em 27 de outubro de 1945, em Garanhuns; sétimo dos oito filhos de Aristides Inácio da Silva e Eurídice Ferreira de Mello.
  - [Luiz Inácio Lula da Silva (biografias do Centro de Referência de Acervos Presidenciais)](https://presidentes.an.gov.br/index.php/centro-de-referencia-de-acervos-presidenciais/assuntos/biografias/204-luiz-inacio-lula-da-silva), Arquivo Nacional. Onde olhar: Primeiro parágrafo. Sustenta: Nascimento em 27 de outubro de 1945, em Garanhuns, Pernambuco.
  - [Dados Abertos da Câmara dos Deputados: deputado de código 139289 (Luiz Inácio Lula da Silva)](https://dadosabertos.camara.leg.br/api/v2/deputados/139289), Câmara dos Deputados (Dados Abertos). Onde olhar: Campos dataNascimento, ufNascimento e municipioNascimento. Sustenta: Nascimento registrado em 6 de outubro de 1945, em Garanhuns (PE).
  - [DivulgaCandContas: candidatura de Lula a presidente em 2026](https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BRASIL/BR/20322002026/280002542548/2026/BR), Tribunal Superior Eleitoral. Onde olhar: Campos dataDeNascimento e descricaoNaturalidade. Sustenta: Registro de candidatura de 2026: nascimento em 6 de outubro de 1945 e naturalidade Garanhuns (PE).
  - [Do agreste ao Planalto Central - a trajetória do novo Presidente da República](https://www12.senado.leg.br/noticias/materias/2002/12/30/do-agreste-ao-planalto-central-a-trajetoria-do-novo-presidente-da-republica), Agência Senado. Onde olhar: Primeiro parágrafo. Sustenta: A agência situa o nascimento em Vargem Grande, no atual município de Caetés (PE).
  - [Caetés (PE): histórico e formação administrativa do município (API da Biblioteca do IBGE)](https://servicodados.ibge.gov.br/api/v1/biblioteca?aspas=3&codmun=260320), Instituto Brasileiro de Geografia e Estatística (IBGE). Onde olhar: Campo FORMACAO_ADMINISTRATIVA. Sustenta: Caetés era distrito de Garanhuns na divisão territorial de 1950 e foi elevado a município em 20 de dezembro de 1963. O documento não cita Lula.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula começa a trabalhar ainda menino (sem data documentada)

- Identificador: `lula-primeiros-trabalhos` · Tipo: Trabalho · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Segundo a biografia da Presidência da República, Lula teve o primeiro emprego aos 12 anos, em uma tinturaria, e também foi engraxate e office-boy. Aos 14 anos, começou a trabalhar com carteira assinada.
- **Divergência a conferir:** O emprego dos 14 anos varia: a biografia da Presidência diz que ele começou nos Armazéns Gerais Columbia e depois foi para a Fábrica de Parafusos Marte; o Arquivo Nacional diz que ele ingressou aos 14 anos na Fábrica de Parafusos Marte e não cita os Armazéns.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Segundo e terceiro parágrafos da biografia. Sustenta: Primeiro emprego aos 12 anos, em uma tinturaria; engraxate e office-boy; aos 14 anos, Armazéns Gerais Columbia, com a carteira de trabalho assinada pela primeira vez; depois, Fábrica de Parafusos Marte.
  - [Luiz Inácio Lula da Silva (biografias do Centro de Referência de Acervos Presidenciais)](https://presidentes.an.gov.br/index.php/centro-de-referencia-de-acervos-presidenciais/assuntos/biografias/204-luiz-inacio-lula-da-silva), Arquivo Nacional. Onde olhar: Primeiro parágrafo. Sustenta: Ingresso, aos 14 anos, na Fábrica de Parafusos Marte.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula é reeleito presidente do sindicato (1978)

- Identificador: `lula-reeleicao-no-sindicato` · Tipo: Atuação sindical · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Em 1978, Lula foi reeleito presidente do sindicato. Naquele ano, depois de dez anos sem greves operárias, ocorreram no país as primeiras paralisações.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Sexto parágrafo da biografia. Sustenta: Reeleição em 1978 e, depois de dez anos sem greves operárias, as primeiras paralisações no país.
  - [Biografia do Presidente da República](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biografia-do-presidente), Presidência da República. Onde olhar: Oitavo parágrafo. Sustenta: Em 1978, foi reeleito presidente do sindicato.
- [ ] Conferido por: ______ em ____/____/______

### Lula: Lula trabalha nas Indústrias Villares, em São Bernardo do Campo (sem data documentada)

- Identificador: `lula-trabalho-na-villares` · Tipo: Trabalho · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Escrito em 11 de outubro de 2026 a partir dos documentos baixados nesse dia, com assistência de IA: cada frase foi conferida contra o trecho literal do documento citado. O verbete do Dicionário Histórico-Biográfico Brasileiro (CPDOC/FGV) foi lido e não foi usado como fonte: o que só ele traz ficou de fora. Idades citadas pelos documentos não foram convertidas em anos. Revisão humana pendente.
- **Texto a conferir:** Depois de passar por várias fábricas, Lula ingressou nas Indústrias Villares, metalúrgica de São Bernardo do Campo. Trabalhando lá, começou a ter contato com o movimento sindical, por meio do irmão José Ferreira da Silva, conhecido como Frei Chico. Os documentos lidos não dizem em que ano ele entrou na empresa.
- Fontes:
  - [Biografia completa de Luiz Inácio Lula da Silva (Galeria dos Ex-Presidentes)](https://www.gov.br/secretariageral/pt-br/centrais-de-conteudo/biblioteca-da-pr/galeria-dos-ex-presidentes/luiz-inacio-lula-da-silva/biografia-completa), Presidência da República, Secretaria-Geral. Onde olhar: Quarto parágrafo da biografia. Sustenta: Passagem por várias fábricas até o ingresso nas Indústrias Villares, em São Bernardo do Campo; contato com o movimento sindical por meio do irmão, Frei Chico.
  - [Luiz Inácio Lula da Silva (biografias do Centro de Referência de Acervos Presidenciais)](https://presidentes.an.gov.br/index.php/centro-de-referencia-de-acervos-presidenciais/assuntos/biografias/204-luiz-inacio-lula-da-silva), Arquivo Nacional. Onde olhar: Primeiro parágrafo. Sustenta: Passagem pela Metalúrgica Independência e, depois, pela Metalúrgica Villares, em São Bernardo do Campo.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Anulação

- Identificador: `anulacao` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Anulação é a decisão que reconhece um defeito em um ato e o declara inválido. Quando o juízo não era o competente para o caso, anulam-se as decisões dele, e o processo vai para o juiz competente.
- **O que a definição simplifica:** A definição não diz que a pessoa foi considerada inocente nem culpada: a anulação trata da validade de atos do processo. Competente, aqui, é o juízo a quem a lei manda julgar o caso. O que cada decisão anulou está na própria decisão.
- Fontes:
  - [Glossário: Anulação](https://www.cnmp.mp.br/portal/institucional/476-glossario/8317-anulacao), Conselho Nacional do Ministério Público. Onde olhar: Verbete Anulação, primeira frase. Sustenta: A anulação reconhece a existência de vício ou defeito em um ato e o declara inválido ou desfeito.
  - [Decreto-Lei nº 3.689, de 3 de outubro de 1941 (Código de Processo Penal, texto compilado)](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 567. Sustenta: A incompetência do juízo anula somente os atos decisórios, e o processo é remetido ao juiz competente.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Assembleia Constituinte

- Identificador: `assembleia-constituinte` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Assembleia constituinte é a assembleia convocada especialmente para escrever a Constituição de um país. Uma emenda de 1985 mandou deputados e senadores se reunirem em Assembleia Nacional Constituinte em 1987. A Constituição em vigor é de 5 de outubro de 1988.
- **O que a definição simplifica:** A emenda citada determina a reunião para 1º de fevereiro de 1987; ela não é, sozinha, o registro de como os trabalhos aconteceram.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Assembleia Constituinte. Sustenta: Assembleia convocada especial ou extraordinariamente para elaborar a Constituição de um Estado.
  - [Emenda Constitucional nº 26, de 27 de novembro de 1985](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc_anterior1988/emc26-85.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 1º. Sustenta: Os membros da Câmara dos Deputados e do Senado se reuniriam em Assembleia Nacional Constituinte no dia 1º de fevereiro de 1987.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Preâmbulo e fecho do texto. Sustenta: A Constituição foi feita por representantes do povo reunidos em Assembleia Nacional Constituinte e traz a data de 5 de outubro de 1988.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Comissão

- Identificador: `comissao` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Comissão é um grupo de parlamentares da própria casa que analisa propostas e fiscaliza o governo. Dá parecer sobre propostas, discute e vota projetos de lei e faz audiências públicas. No Senado, cada comissão elege o seu presidente, que organiza e dirige os trabalhos.
- **O que a definição simplifica:** Há comissões permanentes e comissões temporárias. Entre as tarefas do presidente de uma comissão do Senado está escolher os relatores das matérias.
- Fontes:
  - [Glossário Legislativo (Senado Notícias)](https://www12.senado.leg.br/noticias/glossario-legislativo), Senado Federal, Agência Senado. Onde olhar: Verbete Comissão, primeira e segunda frases. Sustenta: Órgão parlamentar formado por membros da casa, com funções no processo legislativo e na fiscalização da administração pública; entre as atribuições, pareceres, discussão e votação de projetos e audiências públicas.
  - [Regimento Interno do Senado Federal: Resolução nº 93, de 1970 (volume 1, texto consolidado)](https://www25.senado.leg.br/documents/12427/45868/RISF+2018+Volume+1.pdf/cd5769c8-46c5-4c8a-9af7-99be436b89c4), Senado Federal. Onde olhar: Artigos 88 e 89, páginas 50 e 51. Sustenta: Cada comissão elege seu presidente e vice-presidente; ao presidente compete ordenar e dirigir os trabalhos e designar relatores.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 58, caput. Sustenta: O Congresso e suas casas têm comissões permanentes e temporárias.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Condenação e recurso

- Identificador: `condenacao-e-recurso` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Condenado é a pessoa a quem a Justiça impõe uma pena por considerá-la culpada. Recurso é o pedido para que uma decisão seja mudada, feito ao mesmo juízo ou a um tribunal acima dele. A segunda instância julga recursos contra decisões da primeira.
- **O que a definição simplifica:** Pela Constituição, ninguém é considerado culpado antes de a condenação se tornar definitiva, isto é, quando não cabe mais recurso.
- Fontes:
  - [Glossário Jurídico](https://portal.stf.jus.br/jurisprudencia/glossario.asp), Supremo Tribunal Federal. Onde olhar: Verbetes Condenado e Instância. Sustenta: Condenado é aquele a quem é imposta uma pena correspondente à infração de que foi considerado culpado; as ações em geral se iniciam na primeira instância, e a segunda julga recursos.
  - [Glossário: Recurso](https://www.cnmp.mp.br/portal/institucional/476-glossario/7800-recurso), Conselho Nacional do Ministério Público. Onde olhar: Verbete Recurso. Sustenta: Instrumento para pedir a mudança de uma decisão, na mesma instância ou em instância superior.
  - [Glossário: Instância](https://www.cnmp.mp.br/portal/institucional/476-glossario/8009-instancia), Conselho Nacional do Ministério Público. Onde olhar: Verbete Instância, segunda frase. Sustenta: A primeira instância, onde em geral começam as ações, é composta por juízes.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 5º, inciso LVII. Sustenta: Ninguém é considerado culpado até o trânsito em julgado de sentença penal condenatória.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Convenção partidária e registro de candidatura

- Identificador: `convencao-e-registro-de-candidatura` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Convenção partidária é a reunião dos filiados de um partido; é nela que o partido escolhe seus candidatos. Registro de candidatura é a inscrição, na Justiça Eleitoral, das pessoas escolhidas em convenção para disputar a eleição.
- **O que a definição simplifica:** Pela lei em vigor, as convenções acontecem de 20 de julho a 5 de agosto do ano da eleição; em eleições antigas o prazo era outro. A Justiça Eleitoral pode aceitar ou negar o registro.
- Fontes:
  - [Glossário Eleitoral: termos iniciados com a letra C](https://www.tse.jus.br/servicos-eleitorais/glossario/termos-iniciados-com-a-letra-c), Tribunal Superior Eleitoral. Onde olhar: Verbete Convenção partidária, primeiro e terceiro parágrafos. Sustenta: Reunião dos filiados a um partido para deliberar sobre assuntos de interesse dele; as convenções para escolha de candidatos se realizam de 20 de julho a 5 de agosto do ano da eleição.
  - [Glossário Eleitoral: termos iniciados com a letra R](https://www.tse.jus.br/servicos-eleitorais/glossario/termos-iniciados-com-a-letra-r), Tribunal Superior Eleitoral. Onde olhar: Verbete Registro de candidato. Sustenta: Inscrição na Justiça Eleitoral das pessoas escolhidas em convenção partidária para concorrer a cargos eletivos.
  - [Glossário Eleitoral: termos iniciados com a letra C](https://www.tse.jus.br/servicos-eleitorais/glossario/termos-iniciados-com-a-letra-c), Tribunal Superior Eleitoral. Onde olhar: Verbete Candidato. Sustenta: Candidato é quem tem o registro deferido pela Justiça Eleitoral.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Decreto

- Identificador: `decreto` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Decreto é um ato do presidente da República. Pode tratar de um caso específico, como uma nomeação, ou detalhar como uma lei deve ser cumprida.
- **O que a definição simplifica:** O glossário citado fala só do decreto do presidente da República.
- Fontes:
  - [Glossário Legislativo (Senado Notícias)](https://www12.senado.leg.br/noticias/glossario-legislativo), Senado Federal, Agência Senado. Onde olhar: Verbete Decreto, segunda frase. Sustenta: O decreto pode ser singular, quando trata de assuntos como nomeação, ou regulamentar, para executar norma instituída por lei.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 84, inciso IV. Sustenta: Compete ao presidente expedir decretos e regulamentos para a fiel execução das leis.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Denúncia

- Identificador: `denuncia` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Denúncia é o documento em que o Ministério Público acusa formalmente alguém de um crime perante a Justiça. É uma acusação, e não uma condenação: pela Constituição, ninguém é considerado culpado antes de a condenação se tornar definitiva.
- **O que a definição simplifica:** Depois de apresentada a denúncia, a Justiça ainda decide se a recebe ou se a rejeita.
- Fontes:
  - [Glossário Jurídico](https://portal.stf.jus.br/jurisprudencia/glossario.asp), Supremo Tribunal Federal. Onde olhar: Verbete Denúncia, primeira acepção. Sustenta: Peça pela qual o membro do Ministério Público formaliza a acusação perante o tribunal, dando início à ação penal pública.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 5º, inciso LVII. Sustenta: Ninguém é considerado culpado até o trânsito em julgado de sentença penal condenatória.
  - [Decreto-Lei nº 3.689, de 3 de outubro de 1941 (Código de Processo Penal, texto compilado)](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 396, caput. Sustenta: O juiz, se não rejeitar a denúncia, a recebe e ordena a citação do acusado.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Deputado estadual

- Identificador: `deputado-estadual` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Deputado estadual é o parlamentar da assembleia legislativa, que é o Poder Legislativo de cada estado. É eleito pelo povo, e o mandato dura quatro anos. Cabe à assembleia fazer, discutir e aprovar as leis estaduais.
- **O que a definição simplifica:** A regra do mandato de quatro anos é a da Constituição de 1988.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Assembleia Legislativa. Sustenta: Órgão do Poder Legislativo de cada estado, cujos membros são eleitos pelo povo e ao qual cabe elaborar, discutir e aprovar as normas jurídicas.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 27, parágrafo 1º. Sustenta: O mandato dos deputados estaduais é de quatro anos.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Deputado federal

- Identificador: `deputado-federal` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Deputado federal é o parlamentar que representa o povo na Câmara dos Deputados. É eleito em cada estado e no Distrito Federal, e o mandato dura quatro anos.
- **O que a definição simplifica:** Ficou de fora como os votos viram vagas (o sistema proporcional) e quantos deputados cada estado tem.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Deputado Federal. Sustenta: Parlamentar representante do povo, eleito em cada unidade da Federação para a Câmara dos Deputados; o mandato dura quatro anos.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Greve

- Identificador: `greve` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Greve é quando trabalhadores, juntos, param de trabalhar por um tempo, de forma pacífica, no todo ou em parte. A Constituição de 1988 garante esse direito, e são os trabalhadores que decidem quando usá-lo.
- **O que a definição simplifica:** A lei citada é de 1989, e a Constituição, de 1988: as duas são posteriores às greves de 1978 a 1980 e não dizem como a greve era tratada naquele tempo.
- Fontes:
  - [Lei nº 7.783, de 28 de junho de 1989 (Lei de Greve)](https://www.planalto.gov.br/ccivil_03/leis/l7783.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 2º. Sustenta: A lei considera legítimo exercício do direito de greve a suspensão coletiva, temporária e pacífica, total ou parcial, da prestação de serviços.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 9º, caput. Sustenta: O direito de greve é assegurado, e cabe aos trabalhadores decidir sobre a oportunidade de exercê-lo.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Intervenção federal

- Identificador: `intervencao-federal` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Intervenção federal é uma medida excepcional em que a União interfere em um estado ou no Distrito Federal e retira, por um tempo, a autonomia dele. É feita por decreto, que diz o alcance e o prazo, e o Congresso examina o decreto.
- **O que a definição simplifica:** A regra é a União não intervir; a Constituição lista os casos em que pode. O alcance de cada intervenção é o que o decreto dela diz, e pode se limitar a uma área.
- Fontes:
  - [Glossário Jurídico](https://portal.stf.jus.br/jurisprudencia/glossario.asp), Supremo Tribunal Federal. Onde olhar: Verbete Intervenção federal. Sustenta: Medida excepcional de interferência da União nos estados ou no Distrito Federal, que suprime temporariamente a autonomia deles.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 34, caput, e artigo 36, parágrafo 1º. Sustenta: A União não intervém nos estados nem no Distrito Federal, salvo nos casos listados; o decreto de intervenção especifica a amplitude, o prazo e as condições e é submetido ao Congresso Nacional.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Lei complementar

- Identificador: `lei-complementar` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Lei complementar é um tipo de lei que precisa do voto de mais da metade de todos os membros de cada casa do Congresso. A Constituição diz quais assuntos exigem esse tipo de lei.
- **O que a definição simplifica:** A lei comum (ordinária) precisa só da maioria simples dos votos.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Lei Complementar (LC). Sustenta: Norma aprovada pela maioria absoluta dos membros de cada casa do Poder Legislativo; a Constituição determina quais matérias são reservadas à lei complementar.
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Lei Ordinária. Sustenta: A lei ordinária depende, para ser aprovada, de maioria simples de votos.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Líder e Minoria

- Identificador: `lider-e-minoria` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Líder é o parlamentar escolhido para representar a bancada do seu partido, ou o bloco de partidos de que faz parte. Minoria, no Congresso, é o nome de uma posição: o maior partido ou bloco que se posiciona contra a Maioria.
- **O que a definição simplifica:** Minoria não é a mesma coisa que oposição: oposição é o conjunto de partidos e blocos que se opõem ao governo e, em geral, se alinham com a Minoria.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbetes Líder, Minoria Parlamentar e Oposição. Sustenta: Líder: parlamentar escolhido para representar sua bancada ou bloco. Minoria: maior partido ou bloco que se posiciona contrariamente à Maioria. Oposição: partidos e blocos que se opõem ao governo.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Medida provisória

- Identificador: `medida-provisoria` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Medida provisória é uma regra com força de lei que o presidente da República pode baixar em caso importante e urgente. Ela tem de ser enviada logo ao Congresso e perde a validade se não virar lei no prazo.
- **O que a definição simplifica:** O prazo é de sessenta dias, prorrogável uma vez pelo mesmo tempo. A redação citada é de 2001. Ficaram de fora os assuntos em que a medida provisória é proibida.
- Fontes:
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 62, caput. Sustenta: Em caso de relevância e urgência, o presidente pode adotar medidas provisórias, com força de lei, e deve submetê-las de imediato ao Congresso Nacional.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 62, parágrafo 3º. Sustenta: As medidas provisórias perdem a eficácia se não forem convertidas em lei em sessenta dias, prazo prorrogável uma vez por igual período.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Partido político

- Identificador: `partido-politico` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Partido político é um grupo organizado em torno de ideias e interesses, que busca levar seus membros a participar das decisões de governo. Suas regras internas, o estatuto, são registradas no Tribunal Superior Eleitoral.
- **O que a definição simplifica:** A Lei dos Partidos Políticos define o partido pelo fim a que serve: garantir, no interesse da democracia, que a representação do povo seja autêntica.
- Fontes:
  - [Glossário Eleitoral: termos iniciados com a letra P](https://www.tse.jus.br/servicos-eleitorais/glossario/termos-iniciados-com-a-letra-p), Tribunal Superior Eleitoral. Onde olhar: Verbete Partido político. Sustenta: O partido é um grupo destinado à arregimentação coletiva, em torno de ideias e de interesses, para levar seus membros a compartilhar do poder de decisão nas instâncias de governo.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 17, parágrafo 2º. Sustenta: Os partidos registram seus estatutos no Tribunal Superior Eleitoral.
  - [Lei nº 9.096, de 19 de setembro de 1995 (Lei dos Partidos Políticos, texto compilado)](https://www.planalto.gov.br/ccivil_03/leis/l9096.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 1º, caput. Sustenta: O partido político destina-se a assegurar, no interesse do regime democrático, a autenticidade do sistema representativo.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: PEC, a proposta de emenda à Constituição

- Identificador: `pec` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** PEC é a proposta para mudar o texto da Constituição. É votada duas vezes na Câmara e duas vezes no Senado, e só passa com três quintos dos votos dos membros em todas as votações.
- **O que a definição simplifica:** Ficou de fora quem pode propor uma PEC. A emenda aprovada é promulgada pelas Mesas da Câmara e do Senado.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Proposta de Emenda à Constituição (PEC). Sustenta: Proposição legislativa destinada a alterar a Constituição Federal.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 60, parágrafo 2º. Sustenta: A proposta é discutida e votada em cada casa do Congresso, em dois turnos, e é aprovada se obtiver, em ambos, três quintos dos votos dos membros.
  - [Emenda Constitucional nº 41, de 19 de dezembro de 2003](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc41.htm), Presidência da República (Portal da Legislação). Onde olhar: Preâmbulo. Sustenta: Exemplo de promulgação: as Mesas da Câmara dos Deputados e do Senado Federal promulgam a emenda.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Presidente da República

- Identificador: `presidente-da-republica` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** O presidente da República chefia o Poder Executivo do país, com a ajuda dos ministros. Cabe a ele, entre outras coisas, sancionar ou vetar os projetos de lei que o Congresso aprova e fazer decretos para que as leis sejam cumpridas.
- **O que a definição simplifica:** A Constituição lista mais de vinte competências do presidente; aqui estão só as que a trilha usa.
- Fontes:
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 76. Sustenta: O Poder Executivo é exercido pelo presidente da República, auxiliado pelos ministros de Estado.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 84, incisos IV e V. Sustenta: Compete ao presidente sancionar, promulgar e fazer publicar as leis, expedir decretos para a sua execução e vetar projetos de lei, total ou parcialmente.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Projeto de lei

- Identificador: `projeto-de-lei` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Projeto de lei é uma proposta de lei. No Congresso, o projeto aprovado em uma das casas (Câmara ou Senado) é examinado pela outra; depois de aprovado, vai ao presidente da República, que pode sancionar ou vetar.
- **O que a definição simplifica:** O glossário citado trata do projeto de lei federal. No estado do Rio de Janeiro, as páginas das leis mostram o mesmo caminho: a Assembleia Legislativa aprova e o governador sanciona.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Projeto de Lei (PL). Sustenta: Proposição sobre matéria de competência da União, que se sujeita, depois de aprovada, à sanção ou ao veto presidencial.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 65, caput. Sustenta: O projeto de lei aprovado por uma casa é revisto pela outra.
  - [Lei nº 4250, de 2003, do estado do Rio de Janeiro: texto e ficha técnica (acervo de leis da Alerj)](https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=53&url=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmLzFmOTYwOGQ0Mzk2ZTY3ZGU4MzI1NmUwYzAwNjdiYmY1P09wZW5Eb2N1bWVudA==), Assembleia Legislativa do Estado do Rio de Janeiro. Onde olhar: Fórmula de sanção, no texto da lei. Sustenta: Exemplo estadual: a Assembleia Legislativa decreta e o governador sanciona.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Proposta de governo

- Identificador: `proposta-de-governo` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Proposta de governo é o documento com as propostas defendidas pelo candidato a presidente, a governador ou a prefeito. A lei manda entregá-lo à Justiça Eleitoral junto com o pedido de registro da candidatura. É o que a candidatura diz que pretende fazer.
- **O que a definição simplifica:** Uma proposta não é ato, voto nem resultado: é intenção declarada. A lei citada pede o documento e não diz, nesse trecho, o que acontece se a proposta não for cumprida.
- Fontes:
  - [Lei nº 9.504, de 30 de setembro de 1997 (Lei das Eleições, texto compilado)](https://www.planalto.gov.br/ccivil_03/leis/l9504.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 11, parágrafo 1º, inciso IX. Sustenta: O pedido de registro deve ser instruído com as propostas defendidas pelo candidato a prefeito, a governador de estado e a presidente da República.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Rejeição da denúncia

- Identificador: `rejeicao-da-denuncia` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Apresentada a denúncia, a Justiça decide: ou a rejeita logo, ou a recebe e manda chamar o acusado para responder à acusação. A lei manda rejeitar a denúncia, por exemplo, quando falta justa causa para a ação penal.
- **O que a definição simplifica:** A rejeição acontece antes de o acusado ser chamado a responder à acusação. A lei não define justa causa nesses artigos, nem diz neles se uma nova denúncia pode ser apresentada depois. A redação citada é de 2008.
- Fontes:
  - [Decreto-Lei nº 3.689, de 3 de outubro de 1941 (Código de Processo Penal, texto compilado)](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigos 395 e 396. Sustenta: A denúncia é rejeitada quando faltar justa causa para o exercício da ação penal, entre outros motivos; se não a rejeitar, o juiz a recebe e ordena a citação do acusado para responder à acusação.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Relator

- Identificador: `relator` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Relator é o parlamentar escolhido para estudar uma proposta e escrever um relatório ou parecer sobre ela, recomendando que seja aprovada ou rejeitada.
- **O que a definição simplifica:** O relator recomenda; a proposta ainda é votada. No Senado, quem escolhe os relatores das matérias em uma comissão é o presidente da comissão.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Relator. Sustenta: O relator elabora relatório ou parecer sobre a proposição, no qual recomenda sua aprovação ou rejeição.
  - [Regimento Interno do Senado Federal: Resolução nº 93, de 1970 (volume 1, texto consolidado)](https://www25.senado.leg.br/documents/12427/45868/RISF+2018+Volume+1.pdf/cd5769c8-46c5-4c8a-9af7-99be436b89c4), Senado Federal. Onde olhar: Artigo 89, inciso III, página 51. Sustenta: Ao presidente de comissão compete designar, na comissão, relatores para as matérias.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Sanção

- Identificador: `sancao` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Sanção é o ato em que o chefe do Poder Executivo concorda com o projeto aprovado pelo Poder Legislativo. Com ela, o projeto vira lei. No governo federal, quem sanciona é o presidente da República.
- **O que a definição simplifica:** Se o presidente não disser nada em quinze dias, o projeto é considerado sancionado.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Sanção. Sustenta: A sanção é a concordância, expressa ou tácita, do chefe do Poder Executivo com o projeto aprovado pelo Poder Legislativo, e encerra a fase de formação da lei.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 66, parágrafo 3º. Sustenta: Decorrido o prazo de quinze dias, o silêncio do presidente importa sanção.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Senador

- Identificador: `senador` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Senador é o parlamentar que representa seu estado ou o Distrito Federal no Senado. Cada estado tem três senadores, e o mandato dura oito anos.
- **O que a definição simplifica:** Ficou de fora como o senador é eleito (o sistema majoritário) e a renovação das vagas de quatro em quatro anos.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Senador. Sustenta: Parlamentar representante dos estados ou do Distrito Federal; cada unidade da Federação tem três senadores, com mandato de oito anos.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Sindicato

- Identificador: `sindicato` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Sindicato é a organização que defende os direitos e os interesses de uma categoria de trabalhadores ou de empregadores, de todos juntos ou de cada um, inclusive na Justiça e diante de órgãos públicos.
- **O que a definição simplifica:** A frase vem da Constituição de 1988, que é posterior às eleições sindicais de 1969, 1975 e 1978. Ficaram de fora as demais regras do artigo 8º da Constituição.
- Fontes:
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 8º, inciso III. Sustenta: Ao sindicato cabe a defesa dos direitos e interesses coletivos ou individuais da categoria, inclusive em questões judiciais ou administrativas.
  - [Decreto-Lei nº 5.452, de 1º de maio de 1943 (Consolidação das Leis do Trabalho, texto compilado)](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 511, caput, na seção Da Associação em Sindicato. Sustenta: A associação em sindicato é de empregadores e de empregados, para estudo, defesa e coordenação dos seus interesses.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Primeiro e segundo turno

- Identificador: `turnos-da-eleicao` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** No primeiro turno, todos os candidatos disputam. Se nenhum passar da metade dos votos válidos, há segundo turno, só entre os dois mais votados. É assim na eleição para presidente da República.
- **O que a definição simplifica:** Votos válidos são os votos sem os brancos e os nulos. A regra citada é a da Constituição de 1988 e da Lei das Eleições, de 1997; eleições anteriores seguiam outras regras.
- Fontes:
  - [Glossário Eleitoral: termos iniciados com a letra T](https://www.tse.jus.br/servicos-eleitorais/glossario/termos-iniciados-com-a-letra-t), Tribunal Superior Eleitoral. Onde olhar: Verbete Turno eleitoral. Sustenta: No primeiro turno concorrem todos os candidatos; no segundo, só os dois primeiros colocados do turno anterior.
  - [Lei nº 9.504, de 30 de setembro de 1997 (Lei das Eleições, texto compilado)](https://www.planalto.gov.br/ccivil_03/leis/l9504.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 2º, parágrafo 1º. Sustenta: Se nenhum candidato alcançar maioria absoluta na primeira votação, há nova eleição entre os dois mais votados.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 77, parágrafo 2º. Sustenta: É eleito presidente o candidato que obtiver a maioria absoluta de votos, não computados os em branco e os nulos.
- [ ] Conferido por: ______ em ____/____/______

### Conceito: Veto

- Identificador: `veto` · Revisão: conferência assistida por IA, por Claude, modelo de IA da Anthropic, em 2026-10-11; observações: Definição escrita em 11 de outubro de 2026, em português simples, a partir do texto oficial baixado nesse dia, com assistência de IA: a definição diz só o que o trecho citado sustenta, e o campo de simplificação avisa o que ficou de fora. Os textos de lei são os compilados do Portal da Legislação, com a redação em vigor. Revisão humana pendente.
- **Definição a conferir:** Veto é o ato do presidente da República de recusar um projeto de lei aprovado pelo Congresso, inteiro (veto total) ou em parte (veto parcial). O Congresso pode derrubar o veto; nesse caso, o trecho vetado passa a fazer parte da lei.
- **O que a definição simplifica:** O presidente veta o que considera contrário à Constituição ou ao interesse público. No veto parcial, só pode tirar um artigo, parágrafo, inciso ou alínea inteiro. Para derrubar o veto é preciso a maioria absoluta dos deputados e senadores.
- Fontes:
  - [Glossário de Termos Legislativos](https://www.congressonacional.leg.br/legislacao-e-publicacoes/glossario-legislativo), Congresso Nacional. Onde olhar: Verbete Veto Presidencial. Sustenta: Instrumento usado pelo presidente da República para recusar a sanção de projeto de lei, no todo ou em parte.
  - [Constituição da República Federativa do Brasil de 1988 (texto compilado)](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm), Presidência da República (Portal da Legislação). Onde olhar: Artigo 66, parágrafos 1º, 2º e 4º. Sustenta: O veto pode ser total ou parcial, por inconstitucionalidade ou contrariedade ao interesse público; o veto parcial abrange texto integral de artigo, parágrafo, inciso ou alínea; o veto só pode ser rejeitado pela maioria absoluta dos deputados e senadores.
  - [Entenda o processo legislativo](https://www.camara.leg.br/entenda-o-processo-legislativo/), Câmara dos Deputados. Onde olhar: Item 7, Veto. Sustenta: Se os vetos forem derrubados, os trechos antes vetados passam a integrar a lei.
- [ ] Conferido por: ______ em ____/____/______
