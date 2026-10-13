# Cidade do Voto

Protótipo de um mundo aberto em `/mundo`, pedido em 13 de outubro de 2026 para tornar o atlas mais visual e prender a atenção de quem ainda não decidiu o voto. É um caminho a mais: o jogo em trilha (`/jogo`), o atlas e a comparação continuam iguais.

## Como funciona

1. **Entrada.** Uma página curta explica as regras e oferece a comparação com os nomes para quem preferir.
2. **Praça.** Uma cena 3D (three.js) com um prédio por tema e um personagem genérico. Joystick no celular; setas ou W A S D e a tecla E no computador.
3. **Prédio.** Na porta, o botão **Entrar** abre os dois programas daquele tema como **Programa A** e **Programa B**, sem nome. A pessoa marca o que combina mais com ela, ou **Nenhum dos dois**. A bandeira do prédio sobe.
4. **Revelação.** A qualquer momento, **Revelar** mostra de quem era cada programa, tema por tema, e as frases com os nomes e as fontes.

Sem WebGL, os prédios aparecem como lista, com o mesmo conteúdo.

## Regras

- **Só propostas registradas no TSE.** É o único conjunto com o mesmo número de frases, por tema, para as duas pessoas (três por área). Decisões dependem dos cargos de cada um e não ficam lado a lado aqui. Um tema em que uma das pessoas não tem proposta publicada não vira prédio (`src/lib/world/content.ts`).
- **Nenhum texto novo sobre as pessoas.** As frases, as ressalvas e as fontes são as do conteúdo publicado; um teste confere frase a frase (`tests/world.test.ts`).
- **Lados sorteados.** O lado de cada pessoa é sorteado por tema e por visita (`src/lib/world/blind.ts`); um teste confere que cada uma fica no lado A em cerca de metade dos sorteios.
- **Fontes só na revelação.** O título dos documentos diria quem é quem.
- **O modo às cegas esconde o nome, não o conteúdo.** Algumas frases dão pistas, como citar o governo atual. A tela diz isso.
- **Sem recomendação de voto.** A revelação mostra só as escolhas da própria pessoa, com o aviso de que três frases por área não são o programa inteiro. Nada é somado com peso, nada aponta vencedor.
- **Nada é guardado.** As escolhas vivem só na página aberta.
- **Visual neutro.** Nenhuma cor de partido nos prédios, placas ou personagem, e nenhuma figura das pessoas retratadas. Arte própria, feita de formas simples, sem modelos baixados.

## Código

| Arquivo | Papel |
| --- | --- |
| `src/app/mundo/page.tsx` | Página estática; monta o conteúdo no build |
| `src/lib/world/content.ts` | Conteúdo por tema, simétrico, a partir de `AtlasData` |
| `src/lib/world/blind.ts` | Sorteio dos lados e revelação, funções puras |
| `src/features/world/CityWorld.tsx` | Telas, joystick, prédio aberto e revelação |
| `src/features/world/scene.ts` | Cena three.js, carregada só no navegador, em pacote à parte |

## Pendências

- Validar com pessoas, num celular real.
- Medir o desempenho em aparelho fraco.
- Decidir se o modo às cegas fica como entrada principal do jogo.
