"use client";

// As janelas do jogo: a fase (explicação e atividade), um registro do período,
// a lista de fases com as preferências, "Como funciona", a confirmação para
// apagar o progresso e o resumo do fim. Todas param a animação da cena
// enquanto estão abertas. O Escrivão fala pelo catálogo
// (src/lib/game/escrivao): a instrução, o que vem do conteúdo e, quando
// ligado, o humor marcado como ficção.

import Link from "next/link";

import { PATH_LINK } from "@/components/touch";
import { DecisionCard } from "@/features/decisions/DecisionCard";
import { ESCRIVAO_NOME, ESCRIVAO_ROTULO, type FalaDita } from "@/lib/game/escrivao";
import type { RelatedRecord } from "@/lib/game/judicial";
import type { DeepDive, TrailOutcome } from "@/lib/game/passport";
import { periodLabel, roomLabel, roomOf, type RoomSpec } from "@/lib/game/rooms";
import { phaseStatus } from "@/lib/game/trail";
import type { GameContent, PhaseProgress, PhaseRef, PhaseSpec, PlayerProgress } from "@/lib/game/types";
import { comparisonHref, decisionHref, explorationHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { EscrivaoSays } from "./EscrivaoSays";
import { TrailEnd, type StampNotice } from "./Passport";
import { PhaseContent, type AnswerFeedback } from "./PhaseContent";
import { FactCard, PositionCard, ProposalCard, RecordCard } from "./RecordCard";
import { statusText } from "./status";

// ---------------------------------------------------------------------------
// A fase
// ---------------------------------------------------------------------------

export function PhaseDialog({
  fase,
  total,
  sala,
  content,
  estado,
  proxima,
  falasDaConclusao,
  carimbo,
  desfecho,
  aprofundamentos,
  onAnswerQuestion,
  onAnswerOrder,
  onSkip,
  onOpenRecord,
  onContinue,
  onOpenPassport,
  onClose,
  encoberta = false,
}: {
  fase: PhaseSpec;
  total: number;
  sala: RoomSpec;
  content: GameContent;
  estado: PhaseProgress;
  proxima: PhaseSpec | null;
  falasDaConclusao: readonly FalaDita[];
  carimbo: StampNotice | null;
  desfecho: TrailOutcome | null;
  aprofundamentos: readonly DeepDive[];
  onAnswerQuestion(opcaoId: string): AnswerFeedback;
  onAnswerOrder(chaves: readonly string[]): AnswerFeedback;
  onSkip(): void;
  onOpenRecord(referencia: PhaseRef): void;
  onContinue(): void;
  onOpenPassport(): void;
  onClose(): void;
  /** Um registro ou o passaporte está aberto por cima: a fase continua montada, com a escolha e a rolagem como estavam. */
  encoberta?: boolean;
}) {
  return (
    <Dialog
      nome="fase"
      eyebrow={
        <span data-fase-posicao>
          {roomLabel(sala)} · Fase {fase.numero} de {total} · {periodLabel(fase.periodo)}
        </span>
      }
      titulo={<span data-fase-titulo>{fase.titulo}</span>}
      tamanho="largo"
      // A leitura começa no topo, e cada fase que entra na janela também.
      focoInicial="inicio"
      focoChave={fase.id}
      encoberta={encoberta}
      onClose={onClose}
      acoes={
        <button type="button" className={quietButton} onClick={onClose} data-fechar-fase>
          Voltar ao cenário
        </button>
      }
    >
      <PhaseContent
        // Cada fase começa com a atividade em branco: o que foi escolhido em uma não passa para a outra.
        key={fase.id}
        fase={fase}
        total={total}
        sala={sala}
        content={content}
        estado={estado}
        proxima={proxima}
        cabecalho={false}
        falasDaConclusao={falasDaConclusao}
        carimbo={carimbo}
        desfecho={desfecho}
        aprofundamentos={aprofundamentos}
        onAnswerQuestion={onAnswerQuestion}
        onAnswerOrder={onAnswerOrder}
        onSkip={onSkip}
        onOpenRecord={onOpenRecord}
        onContinue={onContinue}
        onOpenPassport={onOpenPassport}
      />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Um registro do período
// ---------------------------------------------------------------------------

/**
 * Um registro aberto de dentro de uma fase: o acontecimento, a decisão, o
 * fato biográfico, o cargo, a filiação ou a proposta eleitoral, como o atlas
 * o traz. É sempre opcional, e fechar volta à fase.
 */
export function RecordDialog({
  referencia,
  content,
  relacionados,
  falas,
  voltar,
  onOpenRecordPage,
  onClose,
}: {
  referencia: PhaseRef;
  content: GameContent;
  /** As decisões relacionadas a um episódio judicial, já resolvidas. */
  relacionados: readonly RelatedRecord[];
  /** O que o Escrivão diz ao abrir o registro. */
  falas: readonly FalaDita[];
  /** O rótulo do botão que fecha: para onde a pessoa volta. */
  voltar: string;
  /** A pessoa seguiu para a ficha completa, fora do jogo. */
  onOpenRecordPage(): void;
  onClose(): void;
}) {
  const personagem = content.personagem.slug;
  const registro = referencia.tipo === "acontecimento" ? content.registros[referencia.id] : undefined;
  const decisao = referencia.tipo === "decisao" ? content.decisoes[referencia.id] : undefined;
  const fato = referencia.tipo === "fato" ? content.fatos[referencia.id] : undefined;
  const posicao = referencia.tipo === "mandato" || referencia.tipo === "filiacao" ? content.posicoes[referencia.id] : undefined;
  const proposta = referencia.tipo === "proposta" ? content.propostas[referencia.id] : undefined;
  if (registro === undefined && decisao === undefined && fato === undefined && posicao === undefined && proposta === undefined) return null;
  return (
    <Dialog
      nome="registro"
      eyebrow="Registro do atlas · leitura opcional"
      titulo={decisao !== undefined ? "O que o atlas registra desta decisão" : proposta !== undefined ? "O que o documento registrado propõe" : "O que o atlas registra"}
      tamanho={decisao !== undefined ? "largo" : "medio"}
      onClose={onClose}
      acoes={
        <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-fechar-registro>
          {voltar}
        </button>
      }
    >
      <EscrivaoSays falas={falas} evento="explorar" className="mb-4" />
      {registro !== undefined && <RecordCard registro={registro} personagem={personagem} detalhe="completo" relacionados={relacionados} onOpenRecordPage={onOpenRecordPage} />}
      {decisao !== undefined && (
        <DecisionCard decisao={decisao} detalhe="completo" link={{ href: decisionHref(personagem, decisao.id), rotulo: "Ver esta decisão na trajetória, no atlas", onFollow: onOpenRecordPage }} />
      )}
      {fato !== undefined && <FactCard fato={fato} />}
      {posicao !== undefined && <PositionCard posicao={posicao} />}
      {proposta !== undefined && <ProposalCard proposta={proposta} />}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// A lista de fases, as preferências e o progresso
// ---------------------------------------------------------------------------

export function PhaseListDialog({
  content,
  sala,
  progresso,
  aberta,
  duravel,
  humor,
  leitura,
  onToggleHumor,
  onToggleReading,
  onOpenPhase,
  onReset,
  onClose,
  encoberta = false,
}: {
  content: GameContent;
  sala: RoomSpec;
  progresso: PlayerProgress;
  /** A fase em que a pessoa está. */
  aberta: PhaseSpec;
  duravel: boolean;
  humor: boolean;
  /** A trilha está em "Ler sem o cenário". */
  leitura: boolean;
  onToggleHumor(): void;
  onToggleReading(): void;
  onOpenPhase(id: string): void;
  onReset(): void;
  onClose(): void;
  /** A confirmação de apagar está aberta por cima: a lista continua montada, como estava. */
  encoberta?: boolean;
}) {
  const { personagem, fases, salas } = content;
  const outrasSalas = salas.filter((item) => item.id !== sala.id);
  return (
    <Dialog
      nome="fases"
      eyebrow={`${personagem.nome} · ${roomLabel(sala)}`}
      titulo="Fases"
      tamanho="largo"
      encoberta={encoberta}
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={quietButton} onClick={onReset} data-apagar-progresso>
            Apagar o progresso
          </button>
          <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
            Fechar
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <section aria-labelledby="lista-de-fases" className="space-y-2">
          <h3 id="lista-de-fases" className="eyebrow text-ink-soft">
            {fases.length === 1 ? "A fase" : `As ${fases.length} fases`} · nenhuma segura a seguinte
          </h3>
          <ol className="divide-y divide-line border-y border-line">
            {fases.map((fase) => {
              const estado = progresso.fases[fase.id];
              const atual = fase.id === aberta.id;
              return (
                <li key={fase.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm" data-fase-item={fase.id} data-situacao={phaseStatus(estado)} aria-current={atual ? "step" : undefined}>
                  <span className="numerals w-6 font-semibold">{fase.numero}</span>
                  <span className="min-w-[11rem] flex-1">
                    <span className={atual ? "font-semibold" : "font-medium"}>{fase.titulo}</span>
                    <span className="numerals text-ink-soft"> · {periodLabel(fase.periodo)}</span>
                    <span className="block text-xs text-ink-soft" data-situacao-texto>
                      {statusText(estado)}
                      {atual && " · você está aqui"}
                    </span>
                  </span>
                  <button type="button" className={secondaryButton} onClick={() => onOpenPhase(fase.id)} data-abrir-fase={fase.id} aria-label={`Abrir a fase ${fase.numero}: ${fase.titulo}`}>
                    {atual ? "Voltar a ela" : "Abrir"}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="preferencias-do-jogo" className="space-y-3 text-sm">
          <h3 id="preferencias-do-jogo" className="eyebrow text-ink-soft">
            Preferências
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="min-w-[14rem] flex-1" id="preferencia-cenario">
              {leitura ? "Você está lendo sem o cenário: as mesmas fases, só com o texto." : "Dá para ler as mesmas fases sem o cenário, só com o texto."}
            </p>
            <button type="button" className={secondaryButton} onClick={onToggleReading} aria-pressed={leitura} aria-describedby="preferencia-cenario" data-alternar-leitura={leitura ? "leitura" : "cenario"}>
              {leitura ? "Voltar ao cenário" : "Ler sem o cenário"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="min-w-[14rem] flex-1" id="preferencia-humor">
              O {ESCRIVAO_NOME}, guia fictício, faz falas de humor sobre papelada e sobre ele mesmo, iguais para os dois personagens. Elas são ficção, marcadas como
              tal, e podem ser desligadas; a instrução e o que vem do conteúdo continuam.
            </p>
            <button type="button" className={secondaryButton} onClick={onToggleHumor} aria-pressed={humor} aria-describedby="preferencia-humor" data-humor={humor ? "ligado" : "desligado"}>
              {humor ? "Desligar o humor" : "Ligar o humor"}
            </button>
          </div>
        </section>

        <section aria-labelledby="progresso-e-caminhos" className="space-y-1 text-sm">
          <h3 id="progresso-e-caminhos" className="eyebrow text-ink-soft">
            Progresso e outros caminhos
          </h3>
          <p data-progresso-duravel={duravel ? "sim" : "nao"}>
            {duravel
              ? "O que você leu e respondeu fica guardado neste navegador, separado por personagem. Abrir uma fase pela lista, ou por um link, não apaga nada."
              : "O armazenamento do navegador está indisponível: o progresso vale enquanto esta página estiver aberta, e se perde ao recarregar ou fechar."}
          </p>
          <ul className="pt-1">
            {outrasSalas.map((outra) => {
              const spec = roomOf(outra.id);
              return (
                <li key={outra.id}>
                  <Link href={gameHref(personagem.slug, outra.id)} prefetch={false} className={PATH_LINK} data-ir-para-sala={outra.id}>
                    {roomLabel(spec)}
                  </Link>
                  <span className="text-ink-soft">
                    {" "}
                    · {periodLabel(outra.periodo)} · {outra.fases === 1 ? "1 fase" : `${outra.fases} fases`}
                  </span>
                </li>
              );
            })}
            <li>
              <Link href={explorationHref(personagem.slug, { periodo: { de: null, ate: null }, categorias: [], acontecimento: null })} prefetch={false} className={PATH_LINK}>
                Ver a trajetória de {personagem.nome} no atlas, com todos os registros
              </Link>
            </li>
            <li>
              <Link href={gameHref()} prefetch={false} className={PATH_LINK}>
                Escolher a outra trajetória
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Como funciona
// ---------------------------------------------------------------------------

export function HelpDialog({
  sala,
  falas,
  humor,
  leitura,
  onToggleHumor,
  onClose,
}: {
  sala: RoomSpec;
  falas: readonly FalaDita[];
  humor: boolean;
  /** A pessoa está lendo sem o cenário: a fase já está na página, sem pasta e sem o botão de abrir o marco. */
  leitura: boolean;
  onToggleHumor(): void;
  onClose(): void;
}) {
  return (
    <Dialog
      nome="ajuda"
      eyebrow={ESCRIVAO_ROTULO}
      titulo="Como funciona"
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={quietButton} onClick={onToggleHumor} aria-pressed={humor} data-humor={humor ? "ligado" : "desligado"}>
            {humor ? "Desligar o humor" : "Ligar o humor"}
          </button>
          <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial>
            Entendi
          </button>
        </>
      }
    >
      <div className="space-y-3 text-base">
        <ol className="list-decimal space-y-1 pl-5">
          <li data-passo-de-abrir>{leitura ? "Sem o cenário, a fase já está aberta na página." : "Toque na pasta em destaque, ou no botão Abrir o marco."}</li>
          <li>Leia a explicação curta. As fontes e os termos explicados abrem no próprio texto.</li>
          <li>Responda a atividade, ou use Ver a explicação e continuar. Errar não tira nada: dá para tentar de novo ou seguir pela explicação.</li>
          <li data-passo-de-continuar>Use Continuar para ir à próxima fase. {leitura ? "Os outros registros são opcionais." : "As outras pastas são opcionais."}</li>
          <li data-passo-do-passaporte>
            Cada fase concluída deixa um carimbo no seu passaporte, pela resposta certa ou por Ver a explicação e continuar. Ele registra o caminho percorrido: não é nota.
          </li>
        </ol>
        <EscrivaoSays falas={falas} evento="ajuda" />
        {sala.natureza === "aprofundamento" && (
          <p className="text-sm" data-aviso-aprofundamento>
            Esta sala é um aprofundamento sobre um assunto, e não o começo da trajetória. As decisões são uma amostra documentada da edição, e não o
            histórico completo.
          </p>
        )}
        <p className="text-sm text-ink-soft" data-aviso-cenario>
          O cenário é uma representação: não afirma que a pessoa esteve neste lugar nem que os fatos aconteceram nele. A figura do personagem muda de cabelo,
          barba e roupa conforme a época, de forma estilizada; não afirma a aparência real em cada data. O {ESCRIVAO_NOME} é uma figura inventada para guiar o
          jogo. O jogo não atribui falas às pessoas retratadas, não dá nota e não recomenda voto.
        </p>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Apagar o progresso
// ---------------------------------------------------------------------------

export function ConfirmResetDialog({ nome, onConfirm, onClose }: { nome: string; onConfirm(): void; onClose(): void }) {
  return (
    <Dialog
      nome="apagar"
      eyebrow="Progresso"
      titulo={`Apagar o progresso de ${nome}?`}
      onClose={onClose}
      acoes={
        <>
          <button type="button" className={secondaryButton} onClick={onClose} data-foco-inicial>
            Cancelar
          </button>
          <button type="button" className={primaryButton} onClick={onConfirm} data-confirmar-apagar>
            Apagar
          </button>
        </>
      }
    >
      <p className="reading">
        O que foi lido e respondido com este personagem, neste navegador, será apagado, na trajetória e nos aprofundamentos. O progresso do outro personagem não
        muda. Para rever as fases desde o começo não é preciso apagar nada: a lista de fases abre qualquer uma.
      </p>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// O resumo do fim
// ---------------------------------------------------------------------------

/**
 * O que a pessoa viu na sala, o que a edição não pesquisou e para onde ir. Sem
 * troféu e sem juízo: é uma lista. Serve à janela sobre o cenário e à leitura
 * sem o cenário. No resumo de uma trajetória, o alto traz o convite para a
 * outra e, com as duas percorridas, a comparação e os aprofundamentos (D-150).
 */
export function SummaryContent({
  content,
  sala,
  progresso,
  outraPessoa,
  desfecho,
  aprofundamentos,
  onOpenPhase,
}: {
  content: GameContent;
  sala: RoomSpec;
  progresso: PlayerProgress;
  /** Na trajetória, como ela e as outras estão. `null` nos aprofundamentos. */
  desfecho: TrailOutcome | null;
  /** Os aprofundamentos das trajetórias, para quem percorreu todas. */
  aprofundamentos: readonly DeepDive[];
  /** A outra trajetória do atlas, para o caminho até ela. */
  outraPessoa: { slug: string; nome: string } | null;
  onOpenPhase(id: string): void;
}) {
  const { personagem, fases, salas } = content;
  const concluidas = fases.filter((fase) => phaseStatus(progresso.fases[fase.id]) === "concluida").length;
  const lacunas = fases.flatMap((fase) => fase.lacunas.map((lacuna) => ({ fase, lacuna })));
  const outrasSalas = salas.filter((item) => item.id !== sala.id);
  const trajetoria = sala.natureza === "trajetoria";
  return (
    <div className="space-y-6" data-resumo={sala.id}>
      <div className="space-y-2">
        <p className="reading" data-resumo-contagem>
          {trajetoria
            ? `A trajetória de ${personagem.nome} tem ${fases.length} fases nesta edição, com marcos documentados de ${fases[0]?.periodo.de} a ${fases.at(-1)?.periodo.ate}. Você concluiu ${concluidas} de ${fases.length}.`
            : `Este aprofundamento tem ${fases.length === 1 ? "uma fase" : `${fases.length} fases`} sobre decisões documentadas de ${personagem.nome} no tema ${sala.nome}, de ${fases[0]?.periodo.de} a ${fases.at(-1)?.periodo.ate}. Você concluiu ${concluidas} de ${fases.length}.`}{" "}
          São marcos documentados, e não a vida inteira nem tudo o que a pessoa fez.
        </p>
      </div>

      {desfecho !== null && <TrailEnd nome={personagem.nome} desfecho={desfecho} aprofundamentos={aprofundamentos} />}

      <section aria-labelledby="resumo-fases" className="space-y-2">
        <h3 id="resumo-fases" className="eyebrow text-ink-soft">
          O que cada fase mostrou
        </h3>
        <ol className="divide-y divide-line border-y border-line">
          {fases.map((fase) => (
            <li key={fase.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-2 text-sm" data-resumo-fase={fase.id} data-situacao={phaseStatus(progresso.fases[fase.id])}>
              <span className="numerals w-6 font-semibold">{fase.numero}</span>
              <span className="min-w-[12rem] flex-1">
                <span className="font-medium">{fase.titulo}</span>
                <span className="numerals text-ink-soft"> · {periodLabel(fase.periodo)}</span>
                <span className="block text-ink-soft">Para {fase.objetivo}</span>
                <span className="block text-xs text-ink-soft">{statusText(progresso.fases[fase.id])}</span>
              </span>
              <button type="button" className={quietButton} onClick={() => onOpenPhase(fase.id)} data-abrir-fase={fase.id} aria-label={`Rever a fase ${fase.numero}: ${fase.titulo}`}>
                Rever
              </button>
            </li>
          ))}
        </ol>
      </section>

      {lacunas.length > 0 && (
        <section aria-labelledby="resumo-lacunas" className="space-y-2 text-sm" data-resumo-lacunas>
          <h3 id="resumo-lacunas" className="eyebrow text-ink-soft">
            Ainda não pesquisado nesta edição
          </h3>
          <p className="text-ink-soft">Uma lacuna da pesquisa não é uma afirmação sobre a pessoa: diz só o que o atlas ainda não tem.</p>
          <ul className="list-disc space-y-1 pl-5">
            {lacunas.map(({ fase, lacuna }, indice) => (
              <li key={`${fase.id}-${indice}`}>
                <span className="text-ink-soft">Fase {fase.numero}: </span>
                {lacuna}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="resumo-caminhos" className="space-y-2 text-sm">
        <h3 id="resumo-caminhos" className="eyebrow text-ink-soft">
          Para onde ir agora
        </h3>
        <ul>
          {!trajetoria && (
            <li>
              <Link href={gameHref(personagem.slug)} prefetch={false} className={PATH_LINK} data-ir-para-sala="historico">
                A trajetória de {personagem.nome}, desde a origem
              </Link>
            </li>
          )}
          {outraPessoa !== null && (
            <li>
              <Link href={gameHref(outraPessoa.slug)} prefetch={false} className={PATH_LINK} data-outra-trajetoria={outraPessoa.slug}>
                A trajetória de {outraPessoa.nome}
              </Link>
            </li>
          )}
          <li>
            <Link href={comparisonHref()} prefetch={false} className={PATH_LINK} data-ir-para-comparar>
              Comparar as duas trajetórias
            </Link>
          </li>
          <li>
            <Link href={`${comparisonHref()}#propostas`} prefetch={false} className={PATH_LINK} data-ir-para-propostas>
              As propostas das duas candidaturas registradas no TSE, por área
            </Link>
          </li>
          {outrasSalas.map((outra) => {
            const spec = roomOf(outra.id);
            if (spec.natureza === "trajetoria") return null;
            return (
              <li key={outra.id}>
                <Link href={gameHref(personagem.slug, outra.id)} prefetch={false} className={PATH_LINK} data-ir-para-sala={outra.id}>
                  {roomLabel(spec)} de {personagem.nome}
                </Link>
                <span className="text-ink-soft"> · decisões de {periodLabel(outra.periodo)}</span>
              </li>
            );
          })}
          <li>
            <Link href={explorationHref(personagem.slug, { periodo: { de: null, ate: null }, categorias: [], acontecimento: null })} prefetch={false} className={PATH_LINK}>
              Todos os registros de {personagem.nome} no atlas, com data, lugar e fontes
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

export function SummaryDialog(props: Parameters<typeof SummaryContent>[0] & { onClose(): void }) {
  const { content, sala, onClose } = props;
  return (
    <Dialog
      nome="resumo"
      eyebrow={`${content.personagem.nome} · ${roomLabel(sala)}`}
      titulo={sala.natureza === "trajetoria" ? "Resumo da trajetória" : "Resumo do aprofundamento"}
      tamanho="largo"
      onClose={onClose}
      acoes={
        <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-fechar-resumo>
          Fechar
        </button>
      }
    >
      <SummaryContent {...props} />
    </Dialog>
  );
}
