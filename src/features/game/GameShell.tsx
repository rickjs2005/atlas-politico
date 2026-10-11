"use client";

// A casca do jogo de um personagem em uma sala: junta o progresso salvo (de
// todas as salas), o capítulo aberto, a cena, os diálogos, o Escrivão e o
// painel. É quem decide o que acontece com uma interação e quando um capítulo
// termina; a cena só anda e desenha.
//
// A saída de um capítulo abre com a tarefa cumprida e todos os registros
// recolhidos (`isExitOpen`), acontecimentos e decisões. A tarefa cumprida
// sozinha não abre a porta.
//
// O HTML do build sai sem a cena (o palco é carregado só no navegador) e com
// o estado inicial; o progresso guardado entra depois da hidratação.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { formatDate } from "@/lib/domain/dates";
import { INSTITUICAO_LABELS, TIPO_DE_ATO_LABELS } from "@/lib/domain/decisions";
import { documentsOf, playableChapters } from "@/lib/game/content";
import { registrarDitas, selectLines, type DadosDoMomento, type EscrivaoEvent, type FalaDita } from "@/lib/game/escrivao";
import { relatedRecords } from "@/lib/game/judicial";
import {
  collect,
  interpretationOptions,
  isAnswerPending,
  isEvidenceDone,
  isExitOpen,
  isTaskDone,
  manifestationLabel,
  missingRecords,
  placeOptions,
  recordIds,
  sourceOptions,
  submitEvidence,
  submitInterpretation,
  submitOrder,
  submitPlace,
  submitSource,
  type Attempt,
} from "@/lib/game/mission";
import { chapterStatus, completeChapter, currentChapter, taskStateOf, withTaskState } from "@/lib/game/progress";
import { chaptersInRoom, roomOf, roomsWithChapters } from "@/lib/game/rooms";
import { getScene } from "@/lib/game/scenes";
import type { ChapterSpec, GameContent, GameDecision, Interactable, RoomId, TaskState } from "@/lib/game/types";

import type { GameStageHandle } from "./GameStage";
import { useCoarsePointer, useGamePreferences, useGameProgress, useMotion, useWindowActive } from "./hooks";
import { ChapterPanel } from "./ui/ChapterPanel";
import { primaryButton } from "./ui/Dialog";
import {
  ChapterTransition,
  ChoiceDialog,
  ClosedExitDialog,
  ConfirmResetDialog,
  DecisionRecordDialog,
  DecisionTaskDialog,
  EndScreen,
  EscrivaoDialog,
  OrderDialog,
  RecordDialog,
  type AttemptWithLines,
} from "./ui/dialogs";
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

/** O navegador não desenha canvas 2D: a cena não existe, e o painel é o caminho (não é falha de rede: recarregar não resolve). */
function StageUnavailable({ onOpenPanel, slug, nome }: { onOpenPanel(): void; slug: string; nome: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunken p-6 text-center" role="alert" data-palco="sem-canvas">
      <p className="max-w-md font-serif text-xl font-medium leading-snug">O navegador não conseguiu desenhar a cena</p>
      <p className="max-w-md text-sm text-ink-soft">
        Ele não ofereceu o desenho em canvas, que o cenário usa. Os capítulos continuam jogáveis pelo painel Capítulos e tarefas: dá para
        recolher os registros, cumprir as tarefas e abrir a saída por ele, sem o cenário. Os registros também estão na{" "}
        <a href={`/politicos/${slug}/`} className="font-medium underline">
          trajetória de {nome} no atlas
        </a>
        .
      </p>
      {/* O nome não repete "Capítulos e tarefas": o botão do HUD, com esse nome, continua na tela, e dois iguais confundiriam leitor de tela e testes. */}
      <button type="button" className={primaryButton} onClick={onOpenPanel} data-abrir-painel-sem-cena>
        Abrir o painel
      </button>
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

type Modo = "jogando" | "registro" | "ordem" | "escolha" | "decisao" | "guia" | "saida-fechada" | "painel" | "reiniciar" | "transicao" | "fim";

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
const OPEN_CHAPTER = new Map<string, string>();

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Os dados de uma decisão para as falas documentais do Escrivão. */
function dadosDaDecisao(decisao: GameDecision): DadosDoMomento {
  return {
    titulo: decisao.titulo,
    data: formatDate(decisao.data),
    fontes: plural(decisao.fontes.length, "fonte", "fontes"),
    cargo: decisao.cargo?.cargo ?? "cargo não publicado",
    instituicao: INSTITUICAO_LABELS[decisao.instituicao],
    ...(decisao.natureza === "voto" ? { manifestacao: manifestationLabel(decisao), objeto: decisao.votacao.objeto.descricao } : { tipoDoAto: TIPO_DE_ATO_LABELS[decisao.ato.tipo] }),
  };
}

export function GameShell({ content, sala }: { content: GameContent; sala: RoomId }) {
  const slug = content.personagem.slug;
  const salaSpec = roomOf(sala);
  // O progresso é de todas as salas; a navegação, da sala aberta.
  const todos = useMemo(() => playableChapters(content), [content]);
  const capitulos = useMemo(() => chaptersInRoom(todos, sala), [todos, sala]);
  const outrasSalas = useMemo(() => roomsWithChapters(todos).filter((outra) => outra.id !== sala), [todos, sala]);
  const documentos = useMemo(() => documentsOf(content), [content]);
  const { carregado, progresso, duravel, update, reset } = useGameProgress(slug, todos);
  const { preferencias, setHumor } = useGamePreferences();
  const movimento = useMotion();
  const toque = useCoarsePointer();
  const janelaAtiva = useWindowActive();
  const instrucoesId = useId();
  const handle = useRef<GameStageHandle | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const chaveDaVolta = `${slug}:${sala}`;

  const [capituloId, setCapituloId] = useState<string | null>(() => OPEN_CHAPTER.get(chaveDaVolta) ?? null);
  const [modo, setModo] = useState<Modo>("jogando");
  const [registroAberto, setRegistroAberto] = useState<string | null>(null);
  // O registro aberto já estava recolhido: foi aberto pelo painel, para ler de novo.
  const [releitura, setReleitura] = useState(false);
  // O registro relido por último: na volta ao painel, o foco fica no botão dele.
  const [focoDoPainel, setFocoDoPainel] = useState<string | null>(null);
  const [alcance, setAlcance] = useState<Interactable | null>(null);
  const [transicao, setTransicao] = useState<Transicao | null>(null);
  // Muda quando a cena tem de recomeçar sem trocar de capítulo: ao reiniciar
  // o progresso e ao chegar ao fim.
  const [sessao, setSessao] = useState(0);
  // O reinício foi pedido na tela de fim: desistir dele volta a ela.
  const [reinicioDoFim, setReinicioDoFim] = useState(false);

  // O capítulo lembrado serve à volta que acabou de acontecer, e a mais nenhuma.
  useEffect(() => {
    OPEN_CHAPTER.delete(chaveDaVolta);
  }, [chaveDaVolta]);

  // O capítulo aberto: o escolhido no painel, se continua acessível, ou o em que se continua na sala.
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
  const total = recordIds(capitulo).length;
  const saida: ExitState = { tarefaConcluida, faltam: missingRecords(capitulo, tarefa).length, total };
  const ultimo = capitulos.at(-1)?.id === capitulo.id;
  const pausado = modo !== "jogando" || !janelaAtiva;
  // A janela da resposta: a de ordem, a de decisão ou a de escolha (documento ou lugar).
  const modoDaResposta: Modo = capitulo.tarefa.tipo === "ordem" ? "ordem" : capitulo.tarefa.tipo === "decisao" ? "decisao" : "escolha";

  // -------------------------------------------------------------------------
  // O Escrivão: as falas de cada momento, com o histórico do que já foi dito
  // nesta visita (a repetição é controlada por ele, sem sorteio).
  // -------------------------------------------------------------------------
  const vistas = useRef<string[]>([]);
  const falar = useCallback(
    (evento: EscrivaoEvent, dados?: DadosDoMomento): FalaDita[] => {
      const ditas = selectLines({ sala, evento, humor: preferencias.humor, vistas: vistas.current, dados });
      vistas.current = registrarDitas(vistas.current, ditas);
      return ditas;
    },
    [sala, preferencias.humor],
  );
  const dadosDoCapitulo = useCallback(
    (estado: TaskState): DadosDoMomento => ({
      capitulo: capitulo.titulo,
      registros: plural(total, "registro", "registros"),
      periodo: capitulo.periodo.de === capitulo.periodo.ate ? `${capitulo.periodo.de}` : `${capitulo.periodo.de} a ${capitulo.periodo.ate}`,
      recolhidos: `${estado.recolhidos.filter((id) => recordIds(capitulo).includes(id)).length} de ${total}`,
    }),
    [capitulo, total],
  );
  // A fala sobre a cena: a entrada do capítulo, e depois a conclusão quando a saída abre.
  const [falasNaCena, setFalasNaCena] = useState<{ evento: string; falas: readonly FalaDita[] } | null>(null);
  const [falasDoRegistro, setFalasDoRegistro] = useState<readonly FalaDita[]>([]);
  const [falasDaAjuda, setFalasDaAjuda] = useState<readonly FalaDita[]>([]);
  const [falasDaFonte, setFalasDaFonte] = useState<readonly FalaDita[]>([]);
  const [falasDaConclusao, setFalasDaConclusao] = useState<readonly FalaDita[]>([]);
  // A entrada: uma vez por capítulo aberto, depois que o progresso chegou.
  const entradaDita = useRef<string | null>(null);
  useEffect(() => {
    if (!carregado || entradaDita.current === capitulo.id) return;
    entradaDita.current = capitulo.id;
    const ditas = falar("entrada", dadosDoCapitulo(tarefa));
    setFalasNaCena({ evento: "entrada", falas: ditas });
  }, [carregado, capitulo.id, falar, dadosDoCapitulo, tarefa]);
  /** Depois de uma mudança no estado da tarefa: se a saída acabou de abrir, o Escrivão conclui. */
  const aoMudarTarefa = useCallback(
    (antes: TaskState, depois: TaskState) => {
      if (isExitOpen(capitulo, antes) || !isExitOpen(capitulo, depois)) return;
      const ditas = falar("conclusao", dadosDoCapitulo(depois));
      setFalasDaConclusao(ditas);
      setFalasNaCena({ evento: "conclusao", falas: ditas });
    },
    [capitulo, falar, dadosDoCapitulo],
  );
  const comFalas = useCallback(
    (avaliacao: Attempt): AttemptWithLines => ({ ...avaliacao, falas: avaliacao.certo ? [] : falar("erro") }),
    [falar],
  );

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
    (id: string) => {
      const antes = taskStateOf(progresso, capitulo.id);
      const depois = collect(antes, id);
      update((atual) => withTaskState(atual, capitulo.id, collect(taskStateOf(atual, capitulo.id), id)));
      const documento = documentos[id];
      const decisao = content.decisoes[id];
      setFalasDoRegistro(
        falar("descoberta", decisao !== undefined ? dadosDaDecisao(decisao) : documento === undefined ? undefined : { titulo: documento.titulo, data: formatDate(documento.data), fontes: plural(documento.fontes.length, "fonte", "fontes") }),
      );
      aoMudarTarefa(antes, depois);
      setRegistroAberto(id);
      setReleitura(false);
      setModo("registro");
    },
    [update, capitulo.id, progresso, documentos, content.decisoes, falar, aoMudarTarefa],
  );

  // Ler de novo um registro já recolhido, pelo painel: o progresso não muda.
  const lerDeNovo = useCallback((id: string) => {
    setRegistroAberto(id);
    setReleitura(true);
    setModo("registro");
  }, []);

  // Abrir a resposta da tarefa. Na decisão, a etapa da evidência começa com a fala do Escrivão.
  const abrirResposta = useCallback(() => {
    if (capitulo.tarefa.tipo === "decisao" && !isEvidenceDone(taskStateOf(progresso, capitulo.id))) {
      const decisao = content.decisoes[capitulo.tarefa.decisaoId];
      setFalasDaFonte(falar("fonte", decisao === undefined ? undefined : { titulo: decisao.titulo, fontes: plural(decisao.fontes.length, "fonte", "fontes") }));
    }
    setModo(modoDaResposta);
  }, [capitulo, progresso, content.decisoes, falar, modoDaResposta]);

  const fecharRegistro = useCallback(() => {
    setRegistroAberto(null);
    if (releitura) {
      // Quem relia volta ao painel, de onde veio, com o foco no registro que leu.
      setReleitura(false);
      setFocoDoPainel(registroAberto);
      setModo("painel");
      return;
    }
    if (isAnswerPending(capitulo.tarefa, taskStateOf(progresso, capitulo.id))) abrirResposta();
    else voltarAoJogo();
  }, [releitura, registroAberto, capitulo, progresso, abrirResposta, voltarAoJogo]);

  // Abrir o painel pelos botões e pela tecla: o foco começa no rodapé, e não em um registro relido antes.
  const abrirPainel = useCallback(() => {
    setFocoDoPainel(null);
    setModo("painel");
  }, []);

  const abrirGuia = useCallback(() => {
    setFalasDaAjuda(falar("ajuda", dadosDoCapitulo(taskStateOf(progresso, capitulo.id))));
    setModo("guia");
  }, [falar, dadosDoCapitulo, progresso, capitulo.id]);

  /** Aplica uma resposta ao progresso e devolve a avaliação com as falas do Escrivão. */
  const responder = useCallback(
    (avaliar: (estado: TaskState) => Attempt): AttemptWithLines => {
      const antes = taskStateOf(progresso, capitulo.id);
      let avaliacao: Attempt | null = null;
      update((atual) => {
        avaliacao = avaliar(taskStateOf(atual, capitulo.id));
        return withTaskState(atual, capitulo.id, avaliacao.estado);
      });
      aoMudarTarefa(antes, avaliacao!.estado);
      return comFalas(avaliacao!);
    },
    [progresso, capitulo.id, update, aoMudarTarefa, comFalas],
  );

  const responderOrdem = useCallback(
    (resposta: readonly [string, string]): AttemptWithLines => {
      const tarefaDeOrdem = capitulo.tarefa;
      if (tarefaDeOrdem.tipo !== "ordem") throw new Error("A tarefa deste capítulo não é de ordem.");
      return responder((estado) => submitOrder(tarefaDeOrdem, estado, resposta, content.registros));
    },
    [capitulo, responder, content.registros],
  );

  // Responder a tarefa de documento ou de lugar com o `id` da opção escolhida.
  const responderEscolha = useCallback(
    (id: string): AttemptWithLines => {
      const tarefaDeEscolha = capitulo.tarefa;
      if (tarefaDeEscolha.tipo !== "fonte" && tarefaDeEscolha.tipo !== "lugar") throw new Error("A tarefa deste capítulo não é de escolha.");
      return responder((estado) =>
        tarefaDeEscolha.tipo === "fonte" ? submitSource(tarefaDeEscolha, estado, capitulo, content.registros, id) : submitPlace(tarefaDeEscolha, estado, capitulos, content.registros, id),
      );
    },
    [capitulo, capitulos, responder, content.registros],
  );

  // As duas etapas da tarefa de decisão.
  const responderEvidencia = useCallback(
    (fonteId: string): AttemptWithLines => {
      const tarefaDeDecisao = capitulo.tarefa;
      if (tarefaDeDecisao.tipo !== "decisao") throw new Error("A tarefa deste capítulo não é de decisão.");
      return responder((estado) => submitEvidence(tarefaDeDecisao, estado, capitulo, documentos, fonteId));
    },
    [capitulo, responder, documentos],
  );
  const responderInterpretacao = useCallback(
    (opcaoId: string): AttemptWithLines => {
      const tarefaDeDecisao = capitulo.tarefa;
      if (tarefaDeDecisao.tipo !== "decisao") throw new Error("A tarefa deste capítulo não é de decisão.");
      return responder((estado) => submitInterpretation(tarefaDeDecisao, estado, content.decisoes[tarefaDeDecisao.decisaoId], opcaoId));
    },
    [capitulo, responder, content.decisoes],
  );

  const atravessar = useCallback(() => {
    // Só se atravessa uma saída aberta: o progresso recusaria, e a transição não pode aparecer sem ele.
    if (!saidaAberta) return;
    const indice = capitulos.findIndex((item) => item.id === capitulo.id);
    const proximo = capitulos[indice + 1] ?? null;
    update((atual) => completeChapter(atual, todos, capitulo.id));
    // A cena fica a mesma até a transição terminar.
    setCapituloId(capitulo.id);
    setFalasNaCena(null);
    setTransicao({ concluido: capitulo, proximo });
    setModo("transicao");
  }, [saidaAberta, capitulos, todos, capitulo, update]);

  const continuarTransicao = useCallback(() => {
    const proximo = transicao?.proximo ?? null;
    setTransicao(null);
    if (proximo === null) {
      // Fim da sala: a cena do último capítulo recomeça por trás da tela
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
      else if (alvo.tipo === "guia") abrirGuia();
      // A saída aberta ao alcance atravessa, como andar para dentro dela.
      else if (saidaAberta) atravessar();
      else setModo("saida-fechada");
    },
    [recolher, abrirGuia, saidaAberta, atravessar],
  );

  const reiniciar = useCallback(() => {
    reset();
    setCapituloId(null);
    setRegistroAberto(null);
    setReleitura(false);
    setTransicao(null);
    setReinicioDoFim(false);
    setFalasNaCena(null);
    entradaDita.current = null;
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
      setFalasNaCena(null);
      setModo("jogando");
      focusStage();
    },
    [progresso, focusStage],
  );

  // Ao seguir para a ficha de um registro, o capítulo aberto fica lembrado para a volta.
  const lembrarCapitulo = useCallback(() => {
    OPEN_CHAPTER.set(chaveDaVolta, capitulo.id);
  }, [chaveDaVolta, capitulo.id]);

  const alternarHumor = useCallback(() => setHumor(!preferencias.humor), [setHumor, preferencias.humor]);

  const registro = registroAberto === null ? null : (content.registros[registroAberto] ?? null);
  const decisaoAberta = registroAberto === null ? null : (content.decisoes[registroAberto] ?? null);
  const acao = reachLabel(alcance, saidaAberta);
  // O navegador não deu canvas 2D: a cena sai, o aviso entra e o painel segue valendo.
  const [semCanvas, setSemCanvas] = useState(false);
  // O registro da tarefa de escolha e as opções, que vêm dos próprios registros.
  const escolha = useMemo(() => {
    const t = capitulo.tarefa;
    if (t.tipo === "fonte") return { tipo: t.tipo, registro: content.registros[t.eventId] ?? null, opcoes: sourceOptions(capitulo, content.registros, t.eventId) };
    if (t.tipo === "lugar") return { tipo: t.tipo, registro: content.registros[t.eventId] ?? null, opcoes: placeOptions(capitulos, content.registros, t.eventId) };
    return null;
  }, [capitulo, capitulos, content.registros]);
  // A decisão da tarefa e as opções das duas etapas, que vêm do próprio registro.
  const decisaoDaTarefa = useMemo(() => {
    const t = capitulo.tarefa;
    if (t.tipo !== "decisao") return null;
    const decisao = content.decisoes[t.decisaoId];
    if (decisao === undefined) return null;
    return { decisao, evidencia: sourceOptions(capitulo, documentos, t.decisaoId), interpretacao: interpretationOptions(decisao) };
  }, [capitulo, content.decisoes, documentos]);

  return (
    <div
      ref={raiz}
      className="jogo-palco relative overflow-hidden bg-sunken"
      data-jogo={slug}
      data-sala={sala}
      data-capitulo={capitulo.id}
      data-cena={cena.id}
      data-epoca={capitulo.epoca}
      data-modo={modo}
      data-tarefa={tarefaConcluida ? "concluida" : "pendente"}
      data-tipo-da-tarefa={capitulo.tarefa.tipo}
      data-etapa={capitulo.tarefa.tipo === "decisao" ? (tarefaConcluida ? "concluida" : isEvidenceDone(tarefa) ? "interpretacao" : "evidencia") : undefined}
      data-saida={saidaAberta ? "aberta" : "fechada"}
      data-registros={`${saida.total - saida.faltam}/${saida.total}`}
      data-carregado={carregado ? "sim" : "nao"}
      data-movimento={movimento ? "ligado" : "reduzido"}
      data-humor={preferencias.humor ? "ligado" : "desligado"}
    >
      {/* Com um diálogo aberto, a cena e os botões sobre ela saem da tabulação e da leitura. */}
      <div className="absolute inset-0" inert={modo !== "jogando"} data-cena-e-hud>
        {carregado ? (
          semCanvas ? (
            <StageUnavailable onOpenPanel={abrirPainel} slug={slug} nome={content.personagem.nome} />
          ) : (
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
                onUnavailable={() => setSemCanvas(true)}
                describedBy={instrucoesId}
              />
            </StageBoundary>
          )
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
          sala={salaSpec}
          cenaNome={cena.nome}
          // Com uma janela aberta a cena está parada: a dica do alcance, que é do instante em que ela abriu, some.
          alcance={modo === "jogando" ? alcance : null}
          saidaAberta={saidaAberta}
          tarefaConcluida={tarefaConcluida}
          respostaPendente={respostaPendente}
          faltam={saida.faltam}
          total={total}
          ultimo={ultimo}
          toque={toque}
          pausadoPelaJanela={!janelaAtiva && modo === "jogando"}
          instrucoesId={instrucoesId}
          falas={falasNaCena}
          onDismissFalas={() => setFalasNaCena(null)}
          onOpenPanel={abrirPainel}
          onOpenGuide={abrirGuia}
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
          falas={falasDoRegistro}
          onOpenRecordPage={lembrarCapitulo}
          onClose={fecharRegistro}
        />
      )}
      {modo === "registro" && registro === null && decisaoAberta !== null && (
        <DecisionRecordDialog
          decisao={decisaoAberta}
          personagem={slug}
          tipoDaTarefa={capitulo.tarefa.tipo}
          respostaPendente={respostaPendente}
          saida={saida}
          releitura={releitura}
          falas={falasDoRegistro}
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
      {modo === "decisao" && decisaoDaTarefa !== null && (
        <DecisionTaskDialog
          decisao={decisaoDaTarefa.decisao}
          estado={tarefa}
          opcoesDeEvidencia={decisaoDaTarefa.evidencia}
          opcoesDeInterpretacao={decisaoDaTarefa.interpretacao}
          saida={saida}
          falasDaFonte={falasDaFonte}
          onSubmitEvidence={responderEvidencia}
          onSubmitInterpretation={responderInterpretacao}
          onClose={voltarAoJogo}
        />
      )}
      {modo === "guia" && (
        <EscrivaoDialog
          capitulo={capitulo}
          sala={salaSpec}
          saida={saida}
          respostaPendente={respostaPendente}
          ultimo={ultimo}
          falas={falasDaAjuda}
          humor={preferencias.humor}
          onToggleHumor={alternarHumor}
          onAnswer={abrirResposta}
          onClose={voltarAoJogo}
        />
      )}
      {modo === "saida-fechada" && (
        <ClosedExitDialog capitulo={capitulo} saida={saida} respostaPendente={respostaPendente} onAnswer={abrirResposta} onClose={voltarAoJogo} />
      )}
      {modo === "painel" && (
        <ChapterPanel
          content={content}
          sala={salaSpec}
          capitulos={capitulos}
          outrasSalas={outrasSalas}
          progresso={progresso}
          aberto={capitulo}
          duravel={duravel}
          humor={preferencias.humor}
          onToggleHumor={alternarHumor}
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
        <ChapterTransition concluido={transicao.concluido} proximo={transicao.proximo} falas={falasDaConclusao} onContinue={continuarTransicao} />
      )}
      {modo === "fim" && (
        <EndScreen
          nome={content.personagem.nome}
          personagem={slug}
          sala={salaSpec}
          capitulos={capitulos}
          outrasSalas={outrasSalas}
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
