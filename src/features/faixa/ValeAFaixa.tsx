"use client";

// Vale a Faixa na tela (docs/VALE-A-FAIXA.md): a abertura, a escolha do
// personagem, a partida contra o computador, a pausa, o resultado e a
// revanche. O motor (motor.ts), o desenho e o som entram por `import()` só
// quando a pessoa chega à escolha: a página informativa do atlas não paga
// por eles. O estado da partida vive no motor; aqui ficam as
// telas e o que elas precisam saber (fase, dica, vencedor), publicado só
// quando muda.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { IntentLink } from "@/components/IntentLink";
import { PROFILES } from "@/lib/domain/profiles";
import type { Dica, Entrada, LutadorSlug } from "@/lib/faixa/tipos";

import { Controles } from "./Controles";
import type { Audio } from "./audio";
import type { Motor, Resumo } from "./motor";
import { assinarPreferencias, assinarToque, gravarPreferencias, lerBruto, lerToque, preferenciasDe, type Preferencias } from "./preferencias";

type Tela = "inicio" | "escolha" | "partida";

const NOMES: Record<LutadorSlug, string> = Object.fromEntries(PROFILES.map((perfil) => [perfil.slug, perfil.nome])) as Record<LutadorSlug, string>;
const outroDe = (slug: LutadorSlug): LutadorSlug => (slug === "lula" ? "flavio-bolsonaro" : "lula");
const novaSemente = () => Math.floor(Math.random() * 2 ** 31);

/** O esquema de teclas, um só: desenhado como teclas, com uma descrição curta cada. */
const TECLAS: readonly { teclas: readonly string[]; acao: string }[] = [
  { teclas: ["←", "→"], acao: "andar" },
  { teclas: ["Espaço"], acao: "pular" },
  { teclas: ["Z"], acao: "atacar (no ar, voadora)" },
  { teclas: ["V"], acao: "golpe forte" },
  { teclas: ["X"], acao: "defender (segurar)" },
  { teclas: ["Shift"], acao: "esquiva" },
  { teclas: ["C"], acao: "interagir" },
  { teclas: ["↑", "↓"], acao: "subir e descer a escada" },
  { teclas: ["Esc"], acao: "pausar" },
];

/** Uma tecla desenhada. */
function Tecla({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-stage-ink-soft/60 bg-stage px-1.5 font-sans text-xs font-bold text-stage-ink shadow-[0_2px_0_rgb(0_0_0/0.55)]">
      {children}
    </kbd>
  );
}

/** A apresentação compacta dos controles do teclado: teclas desenhadas e descrições curtas. */
function Teclas({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 text-sm text-stage-ink-soft ${className}`} data-teclas>
      {TECLAS.map((item) => (
        <li key={item.acao} className="inline-flex items-center gap-1.5">
          <span className="inline-flex gap-1">
            {item.teclas.map((tecla) => (
              <Tecla key={tecla}>{tecla}</Tecla>
            ))}
          </span>
          <span>{item.acao}</span>
        </li>
      ))}
    </ul>
  );
}

const TOQUE_RESUMO = "No celular: o direcional à esquerda; à direita, Pular, Atacar, Forte, Defender, Esquiva e Interagir, que muda de ícone conforme o que dá para fazer.";

export function ValeAFaixa() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [jogador, setJogador] = useState<LutadorSlug>("lula");
  const [semente, setSemente] = useState(0);
  const audio = useRef<Audio | null>(null);

  // O que está no navegador, como fonte externa: no servidor, o padrão e sem toque.
  const bruto = useSyncExternalStore(assinarPreferencias, lerBruto, () => null);
  const preferencias = useMemo(() => preferenciasDe(bruto), [bruto]);
  const toque = useSyncExternalStore(assinarToque, lerToque, () => false);

  const mudarPreferencias = useCallback((mudanca: Partial<Preferencias>) => {
    gravarPreferencias({ ...preferenciasDe(lerBruto()), ...mudanca });
  }, []);

  useEffect(() => {
    audio.current?.setVolumes(preferencias.volumeEfeitos, preferencias.volumeTorcida);
    audio.current?.setMudo(preferencias.mudo);
  }, [preferencias.volumeEfeitos, preferencias.volumeTorcida, preferencias.mudo]);

  // O som nasce em um gesto da pessoa (a restrição de reprodução automática dos navegadores); o módulo chega por `import()`.
  const ligarSom = useCallback(() => {
    if (audio.current !== null) {
      audio.current.ativar();
      return;
    }
    void import("./audio").then(({ criarAudio }) => {
      if (audio.current !== null) return;
      const criado = criarAudio(preferencias.volumeEfeitos, preferencias.volumeTorcida, preferencias.mudo);
      if (criado === null) return;
      audio.current = criado;
      criado.ativar();
    });
  }, [preferencias.volumeEfeitos, preferencias.volumeTorcida, preferencias.mudo]);

  useEffect(() => {
    const som = audio;
    return () => {
      som.current?.dispose();
      som.current = null;
    };
  }, []);

  const irParaEscolha = () => {
    ligarSom();
    // O desenho dos retratos e o motor são adiantados enquanto a pessoa escolhe.
    void import("./motor");
    setTela("escolha");
  };

  const escolher = (slug: LutadorSlug) => {
    ligarSom();
    setJogador(slug);
    mudarPreferencias({ personagem: slug });
    setSemente(novaSemente());
    setTela("partida");
  };

  if (tela === "inicio") {
    return (
      <div className="palco flex flex-1 flex-col" data-faixa="inicio">
        <div className="page grid gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:py-14">
          <div className="max-w-2xl space-y-5">
            <p className="eyebrow text-highlight">Sátira interativa · jogo de luta</p>
            <h1 className="font-serif text-5xl font-medium leading-[0.95] tracking-[-0.02em] sm:text-6xl">Vale a Faixa</h1>
            <p className="font-serif text-2xl leading-snug text-stage-ink md:text-3xl">Dois candidatos. Uma escada. Uma faixa.</p>
            <p className="max-w-[34rem] text-stage-ink-soft">
              O debate acabou em luta livre. A faixa presidencial está pendurada sobre o centro do ringue, e só desce para quem encostar a escada embaixo dela,
              subir e puxar por alguns segundos. Derrubar o adversário não vence a partida: abre a chance de subir.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={irParaEscolha} className="btn-acao text-base" data-escolher-candidato>
                Escolher candidato
              </button>
              <IntentLink href="/jogo" className="btn-palco text-base">
                Voltar ao Jogar
              </IntentLink>
            </div>
            {toque ? <p className="text-sm text-stage-ink-soft">{TOQUE_RESUMO} Partidas de dois a quatro minutos.</p> : <Teclas />}
          </div>
          <aside className="space-y-3 border border-stage-line bg-stage-raised p-5 text-sm text-stage-ink-soft">
            <p className="eyebrow text-highlight">Como vencer</p>
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Derrube o adversário: golpes tiram equilíbrio, e a zero ele cai.</li>
              <li>Pegue a escada, que começa caída em uma lateral.</li>
              <li>Leve-a até a marca amarela embaixo da faixa e ponha em pé.</li>
              <li>Suba e, no topo, segure o comando de interação até a barra da faixa encher.</li>
            </ol>
            <p className="border-t border-stage-line pt-3">
              Lula e Flávio Bolsonaro aparecem em caricatura, com as mesmas capacidades: mesma velocidade, mesmo alcance, mesma resistência. É ficção sobre uma situação absurda,
              não informação sobre as pessoas: nada aqui é fato, acusação ou recomendação de voto. Os documentos do atlas estão em{" "}
              <IntentLink href="/explorar" className="text-stage-ink underline decoration-stage-line hover:decoration-stage-ink">
                Explorar
              </IntentLink>
              .
            </p>
          </aside>
        </div>
      </div>
    );
  }

  if (tela === "escolha") {
    return <Escolha preferencias={preferencias} onEscolher={escolher} onVoltar={() => setTela("inicio")} />;
  }

  return (
    <Ringue
      key={`${jogador}-${semente}`}
      jogador={jogador}
      semente={semente}
      toque={toque}
      audio={audio}
      preferencias={preferencias}
      onPreferencias={mudarPreferencias}
      onTrocar={() => setTela("escolha")}
      onRevanche={() => setSemente(novaSemente())}
    />
  );
}

// ---------------------------------------------------------------------------
// A escolha do personagem
// ---------------------------------------------------------------------------

function Escolha({ preferencias, onEscolher, onVoltar }: { preferencias: Preferencias; onEscolher: (slug: LutadorSlug) => void; onVoltar: () => void }) {
  return (
    <div className="palco flex flex-1 flex-col" data-faixa="escolha">
      <div className="page space-y-6 py-8 md:py-12">
        <header className="max-w-2xl space-y-2">
          <p className="eyebrow text-highlight">Vale a Faixa · escolha</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Quem sobe na escada?</h1>
          <p className="text-stage-ink-soft">O outro fica com o computador. Os dois têm as mesmas capacidades: muda a figura, não a chance.</p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 sm:max-w-3xl">
          {PROFILES.map((perfil) => (
            <li key={perfil.slug}>
              <button
                type="button"
                onClick={() => onEscolher(perfil.slug)}
                data-escolha={perfil.slug}
                className="group flex w-full flex-col items-stretch gap-3 border border-stage-line bg-stage-raised p-4 text-left transition-colors hover:border-action focus-visible:border-action"
              >
                <Retrato slug={perfil.slug} />
                <span className="flex items-center justify-between gap-3">
                  <span className="font-serif text-2xl font-medium">{perfil.nome}</span>
                  <span className="btn-acao min-h-10 px-3 text-sm group-hover:bg-[#f6d589]">Lutar</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {preferencias.partidas > 0 && (
          <p className="text-sm text-stage-ink-soft" data-placar>
            Seu placar contra o computador: {preferencias.vitorias} {preferencias.vitorias === 1 ? "vitória" : "vitórias"} em {preferencias.partidas}{" "}
            {preferencias.partidas === 1 ? "partida" : "partidas"}.
          </p>
        )}
        <button type="button" onClick={onVoltar} className="btn-palco text-sm">
          Voltar
        </button>
      </div>
    </div>
  );
}

/** O personagem parado, desenhado pelo mesmo código da partida, respirando. */
function Retrato({ slug }: { slug: LutadorSlug }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const alvo = canvas.current;
    if (alvo === null) return;
    let pedido = 0;
    let cancelado = false;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void import("./desenho/lutador").then(({ desenharRetrato }) => {
      if (cancelado) return;
      const inicio = performance.now();
      const quadro = (agora: number) => {
        desenharRetrato(alvo, slug, (agora - inicio) / 1000);
        if (!reduzir) pedido = requestAnimationFrame(quadro);
      };
      pedido = requestAnimationFrame(quadro);
    });
    return () => {
      cancelado = true;
      cancelAnimationFrame(pedido);
    };
  }, [slug]);
  return (
    <span className="relative block h-56 w-full overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_50%_90%,#2a3a30_0%,#131a16_70%)]">
      <canvas ref={canvas} className="block h-full w-full" aria-hidden="true" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// A partida
// ---------------------------------------------------------------------------

interface RingueProps {
  jogador: LutadorSlug;
  semente: number;
  toque: boolean;
  audio: React.RefObject<Audio | null>;
  preferencias: Preferencias;
  onPreferencias(mudanca: Partial<Preferencias>): void;
  onTrocar(): void;
  onRevanche(): void;
}

const RESUMO_INICIAL: Resumo = { fase: "contagem", dica: null, vencedor: null, naEscada: false, carregando: false, noAr: false, teclado: true, tempo: 0 };

function Ringue({ jogador, semente, toque, audio, preferencias, onPreferencias, onTrocar, onRevanche }: RingueProps) {
  const computador = outroDe(jogador);
  const raiz = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Motor | null>(null);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [resumo, setResumo] = useState<Resumo>(RESUMO_INICIAL);
  const [painel, setPainel] = useState<"pausa" | "controles" | null>(null);
  const [tutorial, setTutorial] = useState(!preferencias.tutorialVisto);
  const placarContado = useRef(false);

  // O motor nasce com o canvas e morre com ele: trocar de personagem ou sair da rota descarta tudo.
  useEffect(() => {
    const alvo = canvas.current;
    if (alvo === null) return;
    let cancelado = false;
    let instancia: Motor | null = null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./motor")
      .then(({ criarMotor }) => {
        if (cancelado) return;
        try {
          instancia = criarMotor({
            canvas: alvo,
            jogador,
            computador,
            semente,
            reduzirMovimento: reduzir,
            toque,
            audio: audio.current,
            // Só para os testes de navegador: com `?computador=parado`, o adversário não age.
            computadorParado: new URLSearchParams(window.location.search).get("computador") === "parado",
            aoMudar: setResumo,
            // Perda de foco e aba escondida: o painel de pausa abre, se nada mais estiver aberto.
            aoPedirPausa: () => setPainel((atual) => atual ?? "pausa"),
            // Esc: abre a pausa; na pausa, continua; na tela de controles, volta à pausa.
            aoAlternarPausa: () => setPainel((atual) => (atual === null ? "pausa" : atual === "pausa" ? null : "pausa")),
          });
          motor.current = instancia;
          setPronto(true);
        } catch {
          setFalhou(true);
        }
      })
      .catch(() => setFalhou(true));
    return () => {
      cancelado = true;
      instancia?.dispose();
      if (motor.current === instancia) motor.current = null;
    };
    // A semente muda só pela revanche, que reinicia o motor sem recriá-lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jogador, computador, toque, audio]);

  // A partida para enquanto há algo por cima dela; parar solta todos os comandos.
  const parada = tutorial || painel !== null || resumo.fase === "fim";
  useEffect(() => {
    motor.current?.setPausado(parada);
  }, [parada, pronto]);

  useEffect(() => {
    if (resumo.fase !== "fim" || placarContado.current) return;
    placarContado.current = true;
    onPreferencias({ partidas: preferencias.partidas + 1, vitorias: preferencias.vitorias + (resumo.vencedor === 0 ? 1 : 0) });
  }, [resumo.fase, resumo.vencedor, onPreferencias, preferencias.partidas, preferencias.vitorias]);

  const focar = useCallback(() => {
    window.requestAnimationFrame(() => raiz.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => {
    if (pronto && !parada) focar();
  }, [pronto, parada, focar]);

  const continuar = () => {
    setPainel(null);
    audio.current?.ativar();
    focar();
  };
  const revanche = () => {
    placarContado.current = false;
    setResumo(RESUMO_INICIAL);
    setPainel(null);
    onRevanche();
    motor.current?.reiniciar(novaSemente());
    audio.current?.ativar();
    focar();
  };
  const fecharTutorial = () => {
    onPreferencias({ tutorialVisto: true });
    setTutorial(false);
    audio.current?.ativar();
    focar();
  };
  const entradaDeToque = useCallback((parte: Partial<Entrada>) => motor.current?.setToque(parte), []);

  const venceu = resumo.vencedor === 0;
  const dicaParaOsBotoes: Dica = resumo.fase === "luta" ? resumo.dica : null;

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      className="palco relative h-[calc(100dvh-var(--atlas-header-h))] min-h-[26rem] w-full touch-none select-none overflow-hidden overscroll-none bg-[#0b0f0d] outline-none janela-baixa:min-h-0"
      data-faixa="partida"
      data-fase={resumo.fase}
      data-vencedor={resumo.vencedor ?? ""}
      data-dica={resumo.dica ?? ""}
      data-pausado={parada ? "sim" : "nao"}
      data-pronto={pronto ? "sim" : "nao"}
      data-na-escada={resumo.naEscada ? "sim" : "nao"}
      onPointerDown={() => {
        if (!parada) raiz.current?.focus({ preventScroll: true });
      }}
    >
      <canvas ref={canvas} className="block h-full w-full" aria-label={`Ringue do Vale a Faixa: ${NOMES[jogador]} contra ${NOMES[computador]}.`} />

      {!pronto && !falhou && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-stage-ink-soft" data-preparando>
          Preparando o ringue…
        </p>
      )}
      {falhou && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" data-sem-canvas>
          <p className="font-serif text-xl">Este navegador não desenha o ringue.</p>
          <p className="max-w-md text-sm text-stage-ink-soft">O Vale a Faixa precisa de um canvas 2D. O resto do atlas funciona igual.</p>
          <IntentLink href="/jogo" className="btn-palco">
            Voltar ao Jogar
          </IntentLink>
        </div>
      )}

      {/* A barra de cima: pausa e som. As placas, as barras e a legenda estão no canvas. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center gap-2 p-2 max-sm:top-[5.5rem] max-sm:p-0">
        <div className="pointer-events-auto flex gap-1 rounded-full border border-stage-line bg-stage/85 p-1">
          <button type="button" onClick={() => setPainel("pausa")} className="inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold text-stage-ink hover:bg-stage-raised" data-pausar>
            Pausa
          </button>
          <button
            type="button"
            onClick={() => onPreferencias({ mudo: !preferencias.mudo })}
            aria-pressed={preferencias.mudo}
            className="inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold text-stage-ink hover:bg-stage-raised"
            data-silenciar
          >
            {preferencias.mudo ? "Som: desligado" : "Som: ligado"}
          </button>
        </div>
      </div>

      {toque && pronto && resumo.fase !== "fim" && <Controles onEntrada={entradaDeToque} dica={dicaParaOsBotoes} naEscada={resumo.naEscada} noAr={resumo.noAr} />}

      <p className="sr-only" aria-live="polite">
        {resumo.fase === "fim" ? (venceu ? "Você tirou a faixa. Vitória." : `${NOMES[computador]} tirou a faixa. Derrota.`) : resumo.dica !== null ? `Agora dá para: ${resumo.dica}.` : ""}
      </p>

      {tutorial && pronto && (
        <Janela titulo="Como se ganha" id="tutorial">
          <ul className="space-y-1.5 text-sm">
            <li>
              <strong>Derrube.</strong> Golpes tiram equilíbrio; a zero, o adversário cai. Defender reduz o dano; a esquiva escapa.
            </li>
            <li>
              <strong>Escada.</strong> Pegue a caída, leve até a marca amarela, posicione, suba pela seta. Atacar a base de uma escada ocupada chacoalha e, três vezes, derruba.
            </li>
            <li>
              <strong>Faixa.</strong> No topo, segure o comando de interação por alguns segundos. Cair tira parte do progresso, não tudo: dá para virar.
            </li>
          </ul>
          <p className="text-xs text-stage-ink-soft">As dicas aparecem sobre o personagem quando há o que fazer.</p>
          {toque ? <p className="text-xs text-stage-ink-soft">{TOQUE_RESUMO}</p> : <Teclas className="text-xs" />}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={fecharTutorial} className="btn-acao" data-comecar-luta autoFocus>
              Lutar
            </button>
          </div>
        </Janela>
      )}

      {painel === "pausa" && !tutorial && resumo.fase !== "fim" && (
        <Janela titulo="Pausa" id="pausa">
          <div className="grid gap-2">
            <button type="button" onClick={continuar} className="btn-acao" data-continuar autoFocus>
              Continuar
            </button>
            <button type="button" onClick={revanche} className="btn-palco" data-reiniciar>
              Reiniciar a partida
            </button>
            <button type="button" onClick={() => setPainel("controles")} className="btn-palco" data-ver-controles>
              Controles
            </button>
            <button type="button" onClick={onTrocar} className="btn-palco" data-trocar-candidato>
              Trocar candidato
            </button>
            <IntentLink href="/jogo" className="btn-palco" data-voltar-ao-atlas>
              Voltar ao Atlas
            </IntentLink>
          </div>
          <Som preferencias={preferencias} onPreferencias={onPreferencias} />
        </Janela>
      )}

      {painel === "controles" && !tutorial && resumo.fase !== "fim" && (
        <Janela titulo="Controles" id="controles">
          <Teclas />
          {toque && <p className="text-xs text-stage-ink-soft">{TOQUE_RESUMO}</p>}
          <p className="text-xs text-stage-ink-soft">
            Z em sequência emenda soco, direto e chute; V é lento e forte; Z no ar é a voadora, uma por salto. Atacar perto da escada em que o adversário sobe chacoalha a escada e,
            três vezes, derruba. Derrubar não vence: só a faixa vence, e cair tira um quarto do progresso, não tudo.
          </p>
          <button type="button" onClick={() => setPainel("pausa")} className="btn-acao" autoFocus>
            Voltar
          </button>
        </Janela>
      )}

      {resumo.fase === "fim" && (
        <Janela titulo={venceu ? "Vale a faixa!" : "A faixa foi para o outro lado"} id="fim" eyebrow={venceu ? "Vitória" : "Derrota"}>
          <p className="text-sm text-stage-ink-soft" data-resultado={venceu ? "vitoria" : "derrota"}>
            {venceu ? `${NOMES[jogador]} subiu, puxou e tirou a faixa` : `${NOMES[computador]} chegou ao topo antes`} em {Math.round(resumo.tempo)} segundos.{" "}
            {venceu ? "Posse no ringue." : "O computador quer a revanche tanto quanto você."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={revanche} className="btn-acao" data-revanche autoFocus>
              Revanche
            </button>
            <button type="button" onClick={onTrocar} className="btn-palco" data-trocar-candidato>
              Trocar candidato
            </button>
            <IntentLink href="/jogo" className="btn-palco sm:col-span-2" data-voltar-ao-atlas>
              Voltar ao Atlas
            </IntentLink>
          </div>
          <p className="text-xs text-stage-ink-soft">Sátira interativa: ficção sobre uma disputa absurda, sem fatos, acusações ou recomendação de voto.</p>
        </Janela>
      )}
    </div>
  );
}

function Janela({ titulo, id, eyebrow, children }: { titulo: string; id: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-stage/70 p-4 backdrop-blur-[2px] janela-baixa:p-2" data-janela={id}>
      {/* A janela rola por dentro em tela baixa (celular deitado): o palco em volta não deixa a página rolar. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`faixa-${id}-titulo`}
        className="max-h-full w-full max-w-md space-y-4 overflow-y-auto border border-stage-line bg-stage-raised p-5 shadow-2xl touch-auto janela-baixa:space-y-2 janela-baixa:p-3"
      >
        <div className="space-y-1">
          {eyebrow !== undefined && <p className="eyebrow text-action">{eyebrow}</p>}
          <h2 id={`faixa-${id}-titulo`} className="font-serif text-2xl font-medium tracking-tight">
            {titulo}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function Deslizante({ rotulo, valor, onChange, dataAttr }: { rotulo: string; valor: number; onChange(valor: number): void; dataAttr: string }) {
  return (
    <label className="flex min-h-10 items-center gap-3">
      <span className="w-20">{rotulo}</span>
      <input type="range" min={0} max={1} step={0.05} value={valor} onChange={(evento) => onChange(Number(evento.target.value))} className="flex-1 accent-action" {...{ [dataAttr]: "" }} aria-label={`Volume: ${rotulo}`} />
    </label>
  );
}

function Som({ preferencias, onPreferencias }: { preferencias: Preferencias; onPreferencias(mudanca: Partial<Preferencias>): void }) {
  return (
    <fieldset className="space-y-1 border-t border-stage-line pt-3 text-sm">
      <legend className="eyebrow pb-2 text-highlight">Som</legend>
      <label className="flex min-h-10 items-center gap-2">
        <input type="checkbox" checked={!preferencias.mudo} onChange={(evento) => onPreferencias({ mudo: !evento.target.checked })} data-som-ligado />
        Som ligado
      </label>
      <Deslizante rotulo="Efeitos" valor={preferencias.volumeEfeitos} onChange={(valor) => onPreferencias({ volumeEfeitos: valor })} dataAttr="data-volume-efeitos" />
      <Deslizante rotulo="Torcida" valor={preferencias.volumeTorcida} onChange={(valor) => onPreferencias({ volumeTorcida: valor })} dataAttr="data-volume-torcida" />
    </fieldset>
  );
}
