# Jogo: matriz de cobertura

Gerado por `npm run game:coverage` a partir dos dados publicados (edição 0.2.0, data de corte 2026-10-08) e de `src/lib/game/chapters.ts`. Não edite à mão: o teste `tests/game-coverage.test.ts` confere que este arquivo está em dia e que nenhum acontecimento ficou fora dos capítulos sem justificativa.

Acontecimentos publicados: 39. Em capítulos: 39. O primeiro turno de 2026 pertence aos dois personagens e aparece uma vez na trajetória de cada um.

Decisões publicadas (votos vigentes e atos do Executivo): 12. Em capítulos: 12. Uma decisão aparece na sala do seu tema e, quando está ligada a um acontecimento da trajetória, também no capítulo dele.

## Flávio Bolsonaro

20 acontecimentos, 7 capítulos em 3 salas, 20 acontecimentos em capítulo, 6 decisões publicadas, 6 em capítulo.

### Sala Histórico

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Assembleia e disputa pela Prefeitura (`flavio-bolsonaro-1-alerj`) | 2002–2016 | Salão da Assembleia (`alerj`, arte `alerj`) | figura dos primeiros anos | 5 | encontrar um registro: `flavio-bolsonaro-2002-eleito-deputado-estadual` |
| 2 | Senado: eleição, Mesa e partido (`flavio-bolsonaro-2-senado`) | 2018–2019 | Plenário do Senado (`senado`, arte `senado`) | figura dos anos intermediários | 3 | ordem de dois registros: `flavio-bolsonaro-2018-eleito-senador` e `flavio-bolsonaro-2019-terceiro-secretario-do-senado` |
| 3 | Denúncia, partidos e decisões judiciais (`flavio-bolsonaro-3-denuncia`) | 2020–2022 | Sala de audiências (`tribunal-b`, arte `tribunal`) | figura dos anos intermediários | 6 | documento que sustenta: `flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao` |
| 4 | Liderança da Minoria, relatoria e comissão (`flavio-bolsonaro-4-minoria`) | 2023–2025 | Sala de comissão (`comissao`, arte `comissao`) | figura dos anos recentes | 4 (3 acontecimentos, 1 decisões) | evidência e interpretação de uma decisão: `senado-voto-6818-5894` |
| 5 | Indicação, convenção e primeiro turno (`flavio-bolsonaro-5-eleicao-2026`) | 2025–2026 | Auditório de convenção (`convencao-b`, arte `convencao`) | figura dos anos recentes | 3 | lugar documentado: `flavio-bolsonaro-2026-convencao-do-pl` |

### Sala Economia

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Regime fiscal, reforma tributária e sua regulamentação (`flavio-bolsonaro-economia`) | 2023–2024 | Sala de arquivo (`arquivo-economia-b`, arte `gabinete`) | figura dos anos recentes | 3 (0 acontecimentos, 3 decisões) | evidência e interpretação de uma decisão: `senado-voto-6714-5894` |

### Sala Segurança pública

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Saídas temporárias, drogas na Constituição e crime organizado (`flavio-bolsonaro-seguranca-publica`) | 2024–2025 | Sala de arquivo (`arquivo-seguranca-b`, arte `comissao`) | figura dos anos recentes | 3 (0 acontecimentos, 3 decisões) | evidência e interpretação de uma decisão: `senado-voto-6825-5894` |

### Acontecimento → capítulo

| Data | Acontecimento | Identificador | Capítulo |
| --- | --- | --- | --- |
| 6 de outubro de 2002 | Flávio Bolsonaro é eleito deputado estadual no Rio de Janeiro | `flavio-bolsonaro-2002-eleito-deputado-estadual` | 1. Assembleia e disputa pela Prefeitura |
| 2006 | Flávio Bolsonaro é reeleito deputado estadual | `flavio-bolsonaro-2006-reeleito-deputado-estadual` | 1. Assembleia e disputa pela Prefeitura |
| 2010 | Flávio Bolsonaro é reeleito deputado estadual pela segunda vez | `flavio-bolsonaro-2010-reeleito-deputado-estadual` | 1. Assembleia e disputa pela Prefeitura |
| 2014 | Flávio Bolsonaro conquista o quarto mandato de deputado estadual | `flavio-bolsonaro-2014-reeleito-deputado-estadual` | 1. Assembleia e disputa pela Prefeitura |
| 2016 | Flávio Bolsonaro disputa a Prefeitura do Rio de Janeiro e não é eleito | `flavio-bolsonaro-2016-candidatura-a-prefeitura-do-rio` | 1. Assembleia e disputa pela Prefeitura |
| 2018 | Flávio Bolsonaro é eleito senador pelo Rio de Janeiro | `flavio-bolsonaro-2018-eleito-senador` | 2. Senado: eleição, Mesa e partido |
| 6 de fevereiro de 2019 | Flávio Bolsonaro assume a 3ª Secretaria da Mesa do Senado | `flavio-bolsonaro-2019-terceiro-secretario-do-senado` | 2. Senado: eleição, Mesa e partido |
| 19 de novembro de 2019 | Flávio Bolsonaro deixa o PSL | `flavio-bolsonaro-2019-saida-do-psl` | 2. Senado: eleição, Mesa e partido |
| 4 de novembro de 2020 | Ministério Público do Rio denuncia Flávio Bolsonaro no caso das “rachadinhas” | `flavio-bolsonaro-2020-denuncia-do-ministerio-publico` | 3. Denúncia, partidos e decisões judiciais |
| 31 de maio de 2021 | Flávio Bolsonaro se filia ao Patriota | `flavio-bolsonaro-2021-filiacao-ao-patriota` | 3. Denúncia, partidos e decisões judiciais |
| 9 de novembro de 2021 | STJ anula decisões da primeira instância na investigação das “rachadinhas” | `flavio-bolsonaro-2021-stj-anula-decisoes-da-investigacao` | 3. Denúncia, partidos e decisões judiciais |
| 30 de novembro de 2021 | Flávio Bolsonaro se filia ao PL | `flavio-bolsonaro-2021-filiacao-ao-pl` | 3. Denúncia, partidos e decisões judiciais |
| 16 de maio de 2022 | Tribunal de Justiça do Rio rejeita a denúncia contra Flávio Bolsonaro | `flavio-bolsonaro-2022-tribunal-rejeita-denuncia` | 3. Denúncia, partidos e decisões judiciais |
| 10 de junho de 2022 | Flávio Bolsonaro assume a liderança do PL no Senado | `flavio-bolsonaro-2022-lider-do-pl-no-senado` | 3. Denúncia, partidos e decisões judiciais |
| 5 de abril de 2023 | Flávio Bolsonaro se torna líder da Minoria no Congresso Nacional | `flavio-bolsonaro-2023-lider-da-minoria-no-congresso` | 4. Liderança da Minoria, relatoria e comissão |
| 20 de fevereiro de 2024 | Senado aprova projeto relatado por Flávio Bolsonaro que restringe saídas temporárias de presos | `flavio-bolsonaro-2024-relatoria-das-saidas-temporarias` | 4. Liderança da Minoria, relatoria e comissão |
| 19 de fevereiro de 2025 | Flávio Bolsonaro assume a presidência da Comissão de Segurança Pública do Senado | `flavio-bolsonaro-2025-presidente-da-comissao-de-seguranca-publica` | 4. Liderança da Minoria, relatoria e comissão |
| 5 de dezembro de 2025 | Flávio Bolsonaro é indicado pelo pai como candidato do PL à Presidência | `flavio-bolsonaro-2025-indicacao-para-a-presidencia` | 5. Indicação, convenção e primeiro turno |
| 25 de julho de 2026 | PL oficializa a candidatura de Flávio Bolsonaro à Presidência | `flavio-bolsonaro-2026-convencao-do-pl` | 5. Indicação, convenção e primeiro turno |
| 4 de outubro de 2026 | Flávio Bolsonaro e Lula passam ao segundo turno da eleição presidencial | `eleicao-2026-primeiro-turno` | 5. Indicação, convenção e primeiro turno |

### Decisão → capítulos

| Data | Decisão | Natureza | Temas | Identificador | Capítulos |
| --- | --- | --- | --- | --- | --- |
| 21 de junho de 2023 | Votação: PLP 93/2023, texto principal | voto | Economia | `senado-voto-6714-5894` | Economia, 1. Regime fiscal, reforma tributária e sua regulamentação |
| 8 de novembro de 2023 | Votação: PEC 45/2019, texto principal | voto | Economia | `senado-voto-6777-5894` | Economia, 1. Regime fiscal, reforma tributária e sua regulamentação |
| 20 de fevereiro de 2024 | Votação: PL 2253/2022, texto principal | voto | Segurança pública | `senado-voto-6818-5894` | Histórico, 4. Liderança da Minoria, relatoria e comissão; Segurança pública, 1. Saídas temporárias, drogas na Constituição e crime organizado |
| 16 de abril de 2024 | Votação: PEC 45/2023, texto principal | voto | Segurança pública | `senado-voto-6825-5894` | Segurança pública, 1. Saídas temporárias, drogas na Constituição e crime organizado |
| 12 de dezembro de 2024 | Votação: PLP 68/2024, substitutivo | voto | Economia | `senado-voto-6899-5894` | Economia, 1. Regime fiscal, reforma tributária e sua regulamentação |
| 10 de dezembro de 2025 | Votação: PL 5582/2025, substitutivo | voto | Segurança pública | `senado-voto-7037-5894` | Segurança pública, 1. Saídas temporárias, drogas na Constituição e crime organizado |

## Lula

20 acontecimentos, 8 capítulos em 3 salas, 20 acontecimentos em capítulo, 6 decisões publicadas, 6 em capítulo.

### Sala Histórico

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sindicato, greves e partido (`lula-1-sindicato`) | 1975–1980 | Salão do sindicato (`sindicato`, arte `sindicato`) | figura dos primeiros anos | 4 | encontrar um registro: `lula-1975-eleito-presidente-do-sindicato` |
| 2 | Constituinte e disputas presidenciais (`lula-2-constituinte`) | 1986–1994 | Plenário da Constituinte (`constituinte`, arte `constituinte`) | figura dos anos intermediários | 3 | ordem de dois registros: `lula-1986-eleito-deputado-federal-constituinte` e `lula-1989-primeira-candidatura-a-presidencia` |
| 3 | Presidência: eleição e reeleição (`lula-3-presidencia`) | 2002–2006 | Comitê de campanha (`comite`, arte `comite`) | figura dos anos intermediários | 2 | documento que sustenta: `lula-2002-eleito-presidente` |
| 4 | Nomeação suspensa, processos e prisão (`lula-4-processos`) | 2016–2019 | Sala de audiências (`tribunal-a`, arte `tribunal`) | figura dos anos recentes | 6 | ordem de dois registros: `lula-2017-condenacao-em-primeira-instancia` e `lula-2018-tribunal-confirma-condenacao` |
| 5 | Anulação, terceira eleição e intervenção federal (`lula-5-anulacao`) | 2021–2023 | Gabinete (`gabinete`, arte `gabinete`) | figura dos anos recentes | 4 (3 acontecimentos, 1 decisões) | evidência e interpretação de uma decisão: `planalto-decreto-11377-2023-intervencao-df` |
| 6 | Convenção e primeiro turno de 2026 (`lula-6-eleicao-2026`) | 2026 | Auditório de convenção (`convencao-a`, arte `convencao`) | figura dos anos recentes | 2 | documento que sustenta: `eleicao-2026-primeiro-turno` |

### Sala Economia

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Regime fiscal, reforma tributária e imposto de renda (`lula-economia`) | 2023–2025 | Sala de arquivo (`arquivo-economia-a`, arte `gabinete`) | figura dos anos recentes | 3 (0 acontecimentos, 3 decisões) | evidência e interpretação de uma decisão: `planalto-lei-complementar-200-2023-regime-fiscal` |

### Sala Segurança pública

| Nº | Capítulo | Período | Cenário | Época da figura | Registros | Tarefa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Intervenção federal, saídas temporárias e crime organizado (`lula-seguranca-publica`) | 2023–2026 | Sala de arquivo (`arquivo-seguranca-a`, arte `comissao`) | figura dos anos recentes | 3 (0 acontecimentos, 3 decisões) | evidência e interpretação de uma decisão: `planalto-lei-14843-2024-saidas-temporarias` |

### Acontecimento → capítulo

| Data | Acontecimento | Identificador | Capítulo |
| --- | --- | --- | --- |
| 1975 | Lula é eleito presidente do Sindicato dos Metalúrgicos de São Bernardo do Campo e Diadema | `lula-1975-eleito-presidente-do-sindicato` | 1. Sindicato, greves e partido |
| março de 1979 | Greve de 170 mil metalúrgicos paralisa o ABC paulista | `lula-1979-greve-dos-metalurgicos-do-abc` | 1. Sindicato, greves e partido |
| 1980 | Lula é preso com base na Lei de Segurança Nacional durante greve | `lula-1980-prisao-pela-lei-de-seguranca-nacional` | 1. Sindicato, greves e partido |
| 10 de fevereiro de 1980 | Lula participa da fundação do Partido dos Trabalhadores | `lula-1980-fundacao-do-pt` | 1. Sindicato, greves e partido |
| 1986 | Lula é eleito deputado federal constituinte por São Paulo | `lula-1986-eleito-deputado-federal-constituinte` | 2. Constituinte e disputas presidenciais |
| 1989 | Lula disputa a Presidência pela primeira vez e perde no segundo turno | `lula-1989-primeira-candidatura-a-presidencia` | 2. Constituinte e disputas presidenciais |
| 3 de outubro de 1994 | Lula é derrotado por Fernando Henrique Cardoso na eleição presidencial | `lula-1994-derrota-na-eleicao-presidencial` | 2. Constituinte e disputas presidenciais |
| 27 de outubro de 2002 | Lula é eleito presidente da República | `lula-2002-eleito-presidente` | 3. Presidência: eleição e reeleição |
| 29 de outubro de 2006 | Lula é reeleito presidente da República | `lula-2006-reeleito-presidente` | 3. Presidência: eleição e reeleição |
| 18 de março de 2016 | STF suspende a nomeação de Lula para a Casa Civil | `lula-2016-nomeacao-para-a-casa-civil-suspensa` | 4. Nomeação suspensa, processos e prisão |
| 12 de julho de 2017 | Lula é condenado em primeira instância no caso do triplex | `lula-2017-condenacao-em-primeira-instancia` | 4. Nomeação suspensa, processos e prisão |
| 24 de janeiro de 2018 | TRF4 confirma a condenação de Lula e aumenta a pena | `lula-2018-tribunal-confirma-condenacao` | 4. Nomeação suspensa, processos e prisão |
| 7 de abril de 2018 | Lula é preso e levado à Polícia Federal em Curitiba | `lula-2018-prisao-em-curitiba` | 4. Nomeação suspensa, processos e prisão |
| 31 de agosto de 2018 | TSE indefere o registro da candidatura de Lula à Presidência | `lula-2018-registro-de-candidatura-indeferido` | 4. Nomeação suspensa, processos e prisão |
| 8 de novembro de 2019 | Lula deixa a prisão em Curitiba | `lula-2019-saida-da-prisao` | 4. Nomeação suspensa, processos e prisão |
| 8 de março de 2021 | STF anula as condenações de Lula na Lava Jato | `lula-2021-stf-anula-condenacoes` | 5. Anulação, terceira eleição e intervenção federal |
| 30 de outubro de 2022 | Lula é eleito presidente da República pela terceira vez | `lula-2022-eleito-presidente-pela-terceira-vez` | 5. Anulação, terceira eleição e intervenção federal |
| 8 de janeiro de 2023 | Lula decreta intervenção federal na segurança pública do Distrito Federal | `lula-2023-intervencao-federal-no-distrito-federal` | 5. Anulação, terceira eleição e intervenção federal |
| 2 de agosto de 2026 | PT oficializa a candidatura de Lula à reeleição | `lula-2026-convencao-do-pt` | 6. Convenção e primeiro turno de 2026 |
| 4 de outubro de 2026 | Flávio Bolsonaro e Lula passam ao segundo turno da eleição presidencial | `eleicao-2026-primeiro-turno` | 6. Convenção e primeiro turno de 2026 |

### Decisão → capítulos

| Data | Decisão | Natureza | Temas | Identificador | Capítulos |
| --- | --- | --- | --- | --- | --- |
| 8 de janeiro de 2023 | Decreto nº 11.377, de 8 de janeiro de 2023 | ato do Executivo | Segurança pública | `planalto-decreto-11377-2023-intervencao-df` | Histórico, 5. Anulação, terceira eleição e intervenção federal; Segurança pública, 1. Intervenção federal, saídas temporárias e crime organizado |
| 30 de agosto de 2023 | Lei Complementar nº 200, de 30 de agosto de 2023 | ato do Executivo | Economia | `planalto-lei-complementar-200-2023-regime-fiscal` | Economia, 1. Regime fiscal, reforma tributária e imposto de renda |
| 11 de abril de 2024 | Lei nº 14.843, de 11 de abril de 2024 | ato do Executivo | Segurança pública | `planalto-lei-14843-2024-saidas-temporarias` | Segurança pública, 1. Intervenção federal, saídas temporárias e crime organizado |
| 16 de janeiro de 2025 | Lei Complementar nº 214, de 16 de janeiro de 2025 | ato do Executivo | Economia | `planalto-lei-complementar-214-2025-ibs-cbs` | Economia, 1. Regime fiscal, reforma tributária e imposto de renda |
| 26 de novembro de 2025 | Lei nº 15.270, de 26 de novembro de 2025 | ato do Executivo | Economia | `planalto-lei-15270-2025-imposto-de-renda` | Economia, 1. Regime fiscal, reforma tributária e imposto de renda |
| 24 de março de 2026 | Lei nº 15.358, de 24 de março de 2026 | ato do Executivo | Segurança pública | `planalto-lei-15358-2026-crime-organizado` | Segurança pública, 1. Intervenção federal, saídas temporárias e crime organizado |

## Exclusões justificadas

Nenhuma: todos os acontecimentos e todas as decisões publicadas dos dois personagens estão em capítulos.
