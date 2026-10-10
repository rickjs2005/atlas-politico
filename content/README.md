# Conteúdo

Tudo o que o atlas afirma sobre pessoas, mandatos e acontecimentos mora aqui, em JSON versionado. O código nunca traz conteúdo embutido.

Situação: edição 0.1.1, com data de corte em 8 de outubro de 2026. São 39 acontecimentos conferidos e 5 rascunhos. Toda a conferência foi assistida por IA; a revisão humana está pendente (ver `docs/CONTENT-REVIEW.md`).

As páginas não leem estas pastas. Elas leem `generated/`, que `npm run data:build` produz depois de validar o conteúdo. O funcionamento está em `docs/DATA-PIPELINE.md`.

## `published/`

A edição: os registros que passaram pela revisão.

| Arquivo | Conteúdo |
|---|---|
| `edicao.json` | Versão, data de corte, revisão, cobertura por pessoa e registro de alterações. Obrigatório quando há registros |
| `pessoas.json` | Perfis |
| `mandatos.json` | Mandatos e funções, com período |
| `filiacoes.json` | Filiações partidárias, com período |
| `acontecimentos.json` | Acontecimentos |
| `lugares.json` | Lugares com coordenada, precisão e origem |
| `fontes.json` | Documentos citados |
| `imagens.json` | Imagens com autoria, crédito e condições de uso. Os arquivos ficam em `public/media/`. Depois de trocar o arquivo de um retrato, rode `npm run images`: as páginas pedem versões preparadas dele, e o build recusa versões desatualizadas |

Regras:

- Entra na publicação o registro com estado `revisado` que respeita o contrato e só cita o que também entra. A regra completa está em `docs/DATA-PIPELINE.md`, seção Elegibilidade.
- Um registro em outro estado, nesta pasta, fica fora da publicação e aparece no relatório.
- Toda revisão declara o tipo: `assistida-por-ia` ou `humana`.
- Lugar, fonte e imagem só vão para os dados públicos quando um registro publicado os usa.
- Nenhum identificador pode começar com `sintetico-` (prefixo reservado aos dados de teste).
- Sem `edicao.json` e sem registros, o atlas mostra "nenhuma edição publicada".

## `drafts/`

Pesquisa em andamento e o que chega por importação. Nada desta pasta é publicado.

- As mesmas sete coleções, parciais: só os registros em pesquisa.
- `importacoes.json`: registro de cada importação, escrito por `npm run data:import`.
- Um rascunho pode citar pessoas, lugares e fontes de `published/`.
- Todo rascunho traz `pendencias`: o que falta para ser conferido.
- `id` e `slug` são únicos somando as duas pastas.

Um arquivo de coleção ausente equivale a uma lista vazia. Qualquer outro `.json`, nas duas pastas, é erro. O formato de cada registro está em `docs/DATA_MODEL.md`.

## Como editar

1. **Corrigir um registro publicado:** edite o arquivo em `published/`, registre a mudança em `alteracoes` de `edicao.json` e suba a versão (regra em `docs/EDITORIAL.md`, seção Correção).
2. **Incluir um registro novo:** escreva em `drafts/`, com estado `rascunho` e as pendências, ou importe um pacote com `npm run data:import -- <arquivo.json>`.
3. **Promover um rascunho:** depois de conferir contra as fontes, troque `editorial` para `revisado` com `revisao` preenchida, apague `pendencias` e mova o registro para o arquivo de mesmo nome em `published/`, junto com os lugares, fontes e imagens que só ele usa.
4. **Registrar revisão humana:** troque `revisao.tipo` para `humana`, com o nome de quem revisou e a data. Só depois de abrir as fontes e conferir os trechos.
5. **Validar:** `npm run data:validate`. A mensagem de erro aponta o arquivo, o registro e o campo:

   ```
   content/published/acontecimentos.json · acontecimento "lula-2002-eleito-presidente" · data.valor: Mês 13 não existe.
   ```

6. **Ver a cobertura e as pendências:** `npm run data:report`.
7. **Ver no site:** `npm run dev`. Com o servidor aberto, basta salvar o arquivo e recarregar a página.

Depois de publicar o primeiro acontecimento de uma edição que estava vazia, reinicie o `npm run dev` para a rota de acontecimentos aparecer.
