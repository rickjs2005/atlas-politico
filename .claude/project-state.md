# Atlas Político

Tipo: institucional
Stack: Next.js 16.4 (exportação estática) · React 19.3 · TypeScript 5.9 · Tailwind 4 · MapLibre GL JS 6 · Zod 4 · Vitest 5 · Playwright 1.63 · npm

Nome provisório. Site estático de conteúdo, sem banco e sem login. A execução segue o plano próprio do projeto, em 10 fases (`Downloads/Atlas-Politico-Plano-de-Desenvolvimento.md`). O quadro de 16 fases abaixo é o padrão da MilWeb e fica como visão de entrega.

## Plano do projeto (10 fases)
Fase 1 — Arquitetura e fundação                  ✓  (08/10/2026, commit 9be1013)
Fase 2 — Pesquisa e primeiro conjunto de conteúdo ✓  (08/10/2026, commit 7b090e1; revisão assistida por IA, revisão humana pendente)
Fase 3 — Camada de dados e preparação             ✓  (08/10/2026, commit local na main, logo depois do 7b090e1)
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
Fase 05 — Conteúdo        ◐
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
- Fase 05: edição 0.1.0 do conteúdo (39 acontecimentos conferidos, 5 rascunhos, 59 fontes), com data de corte em 08/10/2026. Toda a conferência foi assistida por IA. Faltam revisão humana, lacunas de pesquisa e imagens de acontecimentos (docs/CONTENT-REVIEW.md e docs/DATA-REPORT.md).
- Fase 06: fundação pronta (projeto, TypeScript, CSS, lint, estrutura, cabeçalho, rodapé, 404 com identidade, falha do mapa tratada), páginas de perfil e de acontecimento com conteúdo real e, desde a fase 3 do plano, o pipeline de dados que as alimenta (docs/DATA-PIPELINE.md). Falta a aplicação em si: linha do tempo, mapa e comparação.

## Bloqueios
- Nenhum bloqueio técnico.
- O conteúdo não pode ser publicado sem revisão humana. Roteiro no fim de docs/CONTENT-REVIEW.md.
- Decisões do Rick ainda pendentes: quem assina a revisão humana, canal público de correção e como tratar as divergências entre documentos (data de nascimento de Lula, filiação de Flávio Bolsonaro ao Republicanos).

## Próxima ação
Aguardar o comando do Rick para começar a fase 4 do plano (experiência e direção visual). Antes de retomar, ler docs/STATUS.md. Para conferir que nada quebrou: `npm run check` e `npm run test:e2e`.

Atenção ao retomar:
- As fases 1, 2 e 3 estão commitadas na `main`, só nesta máquina: o repositório não tem remoto e nada foi enviado. Push só com pedido.
- As páginas não leem mais `content/`: leem `generated/`, que `npm run data:build` produz e que fica fora do Git. `npm run dev` e `npm run build` já geram. Conteúdo com erro interrompe os dois.
- Para ver os dados reais em uso: `npm run dev` e abrir http://localhost:3000/dev/dados/.
- Comandos de dados: `data:validate`, `data:build`, `data:report`, `data:import` e `data:query`.
- O conteúdo é de 08/10/2026, entre o primeiro e o segundo turno da eleição presidencial (segundo turno em 25/10/2026). Registros de 2026 vão precisar de atualização.

Pendências pequenas:
- Abrir /dev/prova/ ou /dev/dados/ em uma janela visível do Chrome, para ver o mapa com a placa de vídeo real (só foi verificado em Chromium sem interface).
- `robots: noindex` no layout, a remover na fase 10 do plano.
- Os comandos de dados só foram rodados no Node 24.15.0, no Windows.

## Notas de N/A
- Nenhuma por enquanto.
