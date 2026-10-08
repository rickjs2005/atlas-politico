import { formatDate } from "@/lib/domain/dates";
import type { Edicao } from "@/lib/domain/types";

/** Diz qual conjunto de conteúdo a página está exibindo, ou que ainda não há nenhum. */
export function EditionStatus({ edicao }: { edicao: Edicao | null }) {
  if (edicao === null) {
    return (
      <p className="rounded-md border border-line bg-notice px-4 py-3 text-sm text-notice-ink">
        <strong>Em construção.</strong> Nenhuma edição de conteúdo foi publicada ainda. As páginas
        mostram a estrutura do atlas; os acontecimentos entram depois de pesquisados e revisados.
      </p>
    );
  }

  return (
    <p className="text-sm text-ink-soft">
      Edição {edicao.versao} · registros até{" "}
      {formatDate({ valor: edicao.dataDeCorte, precisao: "dia" })} · última revisão em{" "}
      {formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}
    </p>
  );
}
