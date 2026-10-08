# Conteúdo

Tudo o que o atlas afirma sobre pessoas, mandatos e acontecimentos mora aqui, em JSON versionado. O código nunca traz conteúdo embutido.

## `published/`

O conjunto que alimenta as páginas. O build lê esta pasta, valida tudo e falha se algo não passar. Regras:

- Só entra registro com estado editorial `revisado`.
- Nenhum identificador pode começar com `sintetico-` (prefixo reservado aos dados de teste).
- Enquanto não existir `edicao.json`, o atlas mostra "nenhuma edição publicada" e a rota `/acontecimentos/[slug]` fica desligada.

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
| `imagens.json` | Imagens com autoria, crédito e condições de uso. |

Um arquivo de coleção ausente equivale a uma lista vazia. O formato de cada registro está em `docs/DATA_MODEL.md`, e um exemplo completo e válido está em `tests/fixtures/sintetico/`.

## `drafts/`

Pesquisa em andamento: registros em `rascunho` ou `em-revisao`. Nada desta pasta é lido pelo build. Ela começa a ser usada na fase 2, e o comando que promove rascunhos revisados para `published/` é entrega da fase 3.

## Como editar à mão, por enquanto

1. Edite ou crie os arquivos em `published/` seguindo o contrato acima.
2. Rode `npm run test` (um dos testes valida esta pasta) ou `npm run build`.
3. Se algo estiver errado, a mensagem aponta o registro e o campo, por exemplo `acontecimentos["posse-2003"].data.valor`.
