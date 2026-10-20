"use client";

// Vale a Faixa na tela (docs/VALE-A-FAIXA.md): a abertura com os dois modos
// (sozinho contra o computador; dois jogadores no mesmo teclado), a escolha
// dos personagens, a partida (com a preparação que mostra os controles e a
// contagem), a pausa, o resultado, a revanche e a volta aos modos. O motor
// (motor.ts), o desenho e o som entram por `import()` só quando a pessoa
// escolhe o modo: a página informativa do atlas não paga por eles. O estado
// da partida vive no motor; aqui ficam as telas e o que elas precisam saber
// (fase, dica, vencedor), publicado só quando muda.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { IntentLink } from "@/components/IntentLink";
import { PROFILES } from "@/lib/domain/profiles";
import { DIFICULDADES, type Dificuldade } from "@/lib/faixa/ia";
import type { Dica, Entrada, Indice, LutadorSlug } from "@/lib/faixa/tipos";

import { Controles } from "./Controles";
import type { Audio } from "./audio";
import { ESQUEMAS_LOCAIS, ESQUEMA_SOLO, linhasDe, type Esquema, type Modo } from "./esquemas";
import type { Motor, Resumo } from "./motor";
import { assinarPreferencias, assinarToque, gravarPreferencias, lerBruto, lerToque, preferenciasDe, type Preferencias } from "./preferencias";

type Tela = "inicio" | "escolha" | "partida";
/** Os personagens de cada lado: o jogador 1 à esquerda; à direita, o computador ou o jogador 2. */
type Lados = readonly [LutadorSlug, LutadorSlug];

const NOMES: Record<LutadorSlug, string> = Object.fromEntries(PROFILES.map((perfil) => [perfil.slug, perfil.nome])) as Record<LutadorSlug, string>;
const outroDe = (slug: LutadorSlug): LutadorSlug => (slug === "lula" ? "flavio-bolsonaro" : "lula");
const novaSemente = () => Math.floor(Math.random() * 2 ** 31);
const ROTULO_DO_MODO: Record<Modo, string> = { solo: "Você contra o computador", local: "2 jogadores — mesmo teclado" };

/** Uma tecla desenhada. */
function Tecla({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-stage-ink-soft/60 bg-stage px-1.5 font-sans text-xs font-bold text-stage-ink shadow-[0_2px_0_rgb(0_0_0/0.55)]">
      {children}
    </kbd>
  );
}

/** A apresentação compacta de um esquema: teclas desenhadas e descrições curtas. */
function Teclas({ esquema, jogador, className = "" }: { esquema: Esquema; jogador?: 1 | 2; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-2 text-sm text-stage-ink-soft ${className}`} data-teclas={jogador ?? "solo"}>
      {linhasDe(esquema).map((item) => (
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

/** Os dois esquemas, um por pessoa, com o nome do personagem de cada lado. */
function TeclasDosDois({ lados, className = "" }: { lados: Lados; className?: string }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`} data-teclas-dos-dois>
      {([0, 1] as const).map((n) => (
        <div key={n} className="space-y-1.5">
          <p className="eyebrow text-highlight">
            Jogador {n + 1} · {NOMES[lados[n]]}
          </p>
          <Teclas esquema={ESQUEMAS_LOCAIS[n]} jogador={n === 0 ? 1 : 2} className="text-xs" />
        </div>
      ))}
    </div>
  );
}

const TOQUE_RESUMO =
  "No celular: o direcional à esquerda; à direita, Pular, Atacar, Forte (colado em quem defende, vira Agarrar), Defender, Esquiva (agarrado, vira Escapar) e Interagir, que muda de ícone conforme o que dá para fazer.";
const AVISO_DO_TECLADO = "Esc pausa para os dois. Alguns teclados não registram muitas teclas ao mesmo tempo: se um comando falhar enquanto o outro jogador segura várias, é limite do teclado, não do jogo.";

const NIVEIS = Object.keys(DIFICULDADES) as Dificuldade[];

export function ValeAFaixa() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [modo, setModo] = useState<Modo>("solo");
  const [lados, setLados] = useState<Lados>(["lula", "flavio-bolsonaro"]);
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

  const escolherModo = (novo: Modo) => {
    ligarSom();
    // O desenho dos retratos e o motor são adiantados enquanto as pessoas escolhem.
    void import("./motor");
    setModo(novo);
    mudarPreferencias({ modo: novo });
    setTela("escolha");
  };

  const lutar = (escolha: Lados) => {
    ligarSom();
    setLados(escolha);
    mudarPreferencias({ personagem: escolha[0] });
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
            {/* Os dois modos, antes de tudo: a escolha dos personagens vem depois. */}
            <div className="grid gap-3 sm:grid-cols-2" data-modos>
              <button
                type="button"
                onClick={() => escolherModo("solo")}
                data-modo="solo"
                className="flex flex-col gap-1 border border-stage-line bg-stage-raised p-4 text-left transition-colors hover:border-action focus-visible:border-action"
              >
                <span className="font-serif text-2xl font-medium">Jogar sozinho</span>
                <span className="text-sm text-stage-ink-soft">{ROTULO_DO_MODO.solo}, em três níveis.</span>
              </button>
              <button
                type="button"
                onClick={() => escolherModo("local")}
                data-modo="local"
                className="flex flex-col gap-1 border border-stage-line bg-stage-raised p-4 text-left transition-colors hover:border-action focus-visible:border-action"
              >
                <span className="font-serif text-2xl font-medium">Jogar com um amigo</span>
                <span className="text-sm text-stage-ink-soft">{ROTULO_DO_MODO.local}: cada um com as suas teclas. Precisa de teclado físico.</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <IntentLink href="/jogo" className="btn-palco text-base">
                Voltar ao Jogar
              </IntentLink>
            </div>
            {toque ? <p className="text-sm text-stage-ink-soft">{TOQUE_RESUMO} Partidas de dois a quatro minutos.</p> : <Teclas esquema={ESQUEMA_SOLO} />}
            {!toque && <p className="text-xs text-stage-ink-soft">A dois, cada pessoa tem as suas teclas: elas aparecem na escolha e antes da luta.</p>}
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
    return <Escolha modo={modo} preferencias={preferencias} onLutar={lutar} onDificuldade={(dificuldade) => mudarPreferencias({ dificuldade })} onVoltar={() => setTela("inicio")} />;
  }

  return (
    <Ringue
      key={`${modo}-${lados[0]}-${semente}`}
      modo={modo}
      lados={lados}
      semente={semente}
      dificuldade={preferencias.dificuldade}
      toque={toque}
      audio={audio}
      preferencias={preferencias}
      onPreferencias={mudarPreferencias}
      onTrocar={() => setTela("escolha")}
      onModos={() => setTela("inicio")}
    />
  );
}

// ---------------------------------------------------------------------------
// A escolha dos personagens
// ---------------------------------------------------------------------------

function Escolha({
  modo,
  preferencias,
  onLutar,
  onDificuldade,
  onVoltar,
}: {
  modo: Modo;
  preferencias: Preferencias;
  onLutar: (lados: Lados) => void;
  onDificuldade: (dificuldade: Dificuldade) => void;
  onVoltar: () => void;
}) {
  const local = modo === "local";
  // A dois, o jogador 1 escolhe primeiro; o jogador 2 vê o que ficou para ele e pode trocar de lado.
  const [primeiro, setPrimeiro] = useState<LutadorSlug | null>(null);
  const escolhidos: Lados | null = primeiro === null ? null : [primeiro, outroDe(primeiro)];
  const titulo = !local ? "Quem sobe na escada?" : primeiro === null ? "Jogador 1: quem sobe na escada?" : `Jogador 2 fica com ${NOMES[outroDe(primeiro)]}`;
  return (
    <div className="palco flex flex-1 flex-col" data-faixa="escolha" data-modo={modo}>
      <div className="page space-y-6 py-8 md:py-12">
        <header className="max-w-2xl space-y-2">
          <p className="eyebrow text-highlight">Vale a Faixa · {ROTULO_DO_MODO[modo]}</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">{titulo}</h1>
          <p className="text-stage-ink-soft">
            {local ? "Cada pessoa fica com um dos dois." : "O outro fica com o computador."} Os dois têm as mesmas capacidades: muda a figura, não a chance.
          </p>
        </header>
        {/* O nível muda só o computador (reação, erros, cautela, ousadia); as regras são as mesmas. A dois, não há computador. */}
        {!local && (
          <fieldset className="max-w-3xl space-y-2" data-dificuldades>
            <legend className="eyebrow pb-1 text-highlight">Computador</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dificuldade do computador">
              {NIVEIS.map((nivel) => {
                const ativo = preferencias.dificuldade === nivel;
                return (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => onDificuldade(nivel)}
                    aria-pressed={ativo}
                    data-dificuldade={nivel}
                    className={`min-h-10 border px-3 text-sm font-semibold transition-colors ${ativo ? "border-action bg-action text-action-ink" : "border-stage-line bg-stage-raised text-stage-ink hover:border-action"}`}
                  >
                    {DIFICULDADES[nivel].rotulo}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-stage-ink-soft" data-dificuldade-descricao>
              {DIFICULDADES[preferencias.dificuldade].rotulo}: {DIFICULDADES[preferencias.dificuldade].descricao}. As regras, o alcance e a resistência não mudam.
            </p>
          </fieldset>
        )}
        {escolhidos === null ? (
          <ul className="grid gap-4 sm:grid-cols-2 sm:max-w-3xl">
            {PROFILES.map((perfil) => (
              <li key={perfil.slug}>
                <button
                  type="button"
                  onClick={() => (local ? setPrimeiro(perfil.slug) : onLutar([perfil.slug, outroDe(perfil.slug)]))}
                  data-escolha={perfil.slug}
                  className="group flex w-full flex-col items-stretch gap-3 border border-stage-line bg-stage-raised p-4 text-left transition-colors hover:border-action focus-visible:border-action"
                >
                  <Retrato slug={perfil.slug} />
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-serif text-2xl font-medium">{perfil.nome}</span>
                    <span className="btn-acao min-h-10 px-3 text-sm group-hover:bg-[#f6d589]">{local ? "Jogador 1" : "Lutar"}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 sm:max-w-3xl">
              {([0, 1] as const).map((n) => (
                <li key={n} className="flex flex-col gap-3 border border-action/60 bg-stage-raised p-4" data-lado={n + 1}>
                  <Retrato slug={escolhidos[n]} />
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-serif text-2xl font-medium">{NOMES[escolhidos[n]]}</span>
                    <span className="eyebrow text-action">Jogador {n + 1}</span>
                  </span>
                </li>
              ))}
            </ul>
            <TeclasDosDois lados={escolhidos} className="sm:max-w-3xl" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onLutar(escolhidos)} className="btn-acao" data-lutar autoFocus>
                Lutar
              </button>
              <button type="button" onClick={() => setPrimeiro(escolhidos[1])} className="btn-palco" data-trocar-lados>
                Trocar de lado
              </button>
              <button type="button" onClick={() => setPrimeiro(null)} className="btn-palco" data-escolher-de-novo>
                Escolher de novo
              </button>
            </div>
          </>
        )}
        {!local && preferencias.partidas > 0 && (
          <p className="text-sm text-stage-ink-soft" data-placar>
            Seu placar contra o computador: {preferencias.vitorias} {preferencias.vitorias === 1 ? "vitória" : "vitórias"} em {preferencias.partidas}{" "}
            {preferencias.partidas === 1 ? "partida" : "partidas"}.
          </p>
        )}
        <button type="button" onClick={onVoltar} className="btn-palco text-sm" data-voltar-aos-modos>
          Voltar aos modos
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
  modo: Modo;
  lados: Lados;
  semente: number;
  dificuldade: Dificuldade;
  toque: boolean;
  audio: React.RefObject<Audio | null>;
  preferencias: Preferencias;
  onPreferencias(mudanca: Partial<Preferencias>): void;
  onTrocar(): void;
  onModos(): void;
}

const RESUMO_INICIAL: Resumo = { fase: "contagem", dica: null, vencedor: null, naEscada: false, carregando: false, noAr: false, teclado: true, tempo: 0 };

function Ringue({ modo, lados, semente, dificuldade, toque, audio, preferencias, onPreferencias, onTrocar, onModos }: RingueProps) {
  const local = modo === "local";
  // A dois, os botões de toque ficam de fora: o modo é do teclado.
  const toqueNaPartida = toque && !local;
  const raiz = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const motor = useRef<Motor | null>(null);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [resumo, setResumo] = useState<Resumo>(RESUMO_INICIAL);
  const [painel, setPainel] = useState<"pausa" | "controles" | null>(null);
  // A preparação: os controles antes de começar, sempre; o "como se ganha", só na primeira vez.
  const [preparacao, setPreparacao] = useState(true);
  const [comoSeGanha] = useState(!preferencias.tutorialVisto);
  const placarContado = useRef(false);

  // O motor nasce com o canvas e morre com ele: trocar de personagem ou sair da rota descarta tudo.
  useEffect(() => {
    const alvo = canvas.current;
    if (alvo === null) return;
    let cancelado = false;
    let instancia: Motor | null = null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Só para os testes de navegador: com `?computador=parado` o adversário não age; com `defendendo`, só defende.
    const modoDeTeste = new URLSearchParams(window.location.search).get("computador");
    import("./motor")
      .then(({ criarMotor }) => {
        if (cancelado) return;
        try {
          instancia = criarMotor({
            canvas: alvo,
            modo,
            lados,
            semente,
            dificuldade,
            reduzirMovimento: reduzir,
            toque: toqueNaPartida,
            audio: audio.current,
            computadorDeTeste: modoDeTeste === "parado" || modoDeTeste === "defendendo" ? modoDeTeste : undefined,
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
    // A semente é a da primeira partida desta montagem; a revanche sorteia outra e reinicia o motor sem recriá-lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, lados, dificuldade, toqueNaPartida, audio]);

  // A partida para enquanto há algo por cima dela; parar solta todos os comandos.
  const parada = preparacao || painel !== null || resumo.fase === "fim";
  // O motor pausa na preparação e nos painéis. No fim da partida ele segue, com a entrada já desligada:
  // a comemoração da torcida toca e se acalma sob a janela de resultado, em vez de ser cortada na pausa.
  const motorParado = preparacao || painel !== null;
  useEffect(() => {
    motor.current?.setPausado(motorParado);
  }, [motorParado, pronto]);

  // O placar é da pessoa contra o computador: a dois, ninguém conta.
  useEffect(() => {
    if (local || resumo.fase !== "fim" || placarContado.current) return;
    placarContado.current = true;
    onPreferencias({ partidas: preferencias.partidas + 1, vitorias: preferencias.vitorias + (resumo.vencedor === 0 ? 1 : 0) });
  }, [local, resumo.fase, resumo.vencedor, onPreferencias, preferencias.partidas, preferencias.vitorias]);

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
  // A revanche e o reinício recomeçam a partida no mesmo motor, com a escada sorteada de novo, sem a preparação de novo: direto para a contagem.
  const revanche = () => {
    placarContado.current = false;
    setResumo(RESUMO_INICIAL);
    setPainel(null);
    motor.current?.reiniciar(novaSemente());
    audio.current?.ativar();
    focar();
  };
  const comecarLuta = () => {
    if (!preferencias.tutorialVisto) onPreferencias({ tutorialVisto: true });
    setPreparacao(false);
    audio.current?.ativar();
    focar();
  };
  const entradaDeToque = useCallback((parte: Partial<Entrada>) => motor.current?.setToque(parte), []);

  const vencedor = resumo.vencedor;
  const venceu = vencedor === 0;
  const nomeDe = (i: Indice) => NOMES[lados[i]];
  const dicaParaOsBotoes: Dica = resumo.fase === "luta" ? resumo.dica : null;
  const resultado = vencedor === null ? "" : local ? `jogador-${vencedor + 1}` : venceu ? "vitoria" : "derrota";

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      className="palco relative h-[calc(100dvh-var(--atlas-header-h))] min-h-[26rem] w-full touch-none select-none overflow-hidden overscroll-none bg-[#0b0f0d] outline-none janela-baixa:min-h-0"
      data-faixa="partida"
      data-modo={modo}
      data-fase={resumo.fase}
      data-vencedor={vencedor ?? ""}
      data-dica={resumo.dica ?? ""}
      data-pausado={parada ? "sim" : "nao"}
      data-pronto={pronto ? "sim" : "nao"}
      data-na-escada={resumo.naEscada ? "sim" : "nao"}
      data-dificuldade={local ? "" : dificuldade}
      onPointerDown={() => {
        if (!parada) raiz.current?.focus({ preventScroll: true });
      }}
    >
      <canvas
        ref={canvas}
        className="block h-full w-full"
        aria-label={local ? `Ringue do Vale a Faixa: ${nomeDe(0)} (jogador 1) contra ${nomeDe(1)} (jogador 2).` : `Ringue do Vale a Faixa: ${nomeDe(0)} contra ${nomeDe(1)}.`}
      />

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

      {toqueNaPartida && pronto && resumo.fase !== "fim" && <Controles onEntrada={entradaDeToque} dica={dicaParaOsBotoes} naEscada={resumo.naEscada} noAr={resumo.noAr} />}

      <p className="sr-only" aria-live="polite">
        {resumo.fase === "fim" && vencedor !== null
          ? local
            ? `Jogador ${vencedor + 1}, ${nomeDe(vencedor)}, tirou a faixa.`
            : venceu
              ? "Você tirou a faixa. Vitória."
              : `${nomeDe(1)} tirou a faixa. Derrota.`
          : resumo.dica !== null
            ? `Agora dá para: ${resumo.dica}.`
            : ""}
      </p>

      {/* A preparação: os controles de cada um e, na primeira vez, como se ganha. Lutar abre a contagem: 3, 2, 1, lutem! */}
      {preparacao && pronto && (
        <Janela titulo={local ? "Dois no mesmo teclado" : comoSeGanha ? "Como se ganha" : "Controles"} id="preparacao" eyebrow={ROTULO_DO_MODO[modo]}>
          {comoSeGanha && (
            <ul className="space-y-1.5 text-sm">
              <li>
                <strong>Derrube.</strong> Golpes tiram equilíbrio; a zero, o adversário cai. Defender reduz o dano; a esquiva escapa. Colado em quem defende, o golpe forte agarra
                e arremessa (quem é agarrado escapa com a esquiva).
              </li>
              <li>
                <strong>Escada.</strong> Pegue a caída, leve até a marca amarela, posicione, suba. Atacar a base de uma escada ocupada chacoalha e, três vezes, derruba.
              </li>
              <li>
                <strong>Faixa.</strong> No topo, segure o comando de interação por alguns segundos. Cair tira parte do progresso, não tudo: dá para virar.
              </li>
            </ul>
          )}
          {local ? (
            <>
              <TeclasDosDois lados={lados} />
              <p className="text-xs text-stage-ink-soft">{AVISO_DO_TECLADO}</p>
            </>
          ) : toqueNaPartida ? (
            <p className="text-xs text-stage-ink-soft">{TOQUE_RESUMO}</p>
          ) : (
            <Teclas esquema={ESQUEMA_SOLO} className="text-xs" />
          )}
          <p className="text-xs text-stage-ink-soft">As dicas aparecem sobre o personagem quando há o que fazer. Depois de Lutar, a contagem: 3, 2, 1, lutem!</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={comecarLuta} className="btn-acao" data-comecar-luta autoFocus>
              Lutar
            </button>
          </div>
        </Janela>
      )}

      {painel === "pausa" && !preparacao && resumo.fase !== "fim" && (
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
            <button type="button" onClick={onModos} className="btn-palco" data-voltar-aos-modos>
              Voltar aos modos
            </button>
            <IntentLink href="/jogo" className="btn-palco" data-voltar-ao-atlas>
              Voltar ao Atlas
            </IntentLink>
          </div>
          <Som preferencias={preferencias} onPreferencias={onPreferencias} />
        </Janela>
      )}

      {painel === "controles" && !preparacao && resumo.fase !== "fim" && (
        <Janela titulo="Controles" id="controles" eyebrow={ROTULO_DO_MODO[modo]}>
          {local ? <TeclasDosDois lados={lados} /> : <Teclas esquema={ESQUEMA_SOLO} />}
          {toqueNaPartida && <p className="text-xs text-stage-ink-soft">{TOQUE_RESUMO}</p>}
          {local && <p className="text-xs text-stage-ink-soft">{AVISO_DO_TECLADO}</p>}
          <p className="text-xs text-stage-ink-soft">
            Atacar em sequência emenda soco, direto e chute; o golpe forte é lento, e colado em quem defende vira o agarrão: segura e arremessa, a não ser que o agarrado escape
            com a esquiva; atacar no ar é a voadora, uma por salto. Atacar perto da escada em que o adversário sobe chacoalha a escada e, três vezes, derruba. Derrubar não
            vence: só a faixa vence, e cair tira um quarto do progresso, não tudo. Passados dois minutos e meio de luta, a prorrogação: a faixa afrouxa e puxar leva menos.
          </p>
          <button type="button" onClick={() => setPainel("pausa")} className="btn-acao" autoFocus>
            Voltar
          </button>
        </Janela>
      )}

      {resumo.fase === "fim" && vencedor !== null && (
        <Janela
          titulo={local || venceu ? "Vale a faixa!" : "A faixa foi para o outro lado"}
          id="fim"
          eyebrow={local ? `Jogador ${vencedor + 1} venceu` : venceu ? "Vitória" : "Derrota"}
        >
          <p className="text-sm text-stage-ink-soft" data-resultado={resultado}>
            {local
              ? `${nomeDe(vencedor)}, do jogador ${vencedor + 1}, subiu, puxou e tirou a faixa em ${Math.round(resumo.tempo)} segundos. ${nomeDe(vencedor === 0 ? 1 : 0)} quer a revanche.`
              : `${venceu ? `${nomeDe(0)} subiu, puxou e tirou a faixa` : `${nomeDe(1)} chegou ao topo antes`} em ${Math.round(resumo.tempo)} segundos, no nível ${DIFICULDADES[dificuldade].rotulo.toLowerCase()}. ${venceu ? "Posse no ringue." : "O computador quer a revanche tanto quanto você."}`}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={revanche} className="btn-acao" data-revanche autoFocus>
              Revanche
            </button>
            <button type="button" onClick={onTrocar} className="btn-palco" data-trocar-candidato>
              Trocar candidato
            </button>
            <button type="button" onClick={onModos} className="btn-palco" data-voltar-aos-modos>
              Voltar aos modos
            </button>
            <IntentLink href="/jogo" className="btn-palco" data-voltar-ao-atlas>
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
        className="max-h-full w-full max-w-md space-y-4 overflow-y-auto border border-stage-line bg-stage-raised p-5 shadow-2xl touch-auto janela-baixa:space-y-2 janela-baixa:p-3 sm:max-w-xl"
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
