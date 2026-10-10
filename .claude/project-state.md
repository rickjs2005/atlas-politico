# Atlas Político

Tipo: institucional
Stack: Next.js 16.4 (exportação estática) · React 19.3 · TypeScript 5.9 · Tailwind 4 · MapLibre GL JS 6 · Zod 4 · Vitest 5 · Playwright 1.63 · sharp 0.35 (só em desenvolvimento) · npm

Nome provisório. Site estático de conteúdo, sem banco e sem login. A execução segue o plano próprio do projeto, em 10 fases (`Downloads/Atlas-Politico-Plano-de-Desenvolvimento.md`). O quadro de 16 fases abaixo é o padrão da MilWeb e fica como visão de entrega.

## Plano do projeto (10 fases)
Fase 1 — Arquitetura e fundação                  ✓  (08/10/2026, commit 9be1013)
Fase 2 — Pesquisa e primeiro conjunto de conteúdo ✓  (08/10/2026, commit 7b090e1; revisão assistida por IA, revisão humana pendente)
Fase 3 — Camada de dados e preparação             ✓  (08/10/2026, commit 76870e1)
Fase 4 — Experiência e direção visual             ✓  (08/10/2026, commit 5632985)
Fase 5 — Aplicação e linha do tempo               ✓  (09/10/2026, commit 86c6e38)
Fase 6 — Mapa sincronizado                        ✓  (09/10/2026, commit f3d4772)
Fase 7 — Comparação, páginas e fontes             ✓  (09/10/2026, commit ce22a56)
Fase 8 — Acabamento visual e desempenho           ✓  (09/10/2026, SEM commit: na pasta de trabalho, à espera do pedido do Rick)
Fase 9 — Revisão editorial, testes e validação    ○
Fase 10 — Publicação e apresentação               ○

## Progresso
Fase 01 — Briefing        ◐
Fase 02 — Arquitetura     ◐
Fase 03 — UX              ◐
Fase 04 — UI              ◐
Fase 05 — Conteúdo        ◐
Fase 06 — Frontend        ◐
Fase 07 — Motion          ✓
Fase 08 — SEO On-Page     ◐
Fase 09 — Performance     ◐
Fase 10 — Acessibilidade  ◐
Fase 11 — Analytics       ○
Fase 12 — Segurança       ○
Fase 13 — QA              ○
Fase 14 — Deploy          ○
Fase 15 — Indexação       ○
Fase 16 — Entrega         ○

O que cada fase já tem e o que falta:
- Fase 01: o plano v1.0 cobre objetivo, público, escopo e fontes de partida. Faltam nome definitivo, canal de correção (hoje pendente em `src/lib/site.ts`, com um modelo copiável na metodologia), domínio e hospedagem.
- Fase 02: rotas, navegação, cabeçalho, rodapé e contrato de URL definidos e implementados (docs/ARCHITECTURE.md e docs/TIMELINE.md), com a comparação e o retorno da página do acontecimento no mesmo contrato. Falta a estratégia de SEO por página.
- Fase 03: as telas navegáveis em computador, tablet e celular, estados de vazio, carregamento e falha, a consulta no endereço, o mapa sincronizado, a comparação e a metodologia (docs/UX.md, docs/INTERACTIONS.md, docs/TIMELINE.md, docs/MAP.md, docs/COMPARISON.md e docs/PAGES.md). A fase 8 do plano conferiu as quatro larguras (1440, 768, 390 e 360) e o link com consulta. Não há formulário no projeto. Falta validar com pessoas (fase 9 do plano).
- Fase 04: tokens, tipografia local, categorias, componentes e estados (docs/DESIGN-SYSTEM.md). A fase 8 do plano fez o acabamento: hierarquia da leitura, enquadramento dos retratos e ritmo da entrada e da comparação, sem cor nem família nova. Faltam duas decisões do Rick: nome definitivo e retrato em cinza.
- Fase 05: edição 0.1.0 do conteúdo (39 acontecimentos conferidos, 5 rascunhos, 59 fontes), com data de corte em 08/10/2026. Toda a conferência foi assistida por IA. Faltam revisão humana, lacunas de pesquisa e imagens de acontecimentos (docs/CONTENT-REVIEW.md e docs/DATA-REPORT.md).
- Fase 06: fundação, pipeline de dados, as telas com conteúdo real, 404 com identidade, linha do tempo, mapa com cinco falhas tratadas, comparação, perfil, páginas de acontecimento, cópia do link, metodologia e, na fase 8 do plano, retratos em versões locais, mapa sob demanda e saída estática ajustada. Faltam o tratamento de um retrato que não carrega (hoje só há iniciais quando não existe imagem cadastrada) e a conferência em aparelho real.
- Fase 07: concluída na fase 8 do plano. Transições só em CSS (120 e 180 ms), depois da primeira ação da pessoa, sem segurar o estado; câmera do mapa em 500 ms; movimento reduzido respeitado e testado; impacto no desempenho medido. Não há animação de entrada, de rolagem nem paralaxe, por decisão (docs/INTERACTIONS.md, seção Movimento; D-80).
- Fase 08: título e descrição por página e Open Graph de título e descrição nos perfis e nos acontecimentos. Faltam endereço canônico, `metadataBase`, sitemap, robots.txt, imagem de compartilhamento e JSON-LD, que dependem do domínio. A indexação segue bloqueada (`noindex`) até a revisão humana.
- Fase 09: retratos em WebP por largura, com dimensões declaradas; mapa carregado só quando vai ser usado; fontes locais com a estratégia medida; LCP e CLS medidos em laboratório antes e depois, dentro das metas (docs/PERFORMANCE.md). Faltam Lighthouse em celular e em computador, INP e dados de campo, e a conferência em aparelho real.
- Fase 10: contraste medido em teste, foco visível, teclado na lista, na linha do tempo, nos filtros e nos marcadores do mapa, regiões nomeadas, avisos para leitor de tela e movimento reduzido. Falta leitor de tela real e zoom de texto.

## Bloqueios
- Nenhum bloqueio técnico.
- O conteúdo não pode ser publicado sem revisão humana. Roteiro no fim de docs/CONTENT-REVIEW.md.
- Decisões do Rick ainda pendentes: quem assina a revisão humana, canal público de correção (D-70), domínio de publicação, como tratar as divergências entre documentos (data de nascimento de Lula, filiação de Flávio Bolsonaro ao Republicanos), nome definitivo do atlas e se o retrato de Flávio Bolsonaro (condição "uso livre com crédito") pode ser exibido em cinza e recortado (docs/DECISIONS.md, D-42).

## Próxima ação
Aguardar o Rick: primeiro o pedido de commit da fase 8, depois o comando para a fase 9 do plano (revisão editorial, testes e validação com pessoas). Antes de retomar, ler docs/STATUS.md, seção "Preparação para a fase 9", e docs/PERFORMANCE.md. Para conferir que nada quebrou: `npm run check` (496 testes), `npm run test:export` (16 testes, sobre o build) e `npm run test:e2e` (201 testes).

Atenção ao retomar:
- As fases 1 a 7 estão commitadas na `main`, só nesta máquina: o repositório não tem remoto e nada foi enviado. A fase 8 está na pasta de trabalho, sem commit. Commit e push só com pedido.
- Para ver o que a pessoa recebe: `npm run build`, `npm run preview` e http://localhost:4311/. Em desenvolvimento: `npm run dev` e http://localhost:3000/politicos/lula/. Guia de estados em http://localhost:3000/dev/previa/.
- Capturas do estado atual em docs/capturas/fase-8/ (`npm run build` e `npm run capture:finish`), com as mesmas telas de antes da fase em `fase-8/antes/`. As das fases 4 a 7 mostram a interface de antes do acabamento.
- Ao trocar um retrato ou o enquadramento (`scripts/images.config.json`): `npm run images` e olhar o resultado. O build recusa versões desatualizadas.
- Para comparar o desempenho de uma mudança: `npm run measure -- --rotulo <nome> --contra <outro>=<pasta> --webgl placa`. Leva perto de uma hora com 7 execuções, e nada pesado pode rodar junto.
- As páginas leem `generated/`, que `npm run data:build` produz e que fica fora do Git. `npm run dev` e `npm run build` já geram. Conteúdo com erro interrompe os dois.
- O conteúdo é de 08/10/2026, entre o primeiro e o segundo turno da eleição presidencial (segundo turno em 25/10/2026). Registros de 2026 vão precisar de atualização.

Pendências pequenas:
- Canal público de correção: preencher `SITE.correctionChannel` em `src/lib/site.ts` quando o Rick decidir. Até lá a metodologia diz que está pendente.
- Domínio público: sem ele não há endereço canônico nem sitemap. **Copiar link** usa o endereço em que o atlas estiver aberto.
- Nada foi visto fora de um Chromium sem interface, com celular emulado. Conferir em um celular real a jornada inteira, a barra do recorte presa ao topo, a cópia do link, a pinça e o arraste no mapa e, principalmente, o tempo para abrir a vista do mapa (perto de 4 segundos no perfil emulado de rede lenta).
- Página do acontecimento em celular: o primeiro desenho ficou 112 ms mais tarde no perfil emulado (dentro da meta). Um terço vem do pré-carregamento da fonte; o resto não foi isolado (docs/PERFORMANCE.md).
- `scripts/finalize-export.mjs` corrige três defeitos do build (arquivos de navegação em pastas no Windows, arquivos do MapLibre sem uso, páginas de acontecimento sem o pré-carregamento da fonte). Rever a cada atualização do Next ou do MapLibre.
- Fase 10 do plano: a hospedagem precisa servir `404.html`, dar cache longo a `/_next/static/` e o tipo certo aos arquivos `.mjs`; a política de segurança de conteúdo precisa permitir o trecho de script do link com consulta; remover `robots: noindex` do layout.
- Se o servidor de desenvolvimento continuar mostrando o CSS antigo depois de mexer em `globals.css`, reiniciar não basta: apagar `.next/dev` e subir de novo.
- Os comandos só foram rodados no Node 24.15.0, no Windows.

## Notas de N/A
- Nenhuma por enquanto.
