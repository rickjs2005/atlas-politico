// Contratos do jogo (docs/GAMEPLAY.md e docs/GAME-TRAIL.md). Só tipos: servem
// ao build, ao navegador e aos testes.
//
// O jogo não guarda conteúdo editorial. As fases, com a explicação e a
// atividade, vêm do conjunto publicado (`fasesDoJogo`), como os fatos
// biográficos e os conceitos; cada bloco de uma fase aponta, pelo
// identificador, os registros que o sustentam, e os textos, as datas e as
// fontes desses registros chegam pelos dados gerados, como em qualquer outra
// tela do atlas. O que fica no código é apresentação: o cenário e a figura de
// cada fase.

import type { DecisionView } from "@/lib/data/decisions";
import type { ProfileSlug } from "@/lib/domain/profiles";
import type { AtividadeDeFase, Categoria, DataHistorica, Editorial, Fonte, ReferenciaDeFase, SalaDoJogo, Tema, TipoDeFatoBiografico } from "@/lib/domain/types";

export type PersonagemSlug = ProfileSlug;

// ---------------------------------------------------------------------------
// Salas
// ---------------------------------------------------------------------------

/**
 * As salas do jogo. `historico` é a trajetória: a trilha da vida, da origem à
 * data de corte. `economia` e `seguranca-publica` são aprofundamentos sobre
 * decisões documentadas de um assunto. A sala não é a cena (`SceneId`, o cenário de uma fase)
 * nem uma categoria do atlas: é a trilha que a pessoa percorre. Os
 * identificadores estão nos endereços e no conteúdo (`SALAS_DO_JOGO`).
 */
export type RoomId = SalaDoJogo;

// ---------------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------------

/** Um registro apontado por uma fase: tipo e identificador no conjunto publicado. */
export type PhaseRef = ReferenciaDeFase;

/** A atividade de uma fase: pergunta com duas ou três opções, ou ordenação curta. */
export type PhaseActivity = AtividadeDeFase;

/**
 * A arte de um cenário: piso, paredes, porta e materiais. Uma arte pode
 * servir a mais de uma cena, com paleta e disposição próprias; a cena é o
 * que a fase aponta (`SceneId`).
 */
export type SceneArtId = "sindicato" | "constituinte" | "alerj" | "senado" | "comite" | "tribunal" | "gabinete" | "comissao" | "convencao";

export type SceneId =
  | "arquivo-origem-a"
  | "arquivo-origem-b"
  | "sindicato"
  | "constituinte"
  | "alerj"
  | "senado"
  | "comite"
  | "tribunal-a"
  | "tribunal-b"
  | "gabinete"
  | "comissao"
  | "convencao-a"
  | "convencao-b"
  | "arquivo-economia-a"
  | "arquivo-economia-b"
  | "arquivo-seguranca-a"
  | "arquivo-seguranca-b"
  | "arquivo-investigacao-a"
  | "arquivo-investigacao-b";

/**
 * A época da figura do personagem na fase: variações estilizadas de cabelo,
 * barba e roupa, as mesmas para os dois personagens (D-111). Não afirmam a
 * aparência real em cada data.
 */
export type Epoca = "inicio" | "meio" | "atual";

/** Como cada época aparece na interface: a figura é uma representação, e o rótulo diz isso. */
export const EPOCA_LABEL: Record<Epoca, string> = {
  inicio: "figura dos primeiros anos",
  meio: "figura dos anos intermediários",
  atual: "figura dos anos recentes",
};

/** Um bloco da explicação de uma fase: o texto e os registros que o sustentam. */
export interface PhaseBlock {
  texto: string;
  referencias: readonly PhaseRef[];
}

/**
 * Uma fase como o jogo a recebe: o que o conteúdo publicado diz dela
 * (`FaseDoJogo`), mais a apresentação (cenário e figura), que é do código, e
 * a marca de contexto sensível, que é regra do jogo.
 */
export interface PhaseSpec {
  /** Identificador estável, usado no progresso salvo. */
  id: string;
  personagem: PersonagemSlug;
  sala: RoomId;
  /** Posição na sala, a partir de 1. */
  numero: number;
  titulo: string;
  /** O que a pessoa sabe ao terminar a fase. */
  objetivo: string;
  /** Os anos que a fase cobre. */
  periodo: { de: number; ate: number };
  /** O registro principal: é o que o cenário destaca. */
  marco: PhaseRef;
  explicacao: readonly PhaseBlock[];
  /** Os conceitos definidos nesta fase. */
  conceitos: readonly string[];
  atividade: PhaseActivity;
  /** Os outros registros do período, opcionais. */
  explorar: readonly PhaseRef[];
  /** O que a edição não pesquisou neste período. */
  lacunas: readonly string[];
  /** Quem conferiu o texto da fase e quando. */
  editorial: Editorial;
  cena: SceneId;
  epoca: Epoca;
  /** A fase trata de processo judicial, prisão, acusação ou violência: o Escrivão não faz humor (D-129). */
  sensivel: boolean;
}

// ---------------------------------------------------------------------------
// Progresso do jogador (salvo localmente, por personagem)
// ---------------------------------------------------------------------------

/**
 * Versão do formato salvo. As versões 1 a 5 guardavam capítulos com registros
 * recolhidos, tarefa confirmada e saída (src/lib/game/legacy.ts as lê). A 6 é
 * a da trilha (D-135): por fase, se a explicação foi aberta, como a atividade
 * foi concluída e a assinatura do que decide a resposta, mais a fase em que a
 * pessoa parou em cada sala e, quando houve migração, o salvo anterior inteiro.
 */
export const PROGRESS_VERSION = 6;

/** Como a atividade de uma fase foi concluída: com a resposta certa, ou lendo a explicação no lugar de responder. */
export type ActivityOutcome = "resposta" | "explicacao";

export interface PhaseProgress {
  /** A explicação da fase foi aberta. */
  vista: boolean;
  /** Como a atividade foi concluída. Ausente enquanto não foi. */
  concluida?: ActivityOutcome;
  /**
   * A atividade que foi concluída, pela assinatura de `activitySignature`
   * (identificador da fase, tipo e um resumo do que decide a resposta). Só
   * existe com `concluida`. Se o que decide a resposta mudar, a conclusão
   * deixa de valer na leitura do progresso; `vista` e as tentativas ficam.
   */
  assinatura?: string;
  /** Quantas respostas foram dadas (só informação; não pune). */
  tentativas: number;
  /**
   * A fase cobre registros de um capítulo concluído em um formato anterior. A
   * atividade nova não foi respondida: a marca só diz que a pessoa já passou
   * por este período.
   */
  anterior?: true;
  /**
   * A fase tinha sido concluída e uma correção no conteúdo mudou o que decide
   * a resposta: a conclusão deixou de valer, e a tela diz por quê. Sai quando
   * a fase é concluída de novo.
   */
  reaberta?: true;
  /**
   * O andamento do dossiê de uma missão de investigação (D-151): os
   * documentos recolhidos da gaveta, a ficha relacionada a cada documento e as
   * fichas conferidas. Só existe em fase com atividade `dossie`; a conclusão
   * continua sendo `concluida`, como nas outras fases. O formato 6 não mudou
   * de número: o campo é opcional, e um salvo sem ele é lido como antes.
   */
  dossie?: DossierProgress;
}

/** O andamento de um dossiê, por chaves de registro (`tipo:id`) e identificadores de ficha. */
export interface DossierProgress {
  /** Os documentos da gaveta que a pessoa guardou no dossiê, na ordem em que guardou. */
  recolhidos: string[];
  /** Por ficha, a chave do documento a que ela foi relacionada, quando a relação está certa. */
  relacionadas: Record<string, string>;
  /** As fichas em que a pessoa também apontou o campo que sustenta o trecho destacado. */
  conferidas: string[];
}

export interface PlayerProgress {
  versao: typeof PROGRESS_VERSION;
  personagem: PersonagemSlug;
  /** Por `PhaseSpec.id`. Só as fases em que algo aconteceu. */
  fases: Record<string, PhaseProgress>;
  /** A fase em que a pessoa parou, por sala. */
  posicao: Partial<Record<RoomId, string>>;
  /** O progresso salvo em um formato anterior, como estava: a migração não o apaga. */
  legado?: { versao: number; capitulos: Record<string, unknown> };
}

// ---------------------------------------------------------------------------
// Conteúdo que o jogo recebe (recortado dos dados gerados no build)
// ---------------------------------------------------------------------------

export interface GameSource {
  /** O `id` da fonte no conjunto publicado. */
  id: string;
  titulo: string;
  autoria: string;
  url: string;
  /** De quando é o documento, como o catálogo diz, ou desconhecida. */
  dataDocumento: Fonte["dataDocumento"];
  /** Quando a fonte foi lida (AAAA-MM-DD). */
  acessadoEm: string;
  /** Onde, no documento, está o trecho: seção, página, parágrafo, minuto. É o que permite conferir sem sair do jogo. */
  localizacao: string;
  /** O que o trecho citado sustenta no registro, como a citação diz. */
  evidencia: string;
}

/** Onde o atlas documenta o acontecimento, com os nomes dos lugares já resolvidos. */
export type GameLocation = { tipo: "lugares"; lugares: readonly string[] } | { tipo: "nacional" } | { tipo: "desconhecida" };

/** Um acontecimento como o jogo o mostra: o mesmo que a ficha, em resumo. */
export interface GameRecord {
  id: string;
  slug: string;
  titulo: string;
  data: DataHistorica;
  categoria: Categoria;
  resumo: string;
  /** O contexto da ficha: nos episódios judiciais, é onde o atlas traz a defesa, a decisão e o desfecho. */
  contexto: string;
  localizacao: GameLocation;
  fontes: readonly GameSource[];
  /** Quem conferiu o registro e quando: o jogo mostra a mesma nota do atlas. */
  editorial: Editorial;
  /**
   * A data deste registro não decide a posição dele em relação a outro
   * registro do personagem no jogo. É a regra da lista do atlas
   * (`findUndeterminedOrder`), e o registro leva o mesmo aviso.
   */
  ordemEmAberto: boolean;
}

/**
 * Uma decisão política como o jogo a apresenta: o mesmo cartão do atlas
 * (src/lib/data/decisions.ts), com cargo, instituição, data, objeto,
 * manifestação ou tipo do ato, fontes e a situação da revisão.
 */
export type GameDecision = DecisionView;

/** Um fato biográfico: origem, família, mudança de cidade, formação, trabalho. */
export interface GameFact {
  id: string;
  tipo: TipoDeFatoBiografico;
  titulo: string;
  /** `null` quando o documento não data o fato. */
  data: DataHistorica | null;
  texto: string;
  /** O que os documentos dizem de diferente e o que o atlas adotou; `null` quando concordam. */
  divergencia: string | null;
  fontes: readonly GameSource[];
  editorial: Editorial;
}

/** A definição simples de um termo, com o texto oficial que a sustenta. */
export interface GameConcept {
  id: string;
  termo: string;
  definicao: string;
  /** O que a definição simplifica; `null` quando não há o que avisar. */
  simplificacao: string | null;
  fontes: readonly GameSource[];
  editorial: Editorial;
}

/** Um cargo ou uma função, ou uma filiação partidária, quando um bloco os aponta. */
export interface GamePosition {
  id: string;
  natureza: "mandato" | "filiacao";
  /** O cargo, ou a sigla do partido. */
  titulo: string;
  /** A instituição, ou o nome do partido. */
  detalhe: string;
  /** O período, por extenso, com as pontas desconhecidas ditas como tais. */
  periodo: string;
  fontes: readonly GameSource[];
  editorial: Editorial;
}

/**
 * Uma proposta do documento que a candidatura registrou na Justiça Eleitoral.
 * É o que o documento diz que pretende fazer: não é ato, voto nem resultado.
 */
export interface GameProposal {
  id: string;
  tema: Tema;
  /** O ano da eleição a que o documento se refere. */
  eleicao: number;
  /** O que o documento propõe, em uma frase. */
  texto: string;
  /** Condição, divergência dentro do documento ou número que é afirmação do próprio texto; `null` quando não há. */
  ressalva: string | null;
  fontes: readonly GameSource[];
  editorial: Editorial;
}

/** Uma sala do personagem, para os caminhos entre elas: quantas fases e que anos. */
export interface RoomSummary {
  id: RoomId;
  fases: number;
  periodo: { de: number; ate: number };
}

export interface GameContent {
  personagem: { slug: PersonagemSlug; nome: string };
  /** A sala aberta. */
  sala: RoomId;
  /** As fases da sala, na ordem de percurso. */
  fases: readonly PhaseSpec[];
  /** Por `id` de acontecimento. Só os apontados pelas fases da sala. */
  registros: Record<string, GameRecord>;
  /** Por `id` de voto ou de ato. Só os apontados pelas fases da sala. */
  decisoes: Record<string, GameDecision>;
  /** Por `id` de fato biográfico. */
  fatos: Record<string, GameFact>;
  /** Por `id` de conceito. */
  conceitos: Record<string, GameConcept>;
  /** Por `id` de mandato ou de filiação. */
  posicoes: Record<string, GamePosition>;
  /** Por `id` de proposta eleitoral. */
  propostas: Record<string, GameProposal>;
  /** Todas as salas do personagem com fase publicada, na ordem das salas, inclusive a aberta. */
  salas: readonly RoomSummary[];
}

// ---------------------------------------------------------------------------
// Cena: o cenário de uma fase
// ---------------------------------------------------------------------------

/**
 * Elementos de cenário desenhados pela arte (src/features/game/draw). Cada
 * tipo ocupa uma célula e bloqueia a passagem, salvo `decoracao`.
 */
export type PropKind =
  | "mesa"
  | "mesa-central"
  | "cadeira"
  | "bancada"
  | "tribuna"
  | "arquivo"
  | "estante"
  | "armario"
  | "coluna"
  | "urna"
  | "bandeira"
  | "planta"
  | "maquina"
  | "banco"
  | "microfone"
  | "caixote"
  | "poltrona"
  | "placa"
  | "decoracao"
  | "tela"
  | "balcao"
  | "fileira"
  | "sofa"
  | "cartaz";

export interface PropSpec {
  tipo: PropKind;
  x: number;
  y: number;
  /** Variação de desenho, quando a arte oferecer mais de uma. */
  variante?: number;
  /** Desenhado espelhado na horizontal. */
  espelhado?: boolean;
}

export interface ScenePalette {
  chao: string;
  chaoAlt: string;
  tapete: string;
  parede: string;
  paredeTopo: string;
  fundo: string;
  acento: string;
}

/** A borda em que a porta da cena está. */
export type ExitSide = "norte" | "sul" | "leste" | "oeste";

export interface SceneSpec {
  id: SceneId;
  /** A arte que desenha esta cena. */
  arte: SceneArtId;
  /** Nome do lugar, mostrado junto da fase. */
  nome: string;
  /** Uma linha por fileira, um caractere por célula (legenda em grid.ts). */
  mapa: readonly string[];
  largura: number;
  altura: number;
  paleta: ScenePalette;
  /** Elementos de cenário, além dos que o mapa marca com `o`. */
  props: readonly PropSpec[];
  /** Células com tapete ou piso diferente, só desenho. */
  tapetes: readonly { x: number; y: number }[];
  spawn: { x: number; y: number };
  guia: { x: number; y: number };
  /** A porta: fecha a cena e abre quando a fase termina. Ninguém a atravessa: é sinal, e não passagem. */
  saida: { x: number; y: number; lado: ExitSide };
  /** As posições das pastas: a primeira é a do marco; as seguintes, as dos registros para explorar. */
  registros: readonly { x: number; y: number }[];
}

// ---------------------------------------------------------------------------
// O que se mexe na cena
// ---------------------------------------------------------------------------

/** Direção em que o personagem olha, em eixos do mundo (ver iso.ts). */
export type Facing = "frente-direita" | "frente-esquerda" | "costas-direita" | "costas-esquerda";

export interface PlayerState {
  x: number;
  y: number;
  facing: Facing;
  andando: boolean;
  /** Fase do ciclo de caminhada, de 0 a 1. */
  fase: number;
}

/**
 * Uma pasta no cenário: o marco da fase, em destaque, ou um registro para
 * explorar. É um botão da página, posto sobre o desenho; a cena só diz onde
 * ele fica. Na missão de investigação (D-151), os marcadores são objetos da
 * sala (`objeto`): o Escrivão, a gaveta, a mesa das fichas e o quadro; cada
 * um abre uma parte do dossiê, e nenhum é pasta.
 */
export interface SceneMarker {
  /** `marco`, a chave do registro (`tipo:id`) ou `objeto:<nome>`. */
  chave: string;
  natureza: "marco" | "explorar" | "objeto";
  /** O que o botão diz. */
  rotulo: string;
  /** A célula da pasta. */
  x: number;
  y: number;
}

/** As partes da sala de investigação que um objeto abre (D-151). */
export type DossierSection = "escrivao" | "gaveta" | "fichas" | "quadro";
