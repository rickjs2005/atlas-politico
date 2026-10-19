// O motor do Vale a Faixa: junta as regras (src/lib/faixa), a entrada
// (entrada.ts), o computador (ia.ts), o desenho (desenho/), o som (audio.ts)
// e a narração por voz (narracao.ts) em um laço de passo fixo (o mesmo da
// trilha do jogo). Carregado só quando a partida começa, por `import()`.
// Trata pausa, perda de foco, redimensionamento e descarte ao sair da rota.

import { createLoop } from "@/features/game/engine/loop";
import { NARRACAO, PRIORIDADE_DAS_FALAS, falaPara } from "@/lib/faixa/falas";
import { criarMemoria, decidir, type MemoriaDaIA } from "@/lib/faixa/ia";
import { REGRAS, alturaNaEscada, avancar, criarPartida, dicaDe, naEscada, noAr } from "@/lib/faixa/regras";
import { ENTRADA_VAZIA, type Dica, type Entrada, type Evento, type FaseDaPartida, type Indice, type Lutador, type LutadorSlug, type Partida } from "@/lib/faixa/tipos";

import type { Audio, Som } from "./audio";
import { criarArena, lerFontes } from "./desenho/arena";
import { alvoDaCamera, projecao, seguir, type Camera, type Tela } from "./desenho/camera";
import { anguloDoTombo, desenharEscadaCaida, desenharEscadaCarregada, desenharEscadaEmPe, desenharFaixa, oscilacao } from "./desenho/escada";
import { criarEfeitos } from "./desenho/efeitos";
import { ROTULO_DO_BLOQUEIO, desenharHud, type Fala } from "./desenho/hud";
import { FIGURAS, desenharLutador, desenharSombra, poseDe } from "./desenho/lutador";
import { criarEntradas } from "./entrada";
import type { Narracao } from "./narracao";

export interface Resumo {
  fase: FaseDaPartida;
  dica: Dica;
  vencedor: Indice | null;
  /** O jogador está na escada: os botões de subir e descer entram. */
  naEscada: boolean;
  carregando: boolean;
  /** O jogador está no ar: pular apaga e atacar vira voadora. */
  noAr: boolean;
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
  narracao: Narracao | null;
  /** O computador não age: para os testes de navegador dirigirem a partida inteira. */
  computadorParado?: boolean;
  aoMudar(resumo: Resumo): void;
  /** A partida pede pausa: perda de foco, aba escondida. Quem decide é a interface. */
  aoPedirPausa(): void;
  /** Esc: pausar ou continuar. */
  aoAlternarPausa(): void;
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
  let aviso: Fala | null = null;
  let ultimaFala = -10;
  let brilhoAcumulado = 0;
  let passosDaEscada = 0;
  let pausado = false;
  let primeiroQuadro = true;
  let ultimoResumo = "";
  let ultimosEstados = "";
  const passosAnteriores: [number, number] = [0, 0];
  const andando: [boolean, boolean] = [false, false];
  const ritmos: [number, number] = [0, 1.7];

  const entradas = criarEntradas(window, {
    ativo: () => !pausado && partida.fase !== "fim",
    aoPausar: () => opcoes.aoAlternarPausa(),
  });

  const usaTeclado = () => !opcoes.toque || (entradas.usouTeclado() && !entradas.usouToque());

  const publicarResumo = () => {
    const l = partida.lutadores[0];
    const resumo: Resumo = {
      fase: partida.fase,
      dica: dicaDe(partida, 0),
      vencedor: partida.vencedor,
      naEscada: naEscada(l),
      carregando: l.estado === "carregando",
      noAr: noAr(l),
      teclado: usaTeclado(),
      tempo: partida.tempo,
    };
    // Os estados de agora vão ao canvas, para os testes de navegador lerem sem mexer no React.
    const estados = `${l.estado}|${partida.lutadores[1].estado}|${partida.escada.estado}|${l.puxada.toFixed(2)}|${Math.round(l.x / 10) * 10}|${Math.round(partida.escada.x / 10) * 10}|${Math.round(l.y / 10) * 10}`;
    if (estados !== ultimosEstados) {
      ultimosEstados = estados;
      canvas.dataset.estados = estados;
    }
    const chave = `${resumo.fase}|${resumo.dica}|${resumo.vencedor}|${resumo.naEscada}|${resumo.carregando}|${resumo.noAr}|${resumo.teclado}`;
    if (chave === ultimoResumo) return;
    ultimoResumo = chave;
    opcoes.aoMudar(resumo);
  };

  const comentar = (eventos: readonly Evento[]) => {
    for (const tipo of PRIORIDADE_DAS_FALAS) {
      if (!eventos.some((evento) => evento.tipo === tipo)) continue;
      const urgente = tipo === "vitoria" || tipo === "interrompido" || tipo === "topo" || tipo === "inicio" || tipo === "faltaPouco";
      if (!urgente && tempo - ultimaFala < 3.2) return;
      const texto = falaPara(tipo, Math.random());
      if (texto === null) return;
      fala = { texto, t: 0 };
      ultimaFala = tempo;
      return;
    }
  };

  const narrar = (tipo: Evento["tipo"]) => {
    const entrada = NARRACAO[tipo];
    if (entrada === undefined || opcoes.narracao === null) return;
    const frase = entrada.frases[Math.floor(Math.random() * entrada.frases.length)];
    if (frase !== undefined) opcoes.narracao.falar(frase, entrada.prioridade);
  };

  const tocar = (som: Som) => opcoes.audio?.tocar(som);

  const reagir = (eventos: readonly Evento[]) => {
    for (const evento of eventos) {
      switch (evento.tipo) {
        case "inicio":
          tocar("sino");
          break;
        case "golpe": {
          const direcao = partida.lutadores[evento.quem].direcao;
          if (evento.bloqueado) {
            efeitos.anel(evento.x, evento.y, "#faf8f2");
            tocar("bloqueio");
            break;
          }
          const pesado = evento.golpe === "chute" || evento.golpe === "forte" || evento.golpe === "voadora";
          efeitos.impacto(evento.x, evento.y, pesado, direcao);
          efeitos.tremer(pesado ? 7 : 3.5);
          paradaDeImpacto = pesado ? PARADA_DE_IMPACTO * 1.7 : PARADA_DE_IMPACTO;
          tocar(evento.golpe === "voadora" ? "voadora" : evento.golpe === "forte" ? "forte" : evento.golpe === "chute" ? "chute" : "soco");
          break;
        }
        case "golpeNoVazio":
          tocar("erro");
          break;
        case "pulo":
          tocar("pulo");
          break;
        case "voadora":
          tocar("esquiva");
          break;
        case "aterrissagem":
          tocar(evento.pesada ? "aterrissagemPesada" : "aterrissagem");
          if (evento.pesada) {
            efeitos.poeira(evento.x, 0, 8);
            efeitos.tremer(3);
          }
          break;
        case "esquiva":
          tocar("esquiva");
          efeitos.poeira(partida.lutadores[evento.quem].x, 0, 3);
          break;
        case "acaoBloqueada":
          if (evento.quem === 0 && (aviso === null || aviso.t > 0.5)) aviso = { texto: ROTULO_DO_BLOQUEIO[evento.motivo], t: 0 };
          break;
        case "derrubada":
          efeitos.impacto(evento.x, 60, evento.tombou, partida.lutadores[evento.quem].direcao);
          efeitos.tremer(evento.tombou ? 6 : 3);
          efeitos.anel(evento.x, 30, "#cfd3d8");
          paradaDeImpacto = PARADA_DE_IMPACTO;
          tocar("escada");
          break;
        case "queda":
          efeitos.poeira(evento.x, 0, evento.longa ? 16 : 12);
          efeitos.tremer(evento.longa ? 9 : 7);
          tocar("queda");
          break;
        case "cordas":
          efeitos.tremer(4);
          tocar("cordas");
          break;
        case "escadaPega":
          tocar("escada");
          break;
        case "escadaSolta":
          tocar("escada");
          efeitos.poeira(evento.x, 0, 5);
          break;
        case "escadaPosta":
          tocar("escadaPosta");
          efeitos.anel(evento.x, 10);
          efeitos.poeira(evento.x, 0, 4);
          break;
        case "escadaCaiu":
          efeitos.poeira(evento.x, 0, 14);
          efeitos.tremer(9);
          tocar("escadaCai");
          break;
        case "subida":
          tocar("subida");
          break;
        case "desceu":
          tocar("aterrissagem");
          break;
        case "topo":
          tocar("aviso");
          break;
        case "puxando":
          tocar("puxar");
          break;
        case "faltaPouco":
          tocar("aviso");
          for (let i = 0; i < 10; i += 1) efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 30);
          break;
        case "interrompido":
          efeitos.tremer(5);
          break;
        case "vitoria": {
          tocar(evento.quem === 0 ? "vitoria" : "derrota");
          for (let i = 0; i < 24; i += 1) efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 40);
          break;
        }
        default:
          break;
      }
      narrar(evento.tipo);
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
    // A escada carregada chacoalha a cada passo; brilhos na faixa enquanto alguém puxa.
    const esc = partida.escada;
    if (esc.estado === "carregada" && esc.portador !== null && andando[esc.portador]) {
      passosDaEscada += dt;
      if (passosDaEscada > 0.42) {
        passosDaEscada = 0;
        tocar("escadaPassos");
      }
    }
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
    if (aviso !== null) {
      aviso.t += dt;
      if (aviso.t > 1) aviso = null;
    }
    const tensao = puxador === undefined ? 0 : 0.4 + puxador.puxada * 0.6;
    opcoes.audio?.torcida(partida.torcida, partida.fase === "luta" ? tensao : 0);
    seguir(camera, alvoDaCamera(partida, tela), dt, primeiroQuadro);
    primeiroQuadro = false;
    publicarResumo();
  };

  /** Onde ficou a cabeça de cada lutador no último quadro, para a dica perto do jogador. */
  const cabecas: [{ x: number; y: number } | null, { x: number; y: number } | null] = [null, null];

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
    // A guarda: um escudo translúcido na frente de quem defende, para a defesa ser visível de longe.
    if (l.estado === "defesa") {
      const u = Math.min(1, l.t / 0.12);
      g.save();
      g.globalAlpha = 0.55 * u;
      g.beginPath();
      g.arc(sx + l.direcao * 14 * pr.s, sy - 95 * pr.s, 62 * pr.s * (0.85 + 0.15 * u), l.direcao === 1 ? -1.15 : Math.PI - 1.15, l.direcao === 1 ? 1.15 : Math.PI + 1.15);
      g.lineWidth = Math.max(2, 7 * pr.s);
      g.lineCap = "round";
      g.strokeStyle = "#f0c66b";
      g.stroke();
      g.globalAlpha = 0.18 * u;
      g.lineTo(sx + l.direcao * 14 * pr.s, sy - 95 * pr.s);
      g.closePath();
      g.fillStyle = "#f0c66b";
      g.fill();
      g.restore();
    }
    const desenho = desenharLutador(g, figura, pose, sx, sy, pr.s, l.direcao, tempo, l.estado === "vitoria");
    cabecas[i] = desenho.cabeca;
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
    if (esc.estado === "caida") desenharEscadaCaida(g, pr, esc.x, esc.direcaoDaQueda, esc.desdeQueCaiu, movimento);

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
        const inclinacao = ((l.vel * l.direcao) / REGRAS.velocidadeCarregando) * -0.06;
        desenharEscadaCarregada(g, pr, l.x, l.direcao, bob, inclinacao);
      }
    }

    efeitos.desenhar(g, pr);
    arena.frente(g, pr);
    desenharHud(g, tela, partida, {
      nomes: [FIGURAS[partida.lutadores[0].slug].nome, FIGURAS[partida.lutadores[1].slug].nome],
      dica: dicaDe(partida, 0),
      teclado: usaTeclado(),
      tempo,
      fala,
      aviso,
      movimento,
      compacto: tela.largura < 640,
      cabecaDoJogador: cabecas[0],
    });
  };

  const peso = (l: Lutador): number => {
    if (l.estado === "caido" || l.estado === "levantando") return 0;
    if (l.estado === "atingido") return 1;
    if (naEscada(l) || noAr(l)) return 3;
    return 2;
  };

  const loop = createLoop({ update: atualizar, render: desenhar });

  const redimensionar = () => {
    const pai = canvas.parentElement;
    const largura = Math.max(1, Math.round(pai?.clientWidth ?? canvas.clientWidth));
    const altura = Math.max(1, Math.round(pai?.clientHeight ?? canvas.clientHeight));
    dpr = Math.min(DPR_MAXIMO, window.devicePixelRatio || 1);
    // Com controles de toque, a cena se enquadra acima deles.
    const margemInferior = opcoes.toque ? Math.min(215, Math.round(altura * 0.25)) : 0;
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
      if (valor) {
        opcoes.audio?.suspender();
        opcoes.narracao?.cancelar();
      } else {
        opcoes.audio?.retomar();
      }
    },
    reiniciar(semente) {
      partida = criarPartida(opcoes.jogador, opcoes.computador, semente);
      memoria = criarMemoria(semente * 31 + 7);
      efeitos.limpar();
      fala = null;
      aviso = null;
      ultimaFala = -10;
      paradaDeImpacto = 0;
      primeiroQuadro = true;
      ultimoResumo = "";
      entradas.limpar();
      opcoes.narracao?.cancelar();
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
      opcoes.narracao?.cancelar();
    },
  };
}
