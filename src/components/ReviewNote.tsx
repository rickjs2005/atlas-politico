// Quem conferiu o registro e quando. A conferência assistida por IA e a
// revisão humana nunca são ditas com as mesmas palavras.

import { formatDate } from "@/lib/domain/dates";
import type { Editorial } from "@/lib/domain/types";

export function ReviewNote({ editorial, className = "" }: { editorial: Editorial; className?: string }) {
  if (editorial.estado !== "revisado") return null;
  const { revisao } = editorial;
  const quando = formatDate({ valor: revisao.revisadoEm, precisao: "dia" });

  return (
    <p className={`text-sm text-ink-soft ${className}`}>
      {revisao.tipo === "humana"
        ? `Revisado por ${revisao.revisadoPor} em ${quando}.`
        : `Conferido com as fontes, com assistência de IA (${revisao.revisadoPor}), em ${quando}.`}
      {revisao.tipo === "assistida-por-ia" && (
        <>
          {" "}
          <span className="font-semibold text-ink">Revisão humana pendente.</span>
        </>
      )}
    </p>
  );
}
