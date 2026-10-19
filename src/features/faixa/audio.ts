// O som do Vale a Faixa, sintetizado na hora com a Web Audio API: nenhum
// arquivo, nenhuma música licenciada. Impactos, guarda, escada, queda, sino,
// torcida contínua que acompanha a intensidade da partida, vitória e
// derrota. Só começa depois de um gesto da pessoa (`ativar`), e tem volume e
// silêncio, guardados em preferencias.ts.

export type Som = "golpe" | "golpeForte" | "bloqueio" | "empurrao" | "queda" | "escada" | "escadaCai" | "subida" | "sino" | "vitoria" | "derrota" | "puxar" | "aviso" | "cordas";

export interface Audio {
  /** Cria ou retoma o contexto; chamar em resposta a um clique ou toque. */
  ativar(): void;
  tocar(som: Som): void;
  /** A intensidade da torcida, de 0 a 1. */
  torcida(nivel: number): void;
  setVolume(volume: number): void;
  setMudo(mudo: boolean): void;
  /** Para a torcida sem fechar o contexto: pausa. */
  suspender(): void;
  retomar(): void;
  dispose(): void;
}

export function criarAudio(volumeInicial: number, mudoInicial: boolean): Audio | null {
  if (typeof window === "undefined") return null;
  const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Contexto === undefined) return null;

  let contexto: AudioContext | null = null;
  let mestre: GainNode | null = null;
  let torcidaGanho: GainNode | null = null;
  let torcidaFiltro: BiquadFilterNode | null = null;
  let ruido: AudioBuffer | null = null;
  let volume = volumeInicial;
  let mudo = mudoInicial;
  let suspenso = false;

  const ganhoMestre = () => (mudo ? 0 : volume * 0.9);

  const prepararRuido = (c: AudioContext): AudioBuffer => {
    const tamanho = c.sampleRate * 2;
    const buffer = c.createBuffer(1, tamanho, c.sampleRate);
    const dados = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < tamanho; i += 1) {
      // Ruído rosa aproximado: menos agudo que o branco, mais parecido com uma plateia.
      const branco = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + branco * 0.099046;
      b1 = 0.963 * b1 + branco * 0.2965164;
      b2 = 0.57 * b2 + branco * 1.0526913;
      dados[i] = (b0 + b1 + b2 + branco * 0.1848) * 0.18;
    }
    return buffer;
  };

  const ativar = () => {
    if (contexto === null) {
      contexto = new Contexto();
      mestre = contexto.createGain();
      mestre.gain.value = ganhoMestre();
      mestre.connect(contexto.destination);
      ruido = prepararRuido(contexto);
      // A torcida: ruído em laço, filtrado, com ganho que segue a intensidade.
      const fonte = contexto.createBufferSource();
      fonte.buffer = ruido;
      fonte.loop = true;
      torcidaFiltro = contexto.createBiquadFilter();
      torcidaFiltro.type = "bandpass";
      torcidaFiltro.frequency.value = 520;
      torcidaFiltro.Q.value = 0.6;
      torcidaGanho = contexto.createGain();
      torcidaGanho.gain.value = 0;
      fonte.connect(torcidaFiltro);
      torcidaFiltro.connect(torcidaGanho);
      torcidaGanho.connect(mestre);
      fonte.start();
    }
    if (contexto.state === "suspended" && !suspenso) void contexto.resume();
  };

  const tom = (tipo: OscillatorType, freq: number, freqFinal: number, duracao: number, ganho: number, inicio = 0, filtro?: number) => {
    if (contexto === null || mestre === null) return;
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
      lp.connect(mestre);
    } else {
      env.connect(mestre);
    }
    osc.start(agora);
    osc.stop(agora + duracao + 0.02);
  };

  const sopro = (duracao: number, ganho: number, filtroDe: number, filtroAte: number, tipo: BiquadFilterType = "lowpass", inicio = 0) => {
    if (contexto === null || mestre === null || ruido === null) return;
    const agora = contexto.currentTime + inicio;
    const fonte = contexto.createBufferSource();
    fonte.buffer = ruido;
    fonte.playbackRate.value = 1.6;
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
    env.connect(mestre);
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
    golpe() {
      sopro(0.09, 0.9, 1400, 300);
      tom("sine", 130, 55, 0.13, 0.9);
    },
    golpeForte() {
      sopro(0.12, 1, 1100, 200);
      tom("sine", 90, 38, 0.2, 1);
      tom("triangle", 260, 120, 0.08, 0.3);
    },
    bloqueio() {
      tom("triangle", 820, 700, 0.06, 0.45);
      sopro(0.04, 0.5, 2500, 1200, "highpass");
    },
    empurrao() {
      sopro(0.26, 0.7, 320, 1600, "bandpass");
      tom("sine", 110, 70, 0.18, 0.5);
    },
    queda() {
      tom("sine", 85, 28, 0.32, 1);
      sopro(0.22, 0.8, 500, 120);
      sopro(0.1, 0.35, 900, 300, "lowpass", 0.09);
    },
    escada() {
      clank(1);
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
      sons[som]();
    },
    torcida(nivel) {
      if (contexto === null || torcidaGanho === null || torcidaFiltro === null) return;
      const alvo = suspenso ? 0 : 0.05 + Math.max(0, Math.min(1, nivel)) * 0.3;
      torcidaGanho.gain.setTargetAtTime(alvo, contexto.currentTime, 0.25);
      torcidaFiltro.frequency.setTargetAtTime(420 + nivel * 500, contexto.currentTime, 0.4);
    },
    setVolume(novo) {
      volume = Math.max(0, Math.min(1, novo));
      if (contexto !== null && mestre !== null) mestre.gain.setTargetAtTime(ganhoMestre(), contexto.currentTime, 0.05);
    },
    setMudo(novo) {
      mudo = novo;
      if (contexto !== null && mestre !== null) mestre.gain.setTargetAtTime(ganhoMestre(), contexto.currentTime, 0.05);
    },
    suspender() {
      suspenso = true;
      if (contexto !== null && torcidaGanho !== null) torcidaGanho.gain.setTargetAtTime(0, contexto.currentTime, 0.1);
    },
    retomar() {
      suspenso = false;
      if (contexto !== null && contexto.state === "suspended") void contexto.resume();
    },
    dispose() {
      suspenso = true;
      if (contexto !== null) void contexto.close();
      contexto = null;
      mestre = null;
      torcidaGanho = null;
      torcidaFiltro = null;
    },
  };
}
