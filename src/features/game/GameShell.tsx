"use client";

// A casca do jogo de um personagem em uma sala: junta o progresso salvo, a
// fase aberta, o cenário, as janelas e o Escrivão. É quem decide o que
// acontece quando a pessoa abre o marco, responde, segue ou muda de fase; o
// palco só desenha e leva o boneco até a pasta.
//
// O ciclo é um só (D-133): abrir o marco, ler a explicação, responder a
// atividade ou ler a explicação dela, continuar. Nenhuma fase segura a
// seguinte, e os registros de "Explorar este período" são opcionais.
//
// Dois modos mostram o mesmo conteúdo: com o cenário, a fase abre em uma
// janela; em "Ler sem o cenário", ela está na página, sem o palco. O segundo
// é também o caminho de quem não tem o canvas.
//
// O HTML do build sai com a primeira fase da sala, sem a cena (o palco é
// carregado só no navegador); a fase pedida pelo endereço e o progresso
// guardado entram depois da hidratação. Em uma navegação interna, o endereço
// da página entra um instante depois dela: até lá o jogo espera, sem supor
// fase nenhuma.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PATH_LINK } from "@/components/touch";
import type { ProgressKeys } from "@/lib/game/content";
import { selectLines, type EscrivaoEvent, type FalaDita } from "@/lib/game/escrivao";
import { relatedRecords } from "@/lib/game/judicial";
import { hasNewStart, nextPhase, openPhase, phaseProgressOf, resumePhase, withPhase, withPosition } from "@/lib/game/progress";
import { NO_QUERY } from "@/lib/game/query";
import { roomLabel, roomOf } from "@/lib/game/rooms";
import { getScene } from "@/lib/game/scenes";
import { isSensitive } from "@/lib/game/sensitivity";
import { answerOrder, answerQuestion, concludeByExplanation, isResolved, phaseStatus, refKey, refShortLabel, refTitle } from "@/lib/game/trail";
import type { GameContent, PhaseRef, PhaseSpec, SceneMarker } from "@/lib/game/types";
import { NO_INSETS, type StageInsets } from "@/lib/game/world/camera";
import { gameHref } from "@/lib/state/links";

import type { GameStageHandle } from "./GameStage";
import { useGameAddress, useGamePreferences, useGameProgress, useMotion, useWindowActive, writePhaseToUrl } from "./hooks";
import { primaryButton, quietButton, secondaryButton } from "./ui/Dialog";
import { ConfirmResetDialog, HelpDialog, PhaseDialog, PhaseListDialog, RecordDialog, SummaryDialog } from "./ui/dialogs";
import { Hud, ResumeNotice, type ResumeInfo } from "./ui/Hud";
import { PhaseContent, type AnswerFeedback } from "./ui/PhaseContent";
import { StageBoundary } from "./ui/StageBoundary";

// O palco (canvas e laço) fica em um pacote à parte, pedido só nesta página.
const GameStage = dynamic(() => import("./GameStage").then((modulo) => ({ default: modulo.GameStage })), {
  ssr: false,
  loading: () => (
    <StageNotice>
      <p className="map-loading text-sm text-ink-soft">Carregando a cena…</p>
    </StageNotice>
  ),
});

function StageNotice({ children }: { children: React.ReactNode }) {
  // O espaço em cima é o do cartão da fase e dos botões: o aviso não fica atrás deles em tela estreita.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunken p-6 pt-40 text-center" role="status">
      {children}
    </div>
  );
}

/** A cena não pôde ser desenhada (o navegador não deu o canvas) ou o pacote dela não chegou: o conteúdo continua inteiro, sem ela. */
function StageMissing({ motivo, onRead }: { motivo: "sem-canvas" | "falhou"; onRead(): void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sunken p-6 pt-40 text-center" role="alert" data-palco={motivo}>
      <p className="max-w-md font-serif text-xl font-medium leading-snug">{motivo === "sem-canvas" ? "O navegador não conseguiu desenhar a cena" : "A cena não carregou"}</p>
      <p className="max-w-md text-sm text-ink-soft">
        {motivo === "sem-canvas" ? "Ele não ofereceu o desenho em canvas, que o cenário usa." : "Pode ter sido a conexão."} Nada se perde: as mesmas fases, com a
        explicação, a atividade e as fontes, estão em Ler sem o cenário.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {motivo === "falhou" && (
          <button type="button" className={secondaryButton} onClick={() => window.location.reload()}>
            Recarregar a página
          </button>
        )}
        <button type="button" className={primaryButton} onClick={onRead} data-ler-sem-cenario-do-aviso>
          Ler sem o cenário
        </button>
      </div>
    </div>
  );
}

type Vista =
  | { tipo: "base" }
  | { tipo: "fase" }
  | { tipo: "registro"; referencia: PhaseRef; de: "base" | "fase" }
  | { tipo: "fases" }
  | { tipo: "ajuda" }
  | { tipo: "apagar" }
  | { tipo: "resumo" };

interface GameShellProps {
  content: GameContent;
  /** Todas as fases do personagem e as assinaturas das atividades, para ler e gravar o progresso sem perder o das outras salas. */
  chaves: ProgressKeys;
  /** A outra trajetória do atlas, para o caminho até ela no resumo. */
  outraPessoa: { slug: string; nome: string } | null;
}

export function GameShell({ content, chaves, outraPessoa }: GameShellProps) {
  const slug = content.personagem.slug;
  const { sala, fases } = content;
  const salaSpec = roomOf(sala);
  const { carregado, progresso, duravel, update, reset } = useGameProgress(slug, chaves);
  const { preferencias, setHumor, setCenario } = useGamePreferences();
  const caminho = gameHref(slug, sala);
  const endereco = useGameAddress(caminho);
  const consulta = endereco.situacao === "lido" ? endereco.consulta : NO_QUERY;
  // O jogo está pronto quando leu o progresso guardado e o endereço da própria página: antes disso, não se sabe que fase abrir.
  const pronto = carregado && endereco.situacao === "lido";
  const movimento = useMotion();
  const janelaAtiva = useWindowActive();
  const handle = useRef<GameStageHandle | null>(null);
  const raiz = useRef<HTMLDivElement>(null);

  // A fase escolhida nesta visita, pela lista, pelo botão de continuar ou pelo resumo. Antes disso, vale o endereço e, sem ele, o progresso.
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>({ tipo: "base" });
  // O navegador não deu o canvas: a cena sai, e a leitura sem o cenário é o caminho.
  const [semCanvas, setSemCanvas] = useState(false);
  // A pessoa pediu a leitura sem o cenário nesta visita, pelo aviso de cena indisponível, sem mexer na preferência guardada.
  const [leituraDaVisita, setLeituraDaVisita] = useState(false);
  // Quantas vezes o progresso foi apagado nesta visita: remonta a fase que a leitura sem o cenário mantém na página.
  const [reinicios, setReinicios] = useState(0);

  const pedida = consulta.fase === null ? undefined : fases[consulta.fase - 1];
  const fase: PhaseSpec = fases.find((item) => item.id === escolhida) ?? pedida ?? (pronto ? resumePhase(progresso, fases) : null) ?? fases[0]!;
  const proxima = nextPhase(fases, fase.id);
  const estado = phaseProgressOf(progresso, fase.id);
  const concluida = estado.concluida !== undefined;
  const cena = getScene(fase.cena);
  const leitura = pronto && (!preferencias.cenario || consulta.leitura || leituraDaVisita);
  const marcoTitulo = refTitle(fase.marco, content) ?? fase.titulo;
  // A pessoa chegou sem pedir fase, e o jogo abriu onde ela tinha parado: a tela diz isso e oferece o começo, como a entrada do jogo faz.
  const retomada: ResumeInfo | null =
    pronto && endereco.situacao === "lido" && endereco.chegada.fase === null && escolhida === null && fase.numero > 1
      ? { ano: fases[0]!.periodo.de, mudou: hasNewStart(progresso, fases) }
      : null;

  // -------------------------------------------------------------------------
  // O Escrivão: as falas de cada momento, sem estado: uma instrução e, no
  // máximo, uma fala de humor. A vez de cada fala vem da posição da fase, ou
  // do número da tentativa; em fase ou registro de contexto sensível (D-129),
  // o humor fica de fora. A exibição aplica a preferência de humor por conta
  // própria (EscrivaoSays e Hud).
  // -------------------------------------------------------------------------
  const falar = useCallback((evento: EscrivaoEvent, vez: number, sensivel: boolean): FalaDita[] => selectLines({ sala, evento, humor: true, vez, sensivel }), [sala]);
  const falasDaEntrada = useMemo(() => falar("entrada", fase.numero - 1, fase.sensivel), [falar, fase]);
  const falasDaConclusao = useMemo(() => (concluida ? falar("conclusao", fase.numero - 1, fase.sensivel) : []), [falar, fase, concluida]);
  const falasDaAjuda = useMemo(() => falar("ajuda", fase.numero - 1, fase.sensivel), [falar, fase]);

  // -------------------------------------------------------------------------
  // As pastas da fase no cenário: a do marco e as dos registros para explorar
  // que couberem nas posições da cena. O que não couber fica só na lista.
  // -------------------------------------------------------------------------
  const marcadores = useMemo<SceneMarker[]>(() => {
    const [doMarco, ...demais] = cena.registros;
    const lista: SceneMarker[] = [];
    if (doMarco !== undefined) lista.push({ chave: "marco", natureza: "marco", rotulo: marcoTitulo, x: doMarco.x, y: doMarco.y });
    fase.explorar
      .filter((referencia) => isResolved(referencia, content))
      .slice(0, demais.length)
      .forEach((referencia, indice) => {
        const posicao = demais[indice]!;
        lista.push({ chave: refKey(referencia), natureza: "explorar", rotulo: refShortLabel(referencia, content) ?? referencia.id, x: posicao.x, y: posicao.y });
      });
    return lista;
  }, [cena, fase, content, marcoTitulo]);

  // -------------------------------------------------------------------------
  // Foco. Fechar uma janela devolve o foco ao controle que a abriu: o botão do
  // cabeçalho, a pasta, o botão dentro da fase. Assim quem lê pelo teclado, ou
  // pelo toque em "Ler sem o cenário", continua de onde estava, sem a página
  // voltar ao começo. Mudar de fase, ou de modo, é diferente: o foco vai para o
  // começo da fase, que é a pasta do marco (ou o botão principal, sem cena) e,
  // na leitura sem o cenário, o título da fase.
  //
  // O controle é lembrado pelo clique, e não pelo foco: nem todo navegador põe
  // o foco em um botão tocado ou clicado.
  // -------------------------------------------------------------------------
  const focoPendente = useRef<"abridor" | "fase" | "de-cima" | null>(null);
  const ultimoAtivado = useRef<HTMLElement | null>(null);
  const abridorDaBase = useRef<HTMLElement | null>(null);
  const abridorDeCima = useRef<HTMLElement | null>(null);
  const lembrarControle = useCallback((evento: React.MouseEvent) => {
    const alvo = evento.target instanceof Element ? evento.target.closest<HTMLElement>("button, a[href], summary") : null;
    if (alvo !== null) ultimoAtivado.current = alvo;
  }, []);

  useEffect(() => {
    const pendente = focoPendente.current;
    const caixa = raiz.current;
    if (pendente === null || caixa === null) return;
    if (pendente === "de-cima") {
      // A janela de cima fechou: o foco volta ao botão que a abriu, dentro da de baixo, sem rolar nada.
      if (vista.tipo === "registro" || vista.tipo === "apagar") return;
      focoPendente.current = null;
      const alvo = abridorDeCima.current;
      abridorDeCima.current = null;
      if (alvo !== null && alvo.isConnected) alvo.focus({ preventScroll: true });
      return;
    }
    if (vista.tipo !== "base") return;
    focoPendente.current = null;
    const abridor = abridorDaBase.current;
    abridorDaBase.current = null;
    if (pendente === "abridor") {
      if (abridor !== null && abridor.isConnected) {
        abridor.focus({ preventScroll: true });
        return;
      }
      // Sem o controle (ele saiu da tela com a mudança dos botões): na leitura, nada rola, e o foco vai para o botão de continuar da fase, quando ele existe; na cena, o foco vai para o marco.
      if (leitura) {
        caixa.querySelector<HTMLElement>("[data-leitura-da-fase] [data-continuar]")?.focus({ preventScroll: true });
        return;
      }
    }
    const alvo = leitura ? caixa.querySelector<HTMLElement>("[data-fase-titulo]") : (caixa.querySelector<HTMLElement>('[data-marcador="marco"]') ?? caixa.querySelector<HTMLElement>("[data-abrir-marco]"));
    alvo?.focus({ preventScroll: !leitura });
    if (leitura) caixa.scrollIntoView({ block: "start" });
  }, [vista, fase.id, leitura]);

  /** Abre uma janela a partir da base, lembrando o controle que a abriu. */
  const abrirDaBase = useCallback((proxima: Vista) => {
    abridorDaBase.current = ultimoAtivado.current;
    setVista(proxima);
  }, []);
  /** Abre uma janela por cima de outra, que continua montada embaixo. */
  const abrirPorCima = useCallback((proxima: Vista) => {
    abridorDeCima.current = ultimoAtivado.current;
    setVista(proxima);
  }, []);
  /** Fecha a janela de cima e volta à de baixo, com o foco no botão que a abriu. */
  const voltarParaDeBaixo = useCallback((deBaixo: Vista) => {
    focoPendente.current = "de-cima";
    setVista(deBaixo);
  }, []);
  /** Fecha a janela e volta à base, sem mudar de fase: o foco volta ao controle que a abriu. */
  const voltarParaBase = useCallback(() => {
    focoPendente.current = "abridor";
    setVista({ tipo: "base" });
  }, []);
  /** Volta à base depois de a fase ou o modo mudar: o foco vai para o começo da fase. */
  const mostrarFase = useCallback(() => {
    focoPendente.current = "fase";
    setVista({ tipo: "base" });
  }, []);

  // -------------------------------------------------------------------------
  // O que a interface cobre do palco. O palco enquadra a cena no que sobra, para
  // a pasta do marco não ficar atrás do cartão da fase nem do botão principal.
  // O bloco de cima só conta em tela estreita, onde vai de um lado ao outro; em
  // tela larga o cartão e os botões ficam nos cantos, e a cena passa entre eles.
  // Em janela baixa e larga (celular deitado) não há altura para isso: a cena
  // fica ao lado do cartão e abaixo dos botões.
  // -------------------------------------------------------------------------
  const [margens, setMargens] = useState<StageInsets>(NO_INSETS);
  const comHud = !leitura && endereco.situacao !== "aguardando";
  useEffect(() => {
    const caixa = raiz.current;
    if (caixa === null || !comHud) return;
    const medir = () => {
      const deCima = caixa.querySelector<HTMLElement>("[data-hud-topo]");
      const deBaixo = caixa.querySelector<HTMLElement>("[data-hud-base]");
      const palco = caixa.getBoundingClientRect();
      const estreita = window.matchMedia("(max-width: 639.98px)").matches;
      const deitada = !estreita && window.matchMedia("(max-height: 30rem)").matches;
      const cartao = caixa.querySelector<HTMLElement>("[data-fase-cartao]");
      const caminhos = caixa.querySelector<HTMLElement>("[data-caminhos-do-jogo]");
      const topo = estreita && deCima !== null ? Math.round(deCima.getBoundingClientRect().height) : deitada && caminhos !== null ? Math.round(caminhos.getBoundingClientRect().bottom - palco.top) : 0;
      const esquerda = deitada && cartao !== null ? Math.round(cartao.getBoundingClientRect().right - palco.left) + 8 : 0;
      const base = deBaixo === null ? 0 : Math.round(deBaixo.getBoundingClientRect().height);
      setMargens((atual) => (atual.topo === topo && atual.base === base && (atual.esquerda ?? 0) === esquerda ? atual : { topo, base, esquerda }));
    };
    // O observador chama `medir` ao começar a observar, e de novo quando o cartão muda de altura ou a janela muda de tamanho.
    const observador = new ResizeObserver(medir);
    observador.observe(caixa);
    for (const bloco of caixa.querySelectorAll("[data-hud-topo], [data-hud-base]")) observador.observe(bloco);
    return () => observador.disconnect();
  }, [comHud]);

  // -------------------------------------------------------------------------
  // O endereço acompanha a fase aberta, sem criar entrada no histórico:
  // recarregar volta à mesma fase, e Voltar sai do jogo. Em "Ler sem o
  // cenário", abrir a página da fase é ler a explicação: ela fica vista.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!pronto) return;
    writePhaseToUrl(caminho, fase.numero, consulta.leitura && preferencias.cenario);
  }, [pronto, caminho, fase.numero, consulta.leitura, preferencias.cenario]);
  useEffect(() => {
    if (!leitura) return;
    // Apagar o progresso com a fase aberta não troca de fase: `reinicios` refaz o efeito, e a fase volta a constar como lida.
    void reinicios;
    update((atual) => openPhase(atual, fase));
  }, [leitura, fase, update, reinicios]);
  // O endereço pediu a leitura sem o cenário: o pedido vira a preferência, para valer também nas outras fases e salas.
  useEffect(() => {
    if (pronto && consulta.leitura && preferencias.cenario) setCenario(false);
  }, [pronto, consulta.leitura, preferencias.cenario, setCenario]);

  // -------------------------------------------------------------------------
  // Ações
  // -------------------------------------------------------------------------

  /** Abre a explicação da fase: ela fica vista, e a posição da sala vai para ela. */
  const abrirFase = useCallback(() => {
    update((atual) => openPhase(atual, fase));
    abrirDaBase({ tipo: "fase" });
  }, [update, fase, abrirDaBase]);

  /** O botão principal e a pasta em destaque: com a cena pronta, o boneco anda até a pasta antes; sem ela, a explicação abre direto. */
  const abrirMarco = useCallback(() => {
    if (handle.current !== null) handle.current.open("marco");
    else abrirFase();
  }, [abrirFase]);

  /** Abre um registro: da base (a pasta do cenário, ou a lista da leitura sem o cenário) ou por cima da janela da fase. */
  const abrirRegistro = useCallback(
    (referencia: PhaseRef, de: "base" | "fase") => (de === "fase" ? abrirPorCima : abrirDaBase)({ tipo: "registro", referencia, de }),
    [abrirDaBase, abrirPorCima],
  );

  /** O boneco chegou a uma pasta do cenário. */
  const aoChegar = useCallback(
    (chave: string) => {
      if (chave === "marco") {
        abrirFase();
        return;
      }
      const referencia = fase.explorar.find((item) => refKey(item) === chave);
      if (referencia !== undefined) abrirRegistro(referencia, "base");
    },
    [abrirFase, abrirRegistro, fase],
  );

  /** Aplica uma resposta ao progresso e devolve o que a tela mostra: se acertou e, no erro, a fala do Escrivão. */
  const responder = useCallback(
    (avaliar: (atual: ReturnType<typeof phaseProgressOf>) => { estado: ReturnType<typeof phaseProgressOf>; certo: boolean }): AnswerFeedback => {
      let certo = false;
      let tentativas = 0;
      update((atual) => {
        const avaliacao = avaliar(phaseProgressOf(atual, fase.id));
        certo = avaliacao.certo;
        tentativas = avaliacao.estado.tentativas;
        return withPosition(withPhase(atual, fase.id, avaliacao.estado), fase);
      });
      return { certo, falas: certo ? [] : falar("erro", tentativas - 1, fase.sensivel) };
    },
    [update, fase, falar],
  );
  const responderPergunta = useCallback((opcaoId: string) => responder((atual) => answerQuestion(fase, atual, opcaoId, content)), [responder, fase, content]);
  const responderOrdem = useCallback((chavesDaOrdem: readonly string[]) => responder((atual) => answerOrder(fase, atual, chavesDaOrdem, content)), [responder, fase, content]);
  const lerEContinuar = useCallback(() => {
    update((atual) => withPosition(withPhase(atual, fase.id, concludeByExplanation(fase, phaseProgressOf(atual, fase.id), content)), fase));
  }, [update, fase, content]);

  /** Ir a uma fase é navegação: não conclui nem apaga nada. */
  const irPara = useCallback(
    (id: string) => {
      setEscolhida(id);
      mostrarFase();
    },
    [mostrarFase],
  );

  const irParaOInicio = useCallback(() => irPara(fases[0]!.id), [irPara, fases]);

  const continuar = useCallback(() => {
    if (proxima !== null) irPara(proxima.id);
    // O resumo aberto pelo botão da base lembra esse botão; aberto de dentro da fase, fica valendo o controle que abriu a fase.
    else if (vista.tipo === "base") abrirDaBase({ tipo: "resumo" });
    else setVista({ tipo: "resumo" });
  }, [proxima, irPara, vista.tipo, abrirDaBase]);

  const apagar = useCallback(() => {
    reset();
    setEscolhida(fases[0]!.id);
    // Na leitura sem o cenário a fase fica montada sob as janelas: sem remontar, a resposta dada antes continuaria na tela, sem botão para responder de novo.
    setReinicios((vezes) => vezes + 1);
    mostrarFase();
  }, [reset, fases, mostrarFase]);

  const alternarHumor = useCallback(() => setHumor(!preferencias.humor), [setHumor, preferencias.humor]);

  /** Trocar entre o cenário e a leitura sem ele. A preferência fica guardada; sem canvas, só a leitura existe. */
  const lerSemCenario = useCallback(() => {
    setCenario(false);
    mostrarFase();
  }, [setCenario, mostrarFase]);
  const voltarAoCenario = useCallback(() => {
    setLeituraDaVisita(false);
    setCenario(true);
    // O pedido de leitura que veio pelo endereço deixa de valer junto com a preferência.
    const url = new URL(window.location.href);
    url.searchParams.delete("leitura");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    mostrarFase();
  }, [setCenario, mostrarFase]);
  const alternarLeitura = useCallback(() => (leitura ? voltarAoCenario() : lerSemCenario()), [leitura, voltarAoCenario, lerSemCenario]);

  // -------------------------------------------------------------------------
  // O que as janelas mostram
  // -------------------------------------------------------------------------

  const registroAberto = vista.tipo === "registro" ? vista.referencia : null;
  const falasDoRegistro = useMemo(() => {
    // A proposta eleitoral traz o próprio aviso no cartão (o que ela é e o que não é): o Escrivão não comenta, nem com humor.
    if (registroAberto === null || registroAberto.tipo === "proposta") return [];
    const posicao = Math.max(0, fase.explorar.findIndex((item) => refKey(item) === refKey(registroAberto)));
    // Um registro sensível aberto de uma fase comum, ou qualquer registro de uma fase sensível: sem humor.
    return falar("explorar", posicao, fase.sensivel || isSensitive(registroAberto.id));
  }, [registroAberto, fase, falar]);
  const pausado = vista.tipo !== "base" || !janelaAtiva;

  const janelas = (
    <>
      {/* A fase continua montada sob o registro aberto de dentro dela: a escolha feita e o lugar da leitura não se perdem. */}
      {(vista.tipo === "fase" || (vista.tipo === "registro" && vista.de === "fase")) && (
        <PhaseDialog
          encoberta={vista.tipo === "registro"}
          fase={fase}
          total={fases.length}
          sala={salaSpec}
          content={content}
          estado={estado}
          proxima={proxima}
          falasDaConclusao={falasDaConclusao}
          onAnswerQuestion={responderPergunta}
          onAnswerOrder={responderOrdem}
          onSkip={lerEContinuar}
          onOpenRecord={(referencia) => abrirRegistro(referencia, "fase")}
          onContinue={continuar}
          onClose={voltarParaBase}
        />
      )}
      {vista.tipo === "registro" && (
        <RecordDialog
          referencia={vista.referencia}
          content={content}
          relacionados={vista.referencia.tipo === "acontecimento" ? relatedRecords(vista.referencia.id, content.registros) : []}
          falas={falasDoRegistro}
          voltar={vista.de === "fase" ? "Voltar à fase" : leitura ? "Voltar à leitura" : "Voltar ao cenário"}
          onOpenRecordPage={() => update((atual) => withPosition(atual, fase))}
          onClose={() => (vista.de === "fase" ? voltarParaDeBaixo({ tipo: "fase" }) : voltarParaBase())}
        />
      )}
      {(vista.tipo === "fases" || vista.tipo === "apagar") && (
        <PhaseListDialog
          encoberta={vista.tipo === "apagar"}
          content={content}
          sala={salaSpec}
          progresso={progresso}
          aberta={fase}
          duravel={duravel}
          humor={preferencias.humor}
          leitura={leitura}
          onToggleHumor={alternarHumor}
          onToggleReading={alternarLeitura}
          onOpenPhase={irPara}
          onReset={() => abrirPorCima({ tipo: "apagar" })}
          onClose={voltarParaBase}
        />
      )}
      {vista.tipo === "ajuda" && <HelpDialog sala={salaSpec} falas={falasDaAjuda} humor={preferencias.humor} leitura={leitura} onToggleHumor={alternarHumor} onClose={voltarParaBase} />}
      {vista.tipo === "apagar" && <ConfirmResetDialog nome={content.personagem.nome} onConfirm={apagar} onClose={() => voltarParaDeBaixo({ tipo: "fases" })} />}
      {vista.tipo === "resumo" && <SummaryDialog content={content} sala={salaSpec} progresso={progresso} outraPessoa={outraPessoa} onOpenPhase={irPara} onClose={voltarParaBase} />}
    </>
  );

  const atributos = {
    "data-jogo": slug,
    "data-sala": sala,
    "data-fase-aberta": fase.id,
    "data-numero": fase.numero,
    "data-cena": cena.id,
    "data-epoca": fase.epoca,
    "data-vista": vista.tipo,
    "data-modo": leitura ? "leitura" : "cenario",
    "data-fase-situacao": phaseStatus(estado),
    "data-carregado": pronto ? "sim" : "nao",
    "data-movimento": movimento ? "ligado" : "reduzido",
    "data-humor": preferencias.humor ? "ligado" : "desligado",
  };

  // -------------------------------------------------------------------------
  // Ler sem o cenário: a fase na página, com as mesmas ações.
  // -------------------------------------------------------------------------
  if (leitura) {
    const anterior = fases[fases.findIndex((item) => item.id === fase.id) - 1] ?? null;
    return (
      <div ref={raiz} className="page space-y-6 py-6 md:py-10" onClickCapture={lembrarControle} {...atributos}>
        <nav aria-label="Caminhos da leitura" className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <p className="text-sm" data-aviso-leitura>
            Você está lendo sem o cenário: as mesmas fases, com a explicação, a atividade e as fontes.
            {semCanvas && " O navegador não conseguiu desenhar a cena."}
          </p>
          <div className="flex flex-wrap gap-2">
            {!semCanvas && (
              <button type="button" className={secondaryButton} onClick={voltarAoCenario} data-voltar-ao-cenario>
                Voltar ao cenário
              </button>
            )}
            <button type="button" className={secondaryButton} onClick={() => abrirDaBase({ tipo: "fases" })} data-abrir-fases>
              Fases
            </button>
            <button type="button" className={secondaryButton} onClick={() => abrirDaBase({ tipo: "ajuda" })} data-abrir-ajuda>
              Como funciona
            </button>
          </div>
        </nav>
        {retomada !== null && <ResumeNotice retomada={retomada} className="text-sm" onGoToStart={irParaOInicio} />}
        {salaSpec.natureza === "aprofundamento" && (
          <p className="text-sm" data-aviso-aprofundamento>
            {roomLabel(salaSpec)}: decisões documentadas sobre um assunto, e não o começo da trajetória.{" "}
            <Link href={`${gameHref(slug)}?fase=1`} prefetch={false} className={PATH_LINK} data-ir-para-o-inicio>
              Ir para o início da vida
            </Link>
          </p>
        )}
        <article className="max-w-3xl" inert={vista.tipo !== "base"} data-leitura-da-fase>
          <PhaseContent
            key={`${fase.id}:${reinicios}`}
            fase={fase}
            total={fases.length}
            sala={salaSpec}
            content={content}
            estado={estado}
            proxima={proxima}
            cabecalho
            falasDaConclusao={falasDaConclusao}
            onAnswerQuestion={responderPergunta}
            onAnswerOrder={responderOrdem}
            onSkip={lerEContinuar}
            onOpenRecord={(referencia) => abrirRegistro(referencia, "base")}
            onContinue={continuar}
          />
        </article>
        <nav aria-label="Fase anterior e fase seguinte" className="flex max-w-3xl flex-wrap items-center justify-between gap-2 border-t border-line pt-4" inert={vista.tipo !== "base"}>
          {anterior === null ? (
            <span />
          ) : (
            <button type="button" className={`${quietButton} gap-1.5`} onClick={() => irPara(anterior.id)} data-fase-anterior={anterior.id}>
              <span aria-hidden="true">←</span>
              <span>
                Fase {anterior.numero}: {anterior.titulo}
              </span>
            </button>
          )}
          {proxima !== null && (
            <button type="button" className={`${quietButton} gap-1.5`} onClick={() => irPara(proxima.id)} data-fase-seguinte={proxima.id}>
              <span>
                Fase {proxima.numero}: {proxima.titulo}
              </span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </nav>
        {/* As janelas, na leitura, cobrem a tela: não há palco para contê-las. */}
        {vista.tipo !== "base" && <div className="fixed inset-0 z-40">{janelas}</div>}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Com o cenário
  // -------------------------------------------------------------------------
  return (
    <div ref={raiz} className="jogo-palco relative overflow-hidden bg-sunken" onClickCapture={lembrarControle} {...atributos}>
      {/* Com uma janela aberta, a cena e os botões sobre ela saem da tabulação e da leitura. */}
      <div className="absolute inset-0" inert={vista.tipo !== "base"} data-cena-e-hud>
        {pronto ? (
          semCanvas ? (
            <StageMissing motivo="sem-canvas" onRead={() => setLeituraDaVisita(true)} />
          ) : (
            <StageBoundary fallback={<StageMissing motivo="falhou" onRead={() => setLeituraDaVisita(true)} />}>
              <GameStage
                handle={handle}
                scene={cena}
                personagem={slug}
                epoca={fase.epoca}
                faseId={fase.id}
                marcadores={marcadores}
                margens={margens}
                concluida={concluida}
                pausado={pausado}
                movimento={movimento}
                onOpen={aoChegar}
                onUnavailable={() => setSemCanvas(true)}
              />
            </StageBoundary>
          )
        ) : (
          <StageNotice>
            <p className="map-loading text-sm text-ink-soft">Carregando o jogo…</p>
          </StageNotice>
        )}

        {/* Enquanto o endereço da página não entra, o cabeçalho de uma fase suposta não aparece: é um instante, e a fase certa vem em seguida. */}
        {endereco.situacao !== "aguardando" && (
          <Hud
            fase={fase}
            total={fases.length}
            sala={salaSpec}
            marco={marcoTitulo}
            concluida={concluida}
            proxima={proxima}
            falas={falasDaEntrada}
            retomada={retomada}
            onGoToStart={irParaOInicio}
            onOpenMarker={abrirMarco}
            onContinue={continuar}
            onOpenPhases={() => abrirDaBase({ tipo: "fases" })}
            onOpenHelp={() => abrirDaBase({ tipo: "ajuda" })}
            onReadWithoutScene={lerSemCenario}
          />
        )}
      </div>
      {janelas}
    </div>
  );
}
