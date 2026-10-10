"use client";

// A casca do jogo de um personagem: junta o progresso salvo, o capítulo
// aberto, a cena, os diálogos e o painel. É quem decide o que acontece com
// uma interação e quando um capítulo termina; a cena só anda e desenha.
//
// A saída de um capítulo abre com a tarefa cumprida e todos os registros
// recolhidos (`isExitOpen`). A tarefa cumprida sozinha não abre a porta.
//
// O HTML do build sai sem a cena (o palco é carregado só no navegador) e com
// o estado inicial; o progresso guardado entra depois da hidratação.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { playableChapters } from "@/lib/game/content";
import { relatedRecords } from "@/lib/game/judicial";
import {
  collect,
  isAnswerPending,
  isExitOpen,
  isTaskDone,
  missingRecords,
  placeOptions,
  sourceOptions,
  submitOrder,
  submitPlace,
  submitSource,
  type Attempt,
} from "@/lib/game/mission";
import { chapterStatus, completeChapter, currentChapter, taskStateOf, withTaskState } from "@/lib/game/progress";
import { getScene } from "@/lib/game/scenes";
import type { ChapterSpec, GameContent, Interactable, PersonagemSlug } from "@/lib/game/types";

import type { GameStageHandle } from "./GameStage";
import { useCoarsePointer, useGameProgress, useMotion, useWindowActive } from "./hooks";
import { ChapterPanel } from "./ui/ChapterPanel";
import { primaryButton } from "./ui/Dialog";
import { ChapterTransition, ChoiceDialog, ClosedExitDialog, ConfirmResetDialog, EndScreen, GuideDialog, OrderDialog, RecordDialog } from "./ui/dialogs";
import { Hud, reachLabel } from "./ui/Hud";
import type { ExitState } from "./ui/saida";
import { StageBoundary } from "./ui/StageBoundary";
import { TouchControls } from "./ui/TouchControls";

// O palco (canvas, laço, entrada) fica em um pacote à parte, pedido só nesta página.
const GameStage = dynamic(() => import("./GameStage").then((modulo) => ({ default: modulo.GameStage })), {
  ssr: false,
  loading: () => (
    <StageNotice>
      <p className="map-loading text-sm text-ink-soft">Carregando a cena…</p>
    </StageNotice>
  ),
});

function StageNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunken p-6 text-center" role="status">
      {children}
    </div>
  );
}

/** O pacote do palco não chegou: o painel continua valendo, e recarregar tenta de novo. */
function StageFailure() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunken p-6 text-center" role="alert" data-palco="falhou">
      <p className="max-w-md font-serif text-xl font-medium leading-snug">A cena não carregou</p>
      <p className="max-w-md text-sm text-ink-soft">
        Pode ter sido a conexão. O painel Capítulos e tarefas continua funcionando: dá para cumprir as tarefas por ele, sem o
        cenário.
      </p>
      <button type="button" className={primaryButton} onClick={() => window.location.reload()}>
        Recarregar a página
      </button>
    </div>
  );
}

type Modo = "jogando" | "registro" | "ordem" | "escolha" | "guia" | "saida-fechada" | "painel" | "reiniciar" | "transicao" | "fim";

interface Transicao {
  concluido: ChapterSpec;
  proximo: ChapterSpec | null;
}

/**
 * O capítulo que estava aberto quando a pessoa saiu do jogo para a ficha de um
 * registro, nesta página: ao voltar, pela navegação do site, ela reencontra o
 * capítulo que estava revendo. Vale para uma volta só. Não é progresso, e não
 * vai ao endereço nem ao navegador.
 */
const OPEN_CHAPTER = new Map<PersonagemSlug, string>();

export function GameShell({ content }: { content: GameContent }) {
  const slug = content.personagem.slug;
  const capitulos = useMemo(() => playableChapters(content), [content]);
  const { carregado, progresso, duravel, update, reset } = useGameProgress(slug, capitulos);
  const movimento = useMotion();
  const toque = useCoarsePointer();
  const janelaAtiva = useWindowActive();
  const instrucoesId = useId();
  const handle = useRef<GameStageHandle | null>(null);
  const raiz = useRef<HTMLDivElement>(null);

  const [capituloId, setCapituloId] = useState<string | null>(() => OPEN_CHAPTER.get(slug) ?? null);
  const [modo, setModo] = useState<Modo>("jogando");
  const [registroAberto, setRegistroAberto] = useState<string | null>(null);
  // O registro aberto já estava recolhido: foi aberto pelo painel, para ler de novo.
  const [releitura, setReleitura] = useState(false);
  // O registro relido por último: na volta ao painel, o foco fica no botão dele.
  const [focoDoPainel, setFocoDoPainel] = useState<string | null>(null);
  const [alcance, setAlcance] = useState<Interactable | null>(null);
  const [transicao, setTransicao] = useState<Transicao | null>(null);
  // Muda quando a cena tem de recomeçar sem trocar de capítulo: ao reiniciar
  // a trajetória e ao chegar ao fim.
  const [sessao, setSessao] = useState(0);
  // O reinício foi pedido na tela de fim: desistir dele volta a ela.
  const [reinicioDoFim, setReinicioDoFim] = useState(false);

  // O capítulo lembrado serve à volta que acabou de acontecer, e a mais nenhuma.
  useEffect(() => {
    OPEN_CHAPTER.delete(slug);
  }, [slug]);

  // O capítulo aberto: o escolhido no painel, se continua acessível, ou o em que se continua.
  const escolhido = capituloId === null ? undefined : capitulos.find((item) => item.id === capituloId);
  const capitulo =
    (escolhido !== undefined && chapterStatus(progresso, escolhido.id) !== "bloqueado" ? escolhido : undefined) ??
    currentChapter(progresso, capitulos) ??
    capitulos[0]!;
  const cena = getScene(capitulo.cena);
  const tarefa = taskStateOf(progresso, capitulo.id);
  const tarefaConcluida = isTaskDone(capitulo.tarefa, tarefa);
  const respostaPendente = isAnswerPending(capitulo.tarefa, tarefa);
  // A porta: a tarefa cumprida e nenhum registro do capítulo por recolher.
  const saidaAberta = isExitOpen(capitulo, tarefa);
  const saida: ExitState = { tarefaConcluida, faltam: missingRecords(capitulo, tarefa).length, total: capitulo.eventIds.length };
  const ultimo = capitulos.at(-1)?.id === capitulo.id;
  const pausado = modo !== "jogando" || !janelaAtiva;
  // A janela da resposta: a de ordem, ou a de escolha (documento ou lugar).
  const modoDaResposta: Modo = capitulo.tarefa.tipo === "ordem" ? "ordem" : "escolha";

  // Com um diálogo aberto, a cena fica fora da tabulação (`inert`). O foco só
  // pode voltar a ela depois que o diálogo sai do documento: fica pedido aqui
  // e é dado no efeito abaixo. Sem o palco (pacote que não chegou), o foco vai
  // para o botão do painel, que é o caminho que resta.
  const focoPendente = useRef(false);
  const focusStage = useCallback(() => {
    focoPendente.current = true;
  }, []);
  useEffect(() => {
    if (modo !== "jogando" || !focoPendente.current) return;
    focoPendente.current = false;
    if (handle.current !== null) handle.current.focus();
    else raiz.current?.querySelector<HTMLElement>("[data-abrir-painel]")?.focus({ preventScroll: true });
  }, [modo, capituloId, sessao]);
  const voltarAoJogo = useCallback(() => {
    setModo("jogando");
    focusStage();
  }, [focusStage]);

  // Uma tecla segurada desde antes de uma janela abrir ou fechar não age no
  // que veio depois: a repetição do teclado cairia no botão que recebeu o
  // foco (Enter fecharia o registro que acabou de abrir) ou rolaria a página
  // (a seta com que se atravessou a saída). O jogo não passa a ouvir teclas na
  // janela: só a repetição de uma tecla que atravessou uma troca de tela é
  // descartada, até a tecla soltar.
  const modoAtual = useRef(modo);
  useLayoutEffect(() => {
    modoAtual.current = modo;
  }, [modo]);
  useEffect(() => {
    const apertadaEm = new Map<string, Modo>();
    const aoApertar = (evento: KeyboardEvent) => {
      if (!evento.repeat) {
        apertadaEm.set(evento.code, modoAtual.current);
        return;
      }
      const origem = apertadaEm.get(evento.code);
      if (origem !== undefined && origem !== modoAtual.current) {
        evento.preventDefault();
        evento.stopPropagation();
      }
    };
    const aoSoltar = (evento: KeyboardEvent) => {
      apertadaEm.delete(evento.code);
    };
    window.addEventListener("keydown", aoApertar, true);
    window.addEventListener("keyup", aoSoltar, true);
    return () => {
      window.removeEventListener("keydown", aoApertar, true);
      window.removeEventListener("keyup", aoSoltar, true);
    };
  }, []);

  const recolher = useCallback(
    (eventId: string) => {
      update((atual) => withTaskState(atual, capitulo.id, collect(taskStateOf(atual, capitulo.id), eventId)));
      setRegistroAberto(eventId);
      setReleitura(false);
      setModo("registro");
    },
    [update, capitulo.id],
  );

  // Ler de novo um registro já recolhido, pelo painel: o progresso não muda.
  const lerDeNovo = useCallback((eventId: string) => {
    setRegistroAberto(eventId);
    setReleitura(true);
    setModo("registro");
  }, []);

  const fecharRegistro = useCallback(() => {
    setRegistroAberto(null);
    if (releitura) {
      // Quem relia volta ao painel, de onde veio, com o foco no registro que leu.
      setReleitura(false);
      setFocoDoPainel(registroAberto);
      setModo("painel");
      return;
    }
    if (isAnswerPending(capitulo.tarefa, taskStateOf(progresso, capitulo.id))) setModo(modoDaResposta);
    else voltarAoJogo();
  }, [releitura, registroAberto, capitulo, progresso, modoDaResposta, voltarAoJogo]);

  // Abrir o painel pelos botões e pela tecla: o foco começa no rodapé, e não em um registro relido antes.
  const abrirPainel = useCallback(() => {
    setFocoDoPainel(null);
    setModo("painel");
  }, []);

  const abrirResposta = useCallback(() => setModo(modoDaResposta), [modoDaResposta]);

  const responderOrdem = useCallback(
    (resposta: readonly [string, string]): Attempt => {
      if (capitulo.tarefa.tipo !== "ordem") throw new Error("A tarefa deste capítulo não é de ordem.");
      const tarefaDeOrdem = capitulo.tarefa;
      let avaliacao: Attempt | null = null;
      update((atual) => {
        avaliacao = submitOrder(tarefaDeOrdem, taskStateOf(atual, capitulo.id), resposta, content.registros);
        return withTaskState(atual, capitulo.id, avaliacao.estado);
      });
      return avaliacao!;
    },
    [capitulo, update, content.registros],
  );

  // Responder a tarefa de documento ou de lugar com o `id` da opção escolhida.
  const responderEscolha = useCallback(
    (id: string): Attempt => {
      const tarefaDeEscolha = capitulo.tarefa;
      if (tarefaDeEscolha.tipo !== "fonte" && tarefaDeEscolha.tipo !== "lugar") throw new Error("A tarefa deste capítulo não é de escolha.");
      let avaliacao: Attempt | null = null;
      update((atual) => {
        const estado = taskStateOf(atual, capitulo.id);
        avaliacao =
          tarefaDeEscolha.tipo === "fonte"
            ? submitSource(tarefaDeEscolha, estado, capitulo, content.registros, id)
            : submitPlace(tarefaDeEscolha, estado, capitulos, content.registros, id);
        return withTaskState(atual, capitulo.id, avaliacao.estado);
      });
      return avaliacao!;
    },
    [capitulo, capitulos, update, content.registros],
  );

  const atravessar = useCallback(() => {
    // Só se atravessa uma saída aberta: o progresso recusaria, e a transição não pode aparecer sem ele.
    if (!saidaAberta) return;
    const indice = capitulos.findIndex((item) => item.id === capitulo.id);
    const proximo = capitulos[indice + 1] ?? null;
    update((atual) => completeChapter(atual, capitulos, capitulo.id));
    // A cena fica a mesma até a transição terminar.
    setCapituloId(capitulo.id);
    setTransicao({ concluido: capitulo, proximo });
    setModo("transicao");
  }, [saidaAberta, capitulos, capitulo, update]);

  const continuarTransicao = useCallback(() => {
    const proximo = transicao?.proximo ?? null;
    setTransicao(null);
    if (proximo === null) {
      // Fim da trajetória: a cena do último capítulo recomeça por trás da tela
      // de fim, para quem voltar a ela encontrar o personagem no início.
      setSessao((atual) => atual + 1);
      setModo("fim");
      return;
    }
    setCapituloId(proximo.id);
    setModo("jogando");
    focusStage();
  }, [transicao, focusStage]);

  const interagir = useCallback(
    (alvo: Interactable) => {
      if (alvo.tipo === "registro") recolher(alvo.id);
      else if (alvo.tipo === "guia") setModo("guia");
      // A saída aberta ao alcance atravessa, como andar para dentro dela.
      else if (saidaAberta) atravessar();
      else setModo("saida-fechada");
    },
    [recolher, saidaAberta, atravessar],
  );

  const reiniciar = useCallback(() => {
    reset();
    setCapituloId(null);
    setRegistroAberto(null);
    setReleitura(false);
    setTransicao(null);
    setReinicioDoFim(false);
    setSessao((atual) => atual + 1);
    setModo("jogando");
    focusStage();
  }, [reset, focusStage]);

  const desistirDoReinicio = useCallback(() => {
    if (reinicioDoFim) {
      setReinicioDoFim(false);
      setModo("fim");
    } else voltarAoJogo();
  }, [reinicioDoFim, voltarAoJogo]);

  const abrirCapitulo = useCallback(
    (id: string) => {
      if (chapterStatus(progresso, id) === "bloqueado") return;
      setCapituloId(id);
      setModo("jogando");
      focusStage();
    },
    [progresso, focusStage],
  );

  // Ao seguir para a ficha de um registro, o capítulo aberto fica lembrado para a volta.
  const lembrarCapitulo = useCallback(() => {
    OPEN_CHAPTER.set(slug, capitulo.id);
  }, [slug, capitulo.id]);

  const registro = registroAberto === null ? null : (content.registros[registroAberto] ?? null);
  const acao = reachLabel(alcance, saidaAberta);
  // O registro da tarefa de escolha e as opções, que vêm dos próprios registros.
  const escolha = useMemo(() => {
    const t = capitulo.tarefa;
    if (t.tipo === "fonte") return { tipo: t.tipo, registro: content.registros[t.eventId] ?? null, opcoes: sourceOptions(capitulo, content.registros, t.eventId) };
    if (t.tipo === "lugar") return { tipo: t.tipo, registro: content.registros[t.eventId] ?? null, opcoes: placeOptions(capitulos, content.registros, t.eventId) };
    return null;
  }, [capitulo, capitulos, content.registros]);

  return (
    <div
      ref={raiz}
      className="jogo-palco relative overflow-hidden bg-sunken"
      data-jogo={slug}
      data-capitulo={capitulo.id}
      data-cena={cena.id}
      data-epoca={capitulo.epoca}
      data-modo={modo}
      data-tarefa={tarefaConcluida ? "concluida" : "pendente"}
      data-tipo-da-tarefa={capitulo.tarefa.tipo}
      data-saida={saidaAberta ? "aberta" : "fechada"}
      data-registros={`${saida.total - saida.faltam}/${saida.total}`}
      data-carregado={carregado ? "sim" : "nao"}
      data-movimento={movimento ? "ligado" : "reduzido"}
    >
      {/* Com um diálogo aberto, a cena e os botões sobre ela saem da tabulação e da leitura. */}
      <div className="absolute inset-0" inert={modo !== "jogando"} data-cena-e-hud>
        {carregado ? (
          <StageBoundary fallback={<StageFailure />}>
            <GameStage
              handle={handle}
              scene={cena}
              chapter={capitulo}
              personagem={slug}
              sessao={sessao}
              recolhidos={tarefa.recolhidos}
              saidaAberta={saidaAberta}
              pausado={pausado}
              movimento={movimento}
              onInteract={interagir}
              onExit={atravessar}
              onReach={setAlcance}
              onEscape={() => {
                if (modo === "jogando") abrirPainel();
              }}
              describedBy={instrucoesId}
            />
          </StageBoundary>
        ) : (
          <StageNotice>
            <p className="map-loading text-sm text-ink-soft">Carregando o jogo…</p>
            {/* Sem JavaScript a cena não chega. O aviso fica aqui, na primeira tela, e não abaixo do palco. */}
            <noscript>
              <p className="max-w-md text-sm" data-sem-javascript>
                O jogo precisa de JavaScript para desenhar a cena. Os registros destes capítulos estão na{" "}
                <a href={`/politicos/${slug}/`} className="font-medium underline">
                  trajetória de {content.personagem.nome} no atlas
                </a>
                , com data, lugar e fontes.
              </p>
            </noscript>
          </StageNotice>
        )}

        <Hud
          capitulo={capitulo}
          cenaNome={cena.nome}
          // Com uma janela aberta a cena está parada: a dica do alcance, que é do instante em que ela abriu, some.
          alcance={modo === "jogando" ? alcance : null}
          saidaAberta={saidaAberta}
          tarefaConcluida={tarefaConcluida}
          respostaPendente={respostaPendente}
          faltam={saida.faltam}
          ultimo={ultimo}
          toque={toque}
          pausadoPelaJanela={!janelaAtiva && modo === "jogando"}
          instrucoesId={instrucoesId}
          onOpenPanel={abrirPainel}
          onOpenGuide={() => setModo("guia")}
        />

        {toque && modo === "jogando" && (
          <TouchControls onDirection={(dx, dy) => handle.current?.setTouch(dx, dy)} onInteract={() => handle.current?.interact()} acao={acao} />
        )}
      </div>

      {modo === "registro" && registro !== null && (
        <RecordDialog
          registro={registro}
          personagem={slug}
          tipoDaTarefa={capitulo.tarefa.tipo}
          respostaPendente={respostaPendente}
          concluiu={capitulo.tarefa.tipo === "registro" && capitulo.tarefa.eventId === registro.id}
          saida={saida}
          releitura={releitura}
          relacionados={relatedRecords(registro.id, content.registros)}
          onOpenRecordPage={lembrarCapitulo}
          onClose={fecharRegistro}
        />
      )}
      {modo === "ordem" && capitulo.tarefa.tipo === "ordem" && (
        <OrderDialog
          tarefa={capitulo.tarefa}
          registros={content.registros}
          personagem={slug}
          tentativas={tarefa.tentativas}
          saida={saida}
          onSubmit={responderOrdem}
          onClose={voltarAoJogo}
        />
      )}
      {modo === "escolha" && escolha !== null && escolha.registro !== null && (
        <ChoiceDialog
          tipo={escolha.tipo}
          registro={escolha.registro}
          opcoes={escolha.opcoes}
          personagem={slug}
          tentativas={tarefa.tentativas}
          saida={saida}
          onSubmit={responderEscolha}
          onClose={voltarAoJogo}
        />
      )}
      {modo === "guia" && (
        <GuideDialog capitulo={capitulo} saida={saida} respostaPendente={respostaPendente} ultimo={ultimo} onAnswer={abrirResposta} onClose={voltarAoJogo} />
      )}
      {modo === "saida-fechada" && (
        <ClosedExitDialog capitulo={capitulo} saida={saida} respostaPendente={respostaPendente} onAnswer={abrirResposta} onClose={voltarAoJogo} />
      )}
      {modo === "painel" && (
        <ChapterPanel
          content={content}
          capitulos={capitulos}
          progresso={progresso}
          aberto={capitulo}
          duravel={duravel}
          onCollect={recolher}
          onRead={lerDeNovo}
          focoEm={focoDoPainel}
          onAnswer={abrirResposta}
          onCrossExit={atravessar}
          onOpenChapter={abrirCapitulo}
          onReset={() => setModo("reiniciar")}
          onClose={voltarAoJogo}
        />
      )}
      {modo === "reiniciar" && <ConfirmResetDialog nome={content.personagem.nome} onConfirm={reiniciar} onClose={desistirDoReinicio} />}
      {modo === "transicao" && transicao !== null && (
        <ChapterTransition concluido={transicao.concluido} proximo={transicao.proximo} onContinue={continuarTransicao} />
      )}
      {modo === "fim" && (
        <EndScreen
          nome={content.personagem.nome}
          personagem={slug}
          capitulos={capitulos}
          onReview={abrirPainel}
          onReset={() => {
            setReinicioDoFim(true);
            setModo("reiniciar");
          }}
        />
      )}
    </div>
  );
}
