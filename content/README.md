# Conteúdo

Tudo o que o atlas afirma sobre pessoas, mandatos e acontecimentos mora aqui, em JSON versionado. O código nunca traz conteúdo embutido.

Situação: edição 0.1.0, com data de corte em 8 de outubro de 2026. São 39 acontecimentos conferidos e 5 rascunhos. Toda a conferência foi assistida por IA; a revisão humana está pendente (ver `docs/CONTENT-REVIEW.md`).

## `published/`

O conjunto que alimenta as páginas. O build lê esta pasta, valida tudo e falha se algo não passar. Regras:

- Só entra registro com estado editorial `revisado`.
- Toda revisão declara o tipo: `assistida-por-ia` ou `humana`.
- Nenhum identificador pode começar com `sintetico-` (prefixo reservado aos dados de teste).
- Sem `edicao.json`, o atlas mostra "nenhuma edição publicada" e a rota `/acontecimentos/[slug]` fica desligada.

Arquivos aceitos (qualquer outro `.json` é erro):

| Arquivo | Conteúdo |
|---|---|
| `edicao.json` | Versão, data de corte, revisão, cobertura por pessoa e registro de alterações. Obrigatório. |
| `pessoas.json` | Perfis. |
| `mandatos.json` | Mandatos e funções, com período. |
| `filiacoes.json` | Filiações partidárias, com período. |
| `acontecimentos.json` | Acontecimentos. |
| `lugares.json` | Lugares com coordenada, precisão e origem. |
| `fontes.json` | Documentos citados. |
| `imagens.json` | Imagens com autoria, crédito e condições de uso. Os arquivos ficam em `public/media/`. |

Um arquivo de coleção ausente equivale a uma lista vazia. O formato de cada registro está em `docs/DATA_MODEL.md`.

## `drafts/`

Pesquisa em andamento. Só `acontecimentos.json`, com registros em `rascunho` ou `em-revisao`. Regras:

- Os rascunhos citam pessoas, lugares e fontes de `published/`. Uma fonte nova entra em `published/fontes.json` mesmo que só um rascunho a use.
- Todo rascunho traz `pendencias`: o que falta para ser conferido.
- Nada desta pasta vira página. `npm run verify:export` confere isso.

## Como editar

1. **Corrigir um registro publicado:** edite o arquivo em `published/`, registre a mudança em `alteracoes` de `edicao.json` e suba a versão (regra em `docs/EDITORIAL.md`, seção Correção).
2. **Promover um rascunho:** depois de conferir contra as fontes, mova o registro de `drafts/acontecimentos.json` para `published/acontecimentos.json`, troque `editorial` para `revisado` com `revisao` preenchida e apague `pendencias`. Por enquanto é manual; o comando vem na fase 3.
3. **Registrar revisão humana:** troque `revisao.tipo` para `humana`, com o nome de quem revisou e a data. Só depois de abrir as fontes e conferir os trechos.
4. **Validar:** `npm run test` confere `published/` e `drafts/`; `npm run build` gera as páginas. A mensagem de erro aponta o registro e o campo, por exemplo `acontecimentos["lula-2002-eleito-presidente"].data.valor`.
5. **Ver a cobertura:** `npm run content:coverage`.

Depois de publicar o primeiro acontecimento de uma pasta que estava vazia, reinicie o `npm run dev` para a rota de acontecimentos aparecer.
