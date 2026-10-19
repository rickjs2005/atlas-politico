// O motor do Vale a Faixa: junta as regras (src/lib/faixa), a entrada
// (entrada.ts), o computador (ia.ts), o desenho (desenho/) e o som
// (audio.ts) em um laço de passo fixo (o mesmo da trilha do jogo). Carregado
// só quando a partida começa, por `import()`. Trata pausa, perda de foco,
// redimensionamento e descarte ao sair da rota.

import { createLoop } from "@/features/game/engine/loop";
import { PRIORIDADE_DAS_FALAS, falaPara } from "@/lib/faixa/falas";
import { criarMemoria, decidir, type MemoriaDaIA } from "@/lib/faixa/ia";
import { REGRAS, alturaNaEscada, avancar, criarPartida, dicaDe, naEscada } from "@/lib/faixa/regras";
import { ENTRADA_VAZIA, type Dica, type Entrada, type Evento, type FaseDaPartida, type Indice, type Lutador, type LutadorSlug, type Partida } from "@/lib/faixa/tipos";

import type { Audio } from "./audio";
import { criarArena, lerFontes } from "./desenho/arena";
import { alvoDaCamera, projecao, seguir, type Camera, type Tela } from "./desenho/camera";
import { anguloDoTombo, desenharEscadaCaida, desenharEscadaCarregada, desenharEscadaEmPe, desenharFaixa, oscilacao } from "./desenho/escada";
import { criarEfeitos } from "./desenho/efeitos";
import { desenharHud, type Fala } from "./desenho/hud";
import { FIGURAS, desenharLutador, desenharSombra, poseDe } from "./desenho/lutador";
import { criarEntradas } from "./entrada";

export interface Resumo {
  fase: FaseDaPartida;
  dica: Dica;
  vencedor: Indice | null;
  /** O jogador está na escada: os botões de subir e descer entram. */
  naEscada: boolean;
  carregando: boolean;
  /** A pessoa usa teclado, e não toque. */
  teclado: boolean;
  tempo: number;
}

export interface OpcoesDoMotor {
  canvas: HTMLCanvasElement;
  jogador: LutadorSlug;
  computador: LutadorSlug;
  semente: number;
  reduzirMovimento: boolean;
  /** Em tela de toque, a dica mostra o botão em vez da tecla. */
  toque: boolean;
  audio: Audio | null;
  /** O computador não age: para os testes de navegador dirigirem a partida inteira. */
  computadorParado?: boolean;
  aoMudar(resumo: Resumo): void;
  /** A partida pede pausa: perda de foco, aba escondida, Esc. Quem decide é a interface. */
  aoPedirPausa(): void;
}

export interface Motor {
  setToque(parte: Partial<Entrada>): void;
  setPausado(pausado: boolean): void;
  reiniciar(semente: number): void;
  redimensionar(): void;
  lerPartida(): Partida;
  dispose(): void;
}

const DPR_MAXIMO = 2;
const PARADA_DE_IMPACTO = 0.045;

export function criarMotor(opcoes: OpcoesDoMotor): Motor {
  const { canvas } = opcoes;
  const contexto = canvas.getContext("2d");
  if (contexto === null) throw new Error("Sem canvas 2D.");
  const g = contexto;
  lerFontes();

  let partida = criarPartida(opcoes.jogador, opcoes.computador, opcoes.semente);
  let memoria: MemoriaDaIA = criarMemoria(opcoes.semente * 31 + 7);
  const movimento = !opcoes.reduzirMovimento;
  const arena = criarArena();
  const efeitos = criarEfeitos(movimento);
  const camera: Camera = { x: 0, y: 0, zoom: 1 };
  let tela: Tela = { largura: 1, altura: 1 };
  let dpr = 1;
  let tempo = 0;
  let paradaDeImpacto = 0;
  let fala: Fala | null = null;
  let ultimaFala = -10;
  let brilhoAcumulado = 0;
  let pausado = false;
  let primeiroQuadro = true;
  let ultimoResumo = "";
  let ultimosEstados = "";
  const passosAnteriores: [number, number] = [0, 0];
  const andando: [boolean, boolean] = [false, false];
  const ritmos: [number, number] = [0, 1.7];

  const entradas = criarEntradas(window, {
    ativo: () => !pausado && partida.fase !== "fim",
    aoPausar: () => opcoes.aoPedirPausa(),
  });

  const publicarResumo = () => {
    const l = partida.lutadores[0];
    const resumo: Resumo = {
      fase: partida.fase,
      dica: dicaDe(partida, 0),
      vencedor: partida.vencedor,
      naEscada: naEscada(l),
      carregando: l.estado === "carregando",
      teclado: !opcoes.toque || (entradas.usouTeclado() && !entradas.usouToque()),
      tempo: partida.tempo,
    };
    // Os estados de agora vão ao canvas, para os testes de navegador lerem sem mexer no React.
    const l0 = partida.lutadores[0];
    const estados = `${l0.estado}|${partida.lutadores[1].estado}|${partida.escada.estado}|${l0.puxada.toFixed(2)}|${Math.round(l0.x / 10) * 10}`;
    if (estados !== ultimosEstados) {
      ultimosEstados = estados;
      canvas.dataset.estados = estados;
    }
    const chave = `${resumo.fase}|${resumo.dica}|${resumo.vencedor}|${resumo.naEscada}|${resumo.carregando}|${resumo.teclado}`;
    if (chave === ultimoResumo) return;
    ultimoResumo = chave;
    opcoes.aoMudar(resumo);
  };

  const comentar = (eventos: readonly Evento[]) => {
    for (const tipo of PRIORIDADE_DAS_FALAS) {
      if (!eventos.some((evento) => evento.tipo === tipo)) continue;
      const urgente = tipo === "vitoria" || tipo === "interrompido" || tipo === "topo" || tipo === "inicio";
      if (!urgente && tempo - ultimaFala < 3.2) return;
      const texto = falaPara(tipo, Math.random());
      if (texto === null) return;
      fala = { texto, t: 0 };
      ultimaFala = tempo;
      return;
    }
  };

  const reagir = (eventos: readonly Evento[]) => {
    const audio = opcoes.audio;
    for (const evento of eventos) {
      switch (evento.tipo) {
        case "inicio":
          audio?.tocar("sino");
          break;
        case "golpe":
          if (evento.bloqueado) {
            efeitos.anel(evento.x, evento.y, "#faf8f2");
            audio?.tocar("bloqueio");
          } else {
            const alvo = partida.lutadores[evento.alvo];
            const forte = alvo.estado === "caido" || alvo.invulneravel > 0;
            efeitos.impacto(evento.x, evento.y, forte, partida.lutadores[evento.quem].direcao);
            efeitos.tremer(forte ? 7 : 3.5);
            paradaDeImpacto = forte ? PARADA_DE_IMPACTO * 1.6 : PARADA_DE_IMPACTO;
            audio?.tocar(forte ? "golpeForte" : "golpe");
          }
          break;
        case "empurrao":
          efeitos.impacto(evento.x, evento.y, true, partida.lutadores[evento.quem].direcao);
          efeitos.tremer(5);
          paradaDeImpacto = PARADA_DE_IMPACTO;
          audio?.tocar("empurrao");
          break;
        case "queda":
          efeitos.poeira(evento.x, 0, 12);
          efeitos.tremer(8);
          audio?.tocar("queda");
          break;
        case "cordas":
          efeitos.tremer(4);
          audio?.tocar("cordas");
          break;
        case "escadaPega":
        case "escadaSolta":
          audio?.tocar("escada");
          if (evento.tipo === "escadaSolta") efeitos.poeira(evento.x, 0, 5);
          break;
        case "escadaPosta":
          audio?.tocar("escada");
          efeitos.anel(evento.x, 10);
          efeitos.poeira(evento.x, 0, 4);
          break;
        case "escadaChacoalhada":
          audio?.tocar("escada");
          efeitos.tremer(3);
          efeitos.anel(evento.x, 30, "#cfd3d8");
          break;
        case "escadaCaiu":
          efeitos.poeira(evento.x, 0, 14);
          efeitos.tremer(9);
          audio?.tocar("escadaCai");
          break;
        case "subida":
          audio?.tocar("subida");
          break;
        case "topo":
          audio?.tocar("aviso");
          break;
        case "puxando":
          audio?.tocar("puxar");
          break;
        case "interrompido":
          efeitos.tremer(5);
          break;
        case "vitoria": {
          audio?.tocar(evento.quem === 0 ? "vitoria" : "derrota");
          for (let i = 0; i < 24; i += 1) efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 40);
          break;
        }
        default:
          break;
      }
    }
    comentar(eventos);
  };

  const atualizar = (dt: number) => {
    if (paradaDeImpacto > 0) {
      paradaDeImpacto -= dt;
      return;
    }
    tempo += dt;
    const entradaDoJogador = entradas.ler();
    const entradaDoComputador = opcoes.computadorParado === true ? ENTRADA_VAZIA : decidir(partida, 1, memoria, dt);
    avancar(partida, dt, [entradaDoJogador, entradaDoComputador]);
    if (partida.eventos.length > 0) reagir(partida.eventos);
    for (const i of [0, 1] as const) {
      const l = partida.lutadores[i];
      andando[i] = l.passo !== passosAnteriores[i];
      passosAnteriores[i] = l.passo;
    }
    // Brilhos na faixa enquanto alguém puxa.
    const puxador = partida.lutadores.find((l) => l.estado === "noTopo" && l.puxando);
    if (puxador !== undefined) {
      brilhoAcumulado += dt * 14;
      while (brilhoAcumulado >= 1) {
        brilhoAcumulado -= 1;
        efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 30);
      }
    }
    efeitos.atualizar(dt);
    if (fala !== null) {
      fala.t += dt;
      if (fala.t > 2.6) fala = null;
    }
    opcoes.audio?.torcida(partida.torcida);
    seguir(camera, alvoDaCamera(partida, tela), dt, primeiroQuadro);
    primeiroQuadro = false;
    publicarResumo();
  };

  const desenharLutadorNaCena = (l: Lutador, i: Indice, pr: ReturnType<typeof projecao>) => {
    const figura = FIGURAS[l.slug];
    const outro = partida.lutadores[i === 0 ? 1 : 0];
    const pose = poseDe(l, tempo, ritmos[i], movimento, andando[i], outro.estado === "noTopo" && outro.puxando);
    let x = l.x;
    let y = l.y;
    // Na escada, o corpo acompanha a oscilação dela.
    if (naEscada(l)) {
      const angulo = oscilacao(partida.escada.balanco, tempo, movimento);
      x += Math.sin(angulo) * alturaNaEscada(l.altura);
      y = Math.cos(angulo) * alturaNaEscada(l.altura);
    }
    const sx = pr.X(x);
    const sy = pr.Y(y);
    desenharLutador(g, figura, pose, sx, sy, pr.s, l.direcao, tempo, l.estado === "vitoria");
  };

  const desenhar = () => {
    const tremor = efeitos.deslocamento();
    const pr = projecao(camera, tela, tremor.x, tremor.y);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, tela.largura, tela.altura);
    // Com o laço parado por pausa, o fundo continua sendo desenhado com o tempo congelado.
    arena.fundo(g, pr, partida, tempo, movimento && !pausado, pausado ? 0 : 1 / 60);

    // Sombras.
    for (const l of partida.lutadores) desenharSombra(g, pr.X(l.x), pr.Y(0), pr.s, l.y, l.estado === "caido");
    const esc = partida.escada;
    if (esc.estado === "caida") desenharEscadaCaida(g, pr, esc.x, esc.direcaoDaQueda);

    // A escada em pé fica atrás de quem sobe nela.
    if (esc.estado === "emPe") desenharEscadaEmPe(g, pr, esc.x, oscilacao(esc.balanco, tempo, movimento));
    if (esc.estado === "caindo") desenharEscadaEmPe(g, pr, esc.x, anguloDoTombo(esc.queda, esc.direcaoDaQueda));

    const puxador = partida.lutadores.find((l) => l.estado === "noTopo");
    desenharFaixa(g, pr, partida, tempo, movimento, puxador?.puxando ? puxador.puxada : 0, partida.fase !== "fim");

    // Quem está no chão ou atingido vai primeiro; o jogador fica por cima em empate.
    const ordem: Indice[] = [1, 0];
    ordem.sort((a, b) => peso(partida.lutadores[a]) - peso(partida.lutadores[b]));
    for (const i of ordem) {
      const l = partida.lutadores[i];
      desenharLutadorNaCena(l, i, pr);
      if (esc.estado === "carregada" && esc.portador === i) {
        const bob = andando[i] && movimento ? Math.abs(Math.sin(l.passo * Math.PI * 2)) * 3 : 0;
        desenharEscadaCarregada(g, pr, l.x, l.direcao, bob);
      }
    }

    efeitos.desenhar(g, pr);
    arena.frente(g, pr);
    desenharHud(g, tela, partida, {
      nomes: [FIGURAS[partida.lutadores[0].slug].nome, FIGURAS[partida.lutadores[1].slug].nome],
      dica: dicaDe(partida, 0),
      teclado: !opcoes.toque || (entradas.usouTeclado() && !entradas.usouToque()),
      tempo,
      fala,
      movimento,
      compacto: tela.largura < 640,
    });
  };

  const peso = (l: Lutador): number => {
    if (l.estado === "caido" || l.estado === "levantando") return 0;
    if (l.estado === "atingido") return 1;
    if (naEscada(l)) return 3;
    return 2;
  };

  const loop = createLoop({ update: atualizar, render: desenhar });

  const redimensionar = () => {
    const pai = canvas.parentElement;
    const largura = Math.max(1, Math.round(pai?.clientWidth ?? canvas.clientWidth));
    const altura = Math.max(1, Math.round(pai?.clientHeight ?? canvas.clientHeight));
    dpr = Math.min(DPR_MAXIMO, window.devicePixelRatio || 1);
    // Com controles de toque, a cena se enquadra acima deles.
    const margemInferior = opcoes.toque ? Math.min(205, Math.round(altura * 0.24)) : 0;
    tela = { largura, altura, margemInferior };
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    seguir(camera, alvoDaCamera(partida, tela), 0, true);
    desenhar();
  };

  const observador = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => redimensionar());
  if (observador !== null && canvas.parentElement !== null) observador.observe(canvas.parentElement);
  window.addEventListener("resize", redimensionar);

  const aoEsconder = () => {
    if (document.visibilityState === "hidden") opcoes.aoPedirPausa();
  };
  const aoPerderFoco = () => opcoes.aoPedirPausa();
  document.addEventListener("visibilitychange", aoEsconder);
  window.addEventListener("blur", aoPerderFoco);

  redimensionar();
  loop.start();
  publicarResumo();

  return {
    setToque(parte) {
      entradas.setToque(parte);
    },
    setPausado(valor) {
      if (pausado === valor) return;
      pausado = valor;
      loop.setPaused(valor);
      entradas.limpar();
      if (valor) opcoes.audio?.suspender();
      else opcoes.audio?.retomar();
    },
    reiniciar(semente) {
      partida = criarPartida(opcoes.jogador, opcoes.computador, semente);
      memoria = criarMemoria(semente * 31 + 7);
      efeitos.limpar();
      fala = null;
      ultimaFala = -10;
      paradaDeImpacto = 0;
      primeiroQuadro = true;
      ultimoResumo = "";
      entradas.limpar();
      seguir(camera, alvoDaCamera(partida, tela), 0, true);
      publicarResumo();
    },
    redimensionar,
    lerPartida: () => partida,
    dispose() {
      loop.stop();
      entradas.dispose();
      observador?.disconnect();
      window.removeEventListener("resize", redimensionar);
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("blur", aoPerderFoco);
      opcoes.audio?.suspender();
    },
  };
}
