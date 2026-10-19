# Vale a Faixa

"Dois candidatos. Uma escada. Uma faixa." Um jogo de luta em `/jogo/vale-a-faixa/`, pedido em 19 de outubro de 2026 como atração do atlas: Lula e Flávio Bolsonaro, em caricatura, disputam em um ringue de luta livre montado no palco de um debate quem posiciona a escada sob a faixa presidencial, sobe e a tira. É sátira interativa, identificada como tal na entrada, no hub `/jogo/` e no fim de cada partida (D-156): ficção sobre uma situação absurda, sem atributo, acusação, fato ou recomendação de voto. O resto do atlas não mudou.

## Como se joga

1. **Entrada** (`/jogo/vale-a-faixa/`): o que é, como se vence, os controles e o aviso de sátira. **Escolher candidato** leva à escolha.
2. **Escolha**: os dois personagens, desenhados pelo mesmo código da partida, parados e respirando. O outro fica com o computador.
3. **Partida**: contagem de três segundos, luta, fim. Na primeira vez, um tutorial curto (três passos) antes da contagem; ele não volta, e fica em Pausa → Controles.
4. **Fim**: vitória ou derrota, o tempo da partida, **Revanche** (mesmos personagens, escada sorteada de novo), **Trocar candidato** e **Voltar ao Atlas**.

A vitória é só pela faixa. Derrubar o adversário não encerra nada: abre a janela para pegar a escada, levá-la até a marca amarela sob a faixa, pôr em pé, subir e, no topo, segurar o comando de interação até a barra encher. Quem está no topo pode ser interrompido: golpes na base chacoalham a escada (a barra não avança enquanto ela balança, e três golpes derrubam quem sobe), e um empurrão na base tomba a escada. Cair tira 40% do que foi puxado, não tudo.

### Controles

Um esquema só, sem atalhos alternativos (D-157):

| Computador | Celular |
| --- | --- |
| ← →: andar | o direcional, à esquerda |
| ↑ ↓: subir e descer a escada (↑ começa a subir com o lutador alinhado à base) | ▲ ▼ do direcional; ▲ acende quando dá para subir |
| Z: atacar, na direção em que olha. Apertar de novo durante o golpe emenda a sequência de três; perto da escada em que o adversário está, Z tenta derrubá-la | **Atacar** |
| X: defender enquanto pressionado, com o escudo visível | **Defender** |
| C: pegar a escada caída; carregando, posicionar (na marca) ou largar (fora dela); no topo, segurar para puxar a faixa | **Interagir**, que muda de ícone com o contexto (mão, escada em pé, escada deitada, roseta) sem sair do lugar |
| Esc: pausar e continuar | **Pausa**, no alto |

Teclado e toque valem ao mesmo tempo. Perder o foco da janela ou esconder a aba abre a pausa; pausar, perder o foco e sair do jogo soltam todos os comandos. As teclas do jogo não rolam a página enquanto a partida está ativa e não são capturadas em campos de texto. Um toque muito curto (apertado e solto entre dois passos da simulação) não se perde: fica guardado até a próxima leitura.

A dica curta aparece sobre a cabeça do personagem só quando a ação está disponível: "C — Pegar", "C — Posicionar", "C — Largar", "↑ — Subir", "Segure C — Pegar faixa" (no toque, sem a tecla). Embaixo, para quem usa teclado, a legenda discreta: "Setas: mover • Z: atacar • X: defender • C: interagir". A zona válida da escada fica marcada no tapete e pulsa enquanto alguém a carrega.

## Regras (src/lib/faixa/regras.ts)

Função pura sobre dados: a cada passo de 1/120 s recebe a entrada dos dois lutadores e avança a partida, registrando eventos. Os números estão em `REGRAS`.

- **Equilíbrio** de 0 a 100, igual para os dois. Golpe tira 24 (5 na guarda), empurrão tira 10 e não se bloqueia. A zero, o lutador cai por 1,8 s, levanta em 0,55 s com proteção de 0,9 s e volta com 55. O equilíbrio volta sozinho a 11 por segundo, fora de combate.
- **Golpe** em três fases (antecipação, ativo, recuperação), em sequência de até três: o jab (0,12, 0,08, 0,20 s; 20 de dano), o direto (0,10, 0,08, 0,22; 22) e o forte (0,18, 0,10, 0,42; 30), que afasta mais e dá 0,6 s de proteção: sem sequência infinita. Apertar de novo depois do instante ativo emenda o próximo, com um passo à frente de 12 para alcançar quem recuou; passada a janela de 0,45 s, a sequência volta ao primeiro. Bater na guarda deixa quem bateu um pouco mais lento. **Derrubada**: o ataque perto da escada em pé em que o adversário está (0,42, 0,10, 0,45 s; recarga de 0,9 s): a escada tomba e quem está nela cai. Perto da escada vazia, atacar é golpe comum, e a escada fica.
- **Escada**: caída em uma das laterais (sorteada por partida), pega a até 90 do centro dela, carregada a 165 por segundo (contra 250 andando), sem atacar nem defender; um golpe em quem carrega a derruba no lugar. Só fica em pé dentro da zona (64 para cada lado do centro); fora, o comando a larga. A seta para cima começa a subir com o lutador a até 40 da base e a escada livre; subida em 1,25 s, descida mais rápida. O balanço é visual: ao ser posta em pé e enquanto alguém puxa.
- **Faixa**: 1,8 s de comando segurado no topo, com a escada estável. Soltar faz o progresso escorrer devagar; cair tira 40%. A vitória muda a fase para `fim` uma vez só, e nada mais muda depois.
- **Estados** dos lutadores: `parado`, `andando`, `golpe`, `derrubada`, `defesa`, `atingido`, `caido`, `levantando`, `carregando`, `subindo`, `noTopo`, `caindoDaEscada`, `vitoria`, `derrota`. Cada um exclui os outros. A escada: `caida`, `carregada`, `emPe`, `caindo`. A escada nunca se teletransporta: tomba a partir de onde está e fica deitada ao lado.
- **Simetria**: velocidade, alcance (78, medido entre os centros), resistência e tempos são os mesmos; os desenhos diferem (Lula um pouco mais baixo e largo, Flávio mais alto e esguio), o alcance não.

## O computador (src/lib/faixa/ia.ts)

Estados: aproximar, atacar, defender, recuperar, buscar a escada, posicionar, subir, disputar a faixa, interromper, hesitar. Usa os mesmos sete comandos da pessoa. Decide com atraso de reação (0,1 a 0,8 s, conforme a ação) e a cada decisão tem 14% de chance de errar de propósito (hesitar ou bater no vazio). Entende o objetivo: vai à escada quando o adversário cai ou está longe, sobe (segurando a seta na base) quando a escada está em pé e há vantagem, desce quando é ameaçado embaixo, emenda a sequência de golpes parte das vezes, espera a guarda do outro baixar em vez de bater nela, e interrompe quem sobe com a derrubada na base. É determinístico pela semente; dois computadores um contra o outro terminam a partida com vitórias dos dois lados (tests/faixa.test.ts).

## Desenho (src/features/faixa/desenho)

Canvas 2D, laço de passo fixo (o `createLoop` da trilha), sem biblioteca nova: o projeto já tinha um kit de arte vetorial com as cabeças em cartum das duas pessoas (`src/features/game/draw`), reaproveitadas aqui em escala maior; o corpo é um boneco articulado de terno, com poses por estado (guarda, caminhada, os três golpes da sequência, a derrubada, defesa com o escudo translúcido na frente, atingido, caído, levantando, carregando, subindo, no topo, puxando, caindo, vitória, derrota) e expressões por cima do rosto (raiva, dor, esforço, alegria, tonto, susto, triste). A arena: palco de debate escuro com painel de LED, púlpitos, treliça com refletores, público estilizado com bandeiras e flashes, ringue com cordas verdes e amarelas, tapete com a zona marcada, avental. A escada tem quatro desenhos (em pé com oscilação e tombo, caída, carregada); a faixa, verde e amarela com roseta, balança, desce e treme quando puxada, e vai ao peito do vencedor. Efeitos: estrelas de impacto, poeira, brilhos, anéis, pausa de impacto de 45 ms e tremor de câmera curto. A câmera enquadra os dois sempre e aproxima 8% na subida. Com movimento reduzido: sem tremor, sem partículas, sem flashes, público parado.

A interface sobre a cena (placas com equilíbrio e situação, medidor da faixa, a dica sobre a cabeça do personagem, a legenda dos comandos, contagem, comentário do narrador) é desenhada no canvas; pausa, tutorial, fim, a apresentação das teclas desenhadas e os botões de toque são React.

## Som (src/features/faixa/audio.ts)

Sintetizado com a Web Audio API: nenhum arquivo. Impactos, guarda, empurrão, queda, escada, sino de abertura, torcida contínua que acompanha a intensidade, vitória e derrota. Começa só depois de um gesto (o botão **Escolher candidato** ou **Lutar**); volume e silêncio ficam em Pausa → Som e no botão **Som** sobre a cena, guardados em `atlas-politico:faixa:preferencias` junto com o tutorial visto, o último personagem e o placar da pessoa.

## Código

| Arquivo | Papel |
| --- | --- |
| `src/app/jogo/vale-a-faixa/page.tsx` | Página estática, leve |
| `src/lib/faixa/tipos.ts`, `regras.ts`, `ia.ts`, `falas.ts` | Dados, regras, computador e comentários, puros |
| `src/features/faixa/ValeAFaixa.tsx` | Telas: entrada, escolha, partida, pausa, fim, tutorial |
| `src/features/faixa/motor.ts` | Laço, entrada, IA, desenho, som, eventos; carregado por `import()` |
| `src/features/faixa/entrada.ts`, `Controles.tsx` | Teclado e toque |
| `src/features/faixa/desenho/*` | Câmera, arena, lutadores, escada e faixa, efeitos, HUD |
| `src/features/faixa/audio.ts`, `preferencias.ts` | Som e preferências |
| `tests/faixa.test.ts` | Regras e IA, em simulação |
| `tests/e2e/vale-a-faixa.spec.ts` | A jornada no navegador, com cada personagem, teclado, toque, pausa, revanche, redimensionamento. Com `?computador=parado` no endereço, o adversário não age: é como o teste dirige a partida inteira pelo teclado |
| `tests/export/vale-a-faixa.spec.ts` | Sobre a saída estática: o hub, a entrada e as páginas informativas não pedem o motor; ele chega na escolha do personagem |

## Limitações

- Nenhuma pessoa jogou: o equilíbrio do computador (atraso de reação e 14% de erro) foi medido só em simulação e em partidas dirigidas por roteiro.
- O toque foi visto em celular emulado; aparelho real, Firefox e Safari não foram conferidos.
- Um nível de dificuldade só; sem partida entre duas pessoas.
- Os ícones dos botões de toque são SVG simples desenhados para o jogo; não foram vistos em aparelho real.
- O som é sintetizado e simples; não há música.
