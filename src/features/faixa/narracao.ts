// A narração do Vale a Faixa por voz: frases curtas de locutor de luta
// livre, em português do Brasil, pela síntese de voz do navegador
// (`speechSynthesis`), quando ele tem uma voz em português. Nada é baixado
// nem pago. Sem voz, a narração fica indisponível e o jogo segue igual, com
// o cartão escrito do narrador.
//
// Uma fila curta: as falas mais importantes passam na frente e podem
// interromper as menos importantes; o que espera demais é descartado; a mesma
// frase não se repete em seguida. Reiniciar ou sair cancela tudo.

export interface Narracao {
  /** Há uma voz em português para falar. Só se sabe depois de o navegador listar as vozes. */
  disponivel(): boolean;
  falar(texto: string, prioridade: number): void;
  setVolume(volume: number): void;
  setLigada(ligada: boolean): void;
  cancelar(): void;
  dispose(): void;
}

interface Pendente {
  texto: string;
  prioridade: number;
  desde: number;
}

const ESPERA_MAXIMA = 2500;
const INTERVALO_MINIMO = 500;
const SEM_REPETIR = 8000;
const FILA_MAXIMA = 2;

export function criarNarracao(volumeInicial: number, ligadaInicial: boolean): Narracao {
  const sintese = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  let voz: SpeechSynthesisVoice | null = null;
  let vozesLidas = false;
  let volume = volumeInicial;
  let ligada = ligadaInicial;
  let fila: Pendente[] = [];
  let falando: Pendente | null = null;
  let ultimoFim = 0;
  const recentes = new Map<string, number>();
  let temporizador: number | null = null;

  const escolherVoz = () => {
    if (sintese === undefined) return;
    const vozes = sintese.getVoices();
    if (vozes.length === 0) return;
    vozesLidas = true;
    const emPortugues = vozes.filter((v) => /^pt[-_]/i.test(v.lang));
    const brasileira = emPortugues.find((v) => /BR/i.test(v.lang));
    voz = brasileira ?? emPortugues[0] ?? null;
  };
  escolherVoz();
  const aoMudarVozes = () => escolherVoz();
  sintese?.addEventListener("voiceschanged", aoMudarVozes);

  const agendar = (em: number) => {
    if (temporizador !== null) window.clearTimeout(temporizador);
    temporizador = window.setTimeout(() => {
      temporizador = null;
      proxima();
    }, em);
  };

  const proxima = () => {
    if (sintese === undefined || voz === null || !ligada || falando !== null) return;
    const agora = performance.now();
    fila = fila.filter((item) => agora - item.desde <= ESPERA_MAXIMA);
    const item = fila.shift();
    if (item === undefined) return;
    const espera = ultimoFim + INTERVALO_MINIMO - agora;
    if (espera > 0) {
      fila.unshift(item);
      agendar(espera);
      return;
    }
    const fala = new SpeechSynthesisUtterance(item.texto);
    fala.voice = voz;
    fala.lang = voz.lang;
    fala.volume = Math.max(0, Math.min(1, volume));
    fala.rate = 1.15;
    fala.pitch = 1.05;
    const terminou = () => {
      if (falando !== item) return;
      falando = null;
      ultimoFim = performance.now();
      if (fila.length > 0) agendar(INTERVALO_MINIMO);
    };
    fala.onend = terminou;
    fala.onerror = terminou;
    falando = item;
    recentes.set(item.texto, agora);
    sintese.speak(fala);
  };

  return {
    disponivel: () => voz !== null,
    falar(texto, prioridade) {
      if (sintese === undefined || !ligada) return;
      if (!vozesLidas) escolherVoz();
      if (voz === null) return;
      const agora = performance.now();
      const dita = recentes.get(texto);
      if (dita !== undefined && agora - dita < SEM_REPETIR) return;
      // Uma fala importante interrompe uma menos importante que esteja no ar.
      if (falando !== null && prioridade >= falando.prioridade + 2) {
        const interrompida = falando;
        falando = null;
        sintese.cancel();
        void interrompida;
      }
      // Na fila, as menos importantes saem para dar lugar.
      fila = fila.filter((item) => item.prioridade >= prioridade);
      fila.push({ texto, prioridade, desde: agora });
      fila.sort((a, b) => b.prioridade - a.prioridade);
      if (fila.length > FILA_MAXIMA) fila.length = FILA_MAXIMA;
      proxima();
    },
    setVolume(novo) {
      volume = Math.max(0, Math.min(1, novo));
    },
    setLigada(nova) {
      ligada = nova;
      if (!nova) this.cancelar();
    },
    cancelar() {
      fila = [];
      falando = null;
      if (temporizador !== null) window.clearTimeout(temporizador);
      temporizador = null;
      sintese?.cancel();
    },
    dispose() {
      this.cancelar();
      sintese?.removeEventListener("voiceschanged", aoMudarVozes);
    },
  };
}
