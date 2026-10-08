# Status

Atualizado em 8 de outubro de 2026.

| Fase do plano | Situação |
| --- | --- |
| 1. Arquitetura e fundação | Concluída em 08/10/2026 |
| 2. Pesquisa e primeiro conjunto de conteúdo | Concluída em 08/10/2026, com revisão assistida por IA e pendências listadas abaixo |
| 3. Camada de dados e preparação | Não iniciada |
| 4 a 10 | Não iniciadas |

## Fase 2 (pesquisa e primeiro conjunto de conteúdo)

### Critério de conclusão do plano

"Cada item publicado tem evidência para suas afirmações, data com precisão definida e revisão registrada."

| Parte do critério | Situação | Como foi conferido |
| --- | --- | --- |
| Evidência para cada afirmação | Atendido | 166 citações, cada uma com o local do trecho e o que ele sustenta; 382 trechos conferidos contra as cópias dos documentos, sem falha |
| Data com precisão definida | Atendido | Todo registro tem valor e precisão; 29 acontecimentos com dia, 1 com mês e 9 com ano |
| Revisão registrada | Atendido, com ressalva | Toda revisão é do tipo assistida por IA. Nenhuma revisão humana foi feita nem registrada |

O plano coloca a revisão humana da coleção final na fase 9 e condiciona a ela o lançamento, não a conclusão da fase 2.

### O que foi entregue

- **39 acontecimentos conferidos**, em `content/published/acontecimentos.json`: 20 de Lula (1975 a 2026) e 20 de Flávio Bolsonaro (2002 a 2026), sendo um compartilhado.
- **5 rascunhos**, em `content/drafts/acontecimentos.json`, cada um com a pendência escrita.
- **15 mandatos e funções**, **8 filiações partidárias**, **9 lugares**, **59 fontes** e **2 imagens**.
- **Edição 0.1.0**, com data de corte em 08/10/2026, cobertura por pessoa e registro de alterações.
- Os dois retratos oficiais em `public/media/retratos/`, com autoria, crédito e condições de uso registrados.
- Documentação: [SOURCES.md](SOURCES.md), [EDITORIAL.md](EDITORIAL.md), [CONTENT-REVIEW.md](CONTENT-REVIEW.md) e a lista de trechos em `docs/evidencias/`.

Passos do plano e situação de cada um:

| Passo | Situação |
| --- | --- |
| 1. Catálogo de fontes por pessoa, período e tipo | Feito (SOURCES.md) |
| 2. Acontecimentos candidatos, mandatos e filiações | Feito |
| 3. Cinco acontecimentos bem documentados de cada perfil | Feito, dentro da coleção de 20 |
| 4. Coleção de 15 a 20 por pessoa | Feito: 20 e 20 |
| 5. Resumos, contexto e identificação das evidências | Feito |
| 6. Lugares com precisão adequada e coordenadas verificadas | Feito: 9 lugares pela API de malhas do IBGE, todos marcados como aproximação |
| 7. Imagens com autoria e condições de uso | Parcial: só os dois retratos. Nenhuma imagem de acontecimento |
| 8. Revisão dos textos e estado editorial | Feito por conferência assistida por IA. Revisão humana pendente |

### Ajustes feitos no que veio da fase 1

Pequenos, compatíveis e registrados em DECISIONS.md (D-22 a D-26):

- `revisao.tipo` passou a ser obrigatório no schema (`assistida-por-ia` ou `humana`), e o site mostra "Revisão humana pendente" quando é o caso.
- A página de metodologia e o aviso de edição passaram a dizer como a conferência foi feita.
- Os rascunhos ganharam validação própria nos testes e uma conferência na saída estática.
- Novo comando `npm run content:coverage`.

Impedimentos encontrados: nenhum na base da fase 1. A rota `/acontecimentos/[slug]` ligou sozinha com o primeiro conteúdo, como previsto.

### Verificações executadas

Todas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
| --- | --- |
| Segunda passagem das evidências | 382 trechos em 166 citações, nenhuma falha |
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 130 testes passando, incluindo validação do conjunto publicado e dos rascunhos |
| `npm run build` | 47 páginas HTML: início, 2 perfis, 39 acontecimentos, comparar, metodologia e 404 |
| `npm run verify:export` | 39 acontecimentos com página, 5 rascunhos sem página, nenhum dado sintético, nenhuma rota de desenvolvimento |
| `npm run test:e2e` | 13 testes passando |
| Páginas com conteúdo real no navegador | Os 2 perfis listam 20 acontecimentos; as 39 páginas têm título, resumo, fontes e aviso de revisão; os 5 rascunhos respondem 404; sem erro de console e sem requisição externa |

### Bloqueios de acesso

Detalhados em SOURCES.md, seção "Fontes procuradas e não obtidas". Os que mais pesaram:

- **Assembleia Legislativa do Rio de Janeiro:** não foi localizada seção com registros de legislaturas anteriores. A atuação estadual de Flávio Bolsonaro, de 2003 a 2018, ficou coberta só pelas eleições.
- **Biografia atual do presidente no Planalto:** bloqueio temporário do portal. O período recente de Lula veio de TSE, STF, TRF4 e agências públicas.
- **TSE antes de 1994:** não há arquivos de candidaturas de 1982, 1986 e 1989 no repositório consultado. Esses acontecimentos têm precisão de ano.

### Pendências reais

1. **Revisão humana de todo o conjunto.** É a principal. O roteiro está no fim de CONTENT-REVIEW.md.
2. **Decisões do responsável pelo projeto:** quem assina a revisão humana; canal público de correção; como tratar as divergências listadas em CONTENT-REVIEW.md, em especial a data de nascimento de Lula e a filiação de Flávio Bolsonaro ao Republicanos.
3. **Lacunas de pesquisa:** Lula de 1995 a 2001 e de 2007 a 2015; atuação de Flávio Bolsonaro na Alerj e proposições no Senado.
4. **Fatos posteriores à data de corte:** o segundo turno de 25 de outubro de 2026 e a totalização final do primeiro turno.
5. **Episódios de 2026 em andamento,** noticiados e não lidos nesta fase. Só entram com documento oficial e desfecho.
6. **Imagens de acontecimentos** e confirmação direta das condições de uso do retrato do Senado.
7. **Os 5 rascunhos,** com as pendências de cada um.

### Limitações desta entrega

- **O conteúdo é de 8 de outubro de 2026, no meio de uma eleição em que os dois perfis disputam o segundo turno.** Vários registros vão ficar desatualizados em poucas semanas.
- **Conferir que um trecho existe no documento não garante que o texto o interpreta bem.** A leitura crítica foi feita por IA e precisa ser refeita por uma pessoa.
- **As cópias dos documentos não estão no repositório.** Repetir a conferência exige baixar tudo de novo.
- **A interface ainda é a estrutural da fase 1.** As páginas de perfil listam os acontecimentos e as de acontecimento mostram texto e fontes; linha do tempo, mapa e comparação são das fases 5 a 7.
- **O site continua com `noindex`** e não foi publicado.

## Preparação para a fase 3 (camada de dados)

O que a fase 3 encontra pronto:

- Conteúdo real nos dois estados: `published/` com 8 arquivos e `drafts/` com os acontecimentos em pesquisa.
- Validação de schema, integridade e regras de publicação rodando no build e nos testes.
- Um relatório de cobertura (`scripts/content-coverage.mjs`) que já calcula totais por pessoa, categoria e década.
- A lista de trechos de evidência e o método da segunda passagem, hoje feito com scripts temporários.

O que a fase 3 precisa resolver, a partir do que esta fase mostrou:

1. **Promoção de rascunho para publicado.** Hoje é manual: mover o registro de um arquivo para o outro e trocar o estado.
2. **Rascunhos como coleção parcial.** Eles citam pessoas, lugares e fontes do conjunto publicado. O pipeline precisa validar os dois juntos, como o teste faz hoje.
3. **Verificador de evidências como comando do projeto,** com cópia local dos documentos e aviso quando um trecho some da fonte.
4. **Índices por pessoa, ano, categoria e lugar,** e a coleção GeoJSON dos acontecimentos com lugar.
5. **Relatório de campos incompletos e de referências sem uso:** fontes não citadas, lugares não usados, imagens sem arquivo.
6. **Como os scripts importam os schemas TypeScript** (ponto em aberto desde a fase 1).
7. **Conferência dos `itens` do registro de alterações** e regra de versão do conteúdo (EDITORIAL.md, seção Correção).

## Fase 1 (arquitetura e fundação)

Concluída em 08/10/2026 e registrada no commit `9be1013`. O que ela entregou e como foi verificada está no histórico deste arquivo e em ARCHITECTURE.md, DATA_MODEL.md e DECISIONS.md. Pontos da fase 1 que seguem abertos:

- O mapa só foi verificado em Chromium sem interface. Falta abrir `/dev/prova/` em uma janela visível do Chrome.
- Firefox, Safari, celular real e leitor de tela não foram testados.
- Hospedagem real, incluindo o tipo MIME de `.mjs`, fica para a fase 10.
- `npm audit`: nenhuma vulnerabilidade em produção; 5 altas na cadeia do lint, que não vai para o site.
- A próxima versão maior do Next deve ligar Cache Components para todos (DECISIONS.md, D-02).
- O plano de desenvolvimento continua fora do repositório, em `Downloads/`.

## Próximo passo

Fase 3: camada de dados e preparação. A fase 2 termina aqui; a fase 3 só começa com o próximo comando. Antes dela, vale a revisão humana de ao menos cinco acontecimentos de cada perfil, para o pipeline ser construído sobre conteúdo já aprovado por uma pessoa.
