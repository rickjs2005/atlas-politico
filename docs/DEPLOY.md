# Publicação: situação e procedimento

O atlas é um site estático (`next build` com `output: "export"` gera `out/`). Nenhuma parte precisa de servidor de aplicação, banco, login ou serviço pago: a hospedagem é de arquivos. **A publicação só acontece com autorização expressa do responsável pelo projeto.** Nenhum comando de deploy roda por conta do código deste repositório.

## Situação em 11 de outubro de 2026

**O site está no ar em um endereço provisório, e um push na `main` pode publicar.** Leia esta seção antes de enviar qualquer commit.

| Fato | Como foi conferido |
| --- | --- |
| `https://atlas-politico.vercel.app/` respondia com a edição 0.2.1 e o jogo anterior, antes do envio da trilha simples | Pedidos HTTP em 11 de outubro de 2026: resposta 200, e a metodologia trazia a edição 0.2.1 |
| O site não é indexável | Nos mesmos pedidos: `robots.txt` com `Disallow: /`, a entrada com `<meta name="robots" content="noindex, nofollow">` e o `sitemap.xml` vazio. Não há endereço canônico, porque `publicUrl` continua vazio em `src/lib/site.ts` |
| O jogo que estava no ar era o anterior | Nos mesmos pedidos: `/jogo/lula/` trazia o painel **Capítulos e tarefas**, que a trilha não tem |
| O projeto na Vercel foi criado pela importação do repositório do GitHub, ramo `main`, e a primeira versão publicada foi a do commit `f084733` | Consulta ao projeto na Vercel, no mesmo dia, depois de o responsável pedir a publicação |
| O que estava no ar era igual à saída local daquele commit | Conferência do mesmo dia: o texto de cada página, os arquivos de nome fixo, a página 404 do atlas e a ausência de pedidos a outros domínios |
| Um push na `main` publica em produção | **Não tinha sido observado quando esta seção foi escrita:** nenhum push tinha acontecido depois da importação. É o comportamento padrão da Vercel para um projeto ligado a um repositório. O envio da trilha simples e da edição 0.3.0 é o primeiro. Para saber o que está no ar, abra a metodologia no endereço e leia a edição |

O que isso muda:

- **Todo push na `main` deve ser tratado como publicação,** até alguém conferir no painel da Vercel ou desligar a publicação automática. A regra da MilWeb continua: commit e push só com pedido do responsável. O que muda é a consequência do push.
- **A versão publicada pode não ser a deste repositório.** Até o envio da trilha simples, o endereço mostrava a edição 0.2.1, com o jogo de exploração. A trilha e a edição 0.3.0 vão ao ar se o push publicar, ou por uma publicação manual. A edição escrita na metodologia do endereço diz qual das duas está lá.
- **O build desta versão na Vercel não tinha sido testado quando esta seção foi escrita.** Pelo padrão dela para um projeto com script de build, a Vercel roda `npm run build`, que gera os dados, confere as imagens, monta o site e ajusta a saída; a configuração não foi conferida no painel. A publicação do commit `f084733` funcionou.
- **A publicação aconteceu antes da revisão humana e da validação com pessoas,** por decisão do responsável pelo projeto (D-147). A barreira do passo 2, abaixo, continua recusando, e as telas dizem "Revisão humana pendente". Nenhum documento do projeto diz que a revisão ou a validação aconteceram.
- **O endereço `*.vercel.app` não é o domínio do atlas.** Só passa a ser se o responsável decidir, e então entra em `publicUrl`.

O que fica com o responsável pelo projeto: manter ou tirar o endereço do ar; ligar ou desligar a publicação a cada push; o domínio; o canal de correção; e a redação da regra de publicação em [EDITORIAL.md](EDITORIAL.md), seção Revisão.

## O que depende de decisão

| Decisão | Onde entra | Enquanto não há |
| --- | --- | --- |
| Domínio público (ex.: `https://atlas.exemplo.com.br`) | `src/lib/site.ts`, campo `publicUrl` | Sem endereço canônico, sem sitemap, sem prévia de compartilhamento com endereço absoluto; `robots.txt` bloqueia indexação |
| Liberar a indexação pelos buscadores | `src/lib/site.ts`, campo `indexar` (só vale com `publicUrl`) | `robots: noindex` em todas as páginas e `robots.txt` com `Disallow: /` |
| Canal público de correção | `src/lib/site.ts`, campo `correctionChannel` | A metodologia diz que o canal está pendente |
| Nome definitivo do atlas | Rodapé e metadados (pontos em aberto) | "nome provisório" no rodapé |
| Hospedagem | Abaixo. Hoje há um projeto na Vercel, ligado ao repositório (seção Situação) | |

Mudar qualquer campo de `src/lib/site.ts` exige `npm run build` de novo: os valores entram no HTML gerado.

## Antes de publicar

A publicação da edição final depende de um comando: `npm run release:check`, que roda, nesta ordem, `npm run check` (passo 3), `npm run capturas:verificar` e `npm run verify:release` (passo 2). A regra do projeto é só publicar com ele saindo com zero. Hoje ele recusa, de propósito, pela barreira do passo 2: a régua de publicação é mais exigente que a do desenvolvimento, e `npm run check` e `npm run build` continuam passando com o conteúdo em conferência. O endereço provisório foi ao ar com a barreira recusando (seção Situação): a Vercel roda o build, e não a barreira.

1. Conteúdo: a edição a publicar está em `content/`, com `alteracoes` registradas, e a revisão humana feita ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)). O código nunca registra revisão como humana.
2. `npm run verify:release`: a barreira de release (`src/lib/editorial/release.ts`). Recusa a publicação, com o diagnóstico, enquanto houver registro sem revisão humana, ou domínio e canal de correção sem valor em `src/lib/site.ts`; avisa, sem recusar, quando a indexação está desligada e quando não há arquivo LICENSE. É uma régua diferente da do build: `npm run check` continua passando com o conteúdo em conferência, de propósito, para o desenvolvimento não parar. Publicar com a barreira recusando é uma mudança de política, que precisa ficar escrita em [EDITORIAL.md](EDITORIAL.md) e nas telas.
3. `npm run check`: lint, tipos, testes, build e verificação da exportação, tudo verde.
4. `npm run test:export` e `npm run test:journeys` sobre o `out/` recém-gerado, e `npm run test:e2e`. A verificação contínua do GitHub (`.github/workflows/verificacao.yml`) roda o mesmo a cada push na `main` e a cada pull request, e tem de estar verde no commit publicado.
5. `npm run audit:a11y` (as oito telas do atlas e dezessete do jogo, com o ciclo de uma fase, a leitura sem o cenário e a retomada) e `npm run measure -- --rotulo <data>` e `npm run measure:game -- --rotulo <data>` (a entrada do jogo, a primeira fase de cada trajetória, uma fase pedida pelo endereço, um aprofundamento de cada personagem e a leitura sem o cenário): registrar os números em [PERFORMANCE.md](PERFORMANCE.md) e em [STATUS.md](STATUS.md).
6. Capturas: `npm run capture:game` e as demais, para a conferência visual da versão candidata.
7. Conferir a primeira dobra em celular real, em pé e deitado, e o jogo em aparelho real ([USER-VALIDATION.md](USER-VALIDATION.md)).

## Como publicar `out/`

Qualquer hospedagem de arquivos estáticos serve. A escolha é do responsável.

**Vercel** (o que a MilWeb usa nos outros projetos, e onde o endereço provisório está): o projeto `atlas-politico` existe e está ligado ao repositório do GitHub. Com essa ligação, a publicação é o próprio push na `main`: a Vercel baixa o commit, roda `npm run build` e serve `out/`. Não há `vercel.json` nem pasta `.vercel/` no repositório. A regra fixa da MilWeb continua valendo no sentido que importa: nada vai ao ar que não esteja antes no GitHub. O endereço `*.vercel.app` só pode ser o domínio público se for a decisão; se for, ele entra em `publicUrl`.

**Cloudflare Pages ou Workers com assets estáticos:** `wrangler pages deploy out` (ou um Worker só com `assets`), com `.assetsignore` se houver arquivos a excluir.

**GitHub Pages:** publicar o conteúdo de `out/` na branch de páginas. O atlas usa endereços com barra final e gera `404.html`; conferir se a hospedagem serve `/jogo/` como `/jogo/index.html` e a 404 do projeto.

Em qualquer uma: sem redirecionamentos de servidor (não há nenhum no projeto), com `index.html` por pasta e a `404.html` do próprio site como página de erro.

## Depois de publicar

1. Abrir a entrada, `/jogo/`, `/jogo/lula/`, `/jogo/flavio-bolsonaro/`, um aprofundamento, uma ficha de acontecimento, `/comparar/`, `/metodologia/` e um endereço inexistente (deve responder com a 404 do atlas). Conferir na metodologia a edição publicada: é o jeito mais rápido de saber que versão está no ar.
2. Conferir que nenhum pedido vai a outro domínio (aba Rede do navegador) e que `robots.txt` e `sitemap.xml` dizem o que a decisão de indexação mandou.
3. Conferir a prévia de compartilhamento com o validador de um serviço (sem conta: colar o endereço em um cliente de mensagens serve).
4. Registrar em [STATUS.md](STATUS.md): data, endereço, edição publicada, quem autorizou.

## O que a publicação não inclui

- Divulgação em redes sociais, envio de mensagens ou publicação automática em qualquer serviço: fora do escopo e sem automação prevista.
- Analytics, cookies, formulários e serviços de terceiros: o atlas não tem nenhum.
- O segundo turno de 25 de outubro de 2026: depois da data de corte da edição; entra só por uma edição nova de conteúdo, com documento oficial lido.
