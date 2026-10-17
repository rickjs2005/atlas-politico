"use client";

// O Passaporte do Escrivão (docs/GAMEPLAY.md, D-150): a caderneta de carimbos
// do jogo. Aqui ficam as peças de tela dele:
//   o carimbo de uma fase, em papel e tinta, com o título dela;
//   a faixa do cartão da fase, com a contagem do que foi concluído, a
//     sequência de marcadores e o botão que abre a caderneta;
//   o aviso de um carimbo que acabou de entrar, com a confirmação curta;
//   a apresentação da fase seguinte, tirada do roteiro publicado;
//   o convite do fim de uma trajetória;
//   e a janela da caderneta, com uma página por pessoa e os selos.
//
// Nada disto guarda estado próprio: tudo é derivado do progresso do jogo
// (src/lib/game/passport.ts). As duas pessoas têm as mesmas peças, com as
// mesmas cores; na caderneta, a página de quem está em jogo vem primeiro, e a
// da outra pessoa, em seguida, qualquer que seja a pessoa. O carimbo
// reconhece o caminho percorrido: é o mesmo para quem respondeu certo e para
// quem leu a explicação, e não é nota.

import Link from "next/link";
import type { CSSProperties } from "react";

import { PATH_LINK } from "@/components/touch";
import { ESCRIVAO_NOME, type FalaDita } from "@/lib/game/escrivao";
import {
  countLabel,
  countSpoken,
  countStamps,
  nextPhaseSentence,
  pagePhases,
  stampSlots,
  type DeepDive,
  type PassportPage,
  type PassportPhase,
  type ProgressByCharacter,
  type Seal,
  type StampCount,
  type StampSlot,
  type TrailMarker,
  type TrailOutcome,
} from "@/lib/game/passport";
import { gameQuery } from "@/lib/game/query";
import { DEFAULT_ROOM, periodLabel, roomLabel, roomOf } from "@/lib/game/rooms";
import type { PersonagemSlug, PhaseSpec, RoomId } from "@/lib/game/types";
import { comparisonHref, gameHref } from "@/lib/state/links";

import { Dialog, primaryButton, quietButton, secondaryButton } from "./Dialog";
import { stampStatusText } from "./status";

// ---------------------------------------------------------------------------
// O carimbo
// ---------------------------------------------------------------------------

/** O giro de cada carimbo, em graus, pela posição da fase: pequeno, e igual para as duas pessoas. */
const GIROS = [-2, 1.5, -1, 2, -1.5, 1];

/**
 * O carimbo de uma fase: uma moldura de tinta com a posição, o período e o
 * título. É desenho: quem lê a página por leitor de tela recebe o mesmo em
 * texto, no nome do controle ou na linha ao lado.
 */
export function StampMark({ fase, novo = false, className = "" }: { fase: Pick<PassportPhase, "numero" | "titulo" | "periodo">; novo?: boolean; className?: string }) {
  const giro = GIROS[(fase.numero - 1) % GIROS.length]!;
  return (
    <span aria-hidden="true" className={`jogo-carimbo ${novo ? "jogo-carimbo-novo" : ""} ${className}`} style={{ "--giro": `${giro}deg` } as CSSProperties} data-carimbo-desenho={novo ? "novo" : "parado"}>
      <span className="eyebrow text-ink-soft">
        Fase {fase.numero} · <span className="numerals whitespace-nowrap">{periodLabel(fase.periodo)}</span>
      </span>
      <span className="font-serif text-sm font-medium leading-tight">{fase.titulo}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// A faixa do cartão da fase
// ---------------------------------------------------------------------------

interface PassportStripProps {
  /** As fases da sala aberta, na ordem: quais têm carimbo e qual está aberta. */
  marcadores: readonly TrailMarker[];
  contagem: StampCount;
  /** O progresso guardado já foi lido. Antes disso a faixa ocupa o mesmo lugar, sem números. */
  carregado: boolean;
  onOpen(): void;
  className?: string;
}

/**
 * O progresso à vista durante a partida, em um controle só: o que foi
 * concluído, o que falta, um marcador por fase e o caminho para a caderneta.
 * A fase aberta tem um anel; a concluída é cheia. Estar na fase 4 não é ter
 * concluído quatro. O marcador de uma fase recém-concluída só muda de cor: a
 * batida do carimbo fica na fase, onde a pessoa está olhando.
 */
export function PassportStrip({ marcadores, contagem, carregado, onOpen, className = "" }: PassportStripProps) {
  const linha = countLabel(contagem);
  return (
    <button
      type="button"
      className={`flex min-h-11 w-full items-center justify-between gap-3 border border-ink bg-raised px-3 py-1 text-left hover:bg-paper ${className}`}
      onClick={onOpen}
      aria-label={carregado ? `Meu passaporte. ${countSpoken(contagem)}.` : "Meu passaporte"}
      data-abrir-passaporte
      data-concluidas={carregado ? contagem.carimbadas : undefined}
      data-faltam={carregado ? contagem.faltam : undefined}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight">Meu passaporte</span>
        <span className="numerals block whitespace-nowrap text-xs leading-tight text-ink-soft" data-passaporte-contagem>
          {carregado ? linha : " "}
        </span>
      </span>
      {/* Os marcadores têm um tamanho só: os de uma trajetória cabem em uma linha ao lado da contagem, também no cartão mais estreito. Só uma sala bem mais longa quebraria a linha. */}
      <span className="flex max-w-[45%] shrink-0 flex-wrap justify-end gap-[3px]" aria-hidden="true" data-passaporte-marcadores>
        {marcadores.map((marcador) => (
          <span
            key={marcador.id}
            className={`size-2 rounded-full border ${carregado && marcador.carimbada ? "border-accent bg-accent" : "border-ink-faint"} ${marcador.aberta ? "mx-0.5 ring-2 ring-ink ring-offset-1 ring-offset-raised" : ""}`}
            data-marcador-de-fase={marcador.id}
            data-carimbada={carregado && marcador.carimbada ? "sim" : "nao"}
            data-aberta={marcador.aberta ? "sim" : undefined}
          />
        ))}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// O carimbo que acabou de entrar, e o de uma fase já concluída
// ---------------------------------------------------------------------------

/** O que a tela mostra quando uma fase acaba de ser concluída nesta visita. */
export interface StampNotice {
  /** A confirmação curta, já escrita: fala do caminho, e não da resposta. */
  confirmacao: string;
  /** Os selos que este carimbo trouxe, quando trouxe. */
  selos: readonly Seal[];
  /** O que o Escrivão diz do carimbo: a instrução e, quando cabe, o humor. */
  falas: readonly FalaDita[];
  /** A fase é de contexto sensível: a confirmação é sóbria, e o Escrivão não faz humor. O desenho do carimbo é o mesmo de toda fase. */
  sobrio: boolean;
}

/**
 * O carimbo dentro da fase. Com `aviso`, ele acabou de entrar: o desenho bate
 * uma vez, igual em toda fase, ao lado da confirmação. O que está escrito aqui
 * é para quem vê: quem ouve a página recebe a mesma coisa, uma vez, pela linha
 * de aviso da fase (`stampAnnouncement`, em PhaseContent), e por isso o texto
 * daqui fica fora da árvore de acessibilidade. O botão fica dentro dela. Sem
 * `aviso`, a fase já estava concluída: fica uma linha, sem comemorar de novo.
 */
export function StampNote({ fase, aviso, onOpenPassport }: { fase: PhaseSpec; aviso: StampNotice | null; onOpenPassport(): void }) {
  if (aviso === null) {
    return (
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-sm" data-carimbo="registrado">
        <span>Esta fase já tem carimbo no seu passaporte.</span>
        <button type="button" className={quietButton} onClick={onOpenPassport} data-ver-passaporte>
          Ver o passaporte
        </button>
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3" data-carimbo="novo" data-carimbo-sobrio={aviso.sobrio ? "sim" : undefined}>
      <StampMark fase={fase} novo className="mx-1 max-w-[14rem]" />
      <div className="min-w-[12rem] flex-1 space-y-1">
        <div className="space-y-1" aria-hidden="true">
          <p className="font-medium" data-carimbo-confirmacao>
            {aviso.confirmacao}
          </p>
          {aviso.selos.map((selo) => (
            <p key={selo.id} className="text-sm font-medium" data-selo-novo={selo.id}>
              Selo novo no passaporte: {selo.nome}.
            </p>
          ))}
        </div>
        <button type="button" className={quietButton} onClick={onOpenPassport} data-ver-passaporte>
          Ver o passaporte
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A fase seguinte
// ---------------------------------------------------------------------------

/**
 * A apresentação da fase seguinte, depois da explicação da resposta: o título,
 * o período e, em uma frase, o que ela mostra. A frase é o objetivo da fase,
 * como o conteúdo publicado o escreve; o botão de continuar vem logo abaixo.
 */
export function NextPhasePreview({ proxima, total }: { proxima: PhaseSpec; total: number }) {
  return (
    <section aria-label="A seguir" className="space-y-1 border border-line bg-paper px-3 py-3" data-proxima-fase={proxima.id}>
      <p className="eyebrow text-ink-soft" data-proxima-posicao>
        A seguir · fase {proxima.numero} de {total} · <span className="numerals">{periodLabel(proxima.periodo)}</span>
      </p>
      <p className="font-serif text-lg font-medium leading-snug" data-proxima-titulo>
        {proxima.titulo}
      </p>
      <p className="text-sm" data-proxima-frase>
        {nextPhaseSentence(proxima)}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// O fim de uma trajetória
// ---------------------------------------------------------------------------

const conviteButton = `${secondaryButton} gap-1.5 text-center`;

/** O caminho para um aprofundamento, com o assunto, a pessoa e os anos. */
function DeepDiveItem({ aprofundamento }: { aprofundamento: DeepDive }) {
  return (
    <li>
      <Link href={gameHref(aprofundamento.personagem, aprofundamento.sala)} prefetch={false} className={PATH_LINK} data-convite-aprofundamento={`${aprofundamento.personagem}:${aprofundamento.sala}`}>
        {roomLabel(roomOf(aprofundamento.sala))} de {aprofundamento.nome}
      </Link>
      <span className="numerals text-ink-soft"> · {roomOf(aprofundamento.sala).natureza === "investigacao" ? "documentos" : "decisões"} de {periodLabel(aprofundamento.periodo)}</span>
    </li>
  );
}

/**
 * O que a tela oferece a quem chega ao fim de uma trajetória. Com ela
 * percorrida, o convite para a outra, com as mesmas regras; com as duas
 * percorridas, a comparação e os aprofundamentos. Quando ainda faltam fases,
 * a tela diz quantas, sem cobrar. Vale igual para as duas pessoas.
 */
export function TrailEnd({ nome, desfecho, aprofundamentos }: { nome: string; desfecho: TrailOutcome; aprofundamentos: readonly DeepDive[] }) {
  const pendentes = desfecho.outras.filter((outra) => !outra.percorrida);
  if (desfecho.todasPercorridas) {
    return (
      <section aria-label="Fim da trajetória" className="space-y-2 border border-ink bg-paper px-3 py-3" data-fim-da-trajetoria="todas">
        <p className="font-serif text-lg font-medium leading-snug">{desfecho.outras.length === 1 ? "As duas trajetórias estão percorridas." : "Todas as trajetórias estão percorridas."}</p>
        <p className="text-sm">Você pode ver as duas lado a lado, no mesmo período, ou ler as decisões documentadas de um assunto.</p>
        <p>
          <Link href={comparisonHref()} prefetch={false} className={conviteButton} data-convite-comparar>
            Comparar as duas trajetórias
            <span aria-hidden="true">→</span>
          </Link>
        </p>
        {aprofundamentos.length > 0 && (
          <ul className="text-sm" data-convite-aprofundamentos>
            {aprofundamentos.map((aprofundamento) => (
              <DeepDiveItem key={`${aprofundamento.personagem}:${aprofundamento.sala}`} aprofundamento={aprofundamento} />
            ))}
          </ul>
        )}
      </section>
    );
  }
  return (
    <section aria-label="Fim da trajetória" className="space-y-2 border border-ink bg-paper px-3 py-3" data-fim-da-trajetoria={desfecho.percorrida ? "percorrida" : "incompleta"}>
      <p className="font-serif text-lg font-medium leading-snug" data-fim-situacao>
        {desfecho.percorrida
          ? `Trajetória de ${nome} percorrida.`
          : `Você chegou ao fim da trajetória de ${nome}. ${desfecho.faltam === 1 ? "Falta 1 fase" : `Faltam ${desfecho.faltam} fases`} para percorrê-la inteira: a lista de fases abre qualquer uma.`}
      </p>
      {pendentes.map((outra) => (
        <div key={outra.personagem} className="space-y-2">
          <p className="text-sm">A trajetória de {outra.nome} segue as mesmas regras, com as fases e os documentos dela.</p>
          <p>
            <Link href={gameHref(outra.personagem)} prefetch={false} className={conviteButton} data-convite-outra-trajetoria={outra.personagem}>
              Conhecer a trajetória de {outra.nome}
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// A caderneta
// ---------------------------------------------------------------------------

const slotClass = "flex h-full min-h-24 w-full flex-col items-start gap-1 border px-2 py-2 text-left no-underline";

interface SlotProps {
  espaco: StampSlot;
  /** A fase aberta agora, quando é desta página. */
  aberta: boolean;
  /** A fase é da sala aberta: abrir é ação do jogo. As outras são links. */
  onOpen: (() => void) | null;
  href: string;
}

/** Um espaço da caderneta: o carimbo da fase concluída, ou o lugar dele. Abre a fase, que é navegação: não conclui nem apaga nada. */
function Slot({ espaco, aberta, onOpen, href }: SlotProps) {
  const { fase, carimbada, estado } = espaco;
  const situacao = carimbada ? "Carimbada" : `Sem carimbo: ${stampStatusText(estado)}`;
  const nome = `Fase ${fase.numero}: ${fase.titulo}, ${periodLabel(fase.periodo)}. ${situacao}.${aberta ? " Você está aqui." : ""} ${carimbada ? "Rever" : "Abrir"} a fase.`;
  const conteudo = carimbada ? (
    <>
      <StampMark fase={fase} className="mx-1 my-1" />
      {aberta && <span className="text-xs text-ink-soft">você está aqui</span>}
    </>
  ) : (
    <>
      <span className="eyebrow text-ink-soft" aria-hidden="true">
        Fase {fase.numero} · <span className="numerals whitespace-nowrap">{periodLabel(fase.periodo)}</span>
      </span>
      <span className="text-sm leading-tight text-ink-soft" aria-hidden="true">
        {fase.titulo}
      </span>
      <span className="text-xs text-ink-soft" aria-hidden="true">
        sem carimbo · {stampStatusText(estado)}
        {aberta && " · você está aqui"}
      </span>
    </>
  );
  const classe = `${slotClass} ${carimbada ? "border-line bg-raised hover:border-ink" : "border-dashed border-ink-faint bg-paper hover:border-ink"}`;
  return (
    <li data-carimbo-fase={fase.id} data-carimbada={carimbada ? "sim" : "nao"} aria-current={aberta ? "step" : undefined}>
      {onOpen !== null ? (
        <button type="button" className={classe} onClick={onOpen} aria-label={nome} data-abrir-fase={fase.id}>
          {conteudo}
        </button>
      ) : (
        <Link href={href} prefetch={false} className={classe} aria-label={nome} data-abrir-fase={fase.id}>
          {conteudo}
        </Link>
      )}
    </li>
  );
}

interface PassportDialogProps {
  /** Uma página por pessoa, na ordem dos perfis; a janela põe primeiro a de quem está em jogo. */
  paginas: readonly PassportPage[];
  /** O progresso de cada pessoa neste navegador. */
  progressos: ProgressByCharacter;
  /** O personagem e a sala abertos, e a fase em que a pessoa está. */
  personagem: PersonagemSlug;
  sala: RoomId;
  abertaId: string;
  selos: readonly Seal[];
  /** O progresso fica guardado entre visitas. */
  duravel: boolean;
  /** O rótulo do botão que fecha: para onde a pessoa volta. */
  voltar: string;
  /** Abre uma fase da sala aberta. */
  onOpenPhase(id: string): void;
  onClose(): void;
}

/**
 * A caderneta: uma página por pessoa, a de quem está em jogo primeiro, com um
 * espaço por fase, e os selos. Abrir uma fase daqui é navegação, como na lista
 * de fases. Nada aqui dá nota: o texto diz o que o carimbo reconhece.
 */
export function PassportDialog({ paginas, progressos, personagem, sala, abertaId, selos, duravel, voltar, onOpenPhase, onClose }: PassportDialogProps) {
  const todasPercorridas = selos.some((selo) => selo.id === "duas-trajetorias" && selo.obtido);
  // A página de quem está em jogo vem primeiro: é onde está o carimbo que a pessoa veio ver. A da outra pessoa vem logo
  // abaixo, com as mesmas peças. A regra é a mesma para as duas: nenhuma fica sempre em cima.
  const ordenadas = [...paginas.filter((pagina) => pagina.personagem === personagem), ...paginas.filter((pagina) => pagina.personagem !== personagem)];
  return (
    <Dialog
      nome="passaporte"
      eyebrow={`${ESCRIVAO_NOME} · caderneta de carimbos`}
      titulo="Passaporte do Escrivão"
      tamanho="largo"
      onClose={onClose}
      acoes={
        <button type="button" className={primaryButton} onClick={onClose} data-foco-inicial data-fechar-passaporte>
          {voltar}
        </button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-1 text-sm">
          <p data-passaporte-regra>
            Cada fase concluída deixa um carimbo, com o título dela. Responder certo e usar Ver a explicação e continuar valem o mesmo carimbo: o passaporte
            registra o caminho percorrido, e não dá nota.
          </p>
          <p className="text-ink-soft" data-passaporte-duravel={duravel ? "sim" : "nao"}>
            {duravel
              ? "Os carimbos ficam guardados neste navegador, separados por pessoa."
              : "O armazenamento do navegador está indisponível: os carimbos valem enquanto esta página estiver aberta, e se perdem ao recarregar ou fechar."}
          </p>
        </div>

        {ordenadas.map((pagina) => {
          const progresso = progressos[pagina.personagem];
          const trajetoria = pagePhases(pagina, DEFAULT_ROOM);
          const contagem = countStamps(trajetoria, progresso);
          const outrasSalas = [...new Set(pagina.fases.map((fase) => fase.sala))].filter((item) => item !== DEFAULT_ROOM);
          const desta = pagina.personagem === personagem;
          const espaco = (item: StampSlot) => {
            const naSalaAberta = desta && item.fase.sala === sala;
            return (
              <Slot
                key={item.fase.id}
                espaco={item}
                aberta={desta && item.fase.id === abertaId}
                onOpen={naSalaAberta ? () => onOpenPhase(item.fase.id) : null}
                href={`${gameHref(pagina.personagem, item.fase.sala)}${gameQuery(item.fase.numero)}`}
              />
            );
          };
          return (
            <section
              key={pagina.personagem}
              aria-labelledby={`passaporte-${pagina.personagem}`}
              className="space-y-3 border border-ink bg-paper p-3"
              data-passaporte-pagina={pagina.personagem}
              data-carimbos={contagem.carimbadas}
              data-pagina-do-jogo={desta ? "sim" : undefined}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 id={`passaporte-${pagina.personagem}`} className="font-serif text-xl font-medium leading-tight">
                  Trajetória de {pagina.nome}
                </h3>
                <p className="numerals text-sm text-ink-soft" data-passaporte-pagina-contagem>
                  {countLabel(contagem)}
                </p>
              </div>
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={`Carimbos da trajetória de ${pagina.nome}`}>
                {stampSlots(trajetoria, progresso).map(espaco)}
              </ol>
              {outrasSalas.length > 0 && (
                <div className="space-y-2 border-t border-line pt-3">
                  <h4 className="eyebrow text-ink-soft">{outrasSalas.some((item) => roomOf(item).natureza === "investigacao") ? "Aprofundamentos por assunto e missão · opcionais" : "Aprofundamentos por assunto · opcionais"}</h4>
                  <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={`Carimbos dos aprofundamentos e da missão de ${pagina.nome}`}>
                    {outrasSalas.flatMap((item) => stampSlots(pagePhases(pagina, item), progresso)).map(espaco)}
                  </ol>
                </div>
              )}
            </section>
          );
        })}

        <section aria-labelledby="passaporte-selos" className="space-y-2" data-selos>
          <h3 id="passaporte-selos" className="eyebrow text-ink-soft">
            Selos do percurso
          </h3>
          <ul className="divide-y divide-line border-y border-line">
            {selos.map((selo) => (
              <li key={selo.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-2 text-sm" data-selo={selo.id} data-obtido={selo.obtido ? "sim" : "nao"}>
                <span className={`min-w-[11rem] flex-1 ${selo.obtido ? "font-semibold" : "font-medium text-ink-soft"}`}>{selo.nome}</span>
                <span className="min-w-[12rem] flex-[2] text-ink-soft">{selo.regra}</span>
                <span className={selo.obtido ? "font-medium" : "text-ink-soft"} data-selo-situacao>
                  {selo.obtido ? "no passaporte" : "ainda não"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-soft">Os selos reconhecem o que foi explorado e concluído. Nenhum depende de acertar, e nenhum compara as duas pessoas.</p>
          {todasPercorridas && (
            <p className="text-sm">
              <Link href={comparisonHref()} prefetch={false} className={PATH_LINK} data-passaporte-comparar>
                Comparar as duas trajetórias
              </Link>
            </p>
          )}
        </section>
      </div>
    </Dialog>
  );
}
