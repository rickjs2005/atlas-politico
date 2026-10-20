// O som do Vale a Faixa, sintetizado na hora com a Web Audio API: nenhum
// arquivo, nenhuma música licenciada. Dois canais com volume próprio: os
// efeitos (passos, socos, chutes, voadora, agarrão e arremesso, guarda, erro,
// pulo e aterrissagem, escada e seus degraus, queda, sino, vitória, derrota)
// e a torcida (torcida.ts), que acompanha o estado real da partida em
// camadas. Só começa depois de um gesto da pessoa (`ativar`), pausa com a
// partida e volta ao silêncio ao reiniciar ou sair.
//
// Um mesmo efeito não toca duas vezes em menos de 50 ms, para não acumular
// nem distorcer; um compressor no canal mestre segura os picos quando muita
// coisa toca junto (a queda com a torcida gritando), sem saturar.

import { criarTorcida, type Reacao, type Torcida } from "./torcida";

export type Som =
  | "passo"
  | "soco"
  | "chute"
  | "forte"
  | "agarrao"
  | "arremesso"
  | "voadora"
  | "bloqueio"
  | "erro"
  | "pulo"
  | "aterrissagem"
  | "aterrissagemPesada"
  | "esquiva"
  | "queda"
  | "escada"
  | "escadaPassos"
  | "escadaPosta"
  | "escadaCai"
  | "subida"
  | "sino"
  | "vitoria"
  | "derrota"
  | "puxar"
  | "aviso"
  | "cordas";

export interface Audio {
  /** Cria ou retoma o contexto; chamar em resposta a um clique ou toque. */
  ativar(): void;
  tocar(som: Som): void;
  /** A torcida, a cada passo: a intensidade da partida (0 a 1) e o progresso real da captura (0 a 1). */
  torcida(intensidade: number, captura: number, dt: number): void;
  reagirTorcida(reacao: Reacao): void;
  setVolumes(efeitos: number, torcida: number): void;
  setMudo(mudo: boolean): void;
  /** Pausa: a torcida desce e as reações param; os efeitos não tocam. */
  suspender(): void;
  retomar(): void;
  /** Reiniciar ou sair: tudo para e volta ao silêncio. */
  limpar(): void;
  dispose(): void;
}

const INTERVALO_MINIMO = 0.05;

export function criarAudio(volumeDeEfeitos: number, volumeDaTorcida: number, mudoInicial: boolean): Audio | null {
  if (typeof window === "undefined") return null;
  const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Contexto === undefined) return null;

  let contexto: AudioContext | null = null;
  let mestre: GainNode | null = null;
  let efeitos: GainNode | null = null;
  let torcida: Torcida | null = null;
  let ruido: AudioBuffer | null = null;
  let volumeEfeitos = volumeDeEfeitos;
  let volumeTorcida = volumeDaTorcida;
  let mudo = mudoInicial;
  let suspenso = false;
  const ultimo = new Map<Som, number>();

  const ganhoMestre = () => (mudo ? 0 : 0.9);

  const prepararRuido = (c: AudioContext): AudioBuffer => {
    const tamanho = c.sampleRate;
    const buffer = c.createBuffer(1, tamanho, c.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < tamanho; i += 1) dados[i] = Math.random() * 2 - 1;
    return buffer;
  };

  const ativar = () => {
    if (contexto === null) {
      contexto = new Contexto();
      mestre = contexto.createGain();
      mestre.gain.value = ganhoMestre();
      // O compressor segura os picos: muitos sons juntos não saturam a saída.
      const compressor = contexto.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.16;
      mestre.connect(compressor);
      compressor.connect(contexto.destination);
      efeitos = contexto.createGain();
      efeitos.gain.value = volumeEfeitos;
      efeitos.connect(mestre);
      ruido = prepararRuido(contexto);
      // A torcida fica abaixo dos impactos: o máximo dela é 55% do canal.
      torcida = criarTorcida(contexto, mestre, volumeTorcida * 0.55);
    }
    if (contexto.state === "suspended" && !suspenso) void contexto.resume();
  };

  const tom = (tipo: OscillatorType, freq: number, freqFinal: number, duracao: number, ganho: number, inicio = 0, filtro?: number) => {
    if (contexto === null || efeitos === null) return;
    const agora = contexto.currentTime + inicio;
    const osc = contexto.createOscillator();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, agora);
    if (freqFinal !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqFinal), agora + duracao);
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, agora);
    env.gain.exponentialRampToValueAtTime(ganho, agora + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
    osc.connect(env);
    if (filtro !== undefined) {
      const lp = contexto.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = filtro;
      env.connect(lp);
      lp.connect(efeitos);
    } else {
      env.connect(efeitos);
    }
    osc.start(agora);
    osc.stop(agora + duracao + 0.02);
  };

  const sopro = (duracao: number, ganho: number, filtroDe: number, filtroAte: number, tipo: BiquadFilterType = "lowpass", inicio = 0) => {
    if (contexto === null || efeitos === null || ruido === null) return;
    const agora = contexto.currentTime + inicio;
    const fonte = contexto.createBufferSource();
    fonte.buffer = ruido;
    const filtro = contexto.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.setValueAtTime(filtroDe, agora);
    if (filtroAte !== filtroDe) filtro.frequency.exponentialRampToValueAtTime(filtroAte, agora + duracao);
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, agora);
    env.gain.exponentialRampToValueAtTime(ganho, agora + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
    fonte.connect(filtro);
    filtro.connect(env);
    env.connect(efeitos);
    fonte.start(agora);
    fonte.stop(agora + duracao + 0.02);
  };

  const clank = (ganho: number, inicio = 0) => {
    tom("square", 1850, 1700, 0.14, ganho * 0.35, inicio, 4000);
    tom("square", 2650, 2400, 0.1, ganho * 0.22, inicio, 5000);
    tom("triangle", 420, 380, 0.18, ganho * 0.5, inicio);
    sopro(0.06, ganho * 0.5, 3000, 1500, "highpass", inicio);
  };

  const sons: Record<Som, () => void> = {
    passo() {
      // Um passo no tapete: baixo e curto, com o tom variando um pouco a cada vez.
      const variacao = 0.9 + Math.random() * 0.2;
      tom("sine", 95 * variacao, 50, 0.07, 0.22);
      sopro(0.04, 0.16, 420 * variacao, 160);
    },
    soco() {
      sopro(0.09, 0.9, 1400, 300);
      tom("sine", 130, 55, 0.13, 0.9);
    },
    agarrao() {
      // O agarrão: o paletó amassado, um sopro curto e grave.
      sopro(0.11, 0.55, 700, 260);
      sopro(0.08, 0.3, 2400, 900, "bandpass", 0.03);
      tom("sine", 150, 90, 0.1, 0.4);
    },
    arremesso() {
      // O arremesso: o sopro que sobe com o corpo voando; a queda toca ao cair.
      sopro(0.3, 0.7, 500, 2600, "bandpass");
      tom("triangle", 160, 260, 0.22, 0.25);
    },
    chute() {
      sopro(0.12, 1, 1100, 220);
      tom("sine", 100, 40, 0.18, 1);
      tom("triangle", 300, 140, 0.07, 0.3);
    },
    forte() {
      sopro(0.14, 1, 900, 160);
      tom("sine", 80, 32, 0.26, 1);
      tom("triangle", 220, 90, 0.1, 0.35);
    },
    voadora() {
      sopro(0.16, 0.8, 600, 2200, "bandpass");
      sopro(0.12, 1, 1000, 200, "lowpass", 0.05);
      tom("sine", 110, 45, 0.2, 1, 0.05);
    },
    bloqueio() {
      tom("triangle", 820, 700, 0.06, 0.45);
      sopro(0.04, 0.5, 2500, 1200, "highpass");
    },
    erro() {
      sopro(0.14, 0.35, 900, 2600, "bandpass");
    },
    pulo() {
      sopro(0.14, 0.3, 400, 1800, "bandpass");
      tom("sine", 180, 420, 0.14, 0.18);
    },
    aterrissagem() {
      tom("sine", 90, 50, 0.1, 0.5);
      sopro(0.07, 0.35, 500, 150);
    },
    aterrissagemPesada() {
      tom("sine", 75, 30, 0.25, 0.9);
      sopro(0.16, 0.7, 500, 120);
    },
    esquiva() {
      sopro(0.12, 0.4, 1800, 600, "bandpass");
    },
    queda() {
      tom("sine", 85, 28, 0.32, 1);
      sopro(0.22, 0.8, 500, 120);
      sopro(0.1, 0.35, 900, 300, "lowpass", 0.09);
    },
    escada() {
      clank(1);
    },
    escadaPassos() {
      clank(0.3);
    },
    escadaPosta() {
      clank(1);
      tom("sine", 120, 60, 0.18, 0.5, 0.06);
    },
    escadaCai() {
      clank(1);
      clank(0.8, 0.12);
      clank(0.5, 0.26);
      tom("sine", 70, 30, 0.35, 0.9, 0.08);
      sopro(0.25, 0.7, 500, 150, "lowpass", 0.08);
    },
    subida() {
      clank(0.45);
    },
    sino() {
      for (let i = 0; i < 3; i += 1) {
        tom("sine", 1047, 1040, 0.9, 0.5, i * 0.32);
        tom("sine", 2093, 2080, 0.5, 0.18, i * 0.32);
        tom("triangle", 1570, 1560, 0.25, 0.12, i * 0.32);
      }
    },
    vitoria() {
      const notas = [523, 659, 784, 1047, 1319];
      notas.forEach((nota, i) => {
        tom("triangle", nota, nota, 0.32, 0.45, i * 0.14);
        tom("square", nota / 2, nota / 2, 0.3, 0.12, i * 0.14, 2200);
      });
      tom("triangle", 1047, 1047, 1.1, 0.4, notas.length * 0.14);
    },
    derrota() {
      tom("sawtooth", 330, 320, 0.35, 0.3, 0, 1500);
      tom("sawtooth", 262, 240, 0.6, 0.3, 0.32, 1200);
      tom("sine", 65, 40, 0.8, 0.5, 0.32);
    },
    puxar() {
      tom("sawtooth", 95, 120, 0.3, 0.25, 0, 900);
      sopro(0.2, 0.3, 700, 1800, "bandpass");
    },
    aviso() {
      tom("sine", 660, 880, 0.09, 0.35);
    },
    cordas() {
      tom("triangle", 200, 110, 0.22, 0.5, 0, 1200);
      sopro(0.08, 0.3, 1500, 500);
    },
  };

  return {
    ativar,
    tocar(som) {
      if (contexto === null || suspenso) return;
      const agora = contexto.currentTime;
      const anterior = ultimo.get(som);
      if (anterior !== undefined && agora - anterior < INTERVALO_MINIMO) return;
      ultimo.set(som, agora);
      sons[som]();
    },
    torcida(intensidade, captura, dt) {
      torcida?.atualizar(intensidade, captura, dt);
    },
    reagirTorcida(reacao) {
      torcida?.reagir(reacao);
    },
    setVolumes(novoEfeitos, novaTorcida) {
      volumeEfeitos = Math.max(0, Math.min(1, novoEfeitos));
      volumeTorcida = Math.max(0, Math.min(1, novaTorcida));
      if (contexto !== null && efeitos !== null) efeitos.gain.setTargetAtTime(volumeEfeitos, contexto.currentTime, 0.05);
      torcida?.setVolume(volumeTorcida * 0.55);
    },
    setMudo(novo) {
      mudo = novo;
      if (contexto !== null && mestre !== null) mestre.gain.setTargetAtTime(ganhoMestre(), contexto.currentTime, 0.05);
    },
    suspender() {
      suspenso = true;
      torcida?.suspender();
    },
    retomar() {
      suspenso = false;
      torcida?.retomar();
      if (contexto !== null && contexto.state === "suspended") void contexto.resume();
    },
    limpar() {
      torcida?.limpar();
      suspenso = false;
    },
    dispose() {
      suspenso = true;
      torcida?.suspender();
      if (contexto !== null) void contexto.close();
      contexto = null;
      mestre = null;
      efeitos = null;
      torcida = null;
    },
  };
}
