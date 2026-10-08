# features/timeline

Espaço reservado. Entra na fase 5.

Responsabilidade: a escala de tempo e os controles de recorte (ano ou intervalo, categorias) e a lista cronológica da exploração.

O que já existe e esta pasta deve usar, sem duplicar:

- Regras de datas e intervalos de cálculo: `src/lib/domain/dates.ts`.
- Estado do recorte (`periodo`, `categorias`) e seletores: `src/lib/state/`.
- Parâmetros de URL `de`, `ate` e `categorias`: `src/lib/state/url-params.ts`.
- Lista de acontecimentos: `src/features/events/EventList.tsx`.

Limite: a linha do tempo altera o recorte por ações do estado central e lê o resultado pelos seletores. Não guarda seleção própria nem conversa direto com o mapa.
