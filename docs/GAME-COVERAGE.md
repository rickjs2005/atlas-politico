# Jogo: matriz de cobertura

Gerado por `npm run game:coverage` a partir dos dados publicados (edição 0.4.0, data de corte 2026-10-08): as fases vêm de `content/published/fasesDoJogo.json`, e o cenário de cada uma, de `src/lib/game/presentation.ts`. Não edite à mão: o teste `tests/game-coverage.test.ts` confere que este arquivo está em dia e que nenhum acontecimento e nenhuma decisão publicados ficaram fora das fases sem justificativa.

Duas coisas diferentes: **acessível no jogo** quer dizer que o registro aparece em alguma fase, como marco, na explicação, na atividade ou em Explorar este período; **obrigatório para avançar** não existe: nenhuma fase segura a seguinte, e a atividade pode ser respondida ou lida. A pesquisa do conteúdo, com o que foi conferido, o que entrou e o que ficou de fora, está em `research/trilha-2026-10.md`. O motivo da escolha de cada marco não foi registrado: os marcos foram escolhidos na redação das fases.

Na edição: 24 fases, 14 fatos biográficos, 26 conceitos, 39 acontecimentos, 32 decisões (votos vigentes, atos do Executivo e atuações legislativas) e 42 propostas eleitorais. O primeiro turno de 2026 pertence às duas pessoas e aparece na trilha de cada uma.

## Flávio Bolsonaro

12 fases, 20 acontecimentos publicados (20 acessíveis no jogo), 15 decisões publicadas (15 acessíveis no jogo).

### Trajetória

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Origem e formação (`flavio-bolsonaro-origem`) | 1981 a 2001 | saber onde Flávio Bolsonaro nasceu, de que família vem e o que estudou. | `fato:flavio-bolsonaro-nascimento` | 3 (0 em Explorar) | pergunta, 3 opções | 90 | Sala de arquivo (`arquivo-origem-b`); figura dos primeiros anos | assistida por IA; humana pendente |
| 2 | A primeira eleição (`flavio-bolsonaro-primeira-eleicao`) | 2002 a 2003 | entender o que faz um deputado estadual e como Flávio Bolsonaro chegou ao cargo. | `acontecimento:flavio-bolsonaro-2002-eleito-deputado-estadual` | 6 (2 em Explorar) | pergunta, 3 opções | 95 | Salão da Assembleia (`alerj`); figura dos primeiros anos | assistida por IA; humana pendente |
| 3 | Na Alerj: como um projeto vira lei (`flavio-bolsonaro-alerj-primeiros-mandatos`) | 2003 a 2010 | ver, com exemplos, como um projeto de deputado vira lei estadual. | `decisao:alerj-lei-4250-2003-autoria` | 8 (2 em Explorar) | pergunta, 3 opções | 91 | Salão da Assembleia (`alerj`); figura dos primeiros anos | assistida por IA; humana pendente |
| 4 | Na Alerj: os últimos mandatos (`flavio-bolsonaro-alerj-ultimos-mandatos`) | 2011 a 2018 | ver que uma lei também pode nascer sem a sanção do governador e acompanhar os últimos anos dele na Alerj. | `decisao:alerj-lei-5938-2011-autoria` | 8 (4 em Explorar) | pergunta, 3 opções | 98 | Salão da Assembleia (`alerj`); figura dos anos intermediários | assistida por IA; humana pendente |
| 5 | Do Rio de Janeiro para o Senado (`flavio-bolsonaro-senado`) | 2018 a 2019 | entender o que é um senador e como Flávio Bolsonaro chegou ao Senado. | `acontecimento:flavio-bolsonaro-2018-eleito-senador` | 5 (1 em Explorar) | pergunta, 3 opções | 91 | Plenário do Senado (`senado`); figura dos anos intermediários | assistida por IA; humana pendente |
| 6 | Denúncia, anulação e rejeição (`flavio-bolsonaro-processos`) | 2019 a 2025 | acompanhar, na ordem, o que a Justiça decidiu sobre a denúncia contra Flávio Bolsonaro e entender o que é rejeitar uma denúncia. | `acontecimento:flavio-bolsonaro-2022-tribunal-rejeita-denuncia` | 10 (5 em Explorar) | ordenação, 3 registros | 96 | Sala de audiências (`tribunal-b`); figura dos anos intermediários | assistida por IA; humana pendente |
| 7 | Líder, relator e presidente de comissão (`flavio-bolsonaro-funcoes-no-senado`) | 2022 a 2025 | entender três funções que um senador pode ter: líder, relator e presidente de comissão. | `acontecimento:flavio-bolsonaro-2024-relatoria-das-saidas-temporarias` | 11 (4 em Explorar) | pergunta, 3 opções | 100 | Sala de comissão (`comissao`); figura dos anos recentes | assistida por IA; humana pendente |
| 8 | Como ler um voto no Senado (`flavio-bolsonaro-decisoes-no-senado`) | 2023 a 2025 | ler um voto nominal: o que foi votado, como ele votou e qual foi o resultado. | `decisao:senado-voto-6777-5894` | 7 (5 em Explorar) | pergunta, 3 opções | 92 | Plenário do Senado (`senado`); figura dos anos recentes | assistida por IA; humana pendente |
| 9 | A eleição de 2026 (`flavio-bolsonaro-eleicao-2026`) | 2025 a 2026 | saber como estava a eleição de 2026 em 8 de outubro, até onde este atlas vai, e onde ler o que a candidatura propõe. | `acontecimento:eleicao-2026-primeiro-turno` | 13 (8 em Explorar) | pergunta, 3 opções | 99 | Auditório de convenção (`convencao-b`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: A infância, a escola básica e a cidade em que ele cresceu: nenhum documento oficial lido traz.
- Fase 1: O ano em que ele concluiu cada curso.
- Fase 2: O número de votos de 2002: esta edição não localizou documento oficial com o total já somado.
- Fase 2: A data de filiação ao PPB.
- Fase 3: O atlas registra oito leis de autoria individual dele, duas por legislatura, por regra fixa. O acervo da Alerj lista outras.
- Fase 3: Os projetos que não viraram lei, os votos dele e as comissões de que participou na Alerj.
- Fase 4: Por que cada lei foi promulgada pela Assembleia, e não sancionada pelo governador: a página cita os parágrafos 5º e 7º do artigo 115 da Constituição do Estado, que esta edição não leu, e a tramitação não foi pesquisada.
- Fase 4: O resultado da ação de inconstitucionalidade a que a Lei 5.938 foi submetida.
- Fase 4: As datas de entrada dele no PSC e no PSL.
- Fase 5: O número de votos de 2018 não está no registro: o atlas traz o percentual informado pela Agência Senado.
- Fase 5: As comissões de que ele participou no Senado foram lidas na pesquisa e não têm registro próprio nesta edição.
- Fase 6: O que aconteceu no caso depois de fevereiro de 2025: o processo tramita em segredo de justiça, e o andamento depois de 2022 vem de reportagens citadas na ficha do atlas.
- Fase 6: A data de filiação dele ao Republicanos.
- Fase 7: O Senado lista outras relatorias dele e as comissões de que participou: o atlas registra duas relatorias e os cargos de direção.
- Fase 7: Se o parecer dele foi aprovado em cada relatoria: os serviços consultados não dizem.
- Fase 8: O atlas registra seis votos, em economia e segurança pública, de 2023 a 2025. Os demais temas e os anos de 2019 a 2022 não foram pesquisados.
- Fase 8: Votações secretas e simbólicas não registram a posição de cada senador.
- Fase 9: O atlas registra três frases por área de cada documento. O documento inteiro tem outras propostas e capítulos fora das sete áreas.
- Fase 9: O segundo turno ficou marcado para depois da data de corte desta edição.

### Aprofundamento: Economia

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Economia: três votos de Flávio Bolsonaro no Senado (`flavio-bolsonaro-economia`) | 2023 a 2026 | ver como ele votou em três propostas de economia e o que cada uma era. | `decisao:senado-voto-6714-5894` | 6 (3 em Explorar) | pergunta, 3 opções | 92 | Sala de arquivo (`arquivo-economia-b`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: Os votos dele em economia de 2019 a 2022 não foram pesquisados.
- Fase 1: Os votos dele na Alerj, de 2003 a 2018, não foram pesquisados.
- Fase 1: É uma amostra de três votações: não é a lista de como ele votou na área.

### Aprofundamento: Segurança pública

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Segurança pública: três votos de Flávio Bolsonaro no Senado (`flavio-bolsonaro-seguranca-publica`) | 2024 a 2026 | ver como ele votou em três propostas de segurança pública e o que cada uma era. | `decisao:senado-voto-6818-5894` | 8 (3 em Explorar) | pergunta, 3 opções | 85 | Sala de arquivo (`arquivo-seguranca-b`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: Os votos dele em segurança pública de 2019 a 2022 não foram pesquisados.
- Fase 1: Os votos dele na Alerj, de 2003 a 2018, não foram pesquisados.
- Fase 1: É uma amostra de três votações: não é a lista de como ele votou na área.

### Missão: O documento diz o quê?

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | O documento diz o quê? Três votos no Senado (`flavio-bolsonaro-investigacao`) | 2007 a 2024 | ler três documentos, montar um dossiê e relacionar cada ficha ao documento que a sustenta. | `decisao:senado-voto-6777-5894` | 3 (0 em Explorar) | dossiê, 3 fichas e 6 documentos | 93 | Sala de investigação (`arquivo-investigacao-b`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: É uma amostra de cinco votações no Senado e uma lei estadual, e não a lista de como ele votou.
- Fase 1: O registro do voto não diz, sozinho, o motivo do voto, e o atlas não o pesquisou.

### Acontecimento → fases

| Data | Acontecimento | Identificador | Onde aparece |
| --- | --- | --- | --- |
| 6 de outubro de 2002 | Flávio Bolsonaro é eleito deputado estadual no Rio de Janeiro | `flavio-bolsonaro-2002-eleito-deputado-estadual` | Trajetória, fase 2 (marco, na explicação, na atividade) |
| 2006 | Flávio Bolsonaro é reeleito deputado estadual | `flavio-bolsonaro-2006-reeleito-deputado-estadual` | Trajetória, fase 3 (na explicação) |
| 2010 | Flávio Bolsonaro é reeleito deputado estadual pela segunda vez | `flavio-bolsonaro-2010-reeleito-deputado-estadual` | Trajetória, fase 3 (na explicação) |
| 2014 | Flávio Bolsonaro conquista o quarto mandato de deputado estadual | `flavio-bolsonaro-2014-reeleito-deputado-estadual` | Trajetória, fase 4 (na explicação) |
| 2016 | Flávio Bolsonaro disputa a Prefeitura do Rio de Janeiro e não é eleito | `flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio` | Trajetória, fase 4 (na explicação, na atividade) |
| 2018 | Flávio Bolsonaro é eleito senador pelo Rio de Janeiro | `flavio-bolsonaro-2018-eleito-senador` | Trajetória, fase 5 (marco, na explicação, na atividade) |
| 6 de fevereiro de 2019 | Flávio Bolsonaro assume a 3ª Secretaria da Mesa do Senado | `flavio-bolsonaro-2019-terceiro-secretario-do-senado` | Trajetória, fase 5 (na explicação) |
| 19 de novembro de 2019 | Flávio Bolsonaro deixa o PSL | `flavio-bolsonaro-2019-saida-do-psl` | Trajetória, fase 6 (em Explorar este período) |
| 4 de novembro de 2020 | Ministério Público do Rio denuncia Flávio Bolsonaro no caso das “rachadinhas” | `flavio-bolsonaro-2020-denuncia-do-ministerio-publico` | Trajetória, fase 6 (na explicação, na atividade) |
| 31 de maio de 2021 | Flávio Bolsonaro se filia ao Patriota | `flavio-bolsonaro-2021-filiacao-ao-patriota` | Trajetória, fase 6 (em Explorar este período) |
| 9 de novembro de 2021 | STJ anula decisões da primeira instância na investigação das “rachadinhas” | `flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao` | Trajetória, fase 6 (na explicação, na atividade) |
| 30 de novembro de 2021 | Flávio Bolsonaro se filia ao PL | `flavio-bolsonaro-2021-filiacao-ao-pl` | Trajetória, fase 6 (em Explorar este período) |
| 16 de maio de 2022 | Tribunal de Justiça do Rio rejeita a denúncia contra Flávio Bolsonaro | `flavio-bolsonaro-2022-tribunal-rejeita-denuncia` | Trajetória, fase 6 (marco, na explicação, na atividade) |
| 10 de junho de 2022 | Flávio Bolsonaro assume a liderança do PL no Senado | `flavio-bolsonaro-2022-lider-do-pl-no-senado` | Trajetória, fase 7 (na explicação) |
| 5 de abril de 2023 | Flávio Bolsonaro se torna líder da Minoria no Congresso Nacional | `flavio-bolsonaro-2023-lider-da-minoria-no-congresso` | Trajetória, fase 7 (na explicação) |
| 20 de fevereiro de 2024 | Senado aprova projeto relatado por Flávio Bolsonaro que restringe saídas temporárias de presos | `flavio-bolsonaro-2024-relatoria-das-saidas-temporarias` | Trajetória, fase 7 (marco, na explicação, na atividade); Aprofundamento: Segurança pública, fase 1 (na explicação, na atividade) |
| 19 de fevereiro de 2025 | Flávio Bolsonaro assume a presidência da Comissão de Segurança Pública do Senado | `flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica` | Trajetória, fase 7 (na explicação); Aprofundamento: Segurança pública, fase 1 (na explicação) |
| 5 de dezembro de 2025 | Flávio Bolsonaro é indicado pelo pai como candidato do PL à Presidência | `flavio-bolsonaro-2025-indicacao-para-a-presidencia` | Trajetória, fase 9 (em Explorar este período) |
| 25 de julho de 2026 | PL oficializa a candidatura de Flávio Bolsonaro à Presidência | `flavio-bolsonaro-2026-convencao-do-pl` | Trajetória, fase 9 (na explicação) |
| 4 de outubro de 2026 | Flávio Bolsonaro e Lula passam ao segundo turno da eleição presidencial | `eleicao-2026-primeiro-turno` | Trajetória, fase 9 (marco, na explicação) |

### Decisão → fases

| Data | Decisão | Natureza | Temas | Identificador | Onde aparece |
| --- | --- | --- | --- | --- | --- |
| 29 de dezembro de 2003 | Autoria da Lei estadual 4.250/2003, sobre ingresso no serviço público | atuação legislativa | sem tema | `alerj-lei-4250-2003-autoria` | Trajetória, fase 3 (marco, na explicação, na atividade) |
| 8 de dezembro de 2006 | Autoria da Lei estadual 4.916/2006, sobre laqueadura e vasectomia gratuitas | atuação legislativa | Saúde | `alerj-lei-4916-2006-autoria` | Trajetória, fase 3 (na explicação) |
| 19 de abril de 2007 | Autoria da Lei estadual 5.019/2007, sobre policiais e bombeiros militares em serviço na Alerj e no Tribunal de Justiça | atuação legislativa | Segurança pública | `alerj-lei-5019-2007-autoria` | Trajetória, fase 3 (em Explorar este período); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 15 de janeiro de 2010 | Autoria da Lei estadual 5.646/2010, sobre o Ano do Planejamento Familiar | atuação legislativa | Saúde | `alerj-lei-5646-2010-autoria` | Trajetória, fase 3 (em Explorar este período) |
| 4 de abril de 2011 | Autoria da Lei estadual 5.938/2011, sobre exame psicológico em concursos públicos | atuação legislativa | sem tema | `alerj-lei-5938-2011-autoria` | Trajetória, fase 4 (marco, na explicação) |
| 22 de maio de 2014 | Autoria da Lei estadual 6.785/2014, sobre condenados por abuso sexual contra menor em cargos públicos | atuação legislativa | sem tema | `alerj-lei-6785-2014-autoria` | Trajetória, fase 4 (em Explorar este período) |
| 19 de maio de 2015 | Autoria da Lei estadual 7.008/2015, sobre mensagens de texto de utilidade pública | atuação legislativa | sem tema | `alerj-lei-7008-2015-autoria` | Trajetória, fase 4 (em Explorar este período) |
| 2 de março de 2018 | Autoria da Lei estadual 7.877/2018, sobre recifes artificiais | atuação legislativa | Meio ambiente | `alerj-lei-7877-2018-autoria` | Trajetória, fase 4 (na explicação) |
| 2019 | Relatoria da Medida Provisória 866/2018, sobre a criação da NAV Brasil | atuação legislativa | Reforma do Estado | `congresso-mpv-866-2018-relatoria` | Trajetória, fase 5 (na explicação) |
| 21 de junho de 2023 | Votação: PLP 93/2023, texto principal | voto | Economia | `senado-voto-6714-5894` | Trajetória, fase 8 (na explicação, em Explorar este período); Aprofundamento: Economia, fase 1 (marco, na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 8 de novembro de 2023 | Votação: PEC 45/2019, texto principal | voto | Economia | `senado-voto-6777-5894` | Trajetória, fase 8 (marco, na explicação, na atividade); Aprofundamento: Economia, fase 1 (na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (marco, na explicação, na atividade) |
| 20 de fevereiro de 2024 | Votação: PL 2253/2022, texto principal | voto | Segurança pública | `senado-voto-6818-5894` | Trajetória, fase 8 (na explicação, em Explorar este período); Aprofundamento: Segurança pública, fase 1 (marco, na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (na explicação, na atividade) |
| 16 de abril de 2024 | Votação: PEC 45/2023, texto principal | voto | Segurança pública | `senado-voto-6825-5894` | Trajetória, fase 8 (na explicação, em Explorar este período); Aprofundamento: Segurança pública, fase 1 (na explicação); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 12 de dezembro de 2024 | Votação: PLP 68/2024, substitutivo | voto | Economia | `senado-voto-6899-5894` | Trajetória, fase 8 (na explicação, em Explorar este período); Aprofundamento: Economia, fase 1 (na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (na explicação, na atividade) |
| 10 de dezembro de 2025 | Votação: PL 5582/2025, substitutivo | voto | Segurança pública | `senado-voto-7037-5894` | Trajetória, fase 8 (na explicação, em Explorar este período); Aprofundamento: Segurança pública, fase 1 (na explicação) |

### Fato biográfico → fases

| Data | Fato | Identificador | Fontes | Onde aparece |
| --- | --- | --- | --- | --- |
| 1998 | Flávio Bolsonaro faz estágios antes da vida pública | `flavio-bolsonaro-estagios` | 1 | Trajetória, fase 1 (na explicação, na atividade) |
| sem data documentada | Flávio Bolsonaro se forma em direito | `flavio-bolsonaro-formacao` | 3 | Trajetória, fase 1 (na explicação) |
| 30 de abril de 1981 | Flávio Bolsonaro nasce em Resende, no estado do Rio de Janeiro | `flavio-bolsonaro-nascimento` | 8 | Trajetória, fase 1 (marco, na explicação) |
| 2003 | O partido de Flávio Bolsonaro muda de nome: de PPB para PP | `flavio-bolsonaro-partido-muda-de-nome` | 3 | Trajetória, fase 2 (na explicação) |
| 2002 | Flávio Bolsonaro se candidata a deputado estadual | `flavio-bolsonaro-registro-da-primeira-candidatura` | 2 | Trajetória, fase 2 (na explicação) |

### Proposta eleitoral → fases

11 das 21 propostas publicadas aparecem em fase: uma por área na fase da eleição e as três da área em cada aprofundamento. As demais ficam na comparação por área, e a fase da eleição leva até lá.

| Área | Proposta | Identificador | Onde aparece |
| --- | --- | --- | --- |
| Economia | O documento propõe rever e redimensionar a reforma tributária em curso e o que chama de majoração de impostos do atual governo, para reduzir a carga sobre a produção e o consumo. | `proposta-flavio-bolsonaro-2026-economia-1` | Trajetória, fase 9 (na explicação, em Explorar este período); Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Economia | O documento propõe reformular as regras fiscais atuais, com foco na estabilização e na redução da dívida pública. | `proposta-flavio-bolsonaro-2026-economia-2` | Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Economia | O documento fixa a meta de crescimento sustentado de 4% ao ano ao longo da próxima década. | `proposta-flavio-bolsonaro-2026-economia-3` | Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe declarar PCC, CV, milícias e as demais facções como organizações narcoterroristas. | `proposta-flavio-bolsonaro-2026-seguranca-publica-1` | Trajetória, fase 9 (em Explorar este período); Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe apoiar e sancionar a redução da maioridade penal de 18 para 16 anos. | `proposta-flavio-bolsonaro-2026-seguranca-publica-2` | Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe cinco novos presídios de segurança máxima, no modelo adotado por El Salvador. | `proposta-flavio-bolsonaro-2026-seguranca-publica-3` | Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Saúde | O documento propõe garantir as condições para a correção efetiva da tabela SUS. | `proposta-flavio-bolsonaro-2026-saude-1` | Trajetória, fase 9 (em Explorar este período) |
| Saúde | O documento propõe implantar o prontuário eletrônico único, vinculado ao CPF e integrado ao Gov.br, interoperável entre as redes pública e privada, observados o consentimento do paciente, a LGPD, o sigilo médico e os protocolos de segurança. | `proposta-flavio-bolsonaro-2026-saude-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Saúde | O documento propõe contratar serviços e exames na rede privada nos horários ociosos. | `proposta-flavio-bolsonaro-2026-saude-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Educação | O documento propõe priorizar o método fônico na alfabetização. | `proposta-flavio-bolsonaro-2026-educacao-1` | Trajetória, fase 9 (em Explorar este período) |
| Educação | O documento propõe ampliar as Escolas Cívico-Militares e garantir atendimento ao aluno com altas habilidades, tirando do papel a política nacional sobre o tema. | `proposta-flavio-bolsonaro-2026-educacao-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Educação | O documento propõe um voucher educacional para a família matricular o filho em outra escola onde faltar vaga na rede pública. | `proposta-flavio-bolsonaro-2026-educacao-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Reforma do Estado | O documento propõe dar continuidade à reforma administrativa, para modernizar o funcionamento do Estado e a carreira do servidor. | `proposta-flavio-bolsonaro-2026-reforma-do-estado-1` | Trajetória, fase 9 (em Explorar este período) |
| Reforma do Estado | O documento propõe cortar no mínimo dez ministérios, reduzir cargos comissionados e despesas administrativas e combater o que chama de penduricalhos e supersalários. | `proposta-flavio-bolsonaro-2026-reforma-do-estado-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Reforma do Estado | O documento propõe retomar o Programa Nacional de Desestatização, com avaliação caso a caso. | `proposta-flavio-bolsonaro-2026-reforma-do-estado-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Meio ambiente | O documento fixa a meta de zerar o desmatamento ilegal até 2029 e propõe combater as queimadas ilegais, com mais prevenção, monitoramento e fiscalização. | `proposta-flavio-bolsonaro-2026-meio-ambiente-1` | Trajetória, fase 9 (em Explorar este período) |
| Meio ambiente | O documento propõe consolidar o mercado regulado de carbono, com segurança jurídica, e impulsionar a bioeconomia. | `proposta-flavio-bolsonaro-2026-meio-ambiente-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Meio ambiente | O documento propõe criar mecanismos de incentivo econômico à preservação e ampliar o pagamento por serviços ambientais. | `proposta-flavio-bolsonaro-2026-meio-ambiente-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Direitos das mulheres | O documento propõe monitorar com tornozeleira eletrônica os agressores de mulheres com medida protetiva; em outro trecho, na página 19, fala nos agressores sob medida protetiva de maior risco. | `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-1` | Trajetória, fase 9 (em Explorar este período) |
| Direitos das mulheres | O documento propõe a Central da Mulher, descrita como um espaço físico onde a mulher resolve a vida sem perder tempo nem percorrer a cidade inteira. | `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Direitos das mulheres | O documento propõe um voucher-creche para acesso à rede privada credenciada onde não houver vaga na rede pública, até a vaga pública surgir. | `proposta-flavio-bolsonaro-2026-direitos-das-mulheres-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |

## Lula

12 fases, 20 acontecimentos publicados (20 acessíveis no jogo), 17 decisões publicadas (17 acessíveis no jogo).

### Trajetória

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | De Garanhuns a São Paulo (`lula-origem`) | 1945 a 1956 | saber onde Lula nasceu e como a família dele foi parar em São Paulo. | `fato:lula-nascimento` | 4 (1 em Explorar) | pergunta, 3 opções | 98 | Sala de arquivo (`arquivo-origem-a`); figura dos primeiros anos | assistida por IA; humana pendente |
| 2 | Da fábrica ao sindicato (`lula-sindicato`) | 1956 a 1979 | entender o que é um sindicato e como Lula chegou à presidência de um. | `acontecimento:lula-1975-eleito-presidente-do-sindicato` | 8 (2 em Explorar) | ordenação, 3 registros | 91 | Salão do sindicato (`sindicato`); figura dos primeiros anos | assistida por IA; humana pendente |
| 3 | Um partido e uma Constituição (`lula-partido-e-constituinte`) | 1980 a 1988 | ver como um líder sindical entrou na política: fundou um partido e foi eleito deputado. | `acontecimento:lula-1986-eleito-deputado-federal-constituinte` | 7 (3 em Explorar) | pergunta, 3 opções | 82 | Plenário da Constituinte (`constituinte`); figura dos anos intermediários | assistida por IA; humana pendente |
| 4 | Quatro disputas pela Presidência (`lula-disputas-pela-presidencia`) | 1989 a 2002 | entender o que são primeiro e segundo turno, pelas eleições que Lula disputou até vencer. | `acontecimento:lula-2002-eleito-presidente` | 5 (1 em Explorar) | pergunta, 3 opções | 79 | Comitê de campanha (`comite`); figura dos anos intermediários | assistida por IA; humana pendente |
| 5 | O primeiro governo (`lula-primeiro-governo`) | 2003 a 2006 | entender o que é uma medida provisória e como ela vira lei. | `decisao:planalto-mpv-132-2003-bolsa-familia` | 11 (6 em Explorar) | pergunta, 3 opções | 76 | Gabinete (`gabinete`); figura dos anos intermediários | assistida por IA; humana pendente |
| 6 | O segundo governo (`lula-segundo-governo`) | 2007 a 2010 | entender a diferença entre sancionar e vetar um projeto aprovado pelo Congresso. | `decisao:planalto-lei-11738-2008-piso-do-magisterio` | 7 (3 em Explorar) | pergunta, 3 opções | 79 | Gabinete (`gabinete`); figura dos anos intermediários | assistida por IA; humana pendente |
| 7 | Condenação, prisão e anulação (`lula-processos`) | 2016 a 2021 | acompanhar, na ordem, o que a Justiça decidiu nos processos contra Lula e entender o que é anular uma decisão. | `acontecimento:lula-2021-stf-anula-condenacoes` | 8 (1 em Explorar) | ordenação, 3 registros | 100 | Sala de audiências (`tribunal-a`); figura dos anos recentes | assistida por IA; humana pendente |
| 8 | De volta à Presidência (`lula-retorno`) | 2022 a 2026 | ver como Lula voltou à Presidência e o que são um decreto e uma intervenção federal. | `acontecimento:lula-2022-eleito-presidente-pela-terceira-vez` | 10 (3 em Explorar) | pergunta, 3 opções | 96 | Gabinete (`gabinete`); figura dos anos recentes | assistida por IA; humana pendente |
| 9 | A eleição de 2026 (`lula-eleicao-2026`) | 2026 | saber como estava a eleição de 2026 em 8 de outubro, até onde este atlas vai, e onde ler o que a candidatura propõe. | `acontecimento:eleicao-2026-primeiro-turno` | 11 (7 em Explorar) | pergunta, 3 opções | 100 | Auditório de convenção (`convencao-a`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: A infância em Pernambuco, antes de 1952: os documentos oficiais lidos trazem só o nascimento e a mudança.
- Fase 1: Os anos em que Lula estudou e os endereços da família: os documentos lidos não trazem datas.
- Fase 2: Os anos em que Lula fez o curso do Senai e entrou na Villares: os documentos oficiais lidos não trazem.
- Fase 2: Quando ele deixou a presidência do sindicato: os documentos lidos não informam, e o atlas registra o fim como desconhecido.
- Fase 3: Os votos e as propostas de Lula como deputado constituinte, de 1987 a 1991.
- Fase 3: Não há acontecimentos registrados de 1981 a 1985 e em 1987 e 1988.
- Fase 4: Não há acontecimentos registrados de 1990 a 1993 e de 1995 a 2001.
- Fase 4: A eleição de 1998 não tem registro próprio: aparece no contexto da de 1994, sem o número de votos.
- Fase 5: O atlas registra sete atos de 2003 a 2006, escolhidos como amostra. Não é a lista do que o governo fez.
- Fase 5: Os efeitos de cada lei e o resultado dos vetos no Congresso.
- Fase 6: O atlas registra quatro atos de 2007 a 2010, escolhidos como amostra. Não é a lista do que o governo fez.
- Fase 6: Se o Congresso manteve ou derrubou cada veto.
- Fase 6: Não há acontecimentos registrados de 2011 a 2015.
- Fase 7: O que aconteceu com cada processo depois de enviado à Justiça Federal do Distrito Federal.
- Fase 7: Três dos quatro processos atingidos pela anulação não têm registro próprio no atlas.
- Fase 7: Quem apresentou a acusação que levou à condenação de 2017: os registros desta edição não dizem.
- Fase 8: O atlas registra seis atos do terceiro mandato, só em economia e segurança pública. Saúde, educação, meio ambiente e os demais temas não foram pesquisados neste período.
- Fase 9: O atlas registra três frases por área de cada documento. O documento inteiro tem outras propostas e capítulos fora das sete áreas.
- Fase 9: O segundo turno ficou marcado para depois da data de corte desta edição.

### Aprofundamento: Economia

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Economia: cinco atos de Lula na Presidência (`lula-economia`) | 2007 a 2026 | ver cinco atos de Lula na área de economia e de que tipo é cada um. | `decisao:planalto-lei-complementar-200-2023-regime-fiscal` | 8 (3 em Explorar) | pergunta, 3 opções | 92 | Sala de arquivo (`arquivo-economia-a`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: O atlas não registra cargo público de Lula entre 2011 e 2022.
- Fase 1: Os atos de economia de 2003 a 2006 conferidos na pesquisa não entraram na amostra desta edição.
- Fase 1: É uma amostra de cinco atos: não é a lista do que o governo decidiu na área.

### Aprofundamento: Segurança pública

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Segurança pública: cinco atos de Lula na Presidência (`lula-seguranca-publica`) | 2003 a 2026 | ver cinco atos de Lula na área de segurança pública e o que acontece quando o Congresso derruba um veto. | `decisao:planalto-lei-14843-2024-saidas-temporarias` | 8 (3 em Explorar) | pergunta, 3 opções | 92 | Sala de arquivo (`arquivo-seguranca-a`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: O atlas não registra cargo público de Lula entre 2011 e 2022.
- Fase 1: Os atos de segurança pública de 2007 a 2010 conferidos na pesquisa não entraram na amostra desta edição.
- Fase 1: É uma amostra de cinco atos: não é a lista do que o governo decidiu na área.

### Missão: O documento diz o quê?

| Nº | Fase | Período | Objetivo | Marco | Registros apontados | Atividade | Palavras | Cenário e figura | Revisão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | O documento diz o quê? Três atos na Presidência (`lula-investigacao`) | 2007 a 2025 | ler três documentos, montar um dossiê e relacionar cada ficha ao documento que a sustenta. | `decisao:planalto-lei-complementar-200-2023-regime-fiscal` | 5 (0 em Explorar) | dossiê, 3 fichas e 6 documentos | 99 | Sala de investigação (`arquivo-investigacao-a`); figura dos anos recentes | assistida por IA; humana pendente |

Lacunas declaradas, por fase:

- Fase 1: É uma amostra de seis atos do Executivo, e não a lista do que a Presidência decidiu.
- Fase 1: O atlas não registra o que cada lei produziu depois de sancionada, nem se o Congresso derrubou algum veto.

### Acontecimento → fases

| Data | Acontecimento | Identificador | Onde aparece |
| --- | --- | --- | --- |
| 1975 | Lula é eleito presidente do Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema | `lula-1975-eleito-presidente-do-sindicato` | Trajetória, fase 2 (marco, na explicação, na atividade) |
| março de 1979 | Greve de 170 mil metalúrgicos paralisa o ABC paulista | `lula-1979-greve-dos-metalurgicos-do-abc` | Trajetória, fase 2 (na explicação, na atividade) |
| 1980 | Lula é preso com base na Lei de Segurança Nacional durante greve | `lula-1980-prisao-pela-lei-de-seguranca-nacional` | Trajetória, fase 3 (na explicação) |
| 10 de fevereiro de 1980 | Lula participa da fundação do Partido dos Trabalhadores | `lula-1980-fundacao-do-pt` | Trajetória, fase 3 (na explicação) |
| 1986 | Lula é eleito deputado federal constituinte por São Paulo | `lula-1986-eleito-deputado-federal-constituinte` | Trajetória, fase 3 (marco, na explicação, na atividade) |
| 1989 | Lula disputa a Presidência pela primeira vez e perde no segundo turno | `lula-1989-primeira-candidatura-a-presidencia` | Trajetória, fase 4 (na explicação, na atividade) |
| 3 de outubro de 1994 | Lula é derrotado por Fernando Henrique Cardoso na eleição presidencial | `lula-1994-derrota-na-eleicao-presidencial` | Trajetória, fase 4 (na explicação, na atividade) |
| 27 de outubro de 2002 | Lula é eleito presidente da República | `lula-2002-eleito-presidente` | Trajetória, fase 4 (marco, na explicação, na atividade) |
| 29 de outubro de 2006 | Lula é reeleito presidente da República | `lula-2006-reeleito-presidente` | Trajetória, fase 5 (em Explorar este período) |
| 18 de março de 2016 | STF suspende a nomeação de Lula para a Casa Civil | `lula-2016-nomeacao-para-a-casa-civil-suspensa` | Trajetória, fase 7 (em Explorar este período) |
| 12 de julho de 2017 | Lula é condenado em primeira instância no caso do triplex | `lula-2017-condenacao-em-primeira-instancia` | Trajetória, fase 7 (na explicação, na atividade) |
| 24 de janeiro de 2018 | TRF4 confirma a condenação de Lula e aumenta a pena | `lula-2018-tribunal-confirma-condenacao` | Trajetória, fase 7 (na explicação) |
| 7 de abril de 2018 | Lula é preso e levado à Polícia Federal em Curitiba | `lula-2018-prisao-em-curitiba` | Trajetória, fase 7 (na explicação, na atividade) |
| 31 de agosto de 2018 | TSE indefere o registro da candidatura de Lula à Presidência | `lula-2018-registro-de-candidatura-indeferido` | Trajetória, fase 7 (na explicação) |
| 8 de novembro de 2019 | Lula deixa a prisão em Curitiba | `lula-2019-saida-da-prisao` | Trajetória, fase 7 (na explicação) |
| 8 de março de 2021 | STF anula as condenações de Lula na Lava Jato | `lula-2021-stf-anula-condenacoes` | Trajetória, fase 7 (marco, na explicação, na atividade) |
| 30 de outubro de 2022 | Lula é eleito presidente da República pela terceira vez | `lula-2022-eleito-presidente-pela-terceira-vez` | Trajetória, fase 8 (marco, na explicação) |
| 8 de janeiro de 2023 | Lula decreta intervenção federal na segurança pública do Distrito Federal | `lula-2023-intervencao-federal-no-distrito-federal` | Trajetória, fase 8 (na explicação) |
| 2 de agosto de 2026 | PT oficializa a candidatura de Lula à reeleição | `lula-2026-convencao-do-pt` | Trajetória, fase 9 (na explicação) |
| 4 de outubro de 2026 | Flávio Bolsonaro e Lula passam ao segundo turno da eleição presidencial | `eleicao-2026-primeiro-turno` | Trajetória, fase 9 (marco, na explicação) |

### Decisão → fases

| Data | Decisão | Natureza | Temas | Identificador | Onde aparece |
| --- | --- | --- | --- | --- | --- |
| 30 de abril de 2003 | Proposta de Emenda à Constituição nº 40, de 2003 | ato do Executivo | Reforma do Estado | `camara-pec-40-2003-iniciativa` | Trajetória, fase 5 (em Explorar este período) |
| 20 de outubro de 2003 | Medida Provisória nº 132, de 20 de outubro de 2003 | ato do Executivo | sem tema | `planalto-mpv-132-2003-bolsa-familia` | Trajetória, fase 5 (marco, na explicação) |
| 22 de dezembro de 2003 | Lei nº 10.826, de 22 de dezembro de 2003 | ato do Executivo | Segurança pública | `planalto-lei-10826-2003-armas-de-fogo` | Trajetória, fase 5 (em Explorar este período); Aprofundamento: Segurança pública, fase 1 (na explicação) |
| 9 de janeiro de 2004 | Lei nº 10.836, de 9 de janeiro de 2004 | ato do Executivo | sem tema | `planalto-lei-10836-2004-bolsa-familia` | Trajetória, fase 5 (na explicação, na atividade) |
| 20 de maio de 2004 | Decreto nº 5.090, de 20 de maio de 2004 | ato do Executivo | Saúde | `planalto-decreto-5090-2004-farmacia-popular` | Trajetória, fase 5 (em Explorar este período) |
| 13 de janeiro de 2005 | Lei nº 11.096, de 13 de janeiro de 2005 | ato do Executivo | Educação | `planalto-lei-11096-2005-prouni` | Trajetória, fase 5 (em Explorar este período) |
| 7 de agosto de 2006 | Lei nº 11.340, de 7 de agosto de 2006 | ato do Executivo | Direitos das mulheres, Segurança pública | `planalto-lei-11340-2006-violencia-contra-a-mulher` | Trajetória, fase 5 (em Explorar este período); Aprofundamento: Segurança pública, fase 1 (na explicação) |
| 22 de janeiro de 2007 | Decreto nº 6.025, de 22 de janeiro de 2007 | ato do Executivo | Economia | `planalto-decreto-6025-2007-pac` | Trajetória, fase 6 (em Explorar este período); Aprofundamento: Economia, fase 1 (na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 16 de julho de 2008 | Lei nº 11.738, de 16 de julho de 2008 | ato do Executivo | Educação | `planalto-lei-11738-2008-piso-do-magisterio` | Trajetória, fase 6 (marco, na explicação, na atividade) |
| 29 de dezembro de 2009 | Lei nº 12.187, de 29 de dezembro de 2009 | ato do Executivo | Meio ambiente | `planalto-lei-12187-2009-mudanca-do-clima` | Trajetória, fase 6 (em Explorar este período) |
| 22 de dezembro de 2010 | Lei nº 12.351, de 22 de dezembro de 2010 | ato do Executivo | Economia | `planalto-lei-12351-2010-partilha-do-pre-sal` | Trajetória, fase 6 (em Explorar este período); Aprofundamento: Economia, fase 1 (na explicação); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 8 de janeiro de 2023 | Decreto nº 11.377, de 8 de janeiro de 2023 | ato do Executivo | Segurança pública | `planalto-decreto-11377-2023-intervencao-df` | Trajetória, fase 8 (na explicação, na atividade); Aprofundamento: Segurança pública, fase 1 (na explicação) |
| 30 de agosto de 2023 | Lei Complementar nº 200, de 30 de agosto de 2023 | ato do Executivo | Economia | `planalto-lei-complementar-200-2023-regime-fiscal` | Trajetória, fase 8 (na explicação); Aprofundamento: Economia, fase 1 (marco, na explicação); Missão: O documento diz o quê?, fase 1 (marco, na explicação, na atividade) |
| 11 de abril de 2024 | Lei nº 14.843, de 11 de abril de 2024 | ato do Executivo | Segurança pública | `planalto-lei-14843-2024-saidas-temporarias` | Trajetória, fase 8 (na explicação); Aprofundamento: Segurança pública, fase 1 (marco, na explicação, na atividade); Missão: O documento diz o quê?, fase 1 (na atividade) |
| 16 de janeiro de 2025 | Lei Complementar nº 214, de 16 de janeiro de 2025 | ato do Executivo | Economia | `planalto-lei-complementar-214-2025-ibs-cbs` | Trajetória, fase 8 (em Explorar este período); Aprofundamento: Economia, fase 1 (na explicação); Missão: O documento diz o quê?, fase 1 (na explicação, na atividade) |
| 26 de novembro de 2025 | Lei nº 15.270, de 26 de novembro de 2025 | ato do Executivo | Economia | `planalto-lei-15270-2025-imposto-de-renda` | Trajetória, fase 8 (na explicação); Aprofundamento: Economia, fase 1 (na explicação); Missão: O documento diz o quê?, fase 1 (na explicação, na atividade) |
| 24 de março de 2026 | Lei nº 15.358, de 24 de março de 2026 | ato do Executivo | Segurança pública | `planalto-lei-15358-2026-crime-organizado` | Trajetória, fase 8 (em Explorar este período); Aprofundamento: Segurança pública, fase 1 (na explicação) |

### Fato biográfico → fases

| Data | Fato | Identificador | Fontes | Onde aparece |
| --- | --- | --- | --- | --- |
| sem data documentada | Lula se forma torneiro mecânico no Senai | `lula-curso-no-senai` | 3 | Trajetória, fase 2 (na explicação) |
| 1969 | Lula entra para a diretoria do sindicato dos metalúrgicos | `lula-entrada-na-diretoria-do-sindicato` | 3 | Trajetória, fase 2 (na explicação, na atividade) |
| sem data documentada | Lula é alfabetizado e faz o ensino primário | `lula-escola` | 4 | Trajetória, fase 1 (em Explorar este período) |
| 1956 | A família se muda para a cidade de São Paulo | `lula-mudanca-para-a-cidade-de-sao-paulo` | 2 | Trajetória, fase 1 (na explicação) |
| dezembro de 1952 | A família de Lula se muda para o litoral de São Paulo | `lula-mudanca-para-o-litoral-paulista` | 4 | Trajetória, fase 1 (na explicação, na atividade) |
| outubro de 1945 | Lula nasce em Garanhuns, no interior de Pernambuco | `lula-nascimento` | 6 | Trajetória, fase 1 (marco, na explicação) |
| sem data documentada | Lula começa a trabalhar ainda menino | `lula-primeiros-trabalhos` | 2 | Trajetória, fase 2 (em Explorar este período) |
| 1978 | Lula é reeleito presidente do sindicato | `lula-reeleicao-no-sindicato` | 2 | Trajetória, fase 2 (na explicação) |
| sem data documentada | Lula trabalha nas Indústrias Villares, em São Bernardo do Campo | `lula-trabalho-na-villares` | 2 | Trajetória, fase 2 (na explicação) |

### Proposta eleitoral → fases

11 das 21 propostas publicadas aparecem em fase: uma por área na fase da eleição e as três da área em cada aprofundamento. As demais ficam na comparação por área, e a fase da eleição leva até lá.

| Área | Proposta | Identificador | Onde aparece |
| --- | --- | --- | --- |
| Economia | O documento propõe criar condições para uma redução sustentada das taxas de juros, com inflação controlada e política fiscal responsável, e manter o novo arcabouço fiscal. | `proposta-lula-2026-economia-1` | Trajetória, fase 9 (na explicação, em Explorar este período); Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Economia | O documento propõe elevar a taxa de investimento da economia e ampliar os investimentos em infraestrutura logística e em infraestrutura social. | `proposta-lula-2026-economia-2` | Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Economia | O documento põe como objetivo central do próximo ciclo de governo aprimorar e fortalecer o que chama de neoindustrialização. | `proposta-lula-2026-economia-3` | Aprofundamento: Economia, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe criar o Ministério da Segurança Pública depois de aprovada a PEC da Segurança Pública, proposta pelo Executivo. | `proposta-lula-2026-seguranca-publica-1` | Trajetória, fase 9 (em Explorar este período); Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe manter uma política de controle de armas e munições. | `proposta-lula-2026-seguranca-publica-2` | Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Segurança pública | O documento propõe fortalecer o Programa Brasil Contra o Crime Organizado e avançar, com estados e municípios, em: enfrentamento ao tráfico de armas, munições, acessórios e explosivos; asfixia financeira do crime organizado e das milícias; investigação de homicídios; retomada de territórios; segurança no sistema prisional. | `proposta-lula-2026-seguranca-publica-3` | Aprofundamento: Segurança pública, fase 1 (em Explorar este período) |
| Saúde | O documento propõe impulsionar o programa Agora Tem Especialistas, com mais terceiro turno nos serviços de saúde, Carretas da Saúde e mutirões de atendimento. | `proposta-lula-2026-saude-1` | Trajetória, fase 9 (em Explorar este período) |
| Saúde | O documento propõe manter o programa Farmácia Popular 100% gratuito, com revisão contínua dos medicamentos ofertados e continuidade da distribuição de fraldas geriátricas. | `proposta-lula-2026-saude-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Saúde | O documento propõe acelerar a consolidação do prontuário único do cidadão, por meio da Rede Nacional de Dados em Saúde. | `proposta-lula-2026-saude-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Educação | O documento propõe dar prioridade absoluta ao fomento à expansão da educação em tempo integral. | `proposta-lula-2026-educacao-1` | Trajetória, fase 9 (em Explorar este período) |
| Educação | O documento propõe seguir com as ações combinadas com estados e municípios para chegar à meta de 80% das crianças alfabetizadas na idade certa. | `proposta-lula-2026-educacao-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Educação | O documento propõe dar continuidade ao programa Pé-de-Meia e fortalecê-lo. | `proposta-lula-2026-educacao-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Reforma do Estado | O documento propõe aprofundar a política de valorização e diálogo com os servidores públicos, a partir da Mesa Nacional de Negociação Permanente. | `proposta-lula-2026-reforma-do-estado-1` | Trajetória, fase 9 (em Explorar este período) |
| Reforma do Estado | O documento propõe continuar investindo na universalização dos serviços públicos digitais e em infraestruturas públicas digitais. | `proposta-lula-2026-reforma-do-estado-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Reforma do Estado | O documento propõe dar sequência às medidas de controle e integridade da administração pública e ao combate à corrupção. | `proposta-lula-2026-reforma-do-estado-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Meio ambiente | O documento reafirma a meta de desmatamento líquido zero até 2030. | `proposta-lula-2026-meio-ambiente-1` | Trajetória, fase 9 (em Explorar este período) |
| Meio ambiente | O documento propõe articular as políticas e mobilizar governo, setor privado e sociedade civil para cumprir a nova NDC, que descreve como a meta de reduzir de 59% a 67% as emissões líquidas de gases de efeito estufa até 2035, em relação a 2005. | `proposta-lula-2026-meio-ambiente-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Meio ambiente | O documento propõe avançar na destinação de terras públicas para unidades de conservação, territórios indígenas e quilombolas ou assentamentos, e reforçar a regularização fundiária. | `proposta-lula-2026-meio-ambiente-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Direitos das mulheres | O documento propõe dar sequência ao Pacto de Enfrentamento ao Feminicídio e concluir 30 Casas da Mulher Brasileira e 15 Centros de Referência da Mulher Brasileira. | `proposta-lula-2026-direitos-das-mulheres-1` | Trajetória, fase 9 (em Explorar este período) |
| Direitos das mulheres | O documento propõe avançar na equivalência de remuneração entre mulheres e homens, fortalecendo a aplicação da Lei de Igualdade Salarial. | `proposta-lula-2026-direitos-das-mulheres-2` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |
| Direitos das mulheres | O documento propõe fortalecer o planejamento reprodutivo, com mais acesso a métodos contraceptivos modernos e de longa duração, distribuídos gratuitamente no SUS. | `proposta-lula-2026-direitos-das-mulheres-3` | Na comparação por área (`/comparar/#propostas`), a um toque da fase da eleição |

## Exclusões justificadas

Nenhuma: todos os acontecimentos e todas as decisões publicados das duas pessoas aparecem em alguma fase.
