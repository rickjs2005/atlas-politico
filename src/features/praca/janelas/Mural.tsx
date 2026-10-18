"use client";

// O mural: ler as perguntas, aceitar uma pauta, montar a resposta e fixá-la.
// A resposta se monta de quatro jeitos (D-155), sempre com opções tiradas só
// das cópias levadas: conferir a data (o tutorial), a nota de três campos, a
// natureza da ação e a ordem de dois documentos. Errar explica, por campo, o
// que a cópia escolhida registra; acertar prega a nota com carimbo, a reação
// de quem perguntou e o selo que a mudança trouxe.

import { useMemo, useState } from "react";

import { camposDaPauta, documentosDaPauta, fimDaEdicao, fixarNota, notaFixada, objetivoDeAgora, pautasDaSessao, sessaoConcluida, sessoesAbertas, situacaoDaPauta, tipoDaPauta, type Fixacao } from "@/lib/praca/regras";
import { selosNovos, type Selo } from "@/lib/praca/selos";
import type { Nota, Pauta } from "@/lib/praca/tipos";

import { CamposDoDocumento, DocumentoNaParede } from "./Documento";
import { Janela } from "./Janela";
import { BOTAO_PRINCIPAL, ROTULO, type JanelaDaPraca } from "./tipos";

type Vista = { modo: "lista" } | { modo: "pauta"; pauta: string } | { modo: "montar"; pauta: string } | { modo: "fixada"; pauta: string; recem: boolean; selos: Selo[] };

const SITUACAO: Record<"fechada" | "aberta" | "publicada", string> = { fechada: "sem resposta", aberta: "pauta aceita", publicada: "respondida" };
const TIPO_ROTULO: Record<"campo" | "nota" | "natureza" | "ordem", string> = { campo: "Conferir uma data", nota: "Nota de três campos", natureza: "Qual documento, e o que a ação registra", ordem: "Dois documentos em ordem" };

export function Mural({ conteudo, progresso, onProgresso, onFechar }: JanelaDaPraca) {
  const [vista, setVista] = useState<Vista>({ modo: "lista" });
  const pautaDe = (id: string) => conteudo.pautas.find((pauta) => pauta.id === id)!;

  if (vista.modo === "montar") {
    const pauta = pautaDe(vista.pauta);
    return (
      <Janela id="mural" titulo={tipoDaPauta(pauta) === "campo" ? "Conferir a data" : "Montar a nota"} sobre={`Pergunta de ${pauta.autor}`} onFechar={onFechar}>
        <MontarResposta
          pauta={pauta}
          conteudo={conteudo}
          progresso={progresso}
          onFixar={(nota) => {
            const resultado = fixarNota(progresso, pauta, nota, conteudo.documentos);
            onProgresso(() => resultado.progresso);
            if (resultado.certo) setVista({ modo: "fixada", pauta: pauta.id, recem: true, selos: selosNovos(progresso, resultado.progresso, conteudo) });
            return resultado;
          }}
          onVoltar={() => setVista({ modo: "pauta", pauta: pauta.id })}
        />
      </Janela>
    );
  }

  if (vista.modo === "fixada") {
    const pauta = pautaDe(vista.pauta);
    const nota = notaFixada(pauta, conteudo.documentos);
    const sessao = conteudo.sessoes.find((item) => item.id === pauta.sessao);
    const concluiu = sessao !== undefined && sessaoConcluida(progresso, sessao, conteudo);
    const mudanca = fimDaEdicao(progresso, conteudo)
      ? "Era a última pergunta desta edição. O mural está respondido e a ata, lavrada: a praça fecha o dia."
      : concluiu && sessao.abreLugar === "camara"
        ? "As pautas de hoje estão no mural. A corrente da Câmara caiu: ela é a próxima pauta."
        : `A pergunta de ${pauta.autor} ganhou resposta no mural. ${objetivoDeAgora(progresso, conteudo)}`;
    return (
      <Janela id="mural" titulo="Nota fixada no mural" sobre={`Pergunta de ${pauta.autor}`} onFechar={onFechar}>
        {nota !== null && (
          <div className="space-y-4" data-nota-fixada={pauta.id}>
            <blockquote className="border-l-2 border-line-strong pl-3 text-ink-soft">{pauta.pergunta}</blockquote>
            <div className="relative rounded-md border border-line bg-raised p-4 pt-10">
              <span className="jogo-carimbo absolute top-2 right-3 text-xs" style={{ ["--giro" as string]: "-3deg" }} data-carimbo>
                <span className="eyebrow">Conferido com o documento</span>
              </span>
              <DocumentoNaParede exposto={nota} />
              {nota.segundo !== null && (
                <div className="mt-4 border-t border-line pt-3" data-segundo-documento>
                  <p className={ROTULO}>Depois dele</p>
                  <DocumentoNaParede exposto={nota.segundo} />
                </div>
              )}
            </div>
            <p className="rounded-md border border-line bg-sunken px-3 py-2 text-sm italic" data-reacao>
              {pauta.reacao}
            </p>
            {vista.recem && (
              <p className="rounded-md border border-ink bg-raised px-3 py-2 font-medium" data-mudanca>
                {mudanca}
              </p>
            )}
            {vista.recem && vista.selos.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Selos ganhos agora">
                {vista.selos.map((selo) => (
                  <li key={selo.id} className="rounded-full border border-highlight px-3 py-1 text-xs font-semibold" data-selo-novo={selo.id}>
                    Selo: {selo.nome}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => setVista({ modo: "lista" })} className={BOTAO_PRINCIPAL} data-voltar-ao-mural>
              Voltar ao mural
            </button>
          </div>
        )}
      </Janela>
    );
  }

  if (vista.modo === "pauta") {
    const pauta = pautaDe(vista.pauta);
    const situacao = situacaoDaPauta(progresso, pauta.id);
    return (
      <Janela id="mural" titulo={pauta.autor} sobre="Pergunta pregada no mural" onFechar={onFechar}>
        <div className="space-y-4" data-pauta={pauta.id} data-situacao={situacao} data-tipo={tipoDaPauta(pauta)}>
          <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
          <p className="text-sm text-ink-soft">
            Sobre {conteudo.pessoas[pauta.pessoa].nome}. Morador fictício; a pergunta só pergunta o que um documento publicado responde. Jeito de responder: {TIPO_ROTULO[tipoDaPauta(pauta)].toLowerCase()}.
          </p>
          {situacao === "fechada" && (
            <button type="button" onClick={() => onProgresso((atual) => ({ ...atual, pautas: { ...atual.pautas, [pauta.id]: { situacao: "aberta", tentativas: atual.pautas[pauta.id]?.tentativas ?? 0 } } }))} className={BOTAO_PRINCIPAL} data-aceitar>
              Aceitar a pauta
            </button>
          )}
          {situacao === "aberta" && (
            <div className="space-y-2">
              <p className="text-sm">Pauta aceita. {pauta.objetivo} Quando tiver as cópias, responda aqui.</p>
              <button type="button" onClick={() => setVista({ modo: "montar", pauta: pauta.id })} className={BOTAO_PRINCIPAL} data-montar>
                {tipoDaPauta(pauta) === "campo" ? "Conferir a data" : "Montar a nota"}
              </button>
            </div>
          )}
          {situacao === "publicada" && (
            <button type="button" onClick={() => setVista({ modo: "fixada", pauta: pauta.id, recem: false, selos: [] })} className={BOTAO_PRINCIPAL} data-ler-nota>
              Ler a nota fixada
            </button>
          )}
          <button type="button" onClick={() => setVista({ modo: "lista" })} className="block min-h-11 text-sm underline" data-voltar-ao-mural>
            Voltar ao mural
          </button>
        </div>
      </Janela>
    );
  }

  // As perguntas pregadas: as das sessões abertas, a mais nova primeiro. Com uma sessão só, sem título de sessão.
  const sessoes = [...sessoesAbertas(progresso, conteudo)].reverse();
  return (
    <Janela id="mural" titulo="Mural da praça" sobre="Perguntas dos moradores" onFechar={onFechar}>
      <p className="text-sm text-ink-soft">Quem responde prega o documento junto. Toque em uma pergunta; as primeiras só pedem para conferir uma data.</p>
      {sessoes.map((sessao) => (
        <section key={sessao.id} className="mt-3" aria-label={sessao.titulo} data-sessao-do-mural={sessao.id}>
          {sessoes.length > 1 && <h3 className={ROTULO}>{sessao.titulo}</h3>}
          <ul className="mt-2 grid gap-2">
            {pautasDaSessao(sessao, conteudo).map((pauta) => {
              const situacao = situacaoDaPauta(progresso, pauta.id);
              return (
                <li key={pauta.id}>
                  <button type="button" onClick={() => setVista({ modo: "pauta", pauta: pauta.id })} className="w-full rounded-xl border-2 border-line-strong bg-raised px-4 py-3 text-left" data-abrir-pauta={pauta.id} data-situacao={situacao} data-tipo={tipoDaPauta(pauta)}>
                    <span className={`block ${ROTULO}`}>
                      {pauta.autor} · {SITUACAO[situacao]} · {TIPO_ROTULO[tipoDaPauta(pauta)].toLowerCase()}
                    </span>
                    <span className="mt-1 block leading-snug">{pauta.pergunta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Janela>
  );
}

function MontarResposta({ pauta, conteudo, progresso, onFixar, onVoltar }: { pauta: Pauta; conteudo: JanelaDaPraca["conteudo"]; progresso: JanelaDaPraca["progresso"]; onFixar: (nota: Nota) => Fixacao; onVoltar: () => void }) {
  const campos = useMemo(() => camposDaPauta(pauta, progresso, conteudo.documentos), [pauta, progresso, conteudo.documentos]);
  const [nota, setNota] = useState<Nota>({});
  const [erros, setErros] = useState<Fixacao["erros"]>([]);
  const completa = campos.every((campo) => nota[campo.chave] !== undefined);
  const tentativas = progresso.pautas[pauta.id]?.tentativas ?? 0;
  const necessarios = documentosDaPauta(pauta);
  const faltam = necessarios.filter((id) => !progresso.copias.includes(id));
  const gavetas = necessarios.flatMap((id) => conteudo.gavetas.filter((gaveta) => gaveta.documentos.includes(id))).map((gaveta) => gaveta.rotulo);
  if (progresso.copias.length === 0 || (tipoDaPauta(pauta) !== "nota" && tipoDaPauta(pauta) !== "natureza" && faltam.length > 0)) {
    return (
      <div className="space-y-3">
        <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
        <p data-sem-copias>
          {progresso.copias.length === 0 ? "Você ainda não levou nenhuma cópia do arquivo." : "Falta a cópia de um documento que a pergunta nomeia."} O Escrivão guarda as gavetas, por pessoa e por ano, no sobrado azul: {gavetas.length === 1 ? `a gaveta é a ${gavetas[0]}` : `as gavetas são ${gavetas.join(" e ")}`}.
        </p>
        <button type="button" onClick={onVoltar} className="min-h-11 text-sm underline">
          Voltar
        </button>
      </div>
    );
  }
  const tipo = tipoDaPauta(pauta);
  return (
    <form
      className="space-y-3"
      data-montar-nota={pauta.id}
      data-tipo={tipo}
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!completa) return;
        setErros(onFixar(nota).erros);
      }}
    >
      <p className="font-serif text-xl leading-snug">{pauta.pergunta}</p>
      <p className="text-sm text-ink-soft">
        {tipo === "campo" && "Uma coisa só: a data está no campo Data da cópia que você levou. As opções vêm das cópias que você tem."}
        {tipo === "nota" && "As opções vêm só das cópias que você levou. Escolha o documento, a data e o que ele registra."}
        {tipo === "natureza" && "As opções vêm só das cópias que você levou. Diga qual documento é o pedido e o que o campo Ação dele registra: sanção, veto, medida provisória, voto a favor ou contra, autoria."}
        {tipo === "ordem" && "As opções vêm só das cópias que você levou. Ponha os dois documentos na ordem em que foram registrados, pelo campo Data de cada um."}
      </p>
      {tipo === "campo" && (
        <details className="rounded-md border border-line bg-raised p-3 text-sm" data-copia-a-mao>
          <summary className="cursor-pointer py-1 font-medium">Ver a cópia que você levou</summary>
          {necessarios.map((id) => (
            <div key={id}>
              <p className="mt-2 font-medium">{conteudo.documentos[id]!.titulo}</p>
              <CamposDoDocumento documento={conteudo.documentos[id]!} />
            </div>
          ))}
        </details>
      )}
      {campos.map((campo) => (
        <fieldset key={campo.chave} className="rounded-md border border-line bg-raised p-3" data-campo-da-nota={campo.chave}>
          <legend className="px-1 text-sm font-semibold">{campo.titulo}</legend>
          <div className="grid gap-1.5">
            {campo.opcoes.map((opcao) => (
              <label key={opcao.chave} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 leading-snug ${nota[campo.chave] === opcao.chave ? "border-ink bg-sunken" : "border-line"}`}>
                <input
                  type="radio"
                  name={`nota-${campo.chave}`}
                  value={opcao.chave}
                  checked={nota[campo.chave] === opcao.chave}
                  onChange={() => setNota((atual) => ({ ...atual, [campo.chave]: opcao.chave }))}
                  className="mt-1"
                  data-opcao={`${campo.chave}:${opcao.chave}`}
                />
                <span>{opcao.texto}</span>
              </label>
            ))}
          </div>
          {erros.some((erro) => erro.campo === campo.chave) && (
            <p className="mt-2 text-sm font-medium" data-erro-campo={campo.chave}>
              {erros.find((erro) => erro.campo === campo.chave)!.mensagem}
            </p>
          )}
        </fieldset>
      ))}
      {erros.length > 0 && (
        <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-nota-recusada>
          O Teodoro arrancaria essa: a resposta não bate com o documento. Veja o que cada campo diz e tente de novo. Tentativas: {tentativas}.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!completa} className={BOTAO_PRINCIPAL} data-fixar>
          Fixar no mural
        </button>
        <button type="button" onClick={onVoltar} className="min-h-11 text-sm underline">
          Voltar
        </button>
      </div>
    </form>
  );
}
