"use client";

// A Praça do Mural na tela (docs/PRACA.md, D-153): a cena 3D, o joystick, as
// janelas de cada lugar (mural, padaria, banca, arquivo, Câmara), o bilhete e
// o caderno. O progresso fica no navegador, em uma chave só, e a praça volta
// de onde parou. Sem WebGL, os mesmos lugares aparecem como lista, com as
// mesmas janelas: nada do jogo depende da cena.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { formatDate } from "@/lib/domain/dates";
import { documentFields } from "@/lib/game/dossier";
import { nodeText, type DialogGraph, type DialogState } from "@/lib/game/escrivao";
import { BILHETE, ITENS, ITENS_POR_NO, MORADORES } from "@/lib/praca/praca";
import {
  abrirMateria,
  abrirPauta,
  ataLavrada,
  camaraAberta,
  conversaDe,
  conversar,
  currentNode,
  devolverCopia,
  fimDaEdicao,
  fixarNota,
  gavetaAberta,
  isDialogOver,
  lavrarAta,
  lerProgresso,
  levarCopia,
  lugaresDeAgora,
  materiaDaSessao,
  notaFixada,
  objetivoDeAgora,
  opcoesDaNota,
  pautasDaSessao,
  pautasDisponiveis,
  pautasPendentes,
  pegarItem,
  progressoInicial,
  sessaoConcluida,
  sessoesAbertas,
  situacaoDaMateria,
  situacaoDaPauta,
  startDialog,
  temItem,
  type DocumentoExposto,
  type Fixacao,
  type Lavratura,
} from "@/lib/praca/regras";
import type { ConteudoDaPraca, Documento, Gaveta, LugarId, Materia, MoradorId, Nota, Pauta, ProgressoDaPraca, Sessao } from "@/lib/praca/tipos";

import type { PontoId, PracaHandle } from "./scene";

export const CHAVE_DO_PROGRESSO = "atlas-politico:praca";

type Etapa = "entrada" | "jogando";
type JanelaId = PontoId | "caderno";

const ROTULO_DA_ACAO: Record<PontoId, string> = {
  mural: "Ler o mural",
  padaria: "Falar com a Zefa",
  banca: "Ver a banca",
  arquivo: "Entrar no arquivo",
  camara: "Câmara",
  bilhete: "Pegar o bilhete",
};

function lerBruto(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_DO_PROGRESSO);
  } catch {
    return null;
  }
}

function lerDoNavegador(conteudo: ConteudoDaPraca): ProgressoDaPraca | null {
  const bruto = lerBruto();
  if (bruto === null) return null;
  try {
    return lerProgresso(JSON.parse(bruto), conteudo);
  } catch {
    return null;
  }
}

const semAssinatura = () => () => {};

function temHistoria(progresso: ProgressoDaPraca): boolean {
  return Object.keys(progresso.pautas).length > 0 || Object.keys(progresso.atas).length > 0 || progresso.itens.length > 0 || progresso.copias.length > 0 || progresso.marcas.length > 0;
}

/** Quantas atas estão lavradas: a cena mostra a ata no quadro da Câmara com a primeira. */
function atasLavradas(progresso: ProgressoDaPraca, conteudo: ConteudoDaPraca): number {
  return conteudo.materias.filter((materia) => situacaoDaMateria(progresso, materia.id) === "publicada").length;
}

export function PracaWorld({ conteudo }: { conteudo: ConteudoDaPraca }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const botaoDeAcao = useRef<HTMLButtonElement>(null);
  const mundo = useRef<PracaHandle | null>(null);
  const posicao = useRef<{ x: number; z: number } | undefined>(undefined);
  const [etapa, setEtapa] = useState<Etapa>("entrada");
  const [semCena, setSemCena] = useState(false);
  const [cena, setCena] = useState<{
    situacao: "carregando" | "pronta" | "parada";
    instancias: number;
    reduzida: boolean;
  }>({ situacao: "carregando", instancias: 0, reduzida: false });
  const [perto, setPerto] = useState<PontoId | null>(null);
  const [janela, setJanela] = useState<JanelaId | null>(null);
  const [progresso, setProgresso] = useState<ProgressoDaPraca>(progressoInicial);

  // O progresso salvo é lido quando a pessoa entra na praça; depois, cada mudança é gravada.
  const entrar = useCallback(() => {
    const salvo = lerDoNavegador(conteudo);
    if (salvo !== null) {
      setProgresso(salvo);
      posicao.current = salvo.posicao;
    }
    setEtapa("jogando");
  }, [conteudo]);
  const gravar = useCallback((atual: ProgressoDaPraca) => {
    try {
      const pos = mundo.current?.getPosition() ?? posicao.current;
      window.localStorage.setItem(CHAVE_DO_PROGRESSO, JSON.stringify(pos === undefined ? atual : { ...atual, posicao: pos }));
    } catch {
      // Sem armazenamento, a praça funciona só nesta visita.
    }
  }, []);
  useEffect(() => {
    if (etapa === "jogando") gravar(progresso);
  }, [etapa, progresso, gravar]);
  // Ao sair da página, a posição de agora vai junto. Só depois de entrar: quem passa pela entrada e vai embora não apaga o que tinha salvo.
  useEffect(() => {
    if (etapa !== "jogando") return;
    const aoSair = () => gravar(progresso);
    window.addEventListener("pagehide", aoSair);
    return () => window.removeEventListener("pagehide", aoSair);
  }, [etapa, progresso, gravar]);

  const disponiveis = useMemo(() => pautasDisponiveis(progresso, conteudo), [conteudo, progresso]);
  const publicadas = useMemo(() => disponiveis.filter((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada").length, [disponiveis, progresso]);
  const camaraEstaAberta = camaraAberta(progresso, conteudo);
  const atas = atasLavradas(progresso, conteudo);
  const bilheteNoChao = !progresso.itens.includes("bilhete");
  const lugares = lugaresDeAgora(progresso, conteudo);
  const progressoRef = useRef(progresso);
  useEffect(() => {
    progressoRef.current = progresso;
  });

  // A cena vive enquanto a praça está na tela, como na Cidade do Voto (src/features/world/CityWorld.tsx).
  useEffect(() => {
    if (etapa !== "jogando" || semCena) return;
    const alvo = canvas.current;
    if (alvo === null) return;
    let cancelado = false;
    let instancia: PracaHandle | null = null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./scene")
      .then(({ createPraca }) => {
        if (cancelado) return;
        try {
          const atual = progressoRef.current;
          instancia = createPraca(
            alvo,
            { onNear: setPerto },
            {
              reduzirMovimento: reduzir,
              posicaoInicial: posicao.current,
              publicadas: pautasDisponiveis(atual, conteudo).filter((pauta) => situacaoDaPauta(atual, pauta.id) === "publicada").length,
              camaraAberta: camaraAberta(atual, conteudo),
              ataLavrada: atasLavradas(atual, conteudo) > 0,
              bilheteNoChao: !atual.itens.includes("bilhete"),
            },
          );
          mundo.current = instancia;
          setCena((anterior) => ({
            situacao: "pronta",
            instancias: anterior.instancias + 1,
            reduzida: reduzir,
          }));
        } catch {
          setSemCena(true);
        }
      })
      .catch(() => setSemCena(true));
    return () => {
      cancelado = true;
      if (instancia !== null) {
        posicao.current = instancia.getPosition();
        instancia.dispose();
      }
      if (mundo.current === instancia) mundo.current = null;
      setPerto(null);
      setCena((anterior) => ({ ...anterior, situacao: "parada" }));
    };
  }, [etapa, semCena, conteudo]);

  useEffect(() => {
    mundo.current?.setPaused(janela !== null || etapa !== "jogando");
  }, [janela, etapa]);
  useEffect(() => {
    mundo.current?.setMural(publicadas);
    mundo.current?.setCamaraAberta(camaraEstaAberta);
    mundo.current?.setAta(atas > 0);
    mundo.current?.setBilhete(bilheteNoChao);
  }, [publicadas, camaraEstaAberta, atas, bilheteNoChao, cena.instancias]);

  const abrir = useCallback((id: JanelaId) => {
    posicao.current = mundo.current?.getPosition() ?? posicao.current;
    setJanela(id);
  }, []);
  const fechar = useCallback(() => {
    setJanela(null);
    window.requestAnimationFrame(() => (botaoDeAcao.current ?? raiz.current)?.focus());
  }, []);

  // "E" ou Enter fazem a ação do lugar em que o personagem está.
  useEffect(() => {
    if (etapa !== "jogando" || janela !== null || perto === null) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|A/.test(evento.target.tagName)) return;
      if (evento.key === "e" || evento.key === "E" || evento.key === "Enter") abrir(perto);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [etapa, janela, perto, abrir]);

  const recomecar = useCallback(() => {
    setProgresso(progressoInicial());
    posicao.current = undefined;
    try {
      window.localStorage.removeItem(CHAVE_DO_PROGRESSO);
    } catch {
      // Sem armazenamento não há o que apagar.
    }
  }, []);

  if (etapa === "entrada") {
    return <Entrada conteudo={conteudo} onEntrar={entrar} onRecomecar={recomecar} />;
  }

  const objetivo = objetivoDeAgora(progresso, conteudo);
  const rotuloDaAcao = perto === null ? null : perto === "camara" ? (camaraEstaAberta ? "Entrar na Câmara" : "Câmara (fechada)") : ROTULO_DA_ACAO[perto];

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      className="relative h-[calc(100dvh-var(--atlas-header-h))] min-h-[480px] w-full overflow-hidden bg-[#dcebf3] outline-none"
      data-praca={semCena ? "lista" : "cena"}
      data-cena={semCena ? "lista" : cena.situacao}
      data-cena-instancias={cena.instancias}
      data-movimento={cena.reduzida ? "reduzido" : "normal"}
      data-publicadas={publicadas}
      data-atas={atas}
    >
      {semCena ? (
        <ListaDaPraca lugares={lugares} bilheteNoChao={bilheteNoChao} onAbrir={abrir} />
      ) : (
        <canvas ref={canvas} className="block h-full w-full touch-none" aria-label="Praça do Mural. Use o joystick ou as setas para andar até um lugar." />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-[min(70vw,28rem)] rounded-md border border-line bg-raised/95 px-3 py-2 text-sm shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Pauta de agora</p>
          <p className="font-medium" data-objetivo>
            {objetivo}
          </p>
          <p className="mt-1 text-xs text-ink-soft" data-instrucao-da-praca>
            {semCena ? "Toque em um lugar da lista." : `Notas no mural: ${publicadas} de ${disponiveis.length} · Cópias: ${progresso.copias.length}${atas > 0 ? " · Ata lavrada" : ""}`}
          </p>
        </div>
        <button type="button" onClick={() => abrir("caderno")} className="pointer-events-auto rounded-md border border-ink bg-ink px-3 py-2 text-sm font-medium text-paper" data-abrir="caderno">
          Caderno
        </button>
      </div>

      {perto !== null && janela === null && rotuloDaAcao !== null && (
        <div className="absolute inset-x-0 bottom-48 flex justify-center px-4 sm:bottom-10">
          <button ref={botaoDeAcao} type="button" onClick={() => abrir(perto)} className="rounded-full border-2 border-ink bg-raised px-6 py-3 text-base font-semibold shadow-lg" data-acao={perto}>
            {rotuloDaAcao}
          </button>
        </div>
      )}

      {!semCena && janela === null && <Joystick onMove={(x, y) => mundo.current?.setStick(x, y)} />}

      {janela === "mural" && <Mural conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onFechar={fechar} />}
      {janela === "padaria" && (
        <Janela titulo="Padaria da Zefa" id="padaria" onFechar={fechar}>
          <Conversa morador="zefa" conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onEncerrar={fechar} />
        </Janela>
      )}
      {janela === "banca" && <Banca conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onFechar={fechar} />}
      {janela === "arquivo" && <Arquivo conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onFechar={fechar} />}
      {janela === "bilhete" && (
        <Janela titulo="Um bilhete no chão" id="bilhete" onFechar={fechar}>
          <p className="text-sm text-ink-soft">Perto do degrau do coreto, um papel amassado. A letra é de quem escreve muito.</p>
          <blockquote className="mt-3 rounded-md border border-line bg-sunken p-4 font-serif text-lg leading-snug" data-bilhete>
            {BILHETE}
          </blockquote>
          <button
            type="button"
            onClick={() => {
              setProgresso((atual) => pegarItem(atual, "bilhete"));
              fechar();
            }}
            className="mt-4 rounded-md bg-ink px-5 py-2.5 font-semibold text-paper"
            data-guardar-bilhete
          >
            Guardar o bilhete
          </button>
        </Janela>
      )}
      {janela === "camara" && <Camara conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onFechar={fechar} />}
      {janela === "caderno" && <Caderno conteudo={conteudo} progresso={progresso} onFechar={fechar} onRecomecar={recomecar} />}

      <p className="sr-only" aria-live="polite">
        {perto !== null && janela === null && rotuloDaAcao !== null ? `Perto: ${rotuloDaAcao}.` : ""}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

function Entrada({ conteudo, onEntrar, onRecomecar }: { conteudo: ConteudoDaPraca; onEntrar: () => void; onRecomecar: () => void }) {
  // O que está salvo no navegador, lido sem efeito: no servidor não há nada, e a tela diz "Entrar".
  const bruto = useSyncExternalStore(semAssinatura, lerBruto, () => null);
  const continua = useMemo(() => {
    if (bruto === null) return false;
    try {
      const salvo = lerProgresso(JSON.parse(bruto), conteudo);
      return salvo !== null && temHistoria(salvo);
    } catch {
      return false;
    }
  }, [bruto, conteudo]);
  return (
    <div className="page max-w-2xl space-y-5 py-10">
      <p className="text-sm font-semibold tracking-wide text-ink-soft uppercase">Aventura de investigação · protótipo</p>
      <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">Praça do Mural</h1>
      <p className="text-lg">
        Você chegou hoje à rádio comunitária. No mural da praça, os moradores pregam perguntas sobre o que os políticos decidiram, e ninguém responde. Quem responder precisa pregar o documento junto.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onEntrar} className="rounded-md bg-ink px-6 py-3 text-base font-semibold text-paper" data-entrar>
          {continua ? "Continuar de onde parou" : "Entrar na praça"}
        </button>
        {continua && (
          <button type="button" onClick={onRecomecar} className="rounded-md border border-line-strong px-6 py-3 text-base" data-recomecar>
            Começar de novo
          </button>
        )}
      </div>
      <p className="text-sm text-ink-soft">
        No computador: setas ou W A S D para andar, E para agir, Esc para fechar. No celular: o joystick no canto da tela. Sem a cena 3D, os lugares aparecem em lista, com o mesmo conteúdo.
      </p>
      <details className="rounded-md border border-line bg-sunken p-4 text-sm text-ink-soft">
        <summary className="cursor-pointer font-medium text-ink">O que é ficção e o que é documento</summary>
        <p className="mt-2">
          A praça, a Zefa, o Teodoro, o Escrivão, o bilhete e os moradores que perguntam são inventados. Os documentos das gavetas são os registros publicados neste atlas: votos, atos e atuações, com
          data, instituição, cargo, objeto, ação e fontes. Cada pergunta do mural só pergunta o que um documento responde. O jogo não dá nota, não soma pontos e não recomenda voto.
        </p>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Janela: o quadro comum de toda interação
// ---------------------------------------------------------------------------

function Janela({ id, titulo, sobre, onFechar, children }: { id: string; titulo: string; sobre?: string; onFechar: () => void; children: React.ReactNode }) {
  const cabecalho = useRef<HTMLHeadingElement>(null);
  useEffect(() => cabecalho.current?.focus(), []);
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={`janela-${id}-titulo`} className="absolute inset-0 z-20 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" data-janela={id}>
      <div className="flex max-h-[92%] w-full max-w-3xl flex-col rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 pt-5 pb-3">
          <div>
            {sobre !== undefined && <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{sobre}</p>}
            <h2 id={`janela-${id}-titulo`} ref={cabecalho} tabIndex={-1} className="font-serif text-2xl font-medium outline-none sm:text-3xl">
              {titulo}
            </h2>
          </div>
          <button type="button" onClick={onFechar} className="rounded-md border border-line px-3 py-1.5 text-sm" data-fechar>
            Sair
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4" data-janela-corpo>
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversa com um morador
// ---------------------------------------------------------------------------

function Conversa({
  morador,
  conteudo,
  progresso,
  onProgresso,
  onEncerrar,
  rotuloDoFim = "Encerrar",
}: {
  morador: MoradorId;
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
  onEncerrar: () => void;
  rotuloDoFim?: string;
}) {
  // O grafo é escolhido quando a conversa começa, e não muda no meio dela, mesmo que um item mude a situação.
  const [{ chave, grafo }] = useState<{ chave: string; grafo: DialogGraph }>(() => conversaDe(morador, progresso, conteudo));
  const [estado, setEstado] = useState<DialogState>(() => startDialog(grafo));
  // A conversa fica marcada como vista quando a pessoa escolhe algo ou a encerra: na próxima visita, a janela abre direto no que interessa.
  const marcarVista = (atual: ProgressoDaPraca) => (atual.marcas.includes(`conversa:${chave}`) ? atual : { ...atual, marcas: [...atual.marcas, `conversa:${chave}`] });
  const no = currentNode(estado, grafo);
  const acabou = isDialogOver(estado, grafo);
  const itemRecebido = ITENS_POR_NO[estado.no];
  const pessoa = MORADORES[morador];
  const escolher = (escolhaId: string) => {
    const passo = conversar(progresso, grafo, estado, escolhaId);
    setEstado(passo.estado);
    onProgresso((atual) => {
      // O passo é refeito sobre o progresso mais novo: só as marcas e o item entram, nada mais é tocado.
      let proximo = marcarVista(atual);
      for (const marca of passo.estado.marcas) if (!proximo.marcas.includes(marca)) proximo = { ...proximo, marcas: [...proximo.marcas, marca] };
      const item = ITENS_POR_NO[passo.estado.no];
      return item === undefined ? proximo : pegarItem(proximo, item);
    });
  };
  return (
    <div className="space-y-3" data-conversa={chave}>
      <p className="text-sm text-ink-soft">
        <strong className="text-ink">{pessoa.nome}</strong>, {pessoa.papel}. Personagem fictício.
      </p>
      <ol className="space-y-2">
        {estado.visitados.map((id, i) => (
          <li
            key={`${id}-${i}`}
            className={`rounded-xl border px-4 py-3 leading-snug ${i === estado.visitados.length - 1 ? "border-ink bg-raised" : "border-line bg-raised/60 text-ink-soft"}`}
            data-fala={id}
          >
            {nodeText(grafo.nos[id]!, estado.marcas)}
          </li>
        ))}
      </ol>
      {itemRecebido !== undefined && (
        <p className="rounded-md border border-ink bg-sunken px-3 py-2 text-sm font-medium" data-item-recebido={itemRecebido}>
          Você guardou: {ITENS[itemRecebido].nome}.
        </p>
      )}
      {acabou ? (
        <button
          type="button"
          onClick={() => {
            onProgresso(marcarVista);
            onEncerrar();
          }}
          className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper"
          data-encerrar
        >
          {rotuloDoFim}
        </button>
      ) : (
        <div className="grid gap-2">
          {no.escolhas.map((escolha) => (
            <button
              key={escolha.id}
              type="button"
              onClick={() => escolher(escolha.id)}
              className="rounded-md border-2 border-line-strong bg-raised px-4 py-2.5 text-left font-medium"
              data-escolha={escolha.id}
            >
              {escolha.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mural: ler as perguntas, aceitar uma pauta, montar e fixar a nota
// ---------------------------------------------------------------------------

type VistaDoMural = { modo: "lista" } | { modo: "pauta"; pauta: string } | { modo: "montar"; pauta: string } | { modo: "fixada"; pauta: string; recem: boolean };

function Mural({
  conteudo,
  progresso,
  onProgresso,
  onFechar,
}: {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
  onFechar: () => void;
}) {
  const [vista, setVista] = useState<VistaDoMural>({ modo: "lista" });
  const pautaDe = (id: string) => conteudo.pautas.find((pauta) => pauta.id === id)!;

  if (vista.modo === "montar") {
    const pauta = pautaDe(vista.pauta);
    return (
      <Janela id="mural" titulo="Montar a nota" sobre={`Pergunta de ${pauta.autor}`} onFechar={onFechar}>
        <MontarNota
          pauta={pauta}
          conteudo={conteudo}
          progresso={progresso}
          onFixar={(nota) => {
            const resultado = fixarNota(progresso, pauta, nota, conteudo.documentos);
            onProgresso(() => resultado.progresso);
            if (resultado.certo) setVista({ modo: "fixada", pauta: pauta.id, recem: true });
            return resultado;
          }}
          onVoltar={() => setVista({ modo: "pauta", pauta: pauta.id })}
        />
      </Janela>
    );
  }

  if (vista.modo === "fixada") {
    const pauta = pautaDe(vista.pauta);
    const nota = notaFixada(pauta, conteudo.documentos);
    const sessao = conteudo.sessoes.find((item) => item.id === pauta.sessao);
    const concluiu = sessao !== undefined && sessaoConcluida(progresso, sessao, conteudo);
    const mudanca = fimDaEdicao(progresso, conteudo)
      ? "Era a última pergunta desta edição. O mural está respondido e a ata, lavrada: a praça fecha o dia."
      : concluiu && sessao.abreLugar === "camara"
        ? "As duas pautas de hoje estão no mural. A corrente da Câmara caiu: ela é a próxima pauta."
        : `A pergunta de ${pauta.autor} ganhou resposta no mural. ${objetivoDeAgora(progresso, conteudo)}`;
    return (
      <Janela id="mural" titulo="Nota fixada no mural" sobre={`Pergunta de ${pauta.autor}`} onFechar={onFechar}>
        {nota !== null && (
          <div className="space-y-4" data-nota-fixada={pauta.id}>
            <blockquote className="border-l-2 border-line-strong pl-3 text-ink-soft">{pauta.pergunta}</blockquote>
            <dl className="rounded-md border border-line bg-raised p-4">
              <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Documento</dt>
              <dd className="font-serif text-xl">{nota.documento.titulo}</dd>
              {nota.linhas.map((linha) => (
                <div key={linha.rotulo} className="mt-2">
                  <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{linha.rotulo}</dt>
                  <dd className="leading-snug">{linha.valor}</dd>
                </div>
              ))}
              {nota.itens.length > 0 && (
                <div className="mt-2">
                  <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">O que ficou de fora</dt>
                  <dd>
                    <ul className="list-disc space-y-1 pl-5 leading-snug" data-dispositivos>
                      {nota.itens.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
            <details className="rounded-md border border-line bg-sunken p-3 text-sm" data-fontes-da-nota>
              <summary className="cursor-pointer font-medium">Fontes do documento ({nota.fontes.length})</summary>
              <ul className="mt-2 space-y-2">
                {nota.fontes.map((fonte) => (
                  <li key={fonte.id + fonte.localizacao}>
                    <a href={fonte.url} className="underline" rel="noopener noreferrer" target="_blank">
                      {fonte.titulo}
                    </a>
                    <span className="block text-ink-soft">
                      {fonte.autoria} · {fonte.localizacao}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
            {vista.recem && (
              <p className="rounded-md border border-ink bg-raised px-3 py-2 font-medium" data-mudanca>
                {mudanca}
              </p>
            )}
            <button type="button" onClick={() => setVista({ modo: "lista" })} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper" data-voltar-ao-mural>
              Voltar ao mural
            </button>
          </div>
        )}
      </Janela>
    );
  }

  if (vista.modo === "pauta") {
    const pauta = pautaDe(vista.pauta);
    const situacao = situacaoDaPauta(progresso, pauta.id);
    return (
      <Janela id="mural" titulo={pauta.autor} sobre="Pergunta pregada no mural" onFechar={onFechar}>
        <div className="space-y-4" data-pauta={pauta.id} data-situacao={situacao}>
          <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
          <p className="text-sm text-ink-soft">Sobre {conteudo.pessoas[pauta.pessoa].nome}. Morador fictício; a pergunta só pergunta o que um documento publicado responde.</p>
          {situacao === "fechada" && (
            <button type="button" onClick={() => onProgresso((atual) => abrirPauta(atual, pauta.id))} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper" data-aceitar>
              Aceitar a pauta
            </button>
          )}
          {situacao === "aberta" && (
            <div className="space-y-2">
              <p className="text-sm">Pauta aceita. {pauta.objetivo} Quando tiver as cópias, monte a nota aqui.</p>
              <button type="button" onClick={() => setVista({ modo: "montar", pauta: pauta.id })} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper" data-montar>
                Montar a nota
              </button>
            </div>
          )}
          {situacao === "publicada" && (
            <button type="button" onClick={() => setVista({ modo: "fixada", pauta: pauta.id, recem: false })} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper" data-ler-nota>
              Ler a nota fixada
            </button>
          )}
          <button type="button" onClick={() => setVista({ modo: "lista" })} className="block text-sm underline" data-voltar-ao-mural>
            Voltar ao mural
          </button>
        </div>
      </Janela>
    );
  }

  // As perguntas pregadas: as das sessões abertas, a mais nova primeiro. Com uma sessão só, sem título de sessão.
  const sessoes = [...sessoesAbertas(progresso, conteudo)].reverse();
  return (
    <Janela id="mural" titulo="Mural da praça" sobre="Perguntas dos moradores" onFechar={onFechar}>
      <p className="text-sm text-ink-soft">Quem responde prega o documento junto. Toque em uma pergunta.</p>
      {sessoes.map((sessao) => (
        <section key={sessao.id} className="mt-3" aria-label={sessao.titulo} data-sessao-do-mural={sessao.id}>
          {sessoes.length > 1 && <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{sessao.titulo}</h3>}
          <ul className="mt-2 grid gap-2">
            {pautasDaSessao(sessao, conteudo).map((pauta) => {
              const situacao = situacaoDaPauta(progresso, pauta.id);
              return (
                <li key={pauta.id}>
                  <button
                    type="button"
                    onClick={() => setVista({ modo: "pauta", pauta: pauta.id })}
                    className="w-full rounded-xl border-2 border-line-strong bg-raised px-4 py-3 text-left"
                    data-abrir-pauta={pauta.id}
                    data-situacao={situacao}
                  >
                    <span className="block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                      {pauta.autor} · {situacao === "publicada" ? "respondida" : situacao === "aberta" ? "pauta aceita" : "sem resposta"}
                    </span>
                    <span className="mt-1 block leading-snug">{pauta.pergunta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Janela>
  );
}

function MontarNota({
  pauta,
  conteudo,
  progresso,
  onFixar,
  onVoltar,
}: {
  pauta: Pauta;
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onFixar: (nota: Nota) => Fixacao;
  onVoltar: () => void;
}) {
  const opcoes = useMemo(() => opcoesDaNota(progresso, conteudo.documentos), [progresso, conteudo.documentos]);
  const [nota, setNota] = useState<Partial<Nota>>({});
  const [erros, setErros] = useState<Fixacao["erros"]>([]);
  const completa = nota.documento !== undefined && nota.quando !== undefined && nota.registro !== undefined;
  const tentativas = progresso.pautas[pauta.id]?.tentativas ?? 0;
  if (progresso.copias.length === 0) {
    return (
      <div className="space-y-3">
        <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
        <p data-sem-copias>Você ainda não levou nenhuma cópia do arquivo. O Escrivão guarda as gavetas, por pessoa e por ano, no sobrado azul.</p>
        <button type="button" onClick={onVoltar} className="text-sm underline">
          Voltar
        </button>
      </div>
    );
  }
  const campo = (chave: keyof Nota, titulo: string, lista: { chave: string; texto: string }[]) => (
    <fieldset className="rounded-md border border-line bg-raised p-3" data-campo-da-nota={chave}>
      <legend className="px-1 text-sm font-semibold">{titulo}</legend>
      <div className="grid gap-1.5">
        {lista.map((opcao) => (
          <label key={opcao.chave} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 leading-snug ${nota[chave] === opcao.chave ? "border-ink bg-sunken" : "border-line"}`}>
            <input
              type="radio"
              name={`nota-${chave}`}
              value={opcao.chave}
              checked={nota[chave] === opcao.chave}
              onChange={() => setNota((atual) => ({ ...atual, [chave]: opcao.chave }))}
              className="mt-1"
              data-opcao={`${chave}:${opcao.chave}`}
            />
            <span>{opcao.texto}</span>
          </label>
        ))}
      </div>
      {erros.some((erro) => erro.campo === chave) && (
        <p className="mt-2 text-sm font-medium" data-erro-campo={chave}>
          {erros.find((erro) => erro.campo === chave)!.mensagem}
        </p>
      )}
    </fieldset>
  );
  return (
    <form
      className="space-y-3"
      data-montar-nota={pauta.id}
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!completa) return;
        const resultado = onFixar(nota as Nota);
        setErros(resultado.erros);
      }}
    >
      <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
      <p className="text-sm text-ink-soft">As opções vêm só das cópias que você levou. Escolha o documento, a data e o que ele registra.</p>
      {campo("documento", "Qual documento responde?", opcoes.documento)}
      {campo("quando", "Quando?", opcoes.quando)}
      {campo("registro", "O que ele registra?", opcoes.registro)}
      {erros.length > 0 && (
        <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-nota-recusada>
          O Teodoro arrancaria essa: a nota não bate com o documento. Veja o que cada campo diz e tente de novo. Tentativas: {tentativas}.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!completa} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper disabled:bg-ink-faint" data-fixar>
          Fixar no mural
        </button>
        <button type="button" onClick={onVoltar} className="text-sm underline">
          Voltar
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Banca: Teodoro e os recortes
// ---------------------------------------------------------------------------

function Banca({
  conteudo,
  progresso,
  onProgresso,
  onFechar,
}: {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
  onFechar: () => void;
}) {
  const [aba, setAba] = useState<"teodoro" | "recortes">(() => (progresso.marcas.includes(`conversa:${conversaDe("teodoro", progresso, conteudo).chave}`) ? "recortes" : "teodoro"));
  const [filtro, setFiltro] = useState<string>("todos");
  const recortes = conteudo.recortes.filter((recorte) => filtro === "todos" || recorte.pessoa === filtro || recorte.pessoa === "ambas");
  return (
    <Janela id="banca" titulo="Banca do Teodoro" sobre="Recortes de jornal, por data" onFechar={onFechar}>
      <div className="mb-3 flex gap-2" role="tablist">
        {(["teodoro", "recortes"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${aba === id ? "border-ink bg-ink text-paper" : "border-line-strong"}`}
            data-aba={id}
          >
            {id === "teodoro" ? "Teodoro" : "Recortes"}
          </button>
        ))}
      </div>
      {aba === "teodoro" ? (
        <Conversa morador="teodoro" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("recortes")} rotuloDoFim="Ver os recortes" />
      ) : (
        <div className="space-y-3" data-recortes>
          <p className="text-sm text-ink-soft">Cada recorte é um acontecimento do atlas, com a data registrada. Recorte diz o que aconteceu; o voto fica no arquivo.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "todos", nome: "Todos" },
              ...Object.entries(conteudo.pessoas).map(([id, pessoa]) => ({
                id,
                nome: pessoa.nome,
              })),
            ].map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setFiltro(opcao.id)}
                aria-pressed={filtro === opcao.id}
                className={`rounded-md border px-3 py-1 text-sm ${filtro === opcao.id ? "border-ink bg-sunken" : "border-line"}`}
                data-filtro={opcao.id}
              >
                {opcao.nome}
              </button>
            ))}
          </div>
          <ul className="divide-y divide-line">
            {recortes.map((recorte) => (
              <li key={recorte.id} className="flex flex-wrap items-baseline gap-x-3 py-2" data-recorte={recorte.id}>
                <span className="font-mono text-sm text-ink-soft">{formatDate(recorte.data)}</span>
                <Link href={`/acontecimentos/${recorte.slug}/`} target="_blank" rel="noopener noreferrer" className="underline">
                  {recorte.titulo}
                </Link>
                {recorte.pessoa !== "ambas" && <span className="text-xs text-ink-soft">{conteudo.pessoas[recorte.pessoa].nome}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Janela>
  );
}

// ---------------------------------------------------------------------------
// Arquivo: o Escrivão e as gavetas
// ---------------------------------------------------------------------------

function Arquivo({
  conteudo,
  progresso,
  onProgresso,
  onFechar,
}: {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
  onFechar: () => void;
}) {
  const [aba, setAba] = useState<"escrivao" | "gavetas">(() => (progresso.marcas.includes(`conversa:${conversaDe("escrivao", progresso, conteudo).chave}`) ? "gavetas" : "escrivao"));
  const [gavetaAbertaId, setGaveta] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [lendo, setLendo] = useState<string | null>(null);
  const gaveta = conteudo.gavetas.find((item) => item.id === gavetaAbertaId) ?? null;

  const abrirGaveta = (alvo: Gaveta) => {
    if (!gavetaAberta(alvo, progresso)) {
      setAviso(`A gaveta ${alvo.rotulo} está trancada. O Escrivão perdeu a chave de novo, e deixou um bilhete para quem a tem.`);
      return;
    }
    setAviso(null);
    setGaveta(alvo.id);
  };

  return (
    <Janela id="arquivo" titulo="Arquivo" sobre="Gavetas por pessoa e por ano" onFechar={onFechar}>
      <div className="mb-3 flex gap-2" role="tablist">
        {(["escrivao", "gavetas"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${aba === id ? "border-ink bg-ink text-paper" : "border-line-strong"}`}
            data-aba={id}
          >
            {id === "escrivao" ? "Escrivão" : "Gavetas"}
          </button>
        ))}
      </div>
      {aba === "escrivao" && <Conversa morador="escrivao" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("gavetas")} rotuloDoFim="Abrir as gavetas" />}
      {aba === "gavetas" && gaveta === null && (
        <div className="space-y-4" data-gavetas>
          {aviso !== null && (
            <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-aviso-da-gaveta>
              {aviso}
            </p>
          )}
          {Object.entries(conteudo.pessoas).map(([slug, pessoa]) => (
            <section key={slug} aria-label={pessoa.nome}>
              <h3 className="font-serif text-xl">{pessoa.nome}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {conteudo.gavetas
                  .filter((item) => item.pessoa === slug)
                  .map((item) => {
                    const aberta = gavetaAberta(item, progresso);
                    const levadas = item.documentos.filter((id) => progresso.copias.includes(id)).length;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => abrirGaveta(item)}
                        className={`rounded-md border-2 px-3 py-2 text-left text-sm ${aberta ? "border-line-strong bg-raised" : "border-dashed border-line text-ink-soft"}`}
                        data-gaveta={item.id}
                        data-trancada={!aberta}
                      >
                        <span className="block font-medium">{item.rotulo}</span>
                        <span className="block text-xs text-ink-soft">
                          {aberta
                            ? `${item.documentos.length} ${item.documentos.length === 1 ? "documento" : "documentos"}${levadas > 0 ? ` · ${levadas} cópia${levadas > 1 ? "s" : ""}` : ""}`
                            : "trancada"}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
      {aba === "gavetas" && gaveta !== null && (
        <div className="space-y-3" data-gaveta-aberta={gaveta.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-serif text-xl">
              Gaveta {gaveta.rotulo} · {conteudo.pessoas[gaveta.pessoa].nome}
            </h3>
            <button type="button" onClick={() => setGaveta(null)} className="text-sm underline" data-voltar-as-gavetas>
              Voltar às gavetas
            </button>
          </div>
          <ul className="space-y-2">
            {gaveta.documentos.map((id) => {
              const documento = conteudo.documentos[id]!;
              const levada = progresso.copias.includes(id);
              const aberto = lendo === id;
              return (
                <li key={id} className="rounded-xl border border-line-strong bg-raised p-3" data-documento={id} data-copia={levada}>
                  <p className="font-medium leading-snug">{documento.titulo}</p>
                  <p className="text-sm text-ink-soft">{formatDate(documento.data)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLendo(aberto ? null : id)}
                      aria-expanded={aberto}
                      className="rounded-md border border-line-strong px-3 py-1.5 text-sm"
                      data-abrir-documento={id}
                    >
                      {aberto ? "Fechar" : "Ler"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onProgresso((atual) => (levada ? devolverCopia(atual, id) : levarCopia(atual, id, conteudo.gavetas)))}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium ${levada ? "border-line" : "border-ink bg-ink text-paper"}`}
                      data-levar={levada ? undefined : id}
                      data-devolver={levada ? id : undefined}
                    >
                      {levada ? "Devolver a cópia" : "Levar uma cópia"}
                    </button>
                  </div>
                  {aberto && <CamposDoDocumento documento={documento} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Janela>
  );
}

function CamposDoDocumento({ documento }: { documento: Documento }) {
  return (
    <dl className="mt-3 grid gap-2 border-t border-line pt-3 text-sm" data-campos>
      {documentFields(documento).map((campo) => (
        <div key={campo.campo} data-campo={campo.campo}>
          <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{campo.rotulo}</dt>
          <dd className="leading-snug">{campo.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Câmara e caderno
// ---------------------------------------------------------------------------

function Camara({
  conteudo,
  progresso,
  onProgresso,
  onFechar,
}: {
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
  onFechar: () => void;
}) {
  const aberta = camaraAberta(progresso, conteudo);
  const sessao = conteudo.sessoes.find((item) => item.abreLugar === "camara") ?? null;
  const anterior = sessao === null || sessao.abreCom === null ? null : (conteudo.sessoes.find((item) => item.id === sessao.abreCom) ?? null);
  const pendentes = anterior === null ? [] : pautasPendentes(progresso, pautasDaSessao(anterior, conteudo));
  const materia = sessao === null ? null : materiaDaSessao(sessao, conteudo);
  const [aba, setAba] = useState<"lourdes" | "mesa">(() => (progresso.marcas.includes(`conversa:${conversaDe("lourdes", progresso, conteudo).chave}`) ? "mesa" : "lourdes"));
  if (!aberta) {
    return (
      <Janela id="camara" titulo="Câmara fechada" sobre="Próxima pauta" onFechar={onFechar}>
        <div className="space-y-3" data-camara="fechada">
          <p>A porta tem uma corrente. Abre quando as duas primeiras pautas estiverem no mural, com os documentos pregados.</p>
          <ul className="list-disc space-y-1 pl-5 text-sm" data-pendentes>
            {pendentes.map((pauta) => (
              <li key={pauta.id}>
                Falta a pergunta de {pauta.autor}: {pauta.objetivo}
              </li>
            ))}
          </ul>
        </div>
      </Janela>
    );
  }
  return (
    <Janela id="camara" titulo="Câmara" sobre="A sessão de hoje" onFechar={onFechar}>
      <div data-camara="aberta">
        <div className="mb-3 flex gap-2" role="tablist">
          {(["lourdes", "mesa"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${aba === id ? "border-ink bg-ink text-paper" : "border-line-strong"}`}
              data-aba={id}
            >
              {id === "lourdes" ? "Lourdes" : "Mesa"}
            </button>
          ))}
        </div>
        {aba === "lourdes" && <Conversa morador="lourdes" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("mesa")} rotuloDoFim="Ir à mesa" />}
        {aba === "mesa" &&
          (sessao === null || materia === null ? (
            <p data-sem-materia>Nenhuma matéria na mesa nesta edição.</p>
          ) : (
            <Mesa sessao={sessao} materia={materia} conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} />
          ))}
      </div>
    </Janela>
  );
}

/** A mesa da Câmara: a matéria da sessão, a credencial que a mesa pede, a ata montada com dois documentos e a ata lavrada. */
function Mesa({
  sessao,
  materia,
  conteudo,
  progresso,
  onProgresso,
}: {
  sessao: Sessao;
  materia: Materia;
  conteudo: ConteudoDaPraca;
  progresso: ProgressoDaPraca;
  onProgresso: (atualizar: (atual: ProgressoDaPraca) => ProgressoDaPraca) => void;
}) {
  const situacao = situacaoDaMateria(progresso, materia.id);
  const credencial = temItem(progresso, sessao.portao.item);
  const [recem, setRecem] = useState(false);
  const [ata, setAta] = useState<Record<string, { documento?: string; registro?: string }>>({});
  const [erros, setErros] = useState<Lavratura["erros"]>([]);
  const opcoes = useMemo(() => opcoesDaNota(progresso, conteudo.documentos), [progresso, conteudo.documentos]);
  const completa = materia.lados.every((lado) => ata[lado.id]?.documento !== undefined && ata[lado.id]?.registro !== undefined);
  const tentativas = progresso.atas[materia.id]?.tentativas ?? 0;

  if (situacao === "publicada") {
    const lavrada = ataLavrada(materia, conteudo.documentos);
    if (lavrada === null) return null;
    const mudanca = fimDaEdicao(progresso, conteudo)
      ? "A ata está no quadro da Câmara, e o mural está respondido: as pautas desta edição acabaram."
      : `A ata está no quadro de avisos da Câmara. ${objetivoDeAgora(progresso, conteudo)}`;
    return (
      <div className="space-y-4" data-ata-lavrada={materia.id}>
        <h3 className="font-serif text-xl leading-snug">{materia.titulo}</h3>
        <blockquote className="border-l-2 border-line-strong pl-3 text-sm text-ink-soft">{materia.pergunta}</blockquote>
        {lavrada.proposicao !== null && (
          <p className="text-sm" data-materia-proposicao>
            <strong>Matéria:</strong> {lavrada.proposicao.identificacao}. {lavrada.proposicao.ementa}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {lavrada.lados.map((lado) => (
            <section key={lado.lado.id} className="rounded-md border border-line bg-raised p-3" aria-label={lado.lado.rotulo} data-lado-da-ata={lado.lado.id}>
              <h4 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                {lado.lado.rotulo} · {conteudo.pessoas[lado.lado.pessoa].nome}
              </h4>
              <DocumentoNaParede exposto={lado} />
            </section>
          ))}
        </div>
        <p className="rounded-md border border-line bg-sunken px-3 py-2 text-sm text-ink-soft" data-aviso-da-ata>
          Cada coluna diz o que o seu documento registra. A ata não compara posições: um voto no texto de um projeto e um veto a dispositivos da lei são atos diferentes, sobre textos diferentes da mesma
          matéria.
        </p>
        {recem && (
          <p className="rounded-md border border-ink bg-raised px-3 py-2 font-medium" data-mudanca>
            {mudanca}
          </p>
        )}
        <Link href="/comparar/#decisoes" className="inline-block rounded-md border border-line-strong px-5 py-2.5 no-underline" data-ver-no-atlas>
          Ver as decisões das duas pessoas no atlas
        </Link>
      </div>
    );
  }

  const campo = (lado: Materia["lados"][number], chave: "documento" | "registro", titulo: string, lista: { chave: string; texto: string }[]) => (
    <fieldset className="rounded-md border border-line bg-raised p-3" data-campo-da-ata={`${lado.id}:${chave}`}>
      <legend className="px-1 text-sm font-semibold">{titulo}</legend>
      <div className="grid gap-1.5">
        {lista.map((opcao) => (
          <label key={opcao.chave} className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 leading-snug ${ata[lado.id]?.[chave] === opcao.chave ? "border-ink bg-sunken" : "border-line"}`}>
            <input
              type="radio"
              name={`ata-${lado.id}-${chave}`}
              value={opcao.chave}
              checked={ata[lado.id]?.[chave] === opcao.chave}
              onChange={() => setAta((atual) => ({ ...atual, [lado.id]: { ...atual[lado.id], [chave]: opcao.chave } }))}
              className="mt-1"
              data-opcao={`${lado.id}:${chave}:${opcao.chave}`}
            />
            <span>{opcao.texto}</span>
          </label>
        ))}
      </div>
      {erros.some((erro) => erro.lado === lado.id && erro.campo === chave) && (
        <p className="mt-2 text-sm font-medium" data-erro-da-ata={`${lado.id}:${chave}`}>
          {erros.find((erro) => erro.lado === lado.id && erro.campo === chave)!.mensagem}
        </p>
      )}
    </fieldset>
  );

  return (
    <div className="space-y-4" data-mesa={materia.id} data-situacao={situacao}>
      <h3 className="font-serif text-xl leading-snug">{materia.titulo}</h3>
      <p className="leading-snug">{materia.pergunta}</p>
      <p className="text-sm text-ink-soft">A mesa e a sessão são ficção. Os dois documentos são registros publicados neste atlas, um de cada pessoa, sobre a mesma proposição.</p>
      {situacao === "fechada" && (
        <button type="button" onClick={() => onProgresso((atual) => abrirMateria(atual, materia.id))} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper" data-aceitar-materia>
          Pôr a matéria na pauta
        </button>
      )}
      {situacao === "aberta" && !credencial && (
        <p className="rounded-md border border-line-strong bg-sunken px-3 py-2" data-sem-credencial>
          A mesa de imprensa pede a {ITENS[sessao.portao.item].nome.toLowerCase()}. A Lourdes sabe onde ela está.
        </p>
      )}
      {situacao === "aberta" && credencial && progresso.copias.length === 0 && (
        <p data-sem-copias>Você ainda não levou nenhuma cópia do arquivo. A matéria deixou papel em duas gavetas, de pessoas diferentes.</p>
      )}
      {situacao === "aberta" && credencial && progresso.copias.length > 0 && (
        <form
          className="space-y-3"
          data-lavrar-ata={materia.id}
          onSubmit={(evento) => {
            evento.preventDefault();
            if (!completa) return;
            const resultado = lavrarAta(progresso, materia, Object.fromEntries(materia.lados.map((lado) => [lado.id, { documento: ata[lado.id]!.documento!, registro: ata[lado.id]!.registro! }])), conteudo.documentos);
            onProgresso(() => resultado.progresso);
            setErros(resultado.erros);
            if (resultado.certo) setRecem(true);
          }}
        >
          <p className="text-sm text-ink-soft">As opções vêm só das cópias que você levou. Para cada lado, escolha o documento e o que ele registra.</p>
          {materia.lados.map((lado) => (
            <div key={lado.id} className="space-y-2" data-lado={lado.id}>
              <h4 className="font-semibold">
                {lado.rotulo} · {conteudo.pessoas[lado.pessoa].nome}
              </h4>
              {campo(lado, "documento", "Qual documento?", opcoes.documento)}
              {campo(lado, "registro", "O que ele registra?", opcoes.registro)}
            </div>
          ))}
          {erros.length > 0 && (
            <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-ata-recusada>
              A Lourdes não lavra essa: a ata não bate com os documentos. Veja o que cada lado diz e tente de novo. Tentativas: {tentativas}.
            </p>
          )}
          <button type="submit" disabled={!completa} className="rounded-md bg-ink px-5 py-2.5 font-semibold text-paper disabled:bg-ink-faint" data-lavrar>
            Lavrar a ata
          </button>
        </form>
      )}
    </div>
  );
}

/** Um documento como fica pregado: o título, as linhas, o que ficou de fora e as fontes, dobradas. Serve à nota do mural e a cada lado da ata. */
function DocumentoNaParede({ exposto }: { exposto: DocumentoExposto }) {
  return (
    <>
      <dl className="mt-2">
        <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Documento</dt>
        <dd className="font-serif text-lg leading-snug">{exposto.documento.titulo}</dd>
        {exposto.linhas.map((linha) => (
          <div key={linha.rotulo} className="mt-2">
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">{linha.rotulo}</dt>
            <dd className="text-sm leading-snug">{linha.valor}</dd>
          </div>
        ))}
        {exposto.itens.length > 0 && (
          <div className="mt-2">
            <dt className="text-xs font-semibold tracking-wide text-ink-soft uppercase">O que ficou de fora</dt>
            <dd>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-snug" data-dispositivos>
                {exposto.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <details className="mt-3 rounded-md border border-line bg-sunken p-3 text-sm" data-fontes-da-nota>
        <summary className="cursor-pointer font-medium">Fontes do documento ({exposto.fontes.length})</summary>
        <ul className="mt-2 space-y-2">
          {exposto.fontes.map((fonte) => (
            <li key={fonte.id + fonte.localizacao}>
              <a href={fonte.url} className="underline" rel="noopener noreferrer" target="_blank">
                {fonte.titulo}
              </a>
              <span className="block text-ink-soft">
                {fonte.autoria} · {fonte.localizacao}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

function Caderno({ conteudo, progresso, onFechar, onRecomecar }: { conteudo: ConteudoDaPraca; progresso: ProgressoDaPraca; onFechar: () => void; onRecomecar: () => void }) {
  const [confirmando, setConfirmando] = useState(false);
  const [lendo, setLendo] = useState<string | null>(null);
  return (
    <Janela id="caderno" titulo="Caderno" sobre="O que você tem" onFechar={onFechar}>
      <div className="space-y-4">
        <section>
          <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Pauta de agora</h3>
          <p className="font-medium">{objetivoDeAgora(progresso, conteudo)}</p>
        </section>
        <section>
          <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Pautas</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {pautasDisponiveis(progresso, conteudo).map((pauta) => (
              <li key={pauta.id} data-caderno-pauta={pauta.id} data-situacao={situacaoDaPauta(progresso, pauta.id)}>
                {pauta.autor}: {situacaoDaPauta(progresso, pauta.id) === "publicada" ? "respondida no mural" : situacaoDaPauta(progresso, pauta.id) === "aberta" ? "aceita" : "sem resposta"}
              </li>
            ))}
            {camaraAberta(progresso, conteudo) &&
              conteudo.materias.map((materia) => (
                <li key={materia.id} data-caderno-materia={materia.id} data-situacao={situacaoDaMateria(progresso, materia.id)}>
                  Mesa da Câmara, {materia.titulo.charAt(0).toLowerCase() + materia.titulo.slice(1)}:{" "}
                  {situacaoDaMateria(progresso, materia.id) === "publicada" ? "ata lavrada" : situacaoDaMateria(progresso, materia.id) === "aberta" ? "na pauta" : "sem ata"}
                </li>
              ))}
          </ul>
        </section>
        <section>
          <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Itens</h3>
          {progresso.itens.length === 0 ? (
            <p className="text-sm text-ink-soft">Nada ainda.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {progresso.itens.map((item) => (
                <li key={item} data-caderno-item={item}>
                  <strong>{ITENS[item].nome}.</strong> {ITENS[item].descricao}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3 className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Cópias do arquivo</h3>
          {progresso.copias.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma cópia. O arquivo é o sobrado azul.</p>
          ) : (
            <ul className="mt-1 space-y-2 text-sm">
              {progresso.copias.map((id) => {
                const documento = conteudo.documentos[id]!;
                return (
                  <li key={id} className="rounded-md border border-line bg-raised p-2" data-caderno-copia={id}>
                    <button type="button" onClick={() => setLendo(lendo === id ? null : id)} aria-expanded={lendo === id} className="text-left font-medium underline">
                      {documento.titulo}
                    </button>
                    <span className="block text-ink-soft">{formatDate(documento.data)}</span>
                    {lendo === id && <CamposDoDocumento documento={documento} />}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="border-t border-line pt-3 text-sm">
          {confirmando ? (
            <div className="space-y-2">
              <p>Isso apaga o progresso da praça neste navegador.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRecomecar();
                    onFechar();
                  }}
                  className="rounded-md border border-ink px-3 py-1.5 font-medium"
                  data-apagar
                >
                  Apagar e começar de novo
                </button>
                <button type="button" onClick={() => setConfirmando(false)} className="rounded-md border border-line px-3 py-1.5">
                  Manter
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmando(true)} className="underline" data-recomecar>
              Começar de novo
            </button>
          )}
        </section>
      </div>
    </Janela>
  );
}

// ---------------------------------------------------------------------------
// Sem a cena: a lista dos lugares
// ---------------------------------------------------------------------------

function ListaDaPraca({ lugares, bilheteNoChao, onAbrir }: { lugares: ReturnType<typeof lugaresDeAgora>; bilheteNoChao: boolean; onAbrir: (id: PontoId) => void }) {
  return (
    <div className="page space-y-4 overflow-y-auto py-28">
      <p className="text-ink-soft">Este navegador não mostrou a cena 3D. Os lugares da praça estão aqui como lista, com o mesmo conteúdo.</p>
      <ul className="grid gap-2 sm:grid-cols-2" data-lista-da-praca>
        {lugares.map((lugar) => (
          <li key={lugar.id}>
            <button type="button" onClick={() => onAbrir(lugar.id as LugarId)} className="w-full rounded-md border border-line-strong bg-raised px-4 py-3 text-left" data-lugar={lugar.id}>
              <span className="block font-medium">
                {lugar.nome}
                {lugar.trancado ? " · fechada" : ""}
              </span>
              <span className="block text-sm text-ink-soft">{lugar.funcao}</span>
            </button>
          </li>
        ))}
        {bilheteNoChao && (
          <li>
            <button type="button" onClick={() => onAbrir("bilhete")} className="w-full rounded-md border border-dashed border-line-strong bg-raised px-4 py-3 text-left" data-lugar="bilhete">
              <span className="block font-medium">Um papel no chão, perto do coreto</span>
              <span className="block text-sm text-ink-soft">Olhar o que é.</span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Joystick (o mesmo desenho da Cidade do Voto)
// ---------------------------------------------------------------------------

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
      data-joystick
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
      <div
        className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-ink/70 shadow"
        style={{
          transform: `translate(calc(-50% + ${ponta.x}px), calc(-50% + ${ponta.y}px))`,
        }}
      />
    </div>
  );
}
