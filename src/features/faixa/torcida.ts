// A torcida do Vale a Faixa: camadas que seguem o estado real da partida.
//
//   - ambiente: o murmúrio contínuo da arena, sempre presente, em volume
//     moderado durante a luta;
//   - expectativa: palmas que ganham ritmo e "oohs" que sobem com a subida
//     na escada e, principalmente, com o progresso real da captura da faixa,
//     até o clímax do trecho final;
//   - reações: um grito curto aos golpes fortes e ao agarrão, um maior a cada
//     queda, o "ooh" curto quando a escada chacoalha com alguém em cima, o
//     suspiro coletivo de surpresa quando a captura é interrompida (maior
//     quanto mais perto do fim), e a explosão de comemoração só na vitória.
//
// Gravações de público com licença conferida, listadas em
// public/audio/torcida/manifesto.json (audio.ts as busca), substituem a
// camada sintetizada correspondente: os laços (ambiente, expectativa) tocam
// por duas fontes alternadas com emenda de potência constante, sem costura
// audível; as reações tocam uma vez, com variação leve de tom. Sem
// gravação, a camada é sintetizada na hora, grão a grão, com sorteios
// contínuos: não há laço curto nem a mesma reação repetida igual.
//
// Cada reação tem recarga própria e, no total, saem no máximo três reações
// a cada 1,5 s (a comemoração à parte): nada acumula nem distorce. As
// transições são suaves (ganhos com constante de tempo), e o volume máximo
// fica abaixo dos impactos da luta.

export type Reacao = "golpe" | "queda" | "surpresa" | "expectativa" | "escada" | "balanco" | "comemoracao";

/** As camadas que uma gravação pode substituir. */
export type Camada = "ambiente" | "expectativa" | "golpe" | "queda" | "surpresa" | "comemoracao";
export const CAMADAS: readonly Camada[] = ["ambiente", "expectativa", "golpe", "queda", "surpresa", "comemoracao"];

export type Gravacoes = Partial<Record<Camada, AudioBuffer>>;

export interface Torcida {
  /** A intensidade da partida (0 a 1) e o progresso real da captura (0 a 1; 0 sem ninguém puxando), a cada passo. */
  atualizar(intensidade: number, captura: number, dt: number): void;
  /** Uma reação, com a força de 0,2 a 1,5 (1 é o normal); respeita as recargas. */
  reagir(reacao: Reacao, forca?: number): void;
  /** Gravações decodificadas: cada camada presente substitui a sintetizada. */
  usarGravacoes(gravacoes: Gravacoes): void;
  setVolume(volume: number): void;
  /** Pausa: as camadas descem e as reações em andamento param. */
  suspender(): void;
  retomar(): void;
  /** Reiniciar ou sair: tudo para e volta ao silêncio. */
  limpar(): void;
}

/** Segundos entre duas reações do mesmo tipo. */
const RECARGA: Record<Reacao, number> = { golpe: 0.4, queda: 0.9, surpresa: 0.8, expectativa: 1.2, escada: 0.9, balanco: 0.45, comemoracao: 6 };
const JANELA_DAS_REACOES = 1.5;
const MAXIMO_NA_JANELA = 3;

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

const PONTOS_DA_EMENDA = 48;
const SUBIDA = new Float32Array(PONTOS_DA_EMENDA).map((_, i) => Math.sin(((i / (PONTOS_DA_EMENDA - 1)) * Math.PI) / 2));
const DESCIDA = new Float32Array(PONTOS_DA_EMENDA).map((_, i) => Math.cos(((i / (PONTOS_DA_EMENDA - 1)) * Math.PI) / 2));

interface Laco {
  comecar(em: number): void;
  /** Agenda o próximo trecho com antecedência; chamar a cada passo. */
  atualizar(): void;
  parar(): void;
}

/**
 * Uma gravação em laço sem costura: trechos inteiros, um atrás do outro,
 * com o fim de um e o começo do seguinte sobrepostos em uma emenda de
 * potência constante (seno e cosseno). Cada trecho é agendado com segundos
 * de antecedência, pelo relógio do áudio, para um quadro travado não abrir
 * um buraco.
 */
function criarLaco(contexto: AudioContext, buffer: AudioBuffer, destino: AudioNode): Laco {
  const duracao = buffer.duration;
  const emenda = Math.min(1.5, duracao / 4);
  const fontes = new Set<AudioBufferSourceNode>();
  let proximo = 0;
  let ativo = false;
  const agendar = () => {
    const inicio = proximo;
    const fonte = contexto.createBufferSource();
    fonte.buffer = buffer;
    const env = contexto.createGain();
    env.gain.value = 0;
    env.gain.setValueCurveAtTime(SUBIDA, inicio, emenda);
    env.gain.setValueCurveAtTime(DESCIDA, inicio + duracao - emenda, emenda);
    fonte.connect(env);
    env.connect(destino);
    fontes.add(fonte);
    fonte.onended = () => {
      fontes.delete(fonte);
      env.disconnect();
    };
    fonte.start(inicio);
    fonte.stop(inicio + duracao + 0.01);
    proximo = inicio + duracao - emenda;
  };
  return {
    comecar(em) {
      ativo = true;
      proximo = Math.max(em, contexto.currentTime + 0.02);
      this.atualizar();
    },
    atualizar() {
      if (!ativo) return;
      while (proximo - contexto.currentTime < 2.5) agendar();
    },
    parar() {
      ativo = false;
      for (const fonte of fontes) {
        try {
          fonte.stop();
        } catch {
          // Já tinha parado.
        }
      }
      fontes.clear();
    },
  };
}

export function criarTorcida(contexto: AudioContext, destino: AudioNode, volumeInicial: number): Torcida {
  const mestre = contexto.createGain();
  mestre.gain.value = volumeInicial;
  mestre.connect(destino);

  const rosa = ruidoRosa(contexto, 9);
  const branco = ruidoBranco(contexto, 1);
  let suspenso = false;
  let volume = volumeInicial;
  let gravacoes: Gravacoes = {};
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
  const ambienteSintetizado = contexto.createGain();
  ambienteSintetizado.connect(ambiente);
  const ambienteGravado = contexto.createGain();
  ambienteGravado.gain.value = 0;
  ambienteGravado.connect(ambiente);
  let lacoDoAmbiente: Laco | null = null;
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
    pan.connect(ambienteSintetizado);
    fonte.start(contexto.currentTime, atraso);
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
  const rugidoSintetizado = contexto.createGain();
  rugidoSintetizado.connect(rugido);
  const rugidoGravado = contexto.createGain();
  rugidoGravado.gain.value = 0;
  rugidoGravado.connect(rugido);
  let lacoDaExpectativa: Laco | null = null;
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
    grave.connect(rugidoSintetizado);
    medio.connect(somaDosMedios);
    somaDosMedios.connect(rugidoSintetizado);
    fonte.start(contexto.currentTime, 5.3);
    const tremor = contexto.createOscillator();
    tremor.frequency.value = 5.5;
    const profundidade = contexto.createGain();
    profundidade.gain.value = 0.12;
    tremor.connect(profundidade);
    profundidade.connect(rugidoSintetizado.gain);
    tremor.start();
  }

  // ---- Uma gravação tocada uma vez: entrada curta, saída suave, tom e lado variando de leve.
  const tocarGravacao = (buffer: AudioBuffer, ganho: number, atraso = 0.02) => {
    const inicio = contexto.currentTime + atraso;
    const fonte = contexto.createBufferSource();
    fonte.buffer = buffer;
    const ritmo = sortear(0.97, 1.03);
    fonte.playbackRate.value = ritmo;
    const duracao = buffer.duration / ritmo;
    const fim = inicio + duracao;
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, inicio);
    env.gain.exponentialRampToValueAtTime(ganho, inicio + Math.min(0.03, duracao / 4));
    const saida = Math.max(inicio + 0.05, fim - Math.min(0.4, duracao / 3));
    env.gain.setValueAtTime(ganho, saida);
    env.gain.linearRampToValueAtTime(0.0001, fim);
    const pan = contexto.createStereoPanner();
    pan.pan.value = sortear(-0.25, 0.25);
    fonte.connect(env);
    env.connect(pan);
    pan.connect(mestre);
    comecar(fonte, inicio, fim + 0.02);
  };

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

  /** O suspiro sintetizado: uma inspirada aguda e curta, e o "ohh" caindo. */
  const suspiro = (forca: number) => {
    const t = contexto.currentTime + 0.02;
    const fonte = contexto.createBufferSource();
    fonte.buffer = branco;
    const filtro = contexto.createBiquadFilter();
    filtro.type = "highpass";
    filtro.frequency.setValueAtTime(1800, t);
    filtro.frequency.exponentialRampToValueAtTime(5000, t + 0.3);
    const env = contexto.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.16 * forca, t + 0.22);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    fonte.connect(filtro);
    filtro.connect(env);
    env.connect(mestre);
    comecar(fonte, t, t + 0.4);
    ooh(t + 0.3, 0.55 * forca, false, 1.1);
    grito(t + 0.35, 0.07 * forca, Math.round(12 * forca), 0.5);
  };

  // ---- As reações, com a força de cada uma; a gravação, quando há, no lugar da sintetizada.
  const reacoes: Record<Reacao, (forca: number) => void> = {
    golpe(forca) {
      if (gravacoes.golpe !== undefined) {
        tocarGravacao(gravacoes.golpe, 0.55 * forca);
        return;
      }
      grito(contexto.currentTime + 0.03, 0.09 * forca, Math.round(10 * forca), 0.3);
    },
    queda(forca) {
      if (gravacoes.queda !== undefined) {
        tocarGravacao(gravacoes.queda, 0.7 * forca, 0.05);
        return;
      }
      const t = contexto.currentTime + 0.05;
      grito(t, 0.12 * forca, Math.round(26 * forca), 0.6);
      for (let i = 0; i < 2; i += 1) assobio(t + sortear(0.1, 0.5), 0.04 * forca);
      for (let i = 0; i < 24; i += 1) palma(t + 0.2 + Math.random() * 0.9, 0.08 * forca);
    },
    surpresa(forca) {
      if (gravacoes.surpresa !== undefined) {
        tocarGravacao(gravacoes.surpresa, 0.75 * forca);
        return;
      }
      suspiro(forca);
    },
    balanco(forca) {
      // A escada chacoalhada com alguém em cima: um "ooh" curto, mais baixo do que o da interrupção.
      if (gravacoes.surpresa !== undefined) {
        tocarGravacao(gravacoes.surpresa, 0.35 * forca);
        return;
      }
      ooh(contexto.currentTime + 0.02, 0.28 * forca, false, 0.7);
      grito(contexto.currentTime + 0.1, 0.05 * forca, 6, 0.3);
    },
    expectativa(forca) {
      ooh(contexto.currentTime + 0.02, 0.4 * forca, true, 1.4);
      grito(contexto.currentTime + 0.3, 0.06 * forca, 8, 0.6);
    },
    escada(forca) {
      if (gravacoes.golpe !== undefined) {
        tocarGravacao(gravacoes.golpe, 0.45 * forca);
        return;
      }
      grito(contexto.currentTime + 0.03, 0.08 * forca, 14, 0.5);
      for (let i = 0; i < 10; i += 1) palma(contexto.currentTime + 0.1 + Math.random() * 0.6, 0.06 * forca);
    },
    comemoracao(forca) {
      explosao = 1;
      if (gravacoes.comemoracao !== undefined) {
        tocarGravacao(gravacoes.comemoracao, 0.95 * forca);
        return;
      }
      // A explosão: gritos em massa, aplausos que se espalham, assobios, e a massa segura por alguns segundos.
      const t = contexto.currentTime + 0.02;
      grito(t, 0.16 * forca, 90, 0.8);
      grito(t + 0.8, 0.12 * forca, 70, 1.6);
      grito(t + 2.4, 0.08 * forca, 50, 2.2);
      for (let i = 0; i < 260; i += 1) {
        const u = Math.random();
        palma(t + 0.15 + u * u * 5.5, 0.1 * forca * (1 - u * 0.5));
      }
      for (let i = 0; i < 7; i += 1) assobio(t + sortear(0.1, 3), 0.05 * forca);
      ooh(t + 0.1, 0.5 * forca, true, 1.2);
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
  const ultimas = new Map<Reacao, number>();
  const recentes: number[] = [];

  const alvoDoAmbiente = (i: number) => 0.12 + i * 0.22;
  const alvoDoRugido = (i: number, c: number, e: number) => Math.max(0, i - 0.45) * 0.5 + c * 0.45 + (c > 0.7 ? (c - 0.7) * 0.5 : 0) + e * 0.6;

  const pararLacos = () => {
    lacoDoAmbiente?.parar();
    lacoDaExpectativa?.parar();
  };
  const retomarLacos = () => {
    const em = contexto.currentTime + 0.05;
    lacoDoAmbiente?.comecar(em);
    lacoDaExpectativa?.comecar(em);
  };

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
      lacoDoAmbiente?.atualizar();
      lacoDaExpectativa?.atualizar();

      // O murmúrio: vozes esparsas, mais quando a arena esquenta. Com gravação de ambiente, só metade.
      acumuladorDeVozes += dt * (1.2 + intensidadeSuave * 6 + explosao * 10) * (gravacoes.ambiente === undefined ? 1 : 0.5);
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
        // A batida coletiva: palmas em compasso, cada vez mais cheias, e no trecho final mais rápidas.
        if (agora >= proximaBatida) {
          proximaBatida = agora + 0.46 - capturaSuave * 0.14 + sortear(-0.02, 0.02);
          const quantas = Math.round(6 + capturaSuave * 24);
          for (let i = 0; i < quantas; i += 1) palma(agora + Math.random() * 0.06, 0.05 + capturaSuave * 0.07);
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
    reagir(reacao, forca = 1) {
      if (suspenso) return;
      const agora = contexto.currentTime;
      const ultima = ultimas.get(reacao);
      if (ultima !== undefined && agora - ultima < RECARGA[reacao]) return;
      if (reacao !== "comemoracao") {
        while (recentes.length > 0 && agora - recentes[0]! > JANELA_DAS_REACOES) recentes.shift();
        if (recentes.length >= MAXIMO_NA_JANELA) return;
        recentes.push(agora);
      }
      ultimas.set(reacao, agora);
      reacoes[reacao](Math.max(0.2, Math.min(1.5, forca)));
    },
    usarGravacoes(novas) {
      gravacoes = novas;
      const agora = contexto.currentTime;
      pararLacos();
      lacoDoAmbiente = novas.ambiente === undefined ? null : criarLaco(contexto, novas.ambiente, ambienteGravado);
      lacoDaExpectativa = novas.expectativa === undefined ? null : criarLaco(contexto, novas.expectativa, rugidoGravado);
      // A camada gravada entra e a sintetizada sai, em meio segundo, sem salto.
      ambienteSintetizado.gain.setTargetAtTime(lacoDoAmbiente === null ? 1 : 0, agora, 0.5);
      ambienteGravado.gain.setTargetAtTime(lacoDoAmbiente === null ? 0 : 1, agora, 0.5);
      rugidoSintetizado.gain.setTargetAtTime(lacoDaExpectativa === null ? 1 : 0, agora, 0.5);
      rugidoGravado.gain.setTargetAtTime(lacoDaExpectativa === null ? 0 : 1, agora, 0.5);
      if (!suspenso) retomarLacos();
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
      pararLacos();
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
      if (!suspenso) return;
      suspenso = false;
      retomarLacos();
    },
    limpar() {
      this.suspender();
      intensidadeSuave = 0;
      capturaSuave = 0;
      explosao = 0;
      ultimoDegrau = 0;
      ultimas.clear();
      recentes.length = 0;
      suspenso = false;
      retomarLacos();
    },
  };
}
