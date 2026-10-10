// O desenho de um marcador do mapa. Sem MapLibre: quem o põe no lugar é
// `MapCanvas`. Serve também à legenda, que mostra os mesmos símbolos.
//
// Um acontecimento: a forma e a cor da categoria, sobre um disco de papel.
// Vários acontecimentos: um disco de tinta com a quantidade. O número conta
// acontecimentos, e não pontos nem lugares.
// Só o estado é conhecido: contorno tracejado, como tudo o que é incerto.
// Selecionado: anel de acento, além do estado dito no próprio botão.

import { CategoryMark } from "@/components/Category";
import { formatDate } from "@/lib/domain/dates";
import type { PrecisaoGeografica } from "@/lib/domain/geo";

import { countEvents, groupLabel, groupTitle, type MarkerGroup } from "./places";

/** Identificador do marcador na página: o foco volta a ele quando o seletor fecha. */
export function markerDomId(groupId: string): string {
  return `marcador-${groupId}`;
}

/** Lugares conhecidos só pelo estado ou pelo país: o ponto é o centro de uma área grande. */
export function isBroadPrecision(precisao: PrecisaoGeografica): boolean {
  return precisao === "uf" || precisao === "pais";
}

interface MarkerSymbolProps {
  /** Categoria do acontecimento, quando o marcador tem um só. */
  categoria?: MarkerGroup["events"][number]["categoria"];
  /** Quantidade de acontecimentos distintos. */
  count: number;
  /** Todos os lugares do marcador são conhecidos só pelo estado ou pelo país. */
  broad?: boolean;
  selected?: boolean;
  open?: boolean;
}

/** Só o símbolo, sem comportamento. */
export function MarkerSymbol({ categoria, count, broad = false, selected = false, open = false }: MarkerSymbolProps) {
  const anel = selected
    ? "shadow-[0_0_0_2px_var(--atlas-paper-raised),0_0_0_5px_var(--atlas-accent)]"
    : open
      ? "shadow-[0_0_0_2px_var(--atlas-paper-raised),0_0_0_4px_var(--atlas-ink)]"
      : "";
  // Tracejado, como tudo o que é incerto. No disco de papel, a própria borda;
  // no disco de tinta, um contorno por fora, para o tracejado não comer o número.
  const tracejado = "outline-dashed outline-[1.5px] outline-offset-2 outline-ink";

  if (count === 1 && categoria) {
    return (
      <span
        className={`grid size-6 place-items-center rounded-full border border-ink bg-raised transition-shadow duration-[var(--atlas-fast)] ${broad ? "border-dashed" : ""} ${anel}`}
      >
        <CategoryMark categoria={categoria} size={12} />
      </span>
    );
  }

  return (
    <span
      className={`numerals grid h-7 min-w-7 place-items-center rounded-full border-2 border-raised bg-ink px-1.5 text-[0.8125rem] font-semibold leading-none text-paper transition-shadow duration-[var(--atlas-fast)] ${broad ? tracejado : ""} ${anel}`}
    >
      {count}
    </span>
  );
}

interface PlaceMarkerProps {
  group: MarkerGroup;
  /** O acontecimento selecionado está neste marcador. */
  selected: boolean;
  /** O seletor deste marcador está aberto. */
  open: boolean;
  /** Elemento que o marcador abre, quando abre algum. */
  controls?: string;
  /** Sem esta função o marcador é só um símbolo com nome: não há o que escolher. */
  onActivate?: () => void;
}

export function PlaceMarker({ group, selected, open, controls, onActivate }: PlaceMarkerProps) {
  const [evento] = group.events;
  const unico = group.events.length === 1 ? evento : undefined;
  const broad = group.places.every((place) => isBroadPrecision(place.precisao));

  // O nome diz o lugar e o que há nele; o estado de seleção vai no próprio botão.
  const nome = unico
    ? `${groupTitle(group)}: ${unico.titulo}, ${formatDate(unico.data)}`
    : `${groupTitle(group)}: ${countEvents(group.events.length)}${
        selected ? ", entre eles o que está aberto" : ""
      }`;

  const conteudo = (
    <>
      <MarkerSymbol
        categoria={unico?.categoria}
        count={group.events.length}
        broad={broad}
        selected={selected}
        open={open}
      />
      {/* Nome do lugar ao lado, com um halo de papel para se soltar do mapa. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(50%_+_1.375rem)] top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6875rem] font-medium leading-none text-ink [text-shadow:0_0_2px_var(--atlas-paper-raised),0_0_2px_var(--atlas-paper-raised),0_0_3px_var(--atlas-paper-raised),0_0_4px_var(--atlas-paper-raised)]"
      >
        {groupLabel(group)}
      </span>
    </>
  );

  // O marcador que entra no recorte aparece com uma transição curta de opacidade.
  const base = "relative grid size-11 animate-fade place-items-center rounded-full";
  const dados = {
    "data-marker": group.id,
    "data-events": group.events.map((item) => item.slug).join(" "),
    "data-places": group.places.length,
    "data-selected": selected ? "" : undefined,
  };

  if (!onActivate) {
    return (
      <span role="img" aria-label={nome} className={base} {...dados}>
        {conteudo}
      </span>
    );
  }

  return (
    <button
      type="button"
      id={markerDomId(group.id)}
      aria-label={nome}
      // Um acontecimento: o botão o seleciona. Vários: abre a lista deles.
      aria-pressed={unico ? selected : undefined}
      aria-expanded={unico ? undefined : open}
      aria-controls={unico ? undefined : controls}
      onClick={onActivate}
      className={`${base} cursor-pointer transition-transform duration-[var(--atlas-fast)] hover:scale-110`}
      {...dados}
    >
      {conteudo}
    </button>
  );
}
