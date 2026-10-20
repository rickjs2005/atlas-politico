// O motor do Vale a Faixa: junta as regras (src/lib/faixa), a entrada
// (entrada.ts), o computador (ia.ts), o desenho (desenho/) e o som
// (audio.ts, com a torcida de torcida.ts) em um laço de passo fixo (o mesmo
// da trilha do jogo). Carregado só quando a partida começa, por `import()`.
// Trata pausa, perda de foco, redimensionamento e descarte ao sair da rota.
//
// Dois modos: sozinho, o lado 1 é o computador (ia.ts); a dois, os dois
// lados são pessoas no mesmo teclado, cada uma com o seu esquema, lidas ao
// mesmo tempo, e o computador não existe. As mesmas regras para os dois
// lados nos dois modos; o nível muda só o perfil do computador.
//
// A torcida recebe, a cada passo, a intensidade da partida e o progresso
// real da captura da faixa, e reage aos eventos: um grito aos golpes fortes,
// um maior a cada queda, o "ooh" curto quando a escada chacoalha, o suspiro
// de surpresa quando a captura é interrompida, e a explosão de comemoração
// só na vitória. Os passos no tapete e os degraus da escada soam pelo
// movimento real de cada um.

import { createLoop } from "@/features/game/engine/loop";
import { PRIORIDADE_DAS_FALAS, falaPara } from "@/lib/faixa/falas";
import { criarMemoria, decidir, type Dificuldade, type MemoriaDaIA } from "@/lib/faixa/ia";
import { REGRAS, alturaNaEscada, avancar, criarPartida, dicaDe, naEscada, noAr, subirOuPular } from "@/lib/faixa/regras";
import { ENTRADA_VAZIA, type Dica, type Entrada, type Evento, type FaseDaPartida, type Indice, type Lutador, type LutadorSlug, type Partida } from "@/lib/faixa/tipos";

import type { Audio, Som } from "./audio";
import type { Camada, Reacao } from "./torcida";
import { criarArena, lerFontes } from "./desenho/arena";
import { alvoDaCamera, projecao, seguir, type Camera, type Tela } from "./desenho/camera";
import { anguloDoTombo, desenharEscadaCaida, desenharEscadaCarregada, desenharEscadaEmPe, desenharFaixa, oscilacao } from "./desenho/escada";
import { criarEfeitos } from "./desenho/efeitos";
import { ROTULO_DO_BLOQUEIO, desenharHud, type Fala } from "./desenho/hud";
import { FIGURAS, desenharLutador, desenharSombra, poseDe } from "./desenho/lutador";
import { criarEntradas } from "./entrada";
import { esquemasDe, type Esquema, type Modo } from "./esquemas";

export interface Resumo {
  fase: FaseDaPartida;
  /** A dica do jogador 1, para os botões de toque e o leitor de tela. */
  dica: Dica;
  vencedor: Indice | null;
  /** O jogador 1 está na escada: os botões de subir e descer entram. */
  naEscada: boolean;
  carregando: boolean;
  /** O jogador 1 está no ar: pular apaga e atacar vira voadora. */
  noAr: boolean;
  /** A pessoa usa teclado, e não toque. */
  teclado: boolean;
  tempo: number;
}

export interface OpcoesDoMotor {
  canvas: HTMLCanvasElement;
  /** Sozinho contra o computador, ou duas pessoas no mesmo teclado. */
  modo: Modo;
  /** Os personagens de cada lado: o jogador 1 à esquerda; à direita, o computador ou o jogador 2. */
  lados: readonly [LutadorSlug, LutadorSlug];
  semente: number;
  /** O nível do computador: só o perfil muda (reação, erros, cautela, ousadia), nunca as regras. */
  dificuldade: Dificuldade;
  reduzirMovimento: boolean;
  /** Em tela de toque, a dica mostra o botão em vez da tecla, e a cena se enquadra acima dos botões. */
  toque: boolean;
  audio: Audio | null;
  /** Só para os testes de navegador: o computador não age (`parado`) ou só defende (`defendendo`), e a pessoa dirige a partida. */
  computadorDeTeste?: "parado" | "defendendo";
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
  const { canvas, modo } = opcoes;
  const contexto = canvas.getContext("2d");
  if (contexto === null) throw new Error("Sem canvas 2D.");
  const g = contexto;
  lerFontes();

  let partida = criarPartida(opcoes.lados[0], opcoes.lados[1], opcoes.semente);
  // O computador só existe sozinho; a dois, a memória fica sem uso.
  let memoria: MemoriaDaIA = criarMemoria(opcoes.semente * 31 + 7, opcoes.dificuldade);
  const movimento = !opcoes.reduzirMovimento;
  const arena = criarArena();
  const efeitos = criarEfeitos(movimento);
  const camera: Camera = { x: 0, y: 0, zoom: 1 };
  let tela: Tela = { largura: 1, altura: 1 };
  let dpr = 1;
  let tempo = 0;
  /** O instante em que a partida acabou, para a torcida se acalmar depois da comemoração. */
  let fimEm: number | null = null;
  let paradaDeImpacto = 0;
  let fala: Fala | null = null;
  const avisos: [Fala | null, Fala | null] = [null, null];
  let ultimaFala = -10;
  let brilhoAcumulado = 0;
  let passosDaEscada = 0;
  let numeroDaContagem = 0;
  let pausado = false;
  let primeiroQuadro = true;
  let ultimoResumo = "";
  let ultimosEstados = "";
  let ultimaTorcida = "";
  let ultimasGravacoes: readonly Camada[] | null = null;
  const passosAnteriores: [number, number] = [0, 0];
  const andando: [boolean, boolean] = [false, false];
  // A última pisada e o último degrau de cada um, para os passos no tapete e os degraus da escada soarem.
  const pisadas: [number, number] = [0, 0];
  const degraus: [number, number] = [0, 0];
  const ritmos: [number, number] = [0, 1.7];
  const ENTRADA_DEFENDENDO: Entrada = { ...ENTRADA_VAZIA, defesa: true };
  const humanos: readonly [boolean, boolean] = [true, modo === "local"];
  const papeis: readonly [string, string] = modo === "local" ? ["JOGADOR 1", "JOGADOR 2"] : ["VOCÊ", "COMPUTADOR"];
  const esquemas = esquemasDe(modo);

  const entradas = criarEntradas(window, {
    esquemas,
    ativo: () => !pausado && partida.fase !== "fim",
    aoPausar: () => opcoes.aoAlternarPausa(),
  });

  const usaTeclado = () => !opcoes.toque || (entradas.usouTeclado() && !entradas.usouToque());
  /** O esquema de cada lado para o HUD: `null` no toque e para o computador. */
  const esquemaDe = (i: Indice): Esquema | null => (i === 0 ? (usaTeclado() ? esquemas[0] : null) : esquemas[1]);

  const publicarResumo = () => {
    const l = partida.lutadores[0];
    const outro = partida.lutadores[1];
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
    // Os estados de agora vão ao canvas, para os testes de navegador lerem sem mexer no React:
    // os dois estados, a escada, a puxada do lado 1, x do lado 1, x da escada, y do lado 1, x e y do lado 2.
    const estados = `${l.estado}|${outro.estado}|${partida.escada.estado}|${l.puxada.toFixed(2)}|${Math.round(l.x / 10) * 10}|${Math.round(partida.escada.x / 10) * 10}|${Math.round(l.y / 10) * 10}|${Math.round(outro.x / 10) * 10}|${Math.round(outro.y / 10) * 10}`;
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

  const tocar = (som: Som) => opcoes.audio?.tocar(som);
  // As recargas e o teto de reações ficam na torcida: aqui só se pede.
  const torcer = (reacao: Reacao, forca?: number) => opcoes.audio?.reagirTorcida(reacao, forca);

  /**
   * A intensidade da torcida pelo estado real: a luta normal, a subida que
   * agita aos poucos, o topo, e a captura, cujo crescendo acompanha o
   * progresso de verdade até o clímax do trecho final. Estar no topo sem
   * puxar não dispara o máximo; a explosão só vem com a vitória. Depois dela,
   * a arena fica no máximo por três segundos e se acalma nos dez seguintes.
   */
  const intensidadeDaTorcida = (): { intensidade: number; captura: number } => {
    if (partida.fase === "contagem") return { intensidade: 0.25, captura: 0 };
    if (partida.fase === "fim") {
      const desdeOFim = fimEm === null ? 0 : tempo - fimEm;
      return { intensidade: desdeOFim < 3 ? 1 : Math.max(0.3, 1 - (desdeOFim - 3) / 10), captura: 0 };
    }
    let intensidade = 0.3 + Math.max(0, partida.torcida - 0.3) * 0.4;
    let captura = 0;
    for (const l of partida.lutadores) {
      if (l.estado === "subindo") intensidade = Math.max(intensidade, 0.42 + l.altura * 0.18);
      if (l.estado === "noTopo") {
        const estavel = partida.escada.balanco <= REGRAS.escada.balancoMaximo;
        intensidade = Math.max(intensidade, l.puxando && estavel ? 0.62 + l.puxada * 0.33 : 0.58);
        if (l.puxando && estavel) captura = Math.max(captura, l.puxada);
      }
      if (l.estado === "caido") intensidade = Math.max(intensidade, 0.45);
    }
    return { intensidade: Math.min(0.95, intensidade), captura };
  };

  const avisar = (quem: Indice, texto: string) => {
    if (!humanos[quem]) return;
    const atual = avisos[quem];
    if (atual === null || atual.t > 0.5) avisos[quem] = { texto, t: 0 };
  };

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
          // A torcida grita com os golpes fortes; os leves ficam no murmúrio.
          if (pesado) torcer("golpe");
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
        case "agarrou":
          efeitos.anel(evento.x, 100, "#f8e4cf");
          tocar("agarrao");
          torcer("golpe", 0.8);
          break;
        case "arremesso":
          efeitos.impacto(evento.x, 110, true, partida.lutadores[evento.quem].direcao);
          efeitos.tremer(4);
          paradaDeImpacto = PARADA_DE_IMPACTO;
          tocar("arremesso");
          break;
        case "escapou":
          efeitos.anel(partida.lutadores[evento.quem].x, 90, "#faf8f2");
          break;
        case "prorrogacao":
          tocar("aviso");
          torcer("expectativa");
          break;
        case "acaoBloqueada":
          avisar(evento.quem, ROTULO_DO_BLOQUEIO[evento.motivo]);
          break;
        case "derrubada":
          efeitos.impacto(evento.x, 60, evento.tombou, partida.lutadores[evento.quem].direcao);
          efeitos.tremer(evento.tombou ? 6 : 3);
          efeitos.anel(evento.x, 30, "#cfd3d8");
          paradaDeImpacto = PARADA_DE_IMPACTO;
          tocar("escada");
          // A escada chacoalhada com alguém em cima: o "ooh" curto; o tombo traz a surpresa pelo evento da queda.
          if (!evento.tombou) torcer("balanco");
          break;
        case "queda":
          efeitos.poeira(evento.x, 0, evento.longa ? 16 : 12);
          efeitos.tremer(evento.longa ? 9 : 7);
          tocar("queda");
          torcer("queda", evento.longa ? 1.2 : 1);
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
          torcer("escada");
          break;
        case "escadaCaiu":
          efeitos.poeira(evento.x, 0, 14);
          efeitos.tremer(9);
          tocar("escadaCai");
          torcer("surpresa");
          break;
        case "subida":
          tocar("subida");
          break;
        case "desceu":
          tocar("aterrissagem");
          break;
        case "topo":
          tocar("aviso");
          torcer("expectativa");
          break;
        case "puxando":
          tocar("puxar");
          break;
        case "faltaPouco":
          tocar("aviso");
          for (let i = 0; i < 10; i += 1) efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 30);
          torcer("expectativa", 1.3);
          break;
        case "interrompido":
          efeitos.tremer(5);
          // Quanto mais perto do fim a captura estava, maior a surpresa.
          torcer("surpresa", 0.7 + evento.puxada * 0.8);
          break;
        case "caiuDaEscada":
          torcer("surpresa");
          break;
        case "vitoria": {
          tocar(humanos[evento.quem] ? "vitoria" : "derrota");
          for (let i = 0; i < 24; i += 1) efeitos.brilho(partida.escada.x, REGRAS.faixa.altura - 40);
          torcer("comemoracao");
          break;
        }
        default:
          break;
      }
    }
    comentar(eventos);
  };

  /** A entrada de cada lado: as pessoas pelo teclado (a dois, a tecla de subir também pula); o computador pela IA. */
  const entradaDe = (i: Indice, dt: number): Entrada => {
    if (i === 0) return modo === "local" ? subirOuPular(partida, 0, entradas.ler(0)) : entradas.ler(0);
    if (modo === "local") return subirOuPular(partida, 1, entradas.ler(1));
    if (opcoes.computadorDeTeste === "parado") return ENTRADA_VAZIA;
    if (opcoes.computadorDeTeste === "defendendo") return ENTRADA_DEFENDENDO;
    return decidir(partida, 1, memoria, dt);
  };

  const atualizar = (dt: number) => {
    if (paradaDeImpacto > 0) {
      paradaDeImpacto -= dt;
      return;
    }
    tempo += dt;
    avancar(partida, dt, [entradaDe(0, dt), entradaDe(1, dt)]);
    if (partida.fase === "fim") fimEm ??= tempo;
    else fimEm = null;
    if (partida.eventos.length > 0) reagir(partida.eventos);
    // Um toque a cada número da contagem: 3, 2, 1.
    if (partida.fase === "contagem") {
      const numero = Math.min(3, Math.floor((REGRAS.contagem - partida.contagem) / (REGRAS.contagem / 3)) + 1);
      if (numero !== numeroDaContagem) {
        numeroDaContagem = numero;
        tocar("contagem");
      }
    }
    for (const i of [0, 1] as const) {
      const l = partida.lutadores[i];
      andando[i] = l.passo !== passosAnteriores[i];
      passosAnteriores[i] = l.passo;
      // Os passos no tapete, um por pé; os degraus da escada, um a cada quinto da subida.
      if (l.estado === "andando") {
        const pisada = Math.floor(l.passo * 2);
        if (pisada !== pisadas[i]) {
          pisadas[i] = pisada;
          tocar("passo");
        }
      }
      if (l.estado === "subindo") {
        const degrau = Math.floor(l.altura * 5);
        if (degrau !== degraus[i]) {
          degraus[i] = degrau;
          if (degrau > 0) tocar("escadaPassos");
        }
      }
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
    for (const i of [0, 1] as const) {
      const aviso = avisos[i];
      if (aviso === null) continue;
      aviso.t += dt;
      if (aviso.t > 1) avisos[i] = null;
    }
    const { intensidade, captura } = intensidadeDaTorcida();
    opcoes.audio?.torcida(intensidade, captura, dt);
    // O que a torcida recebe, e quais camadas vêm de gravação, no canvas, para os testes de navegador conferirem sem ouvir.
    const torcidaAgora = `${intensidade.toFixed(2)}|${captura.toFixed(2)}`;
    if (torcidaAgora !== ultimaTorcida) {
      ultimaTorcida = torcidaAgora;
      canvas.dataset.torcida = torcidaAgora;
    }
    const gravacoes = opcoes.audio?.gravacoes() ?? [];
    if (gravacoes !== ultimasGravacoes) {
      ultimasGravacoes = gravacoes;
      canvas.dataset.gravacoes = gravacoes.join(",");
    }
    seguir(camera, alvoDaCamera(partida, tela), dt, primeiroQuadro);
    primeiroQuadro = false;
    publicarResumo();
  };

  /** Onde ficou a cabeça de cada lutador no último quadro, para a dica perto dele. */
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

    // Quem está no chão ou atingido vai primeiro; o jogador 1 fica por cima em empate.
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
      papeis,
      humanos,
      dicas: [dicaDe(partida, 0), humanos[1] ? dicaDe(partida, 1) : null],
      esquemas: [esquemaDe(0), esquemaDe(1)],
      tempo,
      fala,
      avisos,
      movimento,
      compacto: tela.largura < 640,
      cabecas,
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
      if (valor) opcoes.audio?.suspender();
      else opcoes.audio?.retomar();
    },
    reiniciar(semente) {
      partida = criarPartida(opcoes.lados[0], opcoes.lados[1], semente);
      memoria = criarMemoria(semente * 31 + 7, opcoes.dificuldade);
      efeitos.limpar();
      fala = null;
      avisos[0] = null;
      avisos[1] = null;
      ultimaFala = -10;
      paradaDeImpacto = 0;
      numeroDaContagem = 0;
      primeiroQuadro = true;
      ultimoResumo = "";
      entradas.limpar();
      opcoes.audio?.limpar();
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
      opcoes.audio?.limpar();
      opcoes.audio?.suspender();
    },
  };
}
