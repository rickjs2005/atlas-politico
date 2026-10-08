# Atlas Político

Tipo: institucional
Stack: Next.js 16.4 (exportação estática) · React 19.3 · TypeScript 5.9 · Tailwind 4 · MapLibre GL JS 6 · Zod 4 · Vitest 5 · Playwright 1.63 · npm

Nome provisório. Site estático de conteúdo, sem banco e sem login. A execução segue o plano próprio do projeto, em 10 fases (`Downloads/Atlas-Politico-Plano-de-Desenvolvimento.md`). O quadro de 16 fases abaixo é o padrão da MilWeb e fica como visão de entrega.

## Plano do projeto (10 fases)
Fase 1 — Arquitetura e fundação                  ✓  (08/10/2026)
Fase 2 — Pesquisa e primeiro conjunto de conteúdo ○
Fase 3 — Camada de dados e preparação             ○
Fase 4 — Experiência e direção visual             ○
Fase 5 — Aplicação e linha do tempo               ○
Fase 6 — Mapa sincronizado                        ○
Fase 7 — Comparação, páginas e fontes             ○
Fase 8 — Acabamento visual e desempenho           ○
Fase 9 — Revisão editorial, testes e validação    ○
Fase 10 — Publicação e apresentação               ○

## Progresso
Fase 01 — Briefing        ◐
Fase 02 — Arquitetura     ◐
Fase 03 — UX              ○
Fase 04 — UI              ○
Fase 05 — Conteúdo        ○
Fase 06 — Frontend        ◐
Fase 07 — Motion          ○
Fase 08 — SEO On-Page     ○
Fase 09 — Performance     ○
Fase 10 — Acessibilidade  ○
Fase 11 — Analytics       ○
Fase 12 — Segurança       ○
Fase 13 — QA              ○
Fase 14 — Deploy          ○
Fase 15 — Indexação       ○
Fase 16 — Entrega         ○

O que cada ◐ já tem e o que falta:
- Fase 01: o plano v1.0 cobre objetivo, público, escopo e fontes de partida. Faltam nome definitivo, canal de correção, domínio e hospedagem.
- Fase 02: rotas, navegação, cabeçalho, rodapé e contrato de URL definidos (docs/ARCHITECTURE.md). Falta a estratégia de SEO por página.
- Fase 06: fundação pronta (projeto, TypeScript, CSS, lint, estrutura, cabeçalho, rodapé, 404 com identidade, falha do mapa tratada). Falta a aplicação em si, que depende de conteúdo.

## Bloqueios
- Nenhum bloqueio técnico.
- A fase 2 depende de decisões do Rick: quem assina a revisão dos registros, o critério editorial por escrito e o canal público de correção (docs/STATUS.md, "Preparação para a fase 2").

## Próxima ação
Aguardar o comando do Rick para começar a fase 2 do plano (catálogo de fontes e primeiro conjunto de conteúdo). Antes de retomar, ler docs/STATUS.md. Para conferir que nada quebrou: `npm run check` e `npm run test:e2e`.

Pendências pequenas herdadas da fase 1:
- Abrir http://localhost:3000/dev/prova/ em uma janela visível do Chrome, para ver o mapa com a placa de vídeo real (só foi verificado em Chromium sem interface).
- Fase 1 commitada na branch main em 08/10/2026, sem remoto. Push e repositório remoto só com pedido.
- `robots: noindex` no layout, a remover na fase 10 do plano.

## Notas de N/A
- Nenhuma por enquanto.
