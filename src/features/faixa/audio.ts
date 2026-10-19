// O som do Vale a Faixa, sintetizado na hora com a Web Audio API: nenhum
// arquivo, nenhuma música licenciada. Dois canais com volume próprio: os
// efeitos (socos, chutes, voadora, guarda, erro, pulo e aterrissagem, escada,
// queda, sino, vitória, derrota) e a torcida contínua, que acompanha a
// intensidade da partida e ganha tensão quando alguém puxa a faixa. Só começa
// depois de um gesto da pessoa (`ativar`), e pausa com a partida. A narração
// por voz fica em narracao.ts.
//
// Um mesmo som não toca duas vezes em menos de 50 ms, para não acumular nem
// distorcer; a torcida é um laço só, que não reinicia a cada evento.

export type Som =
  | "soco"
  | "chute"
  | "forte"
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
  /** A intensidade da torcida, de 0 a 1, e se há tensão (alguém puxando a faixa). */
  torcida(nivel: number, tensao: number): void;
  setVolumes(efeitos: number, torcida: number): void;
  setMudo(mudo: boolean): void;
  /** Para a torcida sem fechar o contexto: pausa. */
  suspender(): void;
  retomar(): void;
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
  let torcidaGanho: GainNode | null = null;
  let torcidaFiltro: BiquadFilterNode | null = null;
  let tensaoGanho: GainNode | null = null;
  let ruido: AudioBuffer | null = null;
  let volumeEfeitos = volumeDeEfeitos;
  let volumeTorcida = volumeDaTorcida;
  let mudo = mudoInicial;
  let suspenso = false;
  const ultimo = new Map<Som, number>();

  const ganhoMestre = () => (mudo ? 0 : 0.9);

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
      efeitos = contexto.createGain();
      efeitos.gain.value = volumeEfeitos;
      efeitos.connect(mestre);
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
      // A tensão: um pulso grave que entra quando alguém puxa a faixa.
      const pulso = contexto.createOscillator();
      pulso.type = "triangle";
      pulso.frequency.value = 55;
      const batida = contexto.createOscillator();
      batida.type = "sine";
      batida.frequency.value = 2.2;
      const profundidade = contexto.createGain();
      profundidade.gain.value = 0.5;
      const modulado = contexto.createGain();
      modulado.gain.value = 0.5;
      batida.connect(profundidade);
      profundidade.connect(modulado.gain);
      tensaoGanho = contexto.createGain();
      tensaoGanho.gain.value = 0;
      pulso.connect(modulado);
      modulado.connect(tensaoGanho);
      tensaoGanho.connect(mestre);
      pulso.start();
      batida.start();
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
    soco() {
      sopro(0.09, 0.9, 1400, 300);
      tom("sine", 130, 55, 0.13, 0.9);
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
    torcida(nivel, tensao) {
      if (contexto === null || torcidaGanho === null || torcidaFiltro === null || tensaoGanho === null) return;
      const n = Math.max(0, Math.min(1, nivel));
      const alvo = suspenso ? 0 : (0.05 + n * 0.3) * volumeTorcida;
      torcidaGanho.gain.setTargetAtTime(alvo, contexto.currentTime, 0.25);
      torcidaFiltro.frequency.setTargetAtTime(420 + n * 500, contexto.currentTime, 0.4);
      const alvoDaTensao = suspenso ? 0 : Math.max(0, Math.min(1, tensao)) * 0.16 * volumeTorcida;
      tensaoGanho.gain.setTargetAtTime(alvoDaTensao, contexto.currentTime, 0.3);
    },
    setVolumes(novoEfeitos, novaTorcida) {
      volumeEfeitos = Math.max(0, Math.min(1, novoEfeitos));
      volumeTorcida = Math.max(0, Math.min(1, novaTorcida));
      if (contexto !== null && efeitos !== null) efeitos.gain.setTargetAtTime(volumeEfeitos, contexto.currentTime, 0.05);
    },
    setMudo(novo) {
      mudo = novo;
      if (contexto !== null && mestre !== null) mestre.gain.setTargetAtTime(ganhoMestre(), contexto.currentTime, 0.05);
    },
    suspender() {
      suspenso = true;
      if (contexto !== null && torcidaGanho !== null && tensaoGanho !== null) {
        torcidaGanho.gain.setTargetAtTime(0, contexto.currentTime, 0.1);
        tensaoGanho.gain.setTargetAtTime(0, contexto.currentTime, 0.1);
      }
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
      efeitos = null;
      torcidaGanho = null;
      torcidaFiltro = null;
      tensaoGanho = null;
    },
  };
}
