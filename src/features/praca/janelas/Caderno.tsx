"use client";

// O caderno: a pauta de agora com os passos, as pautas, os itens, as cópias
// (que se leem inteiras aqui), as descobertas e os selos, as preferências de
// desenho (modo leve, lista) e o recomeço. Nada aqui soma nem dá nota.

import { useState } from "react";

import { formatDate } from "@/lib/domain/dates";
import { passoDeAgora } from "@/lib/praca/passos";
import { ITENS } from "@/lib/praca/praca";
import { camaraAberta, objetivoDeAgora, pautasDisponiveis, situacaoDaMateria, situacaoDaPauta } from "@/lib/praca/regras";
import { descobertas, selos } from "@/lib/praca/selos";

import type { PreferenciasDaPraca } from "../persistencia";
import { CamposDoDocumento } from "./Documento";
import { Janela } from "./Janela";
import { BOTAO_SECUNDARIO, ROTULO, type JanelaDaPraca } from "./tipos";

interface CadernoProps extends Omit<JanelaDaPraca, "onProgresso"> {
  preferencias: PreferenciasDaPraca;
  onPreferencias: (preferencias: PreferenciasDaPraca) => void;
  /** A cena existe neste navegador: sem WebGL, a troca para a lista não aparece. */
  cenaPossivel: boolean;
  onRecomecar: () => void;
}

export function Caderno({ conteudo, progresso, preferencias, onPreferencias, cenaPossivel, onFechar, onRecomecar }: CadernoProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [lendo, setLendo] = useState<string | null>(null);
  const passo = passoDeAgora(progresso, conteudo);
  const achados = descobertas(progresso, conteudo);
  return (
    <Janela id="caderno" titulo="Caderno" sobre="O que você tem" onFechar={onFechar}>
      <div className="space-y-4">
        <section>
          <h3 className={ROTULO}>Pauta de agora</h3>
          <p className="font-medium">{objetivoDeAgora(progresso, conteudo)}</p>
          {passo !== null && (
            <ol className="mt-2 space-y-1 text-sm" data-passos>
              {passo.passos.map((item, i) => (
                <li key={item.id} className={i === passo.indice ? "font-medium" : item.feito ? "text-ink-soft line-through" : "text-ink-soft"} data-passo={item.id} data-feito={item.feito} aria-current={i === passo.indice ? "step" : undefined}>
                  {i + 1}. {item.texto}
                </li>
              ))}
            </ol>
          )}
        </section>
        <section>
          <h3 className={ROTULO}>Pautas</h3>
          <ul className="mt-1 space-y-1 text-sm">
            {pautasDisponiveis(progresso, conteudo).map((pauta) => (
              <li key={pauta.id} data-caderno-pauta={pauta.id} data-situacao={situacaoDaPauta(progresso, pauta.id)}>
                {pauta.autor}: {situacaoDaPauta(progresso, pauta.id) === "publicada" ? "respondida no mural" : situacaoDaPauta(progresso, pauta.id) === "aberta" ? "aceita" : "sem resposta"}
              </li>
            ))}
            {camaraAberta(progresso, conteudo) &&
              conteudo.materias.map((materia) => (
                <li key={materia.id} data-caderno-materia={materia.id} data-situacao={situacaoDaMateria(progresso, materia.id)}>
                  Mesa da Câmara, {materia.titulo.charAt(0).toLowerCase() + materia.titulo.slice(1)}: {situacaoDaMateria(progresso, materia.id) === "publicada" ? "ata lavrada" : situacaoDaMateria(progresso, materia.id) === "aberta" ? "na pauta" : "sem ata"}
                </li>
              ))}
          </ul>
        </section>
        <section>
          <h3 className={ROTULO}>Itens</h3>
          {progresso.itens.length === 0 ? (
            <p className="text-sm text-ink-soft">Nada ainda.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {progresso.itens.map((item) => (
                <li key={item} data-caderno-item={item}>
                  <strong>{ITENS[item].nome}.</strong> {ITENS[item].descricao}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3 className={ROTULO}>Cópias do arquivo</h3>
          {progresso.copias.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma cópia. O arquivo é o sobrado azul.</p>
          ) : (
            <ul className="mt-1 space-y-2 text-sm">
              {progresso.copias.map((id) => {
                const documento = conteudo.documentos[id]!;
                return (
                  <li key={id} className="rounded-md border border-line bg-raised p-2" data-caderno-copia={id}>
                    <button type="button" onClick={() => setLendo(lendo === id ? null : id)} aria-expanded={lendo === id} className="min-h-11 text-left font-medium underline">
                      {documento.titulo}
                    </button>
                    <span className="block text-ink-soft">{formatDate(documento.data)}</span>
                    {lendo === id && <CamposDoDocumento documento={documento} />}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section data-descobertas>
          <h3 className={ROTULO}>Descobertas</h3>
          <p className="mt-1 text-sm text-ink-soft">
            {achados.documentos} de {achados.documentosNoArquivo} documentos copiados · {achados.conversas} {achados.conversas === 1 ? "morador ouvido" : "moradores ouvidos"} · {achados.notas} {achados.notas === 1 ? "nota" : "notas"} no mural · {achados.itens}{" "}
            {achados.itens === 1 ? "item" : "itens"}
          </p>
        </section>
        <section>
          <h3 className={ROTULO}>Selos</h3>
          <p className="mt-1 text-xs text-ink-soft">Um selo reconhece um caminho percorrido. Não soma, não compara pessoas e não dá nota.</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2" data-selos>
            {selos(progresso, conteudo).map((selo) => (
              <li key={selo.id} className={`rounded-md border px-3 py-2 text-sm ${selo.ganho ? "border-highlight bg-raised" : "border-dashed border-line text-ink-soft"}`} data-selo={selo.id} data-ganho={selo.ganho}>
                <span className="block font-medium">{selo.nome}</span>
                <span className="block text-xs">{selo.descricao}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2 border-t border-line pt-3 text-sm" data-preferencias>
          <h3 className={ROTULO}>Desenho</h3>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={preferencias.modoLeve} onChange={(evento) => onPreferencias({ ...preferencias, modoLeve: evento.target.checked })} data-modo-leve />
            Modo leve: sem sombras e sem as luzes dos postes, para aparelho mais fraco.
          </label>
          {cenaPossivel && (
            <button type="button" onClick={() => onPreferencias({ ...preferencias, lista: !preferencias.lista })} className={BOTAO_SECUNDARIO} data-alternar-lista>
              {preferencias.lista ? "Ver a cena 3D" : "Ver os lugares em lista, sem a cena"}
            </button>
          )}
        </section>
        <section className="border-t border-line pt-3 text-sm">
          {confirmando ? (
            <div className="space-y-2">
              <p>Isso apaga o progresso da praça neste navegador.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRecomecar();
                    onFechar();
                  }}
                  className="min-h-11 rounded-md border border-ink px-3 py-1.5 font-medium"
                  data-apagar
                >
                  Apagar e começar de novo
                </button>
                <button type="button" onClick={() => setConfirmando(false)} className="min-h-11 rounded-md border border-line px-3 py-1.5">
                  Manter
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmando(true)} className="min-h-11 underline" data-recomecar>
              Começar de novo
            </button>
          )}
        </section>
      </div>
    </Janela>
  );
}
