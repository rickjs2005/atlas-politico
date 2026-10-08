# Status

Atualizado em 8 de outubro de 2026.

## Fase 1 (arquitetura e fundação): concluída

Critérios de conclusão do plano e como cada um foi atendido:

| Critério | Situação | Como foi conferido |
|---|---|---|
| O projeto executa localmente | Atendido | `npm run dev` e testes de navegador |
| Gera a saída estática | Atendido | `npm run build` gera `out/`; `npm run verify:export` confere |
| O mapa monta apenas no navegador | Atendido | Teste: o HTML do servidor traz "Carregando o mapa…" e nenhum canvas |
| Regras de datas e de fontes definidas | Atendido | Schemas e testes; documentadas em DATA_MODEL.md |
| Dados de teste restritos ao desenvolvimento | Atendido | Três barreiras (DECISIONS.md, D-07), todas testadas |

### O que foi entregue

- Projeto Next.js 16.4 com TypeScript estrito, Tailwind 4, lint com fronteiras entre camadas e exportação estática.
- Modelo de dados em Zod para pessoa, mandato, filiação, acontecimento, lugar, fonte, citação, imagem e edição, com as regras de datas, períodos, lugares e revisão.
- Leitor de conteúdo local com validação, integridade e regras de publicação.
- Estado compartilhado, seletores e tradução entre estado e parâmetros de URL.
- Rotas: início, dois perfis, comparação, metodologia e 404 com a identidade do projeto. Rota de acontecimento implementada, à espera de conteúdo.
- Tela de prova técnica com mapa, lista e painel sobre dados sintéticos, restrita ao desenvolvimento.
- Testes de regras (Vitest) e de navegador (Playwright).
- Documentação: README, ARCHITECTURE, DATA_MODEL, DECISIONS e este arquivo.

## Verificações realizadas

Todas executadas em 08/10/2026, com Node 24.15.0 no Windows 11.

| Verificação | Resultado |
|---|---|
| `npm run lint` | Sem problemas |
| `npm run typecheck` | Sem erros |
| `npm run test` | 123 testes em 7 arquivos, todos passando |
| `npm run build` | Concluído. Rotas: `/`, `/comparar`, `/metodologia`, `/politicos/lula`, `/politicos/flavio-bolsonaro` e 404 |
| `npm run verify:export` | 46 arquivos, 8 páginas HTML, 44 arquivos de texto sem dados sintéticos e sem rota de desenvolvimento |
| `npm run test:e2e` | 12 testes passando, em Chromium 153 sem interface |

O que os testes de regras cobrem: precisão de datas, datas impossíveis (30 de fevereiro, mês 13, ano fora da faixa, bissextos), intervalos incoerentes, datas parciais em filtros e na ordenação, apresentação sem inventar dia ou mês, evidência obrigatória no registro revisado, coordenadas trocadas, referências quebradas, identificadores e slugs repetidos, data de corte, recusa de rascunho e de dado sintético na publicação, leitura de pasta (BOM, arquivo fora do contrato, JSON ilegível), recorte por pessoa, período e categoria, seleção coerente com o recorte e parâmetros de URL.

O que os testes de navegador cobrem: mapa fora do HTML do servidor e montado no navegador, nenhuma requisição externa, seleção pela lista, seleção por clique em ponto do mapa, datas parciais e falta de lugar na tela, troca de pessoa com lista, mapa e painel no mesmo recorte, rascunho fora da tela, uso só com teclado, lista de lugares quando não há WebGL, quando o pacote do mapa não baixa e quando o worker não carrega, e largura em tela de celular (390 px).

As capturas de tela geradas pelos testes foram conferidas a olho: mapa com grade e pontos, destaque e enquadramento do item selecionado, lista de lugares sem WebGL, tela de celular, página de acontecimento e 404.

### Verificações pontuais, feitas uma vez e desfeitas

Três pontos não podem ser conferidos pelo build normal da fase 1, porque dependem de coisas que a produção ainda não tem. Foram conferidos com alterações temporárias, todas revertidas ao fim (o `next.config.ts` voltou idêntico, por comparação de hash, e `content/published/` voltou a ter só o `.gitkeep`).

| Ponto | Como | Resultado |
|---|---|---|
| O mapa funciona a partir da saída estática | Build temporário incluindo a tela de prova, servido por `npm run preview` e aberto no Chromium | Mapa montou, worker servido de `/_next/static/media/` com status 200, seleção nos dois sentidos, sem erros de console e sem requisição externa |
| A rota `/acontecimentos/[slug]` liga sozinha com conteúdo | Cópia das fixtures em `content/published/`, sem o prefixo sintético e sem o rascunho | 7 páginas geradas, conteúdo e título corretos, rascunho com 404 |
| `verify:export` acusa vazamento | Rodado sobre esse build temporário | Falhou como esperado: acusou a rota `dev/` e 100 ocorrências de marcas sintéticas |

Também foi feita uma sonda nas regras de lint: dois arquivos temporários com importações proibidas geraram os 3 erros esperados.

## O que não foi verificado

- **Chrome com placa de vídeo.** O mapa foi verificado no Chromium sem interface, que desenha o WebGL por software. A tentativa pelo Chrome do Rick não serviu: a aba controlada ficou em segundo plano, e aba em segundo plano não desenha quadros. Falta abrir `/dev/prova/` em uma janela visível.
- **Firefox, Safari e celular real.** Só Chromium, em janela de computador e em largura de celular emulada.
- **Leitor de tela.** A estrutura usa regiões nomeadas, botões com `aria-pressed` e região viva no painel, mas não houve teste com NVDA ou VoiceOver.
- **Página de perfil com conteúdo.** O ramo que mostra resumo e lista de acontecimentos de um perfil não foi gerado em nenhum build, porque os dados de teste nunca usam o slug de uma pessoa real. Só o ramo "sem conteúdo" foi conferido.
- **Hospedagem real.** Nada foi publicado. Em especial, falta confirmar que a hospedagem escolhida serve `.mjs` como JavaScript.
- **Desempenho.** Nenhuma medição de LCP, CLS ou Lighthouse. É assunto da fase 8.

## Limitações conhecidas

- **Sem conteúdo real.** `content/published/` está vazio. As páginas dizem isso.
- **Mapa sem geografia.** A base é uma grade de meridianos e paralelos. Contornos de países, rótulos e limites de zoom adequados entram na fase 6.
- **Estado ainda não ligado ao endereço.** A tradução entre estado e URL está pronta e testada, mas a tela de prova não lê nem escreve a query string. É da fase 5.
- **Pontos do mapa não recebem foco individual.** O canvas aceita teclado para mover e aproximar, e a lista é o caminho de teclado para selecionar. A alternativa com marcadores focáveis fica para a fase 6.
- **Gestos no celular.** O mapa captura o arrasto de um dedo, o que pode atrapalhar a rolagem da página. A fase 6 decide sobre gestos cooperativos.
- **Falha do worker demora a aparecer.** Se o worker do mapa não carrega, a lista de lugares só assume depois de 15 segundos.
- **Rascunho usa o mesmo schema do revisado.** Todos os campos de texto são obrigatórios também no rascunho; só as fontes podem faltar. A fase 3 pode afrouxar isso.
- **`.gitkeep` na saída.** `out/geo/.gitkeep` e `out/media/.gitkeep` são copiados para a saída. São arquivos vazios e saem quando houver arquivos reais.
- **Indexação bloqueada.** O layout define `noindex`. Remover na fase 10.
- **Reinício do servidor de desenvolvimento.** Depois de publicar o primeiro acontecimento, é preciso reiniciar o `npm run dev` para a rota de acontecimento aparecer.
- **`npm audit`.** Nenhuma vulnerabilidade nas dependências de produção. Há 5 de severidade alta, todas na cadeia da ferramenta de lint (`eslint-config-next`, `fast-glob`, `micromatch`, `braces`), que não vai para o site. A correção automática exige uma troca forçada de versão e não foi aplicada.
- **Next 17.** A próxima versão maior deve ligar Cache Components para todos (DECISIONS.md, D-02). Rever antes de atualizar.
- **Git.** A fase 1 está em um commit local na branch `main`. Não há repositório remoto.
- **Plano fora do repositório.** O plano de desenvolvimento continua em `Downloads/Atlas-Politico-Plano-de-Desenvolvimento.md`.

## Preparação para a fase 2 (pesquisa e primeiro conjunto de conteúdo)

O que a fase 2 já encontra pronto:

- O formato de cada registro (DATA_MODEL.md) e um exemplo completo e válido em `tests/fixtures/sintetico/`.
- A pasta `content/drafts/` para a pesquisa e `content/published/` para o que for revisado.
- A validação: basta colocar os arquivos em `content/published/` e rodar `npm run test` ou `npm run build` para saber, registro por registro, o que está errado.

O que precisa ser decidido ou providenciado antes de começar:

1. **Quem assina a revisão.** O campo `revisadoPor` de cada registro e da edição precisa de um nome.
2. **Critério editorial por escrito.** O plano (seção 5) dá os passos. Falta o texto que explica por que um acontecimento entra, igual para os dois perfis. Ele vai para a página de metodologia.
3. **Catálogo de fontes.** Começar por `fontes.json`, com as fontes de partida do plano (D1 a D7), conferindo cada endereço e registrando a data de acesso.
4. **Primeiros cinco acontecimentos de cada perfil**, bem documentados, para a interface ter conteúdo real nas fases 5 e 6.
5. **Coordenadas.** Definir a base para o centro dos municípios e registrá-la em `origemCoordenadas`.
6. **Imagens.** Só entram com autoria, origem e condições de uso registradas.
7. **Canal de correção.** O plano prevê um contato público para apontar erros; falta definir qual.
8. **Validação de rascunhos.** Hoje só `content/published/` é validado pelo build. Se a fase 2 quiser validar `content/drafts/` enquanto pesquisa, o primeiro passo é um comando para isso, que pode ser adiantado da fase 3.

## Próximo passo

Fase 2: montar o catálogo de fontes e o primeiro conjunto de conteúdo. A fase 1 termina aqui; a fase 2 só começa com o próximo comando.
