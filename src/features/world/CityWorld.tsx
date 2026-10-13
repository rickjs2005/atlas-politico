"use client";

// A Cidade do Voto na tela (docs/MUNDO.md): a cena 3D, o joystick, o prédio
// aberto no modo às cegas e a revelação no fim. A cena é carregada só no
// navegador; sem WebGL, os mesmos prédios aparecem como lista.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Tema } from "@/lib/domain/decisions";
import { assignSides, programOnSide, reveal, type Choice, type Side } from "@/lib/world/blind";
import type { WorldContent, WorldTheme } from "@/lib/world/content";

import type { WorldHandle } from "./scene";

type Etapa = "entrada" | "jogando" | "revelacao";

const AVISO_PISTAS =
  "As frases são as dos documentos, sem edição. Algumas dão pistas de quem é quem, como citar o governo atual: o modo às cegas esconde o nome, não o conteúdo.";

const AVISO_AMOSTRA =
  "Cada programa aparece com três frases por área, tiradas do documento que a candidatura registrou no TSE. Não é o documento inteiro, e proposta é intenção: não é ato nem resultado.";

export function CityWorld({ content }: { content: WorldContent }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const mundo = useRef<WorldHandle | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("entrada");
  const [semCena, setSemCena] = useState(false);
  const [perto, setPerto] = useState<Tema | null>(null);
  const [aberto, setAberto] = useState<Tema | null>(null);
  const [escolhas, setEscolhas] = useState<Partial<Record<Tema, Choice>>>({});
  // O sorteio dos lados é por visita: feito uma vez, no navegador.
  const [semente] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const lados = useMemo(() => assignSides(content.temas, semente), [content.temas, semente]);

  const temaAberto = content.temas.find((tema) => tema.tema === aberto) ?? null;
  const temaPerto = content.temas.find((tema) => tema.tema === perto) ?? null;
  const visitados = Object.keys(escolhas).length;
  const total = content.temas.length;

  // A cena: carregada quando a pessoa entra na cidade, com o pacote do three.js à parte.
  useEffect(() => {
    if (etapa !== "jogando" || semCena || canvas.current === null || mundo.current !== null) return;
    let cancelado = false;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./scene")
      .then(({ createWorld }) => {
        if (cancelado || canvas.current === null) return;
        try {
          mundo.current = createWorld(
            canvas.current,
            content.temas.map((tema) => ({ id: tema.tema, rotulo: tema.rotulo })),
            { onNear: (id) => setPerto(id as Tema | null) },
            { reduzirMovimento: reduzir },
          );
        } catch {
          setSemCena(true);
        }
      })
      .catch(() => setSemCena(true));
    return () => {
      cancelado = true;
    };
  }, [etapa, semCena, content.temas]);

  useEffect(
    () => () => {
      mundo.current?.dispose();
      mundo.current = null;
    },
    [],
  );

  useEffect(() => {
    mundo.current?.setPaused(aberto !== null || etapa !== "jogando");
  }, [aberto, etapa]);

  const abrir = useCallback((tema: Tema) => setAberto(tema), []);

  const escolher = useCallback((tema: Tema, escolha: Choice) => {
    setEscolhas((atuais) => ({ ...atuais, [tema]: escolha }));
    mundo.current?.markVisited(tema);
    setAberto(null);
  }, []);

  // "E" ou Enter abrem o prédio da porta em que o personagem está.
  useEffect(() => {
    if (etapa !== "jogando" || aberto !== null || perto === null) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "e" || evento.key === "E" || evento.key === "Enter") abrir(perto);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [etapa, aberto, perto, abrir]);

  if (etapa === "entrada") {
    return <Entrada total={total} eleicao={content.eleicao} onComecar={() => setEtapa("jogando")} />;
  }

  if (etapa === "revelacao") {
    return <Revelacao content={content} lados={lados} escolhas={escolhas} onVoltar={() => setEtapa("jogando")} />;
  }

  return (
    <div className="relative h-[calc(100dvh-var(--atlas-header-h))] min-h-[480px] w-full overflow-hidden bg-[#f4ecd9]">
      {semCena ? (
        <ListaDePredios temas={content.temas} escolhas={escolhas} onAbrir={abrir} />
      ) : (
        <canvas ref={canvas} className="block h-full w-full touch-none" aria-label="Praça da Cidade do Voto. Use o joystick ou as setas para andar até um prédio." />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-md border border-line bg-raised/95 px-3 py-2 text-sm shadow-sm">
          <p className="font-medium">
            Temas visitados: {visitados} de {total}
          </p>
          <p className="text-ink-soft">Ande até a porta de um prédio.</p>
        </div>
        <button
          type="button"
          onClick={() => setEtapa("revelacao")}
          disabled={visitados === 0}
          className="pointer-events-auto rounded-md border border-ink bg-ink px-3 py-2 text-sm font-medium text-paper disabled:border-line disabled:bg-raised disabled:text-ink-faint"
        >
          Revelar
        </button>
      </div>

      {temaPerto !== null && aberto === null && (
        <div className="absolute inset-x-0 bottom-48 flex justify-center px-4 sm:bottom-10">
          <button type="button" onClick={() => abrir(temaPerto.tema)} className="rounded-full border-2 border-ink bg-raised px-6 py-3 text-base font-semibold shadow-lg">
            Entrar: {temaPerto.rotulo}
            {escolhas[temaPerto.tema] !== undefined ? " (visitado)" : ""}
          </button>
        </div>
      )}

      {!semCena && aberto === null && <Joystick onMove={(x, y) => mundo.current?.setStick(x, y)} />}

      {temaAberto !== null && (
        <Predio
          tema={temaAberto}
          lados={lados[temaAberto.tema]}
          escolhaAtual={escolhas[temaAberto.tema]}
          onEscolher={(escolha) => escolher(temaAberto.tema, escolha)}
          onFechar={() => setAberto(null)}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {temaPerto !== null && aberto === null ? `Você está na porta do prédio ${temaPerto.rotulo}.` : ""}
      </p>
    </div>
  );
}

function Entrada({ total, eleicao, onComecar }: { total: number; eleicao: number | null; onComecar: () => void }) {
  return (
    <div className="page max-w-2xl space-y-6 py-10">
      <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Mundo aberto · protótipo</p>
      <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Cidade do Voto</h1>
      <p className="text-lg">
        Ande pela praça e entre nos {total} prédios. Cada um é um tema, como Saúde, Economia ou Educação, e guarda dois programas de governo{eleicao !== null ? ` de ${eleicao}` : ""}: <strong>Programa A</strong> e{" "}
        <strong>Programa B</strong>, sem nome.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-ink-soft">
        <li>Leia as frases dos dois lados.</li>
        <li>Marque o que combina mais com você, ou &quot;nenhum dos dois&quot;.</li>
        <li>Quando quiser, toque em <strong>Revelar</strong> para ver de quem era cada programa, com as fontes.</li>
      </ol>
      <p className="rounded-md border border-line bg-sunken p-4 text-sm text-ink-soft">
        O lado de cada candidatura é sorteado de novo em cada prédio e em cada visita. O jogo não recomenda voto e não guarda suas escolhas: elas ficam só nesta página. {AVISO_PISTAS} {AVISO_AMOSTRA}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onComecar} className="rounded-md bg-ink px-6 py-3 text-base font-semibold text-paper">
          Entrar na cidade
        </button>
        <Link href="/comparar/" className="rounded-md border border-line-strong px-6 py-3 text-base">
          Prefiro a comparação com os nomes
        </Link>
      </div>
      <p className="text-sm text-ink-soft">No computador: setas ou W A S D para andar, E para entrar. No celular: o joystick no canto da tela.</p>
    </div>
  );
}

function Predio({
  tema,
  lados,
  escolhaAtual,
  onEscolher,
  onFechar,
}: {
  tema: WorldTheme;
  lados: Record<Side, string> | undefined;
  escolhaAtual: Choice | undefined;
  onEscolher: (escolha: Choice) => void;
  onFechar: () => void;
}) {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  if (lados === undefined) return null;
  const mapa = { [tema.tema]: lados };
  const programas = (["A", "B"] as const).map((lado) => ({ lado, programa: programOnSide(tema, mapa, lado)! }));

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="predio-titulo" className="absolute inset-0 z-20 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6">
      <div className="max-h-[92%] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Prédio</p>
            <h2 id="predio-titulo" ref={titulo} tabIndex={-1} className="font-serif text-3xl font-medium">
              {tema.rotulo}
            </h2>
          </div>
          <button type="button" onClick={onFechar} className="rounded-md border border-line px-3 py-1.5 text-sm">
            Sair
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-soft">O que cada programa diz sobre {tema.rotulo.toLowerCase()}. Os nomes aparecem só na revelação.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {programas.map(({ lado, programa }) => (
            <section key={lado} aria-label={`Programa ${lado}`} className={`rounded-xl border-2 p-4 ${escolhaAtual === lado ? "border-ink bg-raised" : "border-line bg-raised/60"}`}>
              <h3 className="text-lg font-semibold">Programa {lado}</h3>
              <ul className="mt-2 space-y-2">
                {programa.propostas.map((proposta) => (
                  <li key={proposta.id} className="border-l-2 border-line-strong pl-3 leading-snug">
                    {proposta.texto}
                    {proposta.ressalva !== null && <span className="mt-1 block text-sm text-ink-soft">{proposta.ressalva}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-4 font-medium">Qual combina mais com você?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["A", "B", "nenhum"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => onEscolher(opcao)}
              aria-pressed={escolhaAtual === opcao}
              className={`rounded-md border-2 px-2 py-3 text-sm font-semibold ${escolhaAtual === opcao ? "border-ink bg-ink text-paper" : "border-line-strong bg-raised"}`}
            >
              {opcao === "nenhum" ? "Nenhum dos dois" : `Programa ${opcao}`}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          {AVISO_PISTAS} {AVISO_AMOSTRA}
        </p>
      </div>
    </div>
  );
}

function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [ponta, setPonta] = useState({ x: 0, y: 0 });
  const ativo = useRef<number | null>(null);
  const RAIO = 48;

  const mover = (evento: React.PointerEvent) => {
    if (ativo.current !== evento.pointerId || base.current === null) return;
    const r = base.current.getBoundingClientRect();
    let x = evento.clientX - (r.left + r.width / 2);
    let y = evento.clientY - (r.top + r.height / 2);
    const d = Math.hypot(x, y);
    if (d > RAIO) {
      x = (x / d) * RAIO;
      y = (y / d) * RAIO;
    }
    setPonta({ x, y });
    onMove(x / RAIO, -y / RAIO);
  };
  const soltar = () => {
    ativo.current = null;
    setPonta({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={base}
      aria-hidden="true"
      className="absolute bottom-8 left-8 h-32 w-32 touch-none rounded-full border-2 border-ink/20 bg-raised/70 shadow-md select-none"
      onPointerDown={(evento) => {
        ativo.current = evento.pointerId;
        evento.currentTarget.setPointerCapture(evento.pointerId);
        mover(evento);
      }}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <div className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-ink/70 shadow" style={{ transform: `translate(calc(-50% + ${ponta.x}px), calc(-50% + ${ponta.y}px))` }} />
    </div>
  );
}

function ListaDePredios({ temas, escolhas, onAbrir }: { temas: readonly WorldTheme[]; escolhas: Partial<Record<Tema, Choice>>; onAbrir: (tema: Tema) => void }) {
  return (
    <div className="page space-y-4 overflow-y-auto py-24">
      <p className="text-ink-soft">Este navegador não mostrou a cena 3D. Os prédios estão aqui como lista, com o mesmo conteúdo.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {temas.map((tema) => (
          <li key={tema.tema}>
            <button type="button" onClick={() => onAbrir(tema.tema)} className="w-full rounded-md border border-line-strong bg-raised px-4 py-3 text-left font-medium">
              {tema.rotulo}
              {escolhas[tema.tema] !== undefined ? " · visitado" : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Revelacao({
  content,
  lados,
  escolhas,
  onVoltar,
}: {
  content: WorldContent;
  lados: ReturnType<typeof assignSides>;
  escolhas: Partial<Record<Tema, Choice>>;
  onVoltar: () => void;
}) {
  const resumo = reveal(content.temas, lados, escolhas);
  return (
    <div className="page max-w-3xl space-y-6 py-10">
      <h1 className="font-serif text-4xl font-medium tracking-tight">De quem era cada programa</h1>
      <p className="text-ink-soft">
        Isto mostra só as suas escolhas, tema por tema. Não é recomendação de voto: três frases por área não são o programa inteiro, e cada pessoa pesa os temas de um jeito.
      </p>

      <ul className="space-y-2" aria-label="Escolhas por tema">
        {resumo.linhas.map((linha) => (
          <li key={linha.tema} className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-line bg-raised px-4 py-3">
            <span className="font-medium">{linha.rotulo}</span>
            <span className="text-ink-soft">
              {linha.escolha === null ? "não visitado" : linha.escolha === "nenhum" ? "nenhum dos dois" : `Programa ${linha.escolha}: ${linha.nome}`}
            </span>
          </li>
        ))}
      </ul>

      <p>
        Você marcou{" "}
        {resumo.contagem.map((linha, indice) => (
          <span key={linha.nome}>
            {indice > 0 ? " e " : ""}
            <strong>
              {linha.temas} {linha.temas === 1 ? "tema" : "temas"} com o programa de {linha.nome}
            </strong>
          </span>
        ))}
        {resumo.nenhum > 0 ? `, e ${resumo.nenhum} sem nenhum dos dois` : ""}
        {resumo.naoVisitados > 0 ? `. Faltam ${resumo.naoVisitados} prédios.` : "."}
      </p>

      <details className="rounded-md border border-line bg-raised p-4">
        <summary className="cursor-pointer font-medium">Ver as frases com nomes e fontes</summary>
        <div className="mt-4 space-y-6">
          {content.temas.map((tema) => (
            <section key={tema.tema}>
              <h2 className="font-serif text-2xl">{tema.rotulo}</h2>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {tema.programas.map((programa) => (
                  <div key={programa.slug}>
                    <h3 className="font-semibold">{programa.nome}</h3>
                    <ul className="mt-1 space-y-2 text-sm">
                      {programa.propostas.map((proposta) => (
                        <li key={proposta.id}>
                          {proposta.texto}
                          {proposta.fontes.map((fonte) => (
                            <a key={fonte.url + fonte.localizacao} href={fonte.url} className="mt-0.5 block text-ink-soft underline" rel="noopener noreferrer" target="_blank">
                              {fonte.titulo} ({fonte.localizacao})
                            </a>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onVoltar} className="rounded-md bg-ink px-6 py-3 font-semibold text-paper">
          Voltar à cidade
        </button>
        <Link href="/comparar/" className="rounded-md border border-line-strong px-6 py-3">
          Comparar as trajetórias no atlas
        </Link>
      </div>
    </div>
  );
}
