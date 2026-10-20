# Vale a Faixa

"Dois candidatos. Uma escada. Uma faixa." Um jogo de luta em `/jogo/vale-a-faixa/`, pedido em 19 de outubro de 2026 como atração do atlas: Lula e Flávio Bolsonaro, em caricatura, disputam em um ringue de luta livre montado no palco de um debate quem posiciona a escada sob a faixa presidencial, sobe e a tira. É sátira interativa, identificada como tal na entrada, no hub `/jogo/` e no fim de cada partida (D-156): ficção sobre uma situação absurda, sem atributo, acusação, fato ou recomendação de voto. O resto do atlas não mudou.

## Como se joga

1. **Entrada** (`/jogo/vale-a-faixa/`): o que é, como se vence, os controles e o aviso de sátira. **Escolher candidato** leva à escolha.
2. **Escolha**: os dois personagens, desenhados pelo mesmo código da partida, parados e respirando. O outro fica com o computador.
3. **Partida**: contagem de três segundos, luta, fim. Na primeira vez, um tutorial curto (três passos) antes da contagem; ele não volta, e fica em Pausa → Controles.
4. **Fim**: vitória ou derrota, o tempo da partida, **Revanche** (mesmos personagens, escada sorteada de novo), **Trocar candidato** e **Voltar ao Atlas**.

A vitória é só pela faixa. Derrubar o adversário não encerra nada: abre a janela para pegar a escada, levá-la até a marca amarela sob a faixa, pôr em pé, subir e, no topo, segurar o comando de interação até a barra encher. Quem está no topo pode ser interrompido: golpes na base chacoalham a escada (a barra não avança enquanto ela balança, e perto de três golpes derrubam quem sobe). Cair tira um quarto do que foi puxado, não tudo. A guarda não é uma parede: colado em quem defende, o golpe forte vira o agarrão, que segura e arremessa; quem é agarrado escapa com a esquiva. Passados 150 s de luta, a prorrogação: a faixa afrouxa e puxar leva menos, para a partida não se arrastar (D-160).

### Controles

Um esquema só, sem atalhos alternativos (D-157, D-158):

| Computador | Celular |
| --- | --- |
| ← →: andar, com aceleração e frenagem curtas | o direcional, à esquerda |
| Espaço: pular, com impulso e gravidade; sem salto duplo | **Pular** |
| Z: atacar, na direção em que olha. Apertar de novo durante o golpe emenda a sequência soco, direto e chute; no ar, a voadora (uma por salto); perto da escada em que o adversário está, Z chacoalha a escada | **Atacar** (no ar, mostra Voadora) |
| V: o golpe forte, lento e arriscado; colado em quem defende, o agarrão (segura e arremessa) | **Forte**, que acende como **Agarrar** colado na guarda do adversário |
| X: defender enquanto pressionado, com o escudo visível; soltar e apertar uma ação no mesmo instante não perde a ação | **Defender** |
| Shift: a esquiva curta, com recarga; agarrado, escapa | **Esquiva**, que acende como **Escapar** enquanto se está agarrado |
| C: pegar a escada caída; carregando, posicionar (na marca) ou largar (fora dela); no topo, segurar para puxar a faixa | **Interagir**, que muda de ícone com o contexto (mão, escada em pé, escada deitada, roseta) sem sair do lugar |
| ↑ ↓: subir e descer a escada (↑ começa a subir com o lutador alinhado à base; ↓ desiste e desce) | ▲ ▼ do direcional; ▲ acende quando dá para subir |
| Esc: pausar e continuar | **Pausa**, no alto |

Teclado e toque valem ao mesmo tempo. Perder o foco da janela ou esconder a aba abre a pausa; pausar, perder o foco e sair do jogo soltam todos os comandos. As teclas do jogo (setas e Espaço inclusive) não rolam a página enquanto a partida está ativa, voltam ao normal fora dela, e não são capturadas em campos de texto. Um toque muito curto não se perde: fica guardado até a próxima leitura. Um comando apertado um instante (0,16 s) antes de o lutador ficar livre sai em seguida; uma queda ou um golpe recebido apagam o que estava guardado.

A dica curta aparece sobre a cabeça do personagem só quando a ação está disponível: "C — Pegar escada", "C — Posicionar escada", "C — Largar escada", "↑ — Subir", "Segure C — Puxar faixa", "Z — Derrubar escada", "V — Agarrar", "Shift — Escapar!" (no toque, com o nome do botão). Um comando que não sai (atacar carregando a escada, pular na escada, esquiva em recarga, segunda voadora no mesmo salto, qualquer coisa que não a esquiva enquanto agarrado) mostra o motivo no mesmo lugar por um instante. Embaixo, para quem usa teclado, a legenda discreta dos comandos. A zona válida da escada fica marcada no tapete e pulsa enquanto alguém a carrega. Na prorrogação, um rótulo discreto sob as placas avisa que a faixa afrouxou.

## Regras (src/lib/faixa/regras.ts)

Função pura sobre dados: a cada passo de 1/120 s recebe a entrada dos dois lutadores e avança a partida, registrando eventos. Os números estão em `REGRAS` e são o ponto de partida do balanceamento (D-158).

- **Movimento**: 260 por segundo, com aceleração de 2600 e frenagem de 3400 por segundo ao quadrado (responde em perto de 0,1 s, sem deslizar); no ar, 35% do controle. Dois lutadores em pé no chão não se sobrepõem (54 de largura); quem salta passa por cima. O ringue vai de −400 a 400; bater forte nas cordas devolve e tira equilíbrio.
- **Equilíbrio** de 0 a 100, igual para os dois. A zero, o lutador cai por 1,9 s (2,5 s depois do chute, do golpe forte ou da voadora), levanta em 0,55 s com proteção de 0,9 s e volta com 55. Volta sozinho a 11 por segundo, fora de combate.
- **A sequência de Z**: o soco (0,12, 0,08, 0,20 s; 18 de dano; recuo 120), o direto (0,10, 0,08, 0,22; 20; 140) e o chute (0,18, 0,10, 0,42; 28; recuo 430, proteção breve de 0,6 s para quem leva: sem sequência infinita). Apertar de novo depois do instante ativo emenda o próximo, com um passo à frente de 12; passada a janela de 0,45 s, volta ao primeiro. Na guarda, 5 de dano e quem bateu fica um pouco mais lento.
- **O golpe forte (V)**: preparação de 0,34 s, ativo 0,10, recuperação 0,52; 36 de dano, recuo 420, 12 na guarda, recarga de 0,5 s. Na preparação e na recuperação, quem bateu leva o troco.
- **O agarrão (V colado em quem defende, a até 64)**: a guarda não o segura. Preparação de 0,26 s, visível e interrompível por qualquer golpe; ao fim dela pega quem está à frente e colado (defendendo, parado ou andando: quem largou a guarda tarde ainda é pego; quem recuou deixa o agarrão no vazio, e quem errou fica 0,4 s exposto). O seguro dura 0,42 s, em que o agarrado fica colado, de frente, sem agir: só a esquiva (Shift) escapa, e só sem recarga; a fuga deixa o agarrador 0,3 s sem golpe e 0,5 s sem forte. Sem fuga, o arremesso: o agarrado voa (impulso 300 para cima, 520 para a frente), cai derrubado por 2,5 s, e as cordas devolvem quem bate forte nelas. Recarga de 1,6 s: o agarrão não vira a resposta para tudo. É desenho próprio para este jogo (D-160), inspirado na regra geral dos jogos de luta em que o agarrão vence a guarda, o golpe interrompe o agarrão e a guarda segura o golpe.
- **O pulo (Espaço)**: impulso 560, gravidade 1650 (perto de 95 de altura e 0,7 s no ar), aterrissagem de 0,1 s. **A voadora (Z no ar)**: ativa de 0,06 a 0,32 s do salto, 26 de dano, recuo 340, alcance 98, 8 na guarda, uma por salto, aterrissagem de 0,42 s em que não se ataca.
- **A esquiva (Shift)**: 0,28 s, 120 de passo (para trás, ou para onde a seta aponta), invulnerável nos primeiros 0,18 s, recarga de 0,9 s.
- **Um ataque só acerta uma vez**, no seu instante ativo, ao alcance (78; 86 no forte; 98 na voadora), na frente e sem proteção. Quem é atingido no ar cai no tapete.
- **Escada**: caída em uma das laterais (sorteada por partida), pega a até 90 do centro dela, carregada a 165 por segundo, sem atacar, pular nem esquivar (a tela diz por quê); um golpe em quem carrega a derruba no lugar. Só fica em pé dentro da zona (64 para cada lado do centro); fora, o comando a larga. A seta para cima começa a subir com o lutador a até 44 da base e a escada livre; subir leva perto de 1,7 s (0,6 da escada por segundo), descer é mais rápido (1,3). **A derrubada**: atacar perto da base em que o adversário está (0,42, 0,10, 0,45 s; recarga 0,9 s) chacoalha a escada (balanço 0,85, que decai 0,9 por segundo; acima de 0,4 ninguém puxa e a subida fica mais lenta) e tira 45 de equilíbrio de quem está nela; a zero, a escada tomba com a pessoa. Perto de três seguidos derrubam. Perto da escada vazia, atacar é golpe comum.
- **Faixa**: 9 s de comando segurado no topo, com a escada parada. Soltar faz o progresso escorrer a 3% por segundo; cair tira 25%. O progresso é de cada um e aparece na placa de cada um; o medidor grande avisa "falta pouco" a partir de 70%. A vitória muda a fase para `fim` uma vez só, e nada mais muda depois.
- **Prorrogação**: aos 150 s de luta (sem a contagem) o aviso sai uma vez e a faixa afrouxa; o ritmo da puxada sobe em linha reta até, aos 240 s, levar 60% do tempo (5,4 s em vez de 9). O alvo é a partida terminar entre 90 e 180 s sem cortar ninguém: nada é decidido por tempo, só fica mais fácil fechar.
- **Estados** dos lutadores: `parado`, `andando`, `pulando`, `voadora`, `aterrissando`, `golpe`, `forte`, `agarrando`, `agarrado`, `arremessado`, `derrubada`, `defesa`, `esquiva`, `atingido`, `caido`, `levantando`, `carregando`, `subindo`, `noTopo`, `caindoDaEscada`, `vitoria`, `derrota`. Cada um exclui os outros. A escada: `caida`, `carregada`, `emPe`, `caindo`.
- **Simetria**: velocidade, alcance, resistência e tempos são os mesmos; os desenhos diferem, o alcance não. O nível de dificuldade muda só o perfil do computador, nunca as regras.
- **Independência do quadro**: a simulação anda em passos fixos de 1/120 s por um acumulador (`createLoop`); a 60 ou a 30 quadros por segundo são os mesmos passos, e um quadro travado conta no máximo 100 ms (12 passos), sem avalanche. Há teste disso em tests/faixa.test.ts.

Doze partidas entre dois computadores no nível normal, em simulação, terminam em 99 a 209 s (média de 129 s), com vitórias dos dois lados; contra uma pessoa, que reage mais devagar que a simulação, a expectativa é de dois a quatro minutos. Oito partidas do difícil contra o fácil, alternando os lados, terminam em 32 a 89 s, com oito vitórias do difícil. Com a derrubada tombando a escada no primeiro golpe, como era, ninguém passava de 16% em 400 s: a disputa entrava no ciclo impossível de interrupções.

## O computador (src/lib/faixa/ia.ts)

Estados: aproximar, atacar, defender, esquivar, escapar, recuar, recuperar, buscar a escada, posicionar, subir, disputar a faixa, interromper, hesitar. Usa os mesmos comandos da pessoa, sem ler a entrada dela nem ter alcance a mais: lê só o que está visível na cena (o estado e o tempo de estado do outro, a escada, a faixa), nunca o que o adversário vai apertar. Reage à preparação visível do outro (defende ou esquiva parte das vezes; diante da preparação do agarrão, esquiva ou interrompe com um golpe), pune a recuperação do golpe forte, da voadora e do agarrão errado com o forte, vem de voadora de média distância uma parte das vezes, recua com pouco equilíbrio, e no topo só desce para disputar quando foi chacoalhado e está perto de cair. Contra a guarda do adversário chega mais perto e agarra (o mesmo comando do forte), ou espera a guarda baixar; agarrado, nota o agarrão e, parte das vezes, escapa com a esquiva um instante depois. Entende o objetivo: vai à escada quando o adversário cai ou está longe, sobe (segurando a seta na base) quando a escada está em pé e há vantagem, desce quando é ameaçado embaixo, emenda a sequência de golpes parte das vezes, e interrompe quem sobe com a derrubada na base. É determinístico pela semente.

Três níveis, escolhidos na tela de escolha e guardados nas preferências; mudam só o perfil, nunca as regras:

| Nível | Atraso de reação | Erros propositais | Cautela (defender, esquivar) | Ousadia (forte, agarrão, voadora) | Fuga do agarrão |
| --- | --- | --- | --- | --- | --- |
| Fácil | ×1,7 | 30% das decisões | ×0,6 | ×0,7 | 30% |
| Normal | ×1 (0,1 a 0,8 s, conforme a ação) | 14% | ×1 | ×1 | 55% |
| Difícil | ×0,65 | 5% | ×1,3 | ×1,25 | 80% |

Dois computadores um contra o outro terminam a partida com vitórias dos dois lados, e o difícil vence o fácil (tests/faixa.test.ts).

## Desenho (src/features/faixa/desenho)

Canvas 2D, laço de passo fixo (o `createLoop` da trilha), sem biblioteca nova: o projeto já tinha um kit de arte vetorial com as cabeças em cartum das duas pessoas (`src/features/game/draw`), reaproveitadas aqui em escala maior; o corpo é um boneco articulado de terno, com poses por estado (guarda, caminhada com a passada no ritmo da velocidade e a inclinação da virada, pulo, voadora de corpo inclinado e perna estendida, aterrissagem, soco, direto e chute, o gancho forte, o agarrão em quatro fases para quem segura, o agarrado erguido se debatendo, o arremessado girando no ar, a derrubada, a esquiva, defesa com o escudo translúcido na frente, atingido, caído, levantando, carregando, subindo, no topo, puxando, caindo, vitória, derrota) e expressões por cima do rosto (raiva, dor, esforço, alegria, tonto, susto, triste). A arena: palco de debate escuro com painel de LED, púlpitos, treliça com refletores, público estilizado com bandeiras e flashes, ringue com cordas verdes e amarelas, tapete com a zona marcada, avental. A escada tem quatro desenhos (em pé com oscilação e tombo, caída, carregada); a faixa, verde e amarela com roseta, balança, desce e treme quando puxada, e vai ao peito do vencedor. Efeitos: estrelas de impacto, poeira, brilhos, anéis, pausa de impacto de 45 ms e tremor de câmera curto. A câmera enquadra os dois sempre e aproxima 8% na subida. Com movimento reduzido: sem tremor, sem partículas, sem flashes, público parado.

A interface sobre a cena (placas com equilíbrio e situação, medidor da faixa, a dica sobre a cabeça do personagem, a legenda dos comandos, contagem, comentário do narrador) é desenhada no canvas; pausa, tutorial, fim, a apresentação das teclas desenhadas e os botões de toque são React.

## Som (src/features/faixa/audio.ts, torcida.ts)

Sintetizado com a Web Audio API: nenhum arquivo. Dois canais com volume próprio, em Pausa → Som, mais o silêncio geral (botão **Som** sobre a cena), guardados em `atlas-politico:faixa:preferencias`. Começa só depois de um gesto (o botão **Escolher candidato** ou **Lutar**), pausa com a partida e volta ao silêncio ao reiniciar ou sair.

- **Efeitos**: passos no tapete (um por pé, pelo ciclo real da caminhada, com o tom variando), socos, chute, golpe forte, agarrão e arremesso, voadora, guarda, erro, pulo e aterrissagem, esquiva, queda, escada (pega, passos de quem a carrega, posta, degraus de quem sobe a cada quinto da subida, chacoalhada, tombo), sino de abertura, aviso da prorrogação, vitória e derrota. Um mesmo efeito não toca duas vezes em menos de 50 ms, e um compressor no canal mestre (limiar −14 dB, razão 4:1, ataque 3 ms) segura os picos quando muita coisa toca junto, sem saturar.
- **Torcida** (D-159): camadas que seguem o estado real da partida, iguais para os dois lados. O ambiente da arena é contínuo (ruído rosa em duas fontes filtradas, uma de cada lado, com movimento lento, e vozes curtas esparsas). A expectativa cresce com a subida na escada (o rugido grave entra), com o topo, e principalmente com o progresso real da captura: palmas que ganham ritmo, "oohs" a cada quarto da barra e o rugido mais cheio; estar no topo sem puxar, ou com a escada balançando, não conta. As reações: um grito curto a cada golpe, um maior a cada queda (com assobios e palmas), o suspiro coletivo de surpresa quando a captura é interrompida ou a escada tomba (uma por lance), e a explosão de comemoração só na vitória (gritos em massa, aplausos que se espalham por cinco segundos, assobios). Tudo é gerado grão a grão, com sorteios contínuos: não há laço curto nem a mesma reação repetida igual. Os ganhos mudam por constante de tempo (sobem mais depressa do que descem), e o máximo da torcida fica em 55% do canal, abaixo dos impactos.

Não há narração por voz. O cartão escrito do narrador continua. Gravações de público com licença conferida podem ser listadas em `GRAVACOES` (`torcida.ts`) e colocadas em `public/audio/torcida/`; sem arquivo, nada é pedido à rede. Em 19 de outubro de 2026 não se achou um conjunto CC0 convincente (ambiente de arena, expectativa, suspiro e comemoração), por isso as camadas são sintetizadas.

## Código

| Arquivo | Papel |
| --- | --- |
| `src/app/jogo/vale-a-faixa/page.tsx` | Página estática, leve |
| `src/lib/faixa/tipos.ts`, `regras.ts`, `ia.ts`, `falas.ts` | Dados, regras, computador e comentários, puros |
| `src/features/faixa/ValeAFaixa.tsx` | Telas: entrada, escolha, partida, pausa, fim, tutorial |
| `src/features/faixa/motor.ts` | Laço, entrada, IA, desenho, som, eventos; carregado por `import()` |
| `src/features/faixa/entrada.ts`, `Controles.tsx` | Teclado e toque |
| `src/features/faixa/desenho/*` | Câmera, arena, lutadores, escada e faixa, efeitos, HUD |
| `src/features/faixa/audio.ts`, `torcida.ts`, `preferencias.ts` | Som em dois canais, a torcida em camadas e as preferências |
| `tests/faixa.test.ts` | Regras e IA, em simulação |
| `tests/e2e/vale-a-faixa.spec.ts` | A jornada no navegador, com cada personagem, teclado, toque, pausa, revanche, redimensionamento, o agarrão e os níveis. Com `?computador=parado` no endereço, o adversário não age; com `?computador=defendendo`, só defende: é como o teste dirige a partida pelo teclado |
| `tests/export/vale-a-faixa.spec.ts` | Sobre a saída estática: o hub, a entrada e as páginas informativas não pedem o motor; ele chega na escolha do personagem |

## O que veio de fora, e o que é desenho próprio

Em 19 de outubro de 2026 pediu-se uma investigação dos jogos WWE 2K Battlegrounds e WWE 2K25 com o REA (rea.tools) antes desta rodada. Ela não foi possível: o REA não estava instalado (instala-se com `npx rea-agents@latest setup`, que pede aprovação das mudanças na configuração do agente e um reinício dele) e nenhum dos dois jogos existe nesta máquina (Steam, Xbox e Loja conferidos). Nada aqui vem de engenharia reversa. O que se usou foi o que guias públicos descrevem do jogo observado, sem números: o agarrão como comando próprio que vence a guarda e os "breakers" que interrompem um agarrão (WWE 2K); a escada que se posiciona, sobe por comando próprio, e de cujo topo se derruba quem está em cima; o minijogo de tempo no topo para pegar o prêmio (WWE 2K25), que aqui é o comando segurado por 9 s. Todos os números, tempos, alcances, a prorrogação e os níveis são desenho próprio, medidos em simulação e em jornadas de navegador, não em nenhum jogo comercial.

## Limitações

- Nenhuma pessoa jogou: o equilíbrio do computador e dos três níveis foi medido só em simulação e em partidas dirigidas por roteiro.
- O toque foi visto em celular emulado; aparelho real, Firefox e Safari não foram conferidos.
- Sem partida entre duas pessoas.
- Os ícones dos botões de toque são SVG simples desenhados para o jogo; não foram vistos em aparelho real.
- O som é sintetizado e simples; não há música. Ninguém ouviu o resultado: as sondas conferem o grafo de áudio, não o som.
