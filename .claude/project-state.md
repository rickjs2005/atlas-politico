# Atlas Político

Tipo: institucional
Stack: Next.js 16.4 (exportação estática) · React 19.3 · TypeScript 5.9 · Tailwind 4 · MapLibre GL JS 6 · Zod 4 · Vitest 5 · Playwright 1.63 · npm

Nome provisório. Site estático de conteúdo, sem banco e sem login. A execução segue o plano próprio do projeto, em 10 fases (`Downloads/Atlas-Politico-Plano-de-Desenvolvimento.md`). O quadro de 16 fases abaixo é o padrão da MilWeb e fica como visão de entrega.

## Plano do projeto (10 fases)
Fase 1 — Arquitetura e fundação                  ✓  (08/10/2026, commit 9be1013)
Fase 2 — Pesquisa e primeiro conjunto de conteúdo ✓  (08/10/2026, commit 7b090e1; revisão assistida por IA, revisão humana pendente)
Fase 3 — Camada de dados e preparação             ✓  (08/10/2026, commit 76870e1)
Fase 4 — Experiência e direção visual             ✓  (08/10/2026, commit 5632985)
Fase 5 — Aplicação e linha do tempo               ✓  (09/10/2026, commit 86c6e38)
Fase 6 — Mapa sincronizado                        ✓  (09/10/2026, commit f3d4772)
Fase 7 — Comparação, páginas e fontes             ✓  (09/10/2026, commit seguinte ao f3d4772)
Fase 8 — Acabamento visual e desempenho           ○
Fase 9 — Revisão editorial, testes e validação    ○
Fase 10 — Publicação e apresentação               ○

## Progresso
Fase 01 — Briefing        ◐
Fase 02 — Arquitetura     ◐
Fase 03 — UX              ◐
Fase 04 — UI              ◐
Fase 05 — Conteúdo        ◐
Fase 06 — Frontend        ◐
Fase 07 — Motion          ◐
Fase 08 — SEO On-Page     ◐
Fase 09 — Performance     ○
Fase 10 — Acessibilidade  ◐
Fase 11 — Analytics       ○
Fase 12 — Segurança       ○
Fase 13 — QA              ○
Fase 14 — Deploy          ○
Fase 15 — Indexação       ○
Fase 16 — Entrega         ○

O que cada ◐ já tem e o que falta:
- Fase 01: o plano v1.0 cobre objetivo, público, escopo e fontes de partida. Faltam nome definitivo, canal de correção (hoje pendente em `src/lib/site.ts`, com um modelo copiável na metodologia), domínio e hospedagem.
- Fase 02: rotas, navegação, cabeçalho, rodapé e contrato de URL definidos e, desde a fase 5 do plano, implementados na exploração (docs/ARCHITECTURE.md e docs/TIMELINE.md). A fase 7 do plano estendeu o contrato à comparação (`de`, `ate`, `categorias`) e ao retorno da página do acontecimento (os mesmos, mais `origem=comparar`). Falta a estratégia de SEO por página.
- Fase 03: as quatro telas navegáveis, composição em computador, tablet e celular, menu em tela estreita, estados de vazio, carregamento e falha, a navegação temporal com a consulta no endereço e o mapa sincronizado, com lista para os acontecimentos que dividem um lugar (docs/UX.md, docs/INTERACTIONS.md, docs/TIMELINE.md e docs/MAP.md). Não há formulário no projeto. A fase 7 do plano fechou a comparação ligada ao endereço, o retorno da página do acontecimento com o recorte, a cópia do link e a metodologia (docs/COMPARISON.md e docs/PAGES.md). Falta validar com pessoas (fase 9 do plano).
- Fase 04: tokens, tipografia local, categorias, componentes e estados (docs/DESIGN-SYSTEM.md). As fases 5, 6 e 7 do plano não criaram token nem cor. Falta o acabamento da fase 8 do plano e duas decisões do Rick: nome definitivo e retrato em cinza.
- Fase 05: edição 0.1.0 do conteúdo (39 acontecimentos conferidos, 5 rascunhos, 59 fontes), com data de corte em 08/10/2026. Toda a conferência foi assistida por IA. A metodologia pública foi escrita na fase 7 do plano, com os números vindos dos dados e a revisão descrita como foi (assistida por IA). Faltam revisão humana, lacunas de pesquisa e imagens de acontecimentos (docs/CONTENT-REVIEW.md e docs/DATA-REPORT.md).
- Fase 06: fundação, pipeline de dados, as quatro telas com conteúdo real, 404 com identidade, a linha do tempo (fase 5 do plano), o mapa sincronizado, com cinco falhas tratadas (fase 6), e a comparação, o perfil completo, as páginas de acontecimento com retorno, a cópia do link e a metodologia (fase 7). Falta o acabamento da fase 8 do plano.
- Fase 07: transições curtas definidas (120 e 180 ms, câmera do mapa em 500 ms) e movimento reduzido respeitado. Não há animação de entrada nem de rolagem, por decisão. Falta a revisão da fase 8 do plano.
- Fase 08: título e descrição por página, com o conteúdo factual do registro, e Open Graph de título e descrição nos perfis e nos acontecimentos (fase 7 do plano). Faltam endereço canônico, `metadataBase`, sitemap, robots.txt, imagem de compartilhamento e JSON-LD, que dependem do domínio. A indexação segue bloqueada (`noindex`) até a revisão humana.
- Fase 10: contraste medido em teste, foco visível, teclado na lista, na linha do tempo, nos filtros e nos marcadores do mapa, regiões nomeadas, avisos para leitor de tela e movimento reduzido. Falta leitor de tela real e zoom de texto.

## Bloqueios
- Nenhum bloqueio técnico.
- O conteúdo não pode ser publicado sem revisão humana. Roteiro no fim de docs/CONTENT-REVIEW.md.
- Decisões do Rick ainda pendentes: quem assina a revisão humana, canal público de correção (D-70), domínio de publicação, como tratar as divergências entre documentos (data de nascimento de Lula, filiação de Flávio Bolsonaro ao Republicanos), nome definitivo do atlas e se o retrato de Flávio Bolsonaro (condição "uso livre com crédito") pode ser exibido em cinza e recortado (docs/DECISIONS.md, D-42).

## Próxima ação
Aguardar o comando do Rick para a fase 8 do plano (acabamento visual e desempenho). Antes de retomar, ler docs/STATUS.md, seção "Preparação para a fase 8". A comparação está em docs/COMPARISON.md, e as páginas, as fontes e o compartilhamento, em docs/PAGES.md. Para conferir que nada quebrou: `npm run check` (485 testes) e `npm run test:e2e` (170 testes).

Atenção ao retomar:
- As fases 1 a 7 estão commitadas na `main`, só nesta máquina: o repositório não tem remoto e nada foi enviado. Commit e push só com pedido.
- Para ver a exploração: `npm run dev` e abrir http://localhost:3000/politicos/lula/. Guia de estados em http://localhost:3000/dev/previa/.
- Capturas em docs/capturas/fase-7/ (`npm run capture:pages`), fase-6/ (`npm run capture:map`), fase-5/ (`npm run capture:timeline`) e fase-4/ (`npm run capture:preview`). As duas últimas mostram o mapa antigo, e as três anteriores mostram a comparação e a página do acontecimento antigas; os comandos hoje as refariam com a interface atual.
- As páginas leem `generated/`, que `npm run data:build` produz e que fica fora do Git. `npm run dev` e `npm run build` já geram. Conteúdo com erro interrompe os dois.
- O conteúdo é de 08/10/2026, entre o primeiro e o segundo turno da eleição presidencial (segundo turno em 25/10/2026). Registros de 2026 vão precisar de atualização.

Pendências pequenas:
- Canal público de correção: preencher `SITE.correctionChannel` em `src/lib/site.ts` quando o Rick decidir. Até lá a metodologia diz que está pendente.
- Domínio público: sem ele não há endereço canônico nem sitemap. **Copiar link** usa o endereço em que o atlas estiver aberto.
- A comparação, o perfil e as páginas também só foram vistos em Chromium sem interface. Conferir em um celular a barra do recorte presa ao topo e a cópia do link.
- Abrir a exploração em uma janela visível do Chrome e em um celular real: tudo foi conferido em Chromium sem interface, com larguras e toque emulados. No mapa, conferir a pinça, o arraste com o dedo e os dois dedos da página do acontecimento.
- Quadro opaco sobre o mapa parado: no Chromium dos testes a base sumia ao lado dele. A legenda aberta usa fundo a 98% por isso, e dois testes comparam o mapa pixel a pixel (docs/MAP.md, seção Falhas). Não se sabe se acontece com placa de vídeo.
- O build publica o worker de desenvolvimento do MapLibre (1,1 MB), que nenhuma página pede. Tirar na fase 8.
- Quem abre um link com consulta vê o estado inicial por um instante, até o JavaScript carregar (D-49). Vale também para a comparação e para os links de retorno da página do acontecimento. Rever na fase 8.
- Na saída estática servida por `npm run preview`, o pré-carregamento de segmentos do Next dá 404 (a navegação funciona). Resolver na fase 8 ou na 10 (docs/STATUS.md).
- Se o servidor de desenvolvimento continuar mostrando o CSS antigo depois de mexer em `globals.css`, reiniciar `npm run dev`.
- `robots: noindex` no layout, a remover na fase 10 do plano.
- Os comandos só foram rodados no Node 24.15.0, no Windows.

## Notas de N/A
- Nenhuma por enquanto.
