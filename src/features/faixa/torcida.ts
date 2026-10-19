// A torcida do Vale a Faixa: camadas que seguem o estado real da partida.
//
//   - ambiente: o murmúrio contínuo da arena, sempre presente;
//   - expectativa: palmas que ganham ritmo e "oohs" que sobem com a subida
//     na escada e, principalmente, com o progresso real da captura da faixa;
//   - reações: um grito curto a cada golpe, um maior a cada queda, o suspiro
//     coletivo de surpresa quando a captura é interrompida, e a explosão de
//     comemoração (gritos, aplausos, assobios) só na vitória.
//
// Tudo é gerado na hora, grão a grão, com sorteios contínuos: não há laço
// curto nem a mesma reação repetida igual. Quem tiver gravações de público
// com licença conferida pode listá-las em GRAVACOES (em public/audio/torcida)
// e elas substituem as camadas sintetizadas correspondentes; sem arquivo,
// nada é pedido à rede. As transições são suaves (ganhos com constante de
// tempo), e o volume máximo fica abaixo dos impactos da luta.

export type Reacao = "golpe" | "queda" | "surpresa" | "expectativa" | "escada" | "comemoracao";

export interface Torcida {
  /** A intensidade da partida (0 a 1) e o progresso real da captura (0 a 1; 0 sem ninguém puxando), a cada passo. */
  atualizar(intensidade: number, captura: number, dt: number): void;
  reagir(reacao: Reacao): void;
  setVolume(volume: number): void;
  /** Pausa: as camadas descem e as reações em andamento param. */
  suspender(): void;
  retomar(): void;
  /** Reiniciar ou sair: tudo para e volta ao silêncio. */
  limpar(): void;
}

/**
 * Gravações opcionais, em public/audio/torcida/. Vazio: tudo sintetizado.
 * `ambiente` e `expectativa` são lidas em laço (arquivos longos, com começo e
 * fim que se emendam); as outras tocam uma vez por reação.
 */
export const GRAVACOES: Partial<Record<"ambiente" | "expectativa" | "surpresa" | "comemoracao", string>> = {};

function ruidoRosa(contexto: AudioContext, segundos: number): AudioBuffer {
  const tamanho = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(2, tamanho, contexto.sampleRate);
  for (let canal = 0; canal < 2; canal += 1) {
    const dados = buffer.getChannelData(canal);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < tamanho; i += 1) {
      const branco = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + branco * 0.0555179;
      b1 = 0.99332 * b1 + branco * 0.0750759;
      b2 = 0.969 * b2 + branco * 0.153852;
      b3 = 0.8665 * b3 + branco * 0.3104856;
      b4 = 0.55 * b4 + branco * 0.5329522;
      b5 = -0.7616 * b5 - branco * 0.016898;
      dados[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + branco * 0.5362) * 0.11;
      b6 = branco * 0.115926;
    }
    // O começo e o fim se emendam: um laço de ruído não tem costura audível.
    const emenda = Math.floor(contexto.sampleRate * 0.5);
    for (let i = 0; i < emenda; i += 1) {
      const u = i / emenda;
      dados[i] = dados[i]! * u + dados[tamanho - emenda + i]! * (1 - u);
    }
  }
  return buffer;
}

function ruidoBranco(contexto: AudioContext, segundos: number): AudioBuffer {
  const tamanho = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(1, tamanho, contexto.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < tamanho; i += 1) dados[i] = Math.random() * 2 - 1;
  return buffer;
}

const sortear = (de: number, ate: number) => de + Math.random() * (ate - de);

export function criarTorcida(contexto: AudioContext, destino: AudioNode, volumeInicial: number): Torcida {
  const mestre = contexto.createGain();
  mestre.gain.value = volumeInicial;
  mestre.connect(destino);

  const rosa = ruidoRosa(contexto, 9);
  const branco = ruidoBranco(contexto, 1);
  let suspenso = false;
  let volume = volumeInicial;
  // Tudo o que está tocando com fim marcado, para parar na pausa e na limpeza.
  const vivos = new Set<AudioScheduledSourceNode>();
  const comecar = (no: AudioScheduledSourceNode, inicio: number, fim: number) => {
    vivos.add(no);
    no.onended = () => vivos.delete(no);
    no.start(inicio);
    no.stop(fim);
  };

  // ---- A camada de ambiente: duas fontes de ruído rosa em laço, filtradas, uma para cada lado.
  const ambiente = contexto.createGain();
  ambiente.gain.value = 0;
  ambiente.connect(mestre);
  const fontesDoAmbiente: AudioBufferSourceNode[] = [];
  for (const [lado, frequencia, atraso] of [
    [-0.6, 380, 0],
    [0.6, 520, 3.1],
  ] as const) {
    const fonte = contexto.createBufferSource();
    fonte.buffer = rosa;
    fonte.loop = true;
    const filtro = contexto.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = frequencia;
    filtro.Q.value = 0.55;
    const pan = contexto.createStereoPanner();
    pan.pan.value = lado;
    fonte.connect(filtro);
    filtro.connect(pan);
    pan.connect(ambiente);
    fonte.start(contexto.currentTime, atraso);
    fontesDoAmbiente.push(fonte);
    // Um movimento lento no filtro, para a massa respirar.
    const lfo = contexto.createOscillator();
    lfo.frequency.value = 0.07 + Math.random() * 0.05;
    const profundidade = contexto.createGain();
    profundidade.gain.value = 120;
    lfo.connect(profundidade);
    profundidade.connect(filtro.frequency);
    lfo.start();
  }

  // ---- O rugido da expectativa: ruído mais grave e cheio, que cresce com a captura.
  const rugido = contexto.createGain();
  rugido.gain.value = 0;
  rugido.connect(mestre);
  {
    const fonte = contexto.createBufferSource();
    fonte.buffer = rosa;
    fonte.loop = true;
    const grave = contexto.createBiquadFilter();
    grave.type = "bandpass";
    grave.frequency.value = 240;
    grave.Q.value = 0.7;
    const medio = contexto.createBiquadFilter();
    medio.type = "bandpass";
    medio.frequency.value = 900;
    medio.Q.value = 0.8;
    const somaDosMedios = contexto.createGain();
    somaDosMedios.gain.value = 0.6;
    fonte.connect(grave);
    fonte.connect(medio);
    grave.connect(rugido);
    medio.connect(somaDosMedios);
    somaDosMedios.connect(rugido);
    fonte.start(contexto.currentTime, 5.3);
    fontesDoAmbiente.push(fonte);
    const tremor = contexto.createOscillator();
    tremor.frequency.value = 5.5;
    const profundidade = contexto.createGain();
    profundidade.gain.value = 0.12;
    tremor.connect(profundidade);
    profundidade.connect(rugido.gain);
    tremor.start();
  }

  // ---- Grãos: uma voz curta, uma palma, um assobio.
  const voz = (inicio: number, ganho: number, grave: boolean, duracao = sortear(0.09, 0.22)) => {
    const fonte = contexto.createBufferSource();
    fonte.buffer = branco;
    fonte.playbackRate.value = sortear(0.7, 1.3);
    const formante = contexto.createBiquadFilter();
    formante.type = "bandpass";
    formante.frequency.setValueAtTime(grave ? sortear(220, 420) : sortear(420, 1100), inicio);
    formante.frequency.exponentialRampToValueAtTime(grave ? sortear(180, 300) : sortear(300, 700), inicio + duracao);
    formante.Q.value = sortear(3, 7);
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, inicio);
    env.gain.exponentialRampToValueAtTime(ganho, inicio + duracao * 0.25);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    const pan = contexto.createStereoPanner();
    pan.pan.value = sortear(-0.9, 0.9);
    fonte.connect(formante);
    formante.connect(env);
    env.connect(pan);
    pan.connect(mestre);
    comecar(fonte, inicio, inicio + duracao + 0.02);
  };

  const palma = (inicio: number, ganho: number) => {
    const fonte = contexto.createBufferSource();
    fonte.buffer = branco;
    const filtro = contexto.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = sortear(1100, 2600);
    filtro.Q.value = 1.2;
    const env = contexto.createGain();
    const duracao = sortear(0.012, 0.03);
    env.gain.setValueAtTime(ganho, inicio);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    const pan = contexto.createStereoPanner();
    pan.pan.value = sortear(-1, 1);
    fonte.connect(filtro);
    filtro.connect(env);
    env.connect(pan);
    pan.connect(mestre);
    comecar(fonte, inicio, inicio + duracao + 0.01);
  };

  const assobio = (inicio: number, ganho: number) => {
    const osc = contexto.createOscillator();
    osc.type = "sine";
    const base = sortear(1700, 2700);
    const duracao = sortear(0.45, 0.9);
    osc.frequency.setValueAtTime(base, inicio);
    osc.frequency.linearRampToValueAtTime(base * 1.25, inicio + duracao * 0.35);
    osc.frequency.linearRampToValueAtTime(base * 0.9, inicio + duracao);
    const vibrato = contexto.createOscillator();
    vibrato.frequency.value = sortear(5, 7);
    const profundidade = contexto.createGain();
    profundidade.gain.value = 40;
    vibrato.connect(profundidade);
    profundidade.connect(osc.frequency);
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, inicio);
    env.gain.exponentialRampToValueAtTime(ganho, inicio + 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    const pan = contexto.createStereoPanner();
    pan.pan.value = sortear(-0.8, 0.8);
    osc.connect(env);
    env.connect(pan);
    pan.connect(mestre);
    comecar(osc, inicio, inicio + duracao + 0.02);
    comecar(vibrato, inicio, inicio + duracao + 0.02);
  };

  /** Um "ooh" coletivo: um coro de vozes graves com o tom subindo (expectativa) ou caindo (surpresa). */
  const ooh = (inicio: number, ganho: number, sobe: boolean, duracao: number) => {
    for (let i = 0; i < 14; i += 1) {
      const osc = contexto.createOscillator();
      osc.type = i % 3 === 0 ? "triangle" : "sawtooth";
      const base = sortear(150, 330);
      osc.frequency.setValueAtTime(base, inicio);
      osc.frequency.exponentialRampToValueAtTime(base * (sobe ? sortear(1.2, 1.5) : sortear(0.6, 0.78)), inicio + duracao);
      const formante = contexto.createBiquadFilter();
      formante.type = "lowpass";
      formante.frequency.value = sortear(500, 900);
      const env = contexto.createGain();
      env.gain.setValueAtTime(0.0001, inicio + i * 0.02);
      env.gain.exponentialRampToValueAtTime(ganho / 14, inicio + i * 0.02 + duracao * 0.3);
      env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
      const pan = contexto.createStereoPanner();
      pan.pan.value = sortear(-0.9, 0.9);
      osc.connect(formante);
      formante.connect(env);
      env.connect(pan);
      pan.connect(mestre);
      comecar(osc, inicio + i * 0.02, inicio + duracao + 0.05);
    }
  };

  /** Um grito coletivo curto: muitas vozes em poucos décimos de segundo. */
  const grito = (inicio: number, ganho: number, quantas: number, espalhar: number) => {
    for (let i = 0; i < quantas; i += 1) voz(inicio + Math.random() * espalhar, ganho * sortear(0.5, 1), Math.random() < 0.4);
  };

  // ---- As reações.
  const reacoes: Record<Reacao, () => void> = {
    golpe() {
      grito(contexto.currentTime + 0.03, 0.09, 10, 0.3);
    },
    queda() {
      const t = contexto.currentTime + 0.05;
      grito(t, 0.12, 26, 0.6);
      for (let i = 0; i < 2; i += 1) assobio(t + sortear(0.1, 0.5), 0.04);
      for (let i = 0; i < 24; i += 1) palma(t + 0.2 + Math.random() * 0.9, 0.08);
    },
    surpresa() {
      // O suspiro: uma inspirada aguda e curta, e o "ohh" caindo.
      const t = contexto.currentTime + 0.02;
      const fonte = contexto.createBufferSource();
      fonte.buffer = branco;
      const filtro = contexto.createBiquadFilter();
      filtro.type = "highpass";
      filtro.frequency.setValueAtTime(1800, t);
      filtro.frequency.exponentialRampToValueAtTime(5000, t + 0.3);
      const env = contexto.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.16, t + 0.22);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
      fonte.connect(filtro);
      filtro.connect(env);
      env.connect(mestre);
      comecar(fonte, t, t + 0.4);
      ooh(t + 0.3, 0.55, false, 1.1);
      grito(t + 0.35, 0.07, 12, 0.5);
    },
    expectativa() {
      ooh(contexto.currentTime + 0.02, 0.4, true, 1.4);
      grito(contexto.currentTime + 0.3, 0.06, 8, 0.6);
    },
    escada() {
      grito(contexto.currentTime + 0.03, 0.08, 14, 0.5);
      for (let i = 0; i < 10; i += 1) palma(contexto.currentTime + 0.1 + Math.random() * 0.6, 0.06);
    },
    comemoracao() {
      // A explosão: gritos em massa, aplausos que se espalham, assobios, e a massa segura por alguns segundos.
      const t = contexto.currentTime + 0.02;
      grito(t, 0.16, 90, 0.8);
      grito(t + 0.8, 0.12, 70, 1.6);
      grito(t + 2.4, 0.08, 50, 2.2);
      for (let i = 0; i < 260; i += 1) {
        const u = Math.random();
        palma(t + 0.15 + u * u * 5.5, 0.1 * (1 - u * 0.5));
      }
      for (let i = 0; i < 7; i += 1) assobio(t + sortear(0.1, 3), 0.05);
      ooh(t + 0.1, 0.5, true, 1.2);
      explosao = 1;
    },
  };

  // ---- A dinâmica.
  let intensidadeAlvo = 0;
  let intensidadeSuave = 0;
  let capturaSuave = 0;
  let explosao = 0;
  let acumuladorDePalmas = 0;
  let acumuladorDeVozes = 0;
  let proximaBatida = 0;
  let ultimoDegrau = 0;

  const alvoDoAmbiente = (i: number) => 0.12 + i * 0.22;
  const alvoDoRugido = (i: number, c: number, e: number) => Math.max(0, i - 0.45) * 0.5 + c * 0.45 + e * 0.6;

  return {
    atualizar(intensidade, captura, dt) {
      if (suspenso) return;
      intensidadeAlvo = Math.max(0, Math.min(1, intensidade));
      // Sobe mais depressa do que desce: a surpresa esvazia aos poucos.
      const subindo = intensidadeAlvo > intensidadeSuave;
      intensidadeSuave += (intensidadeAlvo - intensidadeSuave) * Math.min(1, dt * (subindo ? 1.6 : 0.5));
      const capturaAlvo = Math.max(0, Math.min(1, captura));
      capturaSuave += (capturaAlvo - capturaSuave) * Math.min(1, dt * (capturaAlvo > capturaSuave ? 1.2 : 0.7));
      explosao = Math.max(0, explosao - dt * 0.12);
      const agora = contexto.currentTime;
      ambiente.gain.setTargetAtTime(alvoDoAmbiente(intensidadeSuave) + explosao * 0.25, agora, 0.4);
      rugido.gain.setTargetAtTime(alvoDoRugido(intensidadeSuave, capturaSuave, explosao), agora, 0.5);

      // O murmúrio: vozes esparsas, mais quando a arena esquenta.
      acumuladorDeVozes += dt * (1.2 + intensidadeSuave * 6 + explosao * 10);
      while (acumuladorDeVozes >= 1) {
        acumuladorDeVozes -= 1;
        voz(agora + Math.random() * 0.05, 0.025 + intensidadeSuave * 0.03, Math.random() < 0.5);
      }
      // As palmas: esparsas no quente, e ritmadas conforme a captura avança.
      const densidade = Math.max(0, intensidadeSuave - 0.5) * 10 + capturaSuave * 14 + explosao * 20;
      acumuladorDePalmas += dt * densidade;
      while (acumuladorDePalmas >= 1) {
        acumuladorDePalmas -= 1;
        palma(agora + Math.random() * 0.04, 0.04 + capturaSuave * 0.05);
      }
      if (capturaSuave > 0.25) {
        // A batida coletiva: palmas em compasso, cada vez mais cheias.
        if (agora >= proximaBatida) {
          proximaBatida = agora + 0.46 - capturaSuave * 0.12 + sortear(-0.02, 0.02);
          const quantas = Math.round(6 + capturaSuave * 22);
          for (let i = 0; i < quantas; i += 1) palma(agora + Math.random() * 0.06, 0.05 + capturaSuave * 0.06);
        }
        // Um "ooh" a cada degrau da captura, só quando ela avança de verdade.
        const degrau = Math.floor(capturaAlvo * 4);
        if (capturaAlvo > 0 && degrau > ultimoDegrau) {
          ultimoDegrau = degrau;
          ooh(agora + 0.02, 0.2 + degrau * 0.08, true, 1.2);
        }
      }
      if (capturaAlvo === 0) ultimoDegrau = 0;
    },
    reagir(reacao) {
      if (suspenso) return;
      reacoes[reacao]();
    },
    setVolume(novo) {
      volume = Math.max(0, Math.min(1, novo));
      mestre.gain.setTargetAtTime(volume, contexto.currentTime, 0.05);
    },
    suspender() {
      suspenso = true;
      const agora = contexto.currentTime;
      ambiente.gain.setTargetAtTime(0, agora, 0.08);
      rugido.gain.setTargetAtTime(0, agora, 0.08);
      for (const no of vivos) {
        try {
          no.stop();
        } catch {
          // Já tinha parado.
        }
      }
      vivos.clear();
    },
    retomar() {
      suspenso = false;
    },
    limpar() {
      this.suspender();
      intensidadeSuave = 0;
      capturaSuave = 0;
      explosao = 0;
      ultimoDegrau = 0;
      suspenso = false;
    },
  };
}
