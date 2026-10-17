# Cidade do Voto

Protótipo de um mundo aberto em `/mundo`, pedido em 13 de outubro de 2026 para tornar o atlas mais visual e prender a atenção de quem ainda não decidiu o voto. É um caminho a mais: o jogo em trilha (`/jogo`), o atlas e a comparação continuam iguais.

## Como funciona

1. **Entrada.** Uma página curta explica as regras e oferece a comparação com os nomes para quem preferir.
2. **Praça.** Uma cena 3D (three.js) com um prédio por tema e um personagem genérico. Joystick no celular; setas ou W A S D e a tecla E no computador.
3. **Prédio.** Na porta, o botão **Entrar** abre os dois programas daquele tema como **Programa A** e **Programa B**, sem nome. A pessoa marca o que combina mais com ela: **Programa A**, **Programa B**, **Nenhum dos dois**, **Concordo com partes dos dois** ou **Ainda não sei** (as duas últimas desde 17 de outubro de 2026). A bandeira do prédio sobe com qualquer escolha.
4. **Revelação.** A qualquer momento, **Revelar** mostra de quem era cada programa, tema por tema, e as frases com os nomes e as fontes. Cada tipo de escolha é contado à parte: "partes dos dois" e "ainda não sei" não contam para ninguém, e a frase do resumo os escreve como são. **Voltar à cidade** recria a cena em um canvas novo, com o personagem no lugar em que parou e as bandeiras visitadas no alto.

Sem WebGL, os prédios aparecem como lista, com o mesmo conteúdo, e a instrução da praça passa a ser "Toque em um prédio da lista".

## Regras

- **Só propostas registradas no TSE.** É o único conjunto com o mesmo número de frases, por tema, para as duas pessoas (três por área). Decisões dependem dos cargos de cada um e não ficam lado a lado aqui. Um tema em que uma das pessoas não tem proposta publicada não vira prédio (`src/lib/world/content.ts`).
- **Nenhum texto novo sobre as pessoas.** As frases, as ressalvas e as fontes são as do conteúdo publicado; um teste confere frase a frase (`tests/world.test.ts`).
- **Cada frase é um resumo editorial, e a tela diz isso.** A frase de uma proposta é o resumo de uma frase do documento, escrito com a mesma regra para as duas candidaturas (docs/EDITORIAL.md, regra 10), e não uma citação literal. Até 17 de outubro de 2026 a praça dizia "sem edição", o que contradizia a comparação; o aviso foi corrigido, e o documento e a página de cada frase continuam só na revelação.
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
| `src/features/world/CityWorld.tsx` | Telas, joystick, prédio aberto e revelação. A cena vive enquanto a praça está na tela: a revelação desmonta o canvas, e a volta cria a cena de novo no canvas novo, na posição guardada; a cena antiga é descartada ao sair (laço parado, recursos da placa soltos, contexto perdido de propósito) |
| `src/features/world/scene.ts` | Cena three.js, carregada só no navegador, em pacote à parte. Recebe a posição inicial e os prédios já visitados, e devolve a posição ao ser descartada |
| `tests/e2e/mundo.spec.ts` | A jornada com a cena (entrar, andar, escolher, revelar e voltar duas vezes, sem canvas vazio nem cena duplicada) e a jornada sem a cena (lista, instrução, cinco escolhas e revelação) |

## O que foi corrigido em 17 de outubro de 2026

- **A cena ficava presa ao canvas antigo.** A revelação desmontava o canvas, mas a referência da cena continuava viva: ao voltar, o canvas novo não recebia cena nenhuma (ficava com o tamanho padrão de 300 por 150 e em branco), o laço antigo seguia desenhando em um elemento fora da tela, e o teclado continuava preso ao mundo antigo. Agora a cena é criada e descartada com a praça, e a posição do personagem e as bandeiras atravessam a revelação. Confirmado por leitura do código e pela jornada `tests/e2e/mundo.spec.ts`, que mede o tamanho do canvas depois de voltar.
- **A lista mandava andar.** Sem a cena, a instrução da praça dizia "Ande até a porta de um prédio"; agora diz para tocar em um prédio da lista.
- **"Sem edição."** Ver a regra acima.
- **"Ainda não sei" e "Concordo com partes dos dois."** Entraram como escolhas próprias, contadas à parte; o significado de "nenhum dos dois" e das contagens por pessoa não mudou.

## Pendências

- Validar com pessoas, num celular real.
- Medir o desempenho em aparelho fraco.
- Decidir se o modo às cegas fica como entrada principal do jogo.
- A jornada com a cena anda com o teclado por tempo fixo (1,7 s para a frente): é frágil em máquina lenta, e vale trocar por uma posição exposta pela cena.
