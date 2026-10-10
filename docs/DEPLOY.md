# Publicação: procedimento preparado

O atlas é um site estático (`next build` com `output: "export"` gera `out/`). Nenhuma parte precisa de servidor de aplicação, banco, login ou serviço pago: a hospedagem é de arquivos. Este documento deixa o procedimento pronto; **a publicação só acontece com autorização expressa do responsável pelo projeto**, depois da revisão humana e da validação com pessoas ([GAME-RELEASE.md](GAME-RELEASE.md), seção Pendências humanas). Nada aqui publica sozinho, e nenhum comando de deploy roda por conta do código.

## O que depende de decisão

| Decisão | Onde entra | Enquanto não há |
| --- | --- | --- |
| Domínio público (ex.: `https://atlas.exemplo.com.br`) | `src/lib/site.ts`, campo `publicUrl` | Sem endereço canônico, sem sitemap, sem prévia de compartilhamento com endereço absoluto; `robots.txt` bloqueia indexação |
| Liberar a indexação pelos buscadores | `src/lib/site.ts`, campo `indexar` (só vale com `publicUrl`) | `robots: noindex` em todas as páginas e `robots.txt` com `Disallow: /` |
| Canal público de correção | `src/lib/site.ts`, campo `correctionChannel` | A metodologia diz que o canal está pendente |
| Nome definitivo do atlas | Rodapé e metadados (D-99, pontos em aberto) | "nome provisório" no rodapé |
| Hospedagem | Abaixo | |

Mudar qualquer campo de `src/lib/site.ts` exige `npm run build` de novo: os valores entram no HTML gerado.

## Antes de publicar

1. Conteúdo: a edição a publicar está em `content/`, com `alteracoes` registradas, e a revisão humana feita ([HUMAN-REVIEW.md](HUMAN-REVIEW.md)). O código nunca registra revisão como humana.
2. `npm run verify:release`: a barreira de release (`src/lib/editorial/release.ts`). Recusa a publicação, com o diagnóstico, enquanto houver registro sem revisão humana, ou domínio e canal de correção sem valor em `src/lib/site.ts`; avisa, sem recusar, quando a indexação está desligada e quando não há arquivo LICENSE. É uma régua diferente da do build: `npm run check` continua passando com o conteúdo em conferência, de propósito, para o desenvolvimento não parar. Publicar com a barreira recusando é uma mudança de política, que precisa ficar escrita em [EDITORIAL.md](EDITORIAL.md) e nas telas.
3. `npm run check`: lint, tipos, testes, build e verificação da exportação, tudo verde.
4. `npm run test:export` e `npm run test:journeys` sobre o `out/` recém-gerado, e `npm run test:e2e`. A verificação contínua do GitHub (`.github/workflows/verificacao.yml`) roda o mesmo a cada push na `main` e a cada pull request, e tem de estar verde no commit publicado.
5. `npm run audit:a11y` e `npm run measure -- --rotulo <data>` e `npm run measure:game -- --rotulo <data>`: registrar os números em [PERFORMANCE.md](PERFORMANCE.md) e em [STATUS.md](STATUS.md).
6. Capturas: `npm run capture:game` e as demais, para a conferência visual da versão candidata.
7. Conferir a primeira dobra em celular real, em pé e deitado, e o jogo em aparelho real ([USER-VALIDATION.md](USER-VALIDATION.md)).

## Como publicar `out/`

Qualquer hospedagem de arquivos estáticos serve. O projeto não tem conta configurada em nenhuma; a escolha é do responsável.

**Vercel** (o que a MilWeb usa nos outros projetos): com a CLI instalada e autenticada, na raiz do projeto, `vercel --prod`. Antes disso, o repositório precisa estar com `main` enviada ao GitHub (regra fixa da MilWeb: commit e push antes de qualquer deploy). O projeto na Vercel deve ser criado como site estático com `out/` como pasta de saída, sem funções. O endereço `*.vercel.app` gerado só pode ser o domínio público se for a decisão; se for, ele entra em `publicUrl`.

**Cloudflare Pages ou Workers com assets estáticos:** `wrangler pages deploy out` (ou um Worker só com `assets`), com `.assetsignore` se houver arquivos a excluir.

**GitHub Pages:** publicar o conteúdo de `out/` na branch de páginas. O atlas usa endereços com barra final e gera `404.html`; conferir se a hospedagem serve `/jogo/` como `/jogo/index.html` e a 404 do projeto.

Em qualquer uma: sem redirecionamentos de servidor (não há nenhum no projeto), com `index.html` por pasta e a `404.html` do próprio site como página de erro.

## Depois de publicar

1. Abrir a entrada, `/jogo/`, `/jogo/lula/`, `/jogo/flavio-bolsonaro/`, uma ficha de acontecimento, `/comparar/`, `/metodologia/` e um endereço inexistente (deve responder com a 404 do atlas).
2. Conferir que nenhum pedido vai a outro domínio (aba Rede do navegador) e que `robots.txt` e `sitemap.xml` dizem o que a decisão de indexação mandou.
3. Conferir a prévia de compartilhamento com o validador de um serviço (sem conta: colar o endereço em um cliente de mensagens serve).
4. Registrar em [STATUS.md](STATUS.md): data, endereço, edição publicada, quem autorizou.

## O que a publicação não inclui

- Divulgação em redes sociais, envio de mensagens ou publicação automática em qualquer serviço: fora do escopo e sem automação prevista.
- Analytics, cookies, formulários e serviços de terceiros: o atlas não tem nenhum.
- O segundo turno de 25 de outubro de 2026: depois da data de corte da edição; entra só por uma edição nova de conteúdo, com documento oficial lido.
