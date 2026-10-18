// Como um documento aparece nas janelas da praça: os cinco campos de uma cópia
// (no arquivo e no caderno) e o documento como fica pregado (na nota do mural e
// em cada lado da ata): o título, as linhas, o que ficou de fora e as fontes,
// dobradas. Nada é escrito aqui: os textos são os do registro.

import { documentFields } from "@/lib/game/dossier";
import type { DocumentoExposto } from "@/lib/praca/regras";
import type { Documento } from "@/lib/praca/tipos";

import { ROTULO } from "./tipos";

export function CamposDoDocumento({ documento }: { documento: Documento }) {
  return (
    <dl className="mt-3 grid gap-2 border-t border-line pt-3 text-sm" data-campos>
      {documentFields(documento).map((campo) => (
        <div key={campo.campo} data-campo={campo.campo}>
          <dt className={ROTULO}>{campo.rotulo}</dt>
          <dd className="leading-snug">{campo.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Um documento como fica pregado: o título, as linhas, o que ficou de fora e as fontes, dobradas. */
export function DocumentoNaParede({ exposto }: { exposto: DocumentoExposto }) {
  return (
    <>
      <dl className="mt-2">
        <dt className={ROTULO}>Documento</dt>
        <dd className="font-serif text-lg leading-snug">{exposto.documento.titulo}</dd>
        {exposto.linhas.map((linha) => (
          <div key={linha.rotulo} className="mt-2">
            <dt className={ROTULO}>{linha.rotulo}</dt>
            <dd className="text-sm leading-snug">{linha.valor}</dd>
          </div>
        ))}
        {exposto.itens.length > 0 && (
          <div className="mt-2">
            <dt className={ROTULO}>O que ficou de fora</dt>
            <dd>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-snug" data-dispositivos>
                {exposto.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
      <FontesDoDocumento fontes={exposto.fontes} />
    </>
  );
}

export function FontesDoDocumento({ fontes }: { fontes: Documento["fontes"] }) {
  return (
    <details className="mt-3 rounded-md border border-line bg-sunken p-3 text-sm" data-fontes-da-nota>
      <summary className="cursor-pointer py-1 font-medium">Fontes do documento ({fontes.length})</summary>
      <ul className="mt-2 space-y-2">
        {fontes.map((fonte) => (
          <li key={fonte.id + fonte.localizacao}>
            <a href={fonte.url} className="underline" rel="noopener noreferrer" target="_blank">
              {fonte.titulo}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            <span className="block text-ink-soft">
              {fonte.autoria} · {fonte.localizacao}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
