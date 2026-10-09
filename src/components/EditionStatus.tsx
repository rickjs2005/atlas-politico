import { formatDate } from "@/lib/domain/dates";
import type { Edicao } from "@/lib/domain/types";

/** Diz qual conjunto de conteúdo a página está exibindo, ou que ainda não há nenhum. */
export function EditionStatus({ edicao, className = "" }: { edicao: Edicao | null; className?: string }) {
  if (edicao === null) {
    return (
      <p className={`border border-line-strong bg-notice px-4 py-3 text-sm ${className}`}>
        <strong>Em construção.</strong> Nenhuma edição de conteúdo foi publicada ainda. As páginas
        mostram a estrutura do atlas; os acontecimentos entram depois de pesquisados e revisados.
      </p>
    );
  }

  const revisadoEm = formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" });

  return (
    <p className={`text-sm text-ink-soft ${className}`}>
      Edição {edicao.versao} · registros até{" "}
      {formatDate({ valor: edicao.dataDeCorte, precisao: "dia" })} ·{" "}
      {edicao.revisao.tipo === "humana"
        ? `última revisão em ${revisadoEm}`
        : `conferência com as fontes assistida por IA em ${revisadoEm}; revisão humana pendente`}
    </p>
  );
}

/** Só a identificação da edição: versão e data de corte. Para o pé de um registro. */
export function EditionTag({ edicao, className = "" }: { edicao: Edicao; className?: string }) {
  return (
    <p className={`numerals text-sm text-ink-soft ${className}`} data-edicao={edicao.versao}>
      Edição {edicao.versao} · registros até {formatDate({ valor: edicao.dataDeCorte, precisao: "dia" })}
    </p>
  );
}
