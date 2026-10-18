"use client";

// A Câmara: fechada, diz o que falta; aberta, a conversa com a Lourdes e a
// mesa, onde a matéria da sessão é lavrada em ata com dois documentos lado a
// lado. A ata não compara posições: cada coluna diz o que o seu documento
// registra, e a frase fixa diz que são atos diferentes.

import Link from "next/link";
import { useMemo, useState } from "react";

import { ITENS } from "@/lib/praca/praca";
import { abrirMateria, ataLavrada, camaraAberta, conversaDe, fimDaEdicao, lavrarAta, materiaDaSessao, objetivoDeAgora, opcoesDaNota, pautasDaSessao, pautasPendentes, situacaoDaMateria, temItem, type Lavratura } from "@/lib/praca/regras";
import type { Materia, Sessao } from "@/lib/praca/tipos";

import { Conversa } from "./Conversa";
import { DocumentoNaParede } from "./Documento";
import { Janela } from "./Janela";
import { ABA, BOTAO_PRINCIPAL, ROTULO, type JanelaDaPraca } from "./tipos";

export function Camara({ conteudo, progresso, onProgresso, onFechar }: JanelaDaPraca) {
  const aberta = camaraAberta(progresso, conteudo);
  const sessao = conteudo.sessoes.find((item) => item.abreLugar === "camara") ?? null;
  const anterior = sessao === null || sessao.abreCom === null ? null : (conteudo.sessoes.find((item) => item.id === sessao.abreCom) ?? null);
  const pendentes = anterior === null ? [] : pautasPendentes(progresso, pautasDaSessao(anterior, conteudo));
  const materia = sessao === null ? null : materiaDaSessao(sessao, conteudo);
  const [aba, setAba] = useState<"lourdes" | "mesa">(() => (progresso.marcas.includes(`conversa:${conversaDe("lourdes", progresso, conteudo).chave}`) ? "mesa" : "lourdes"));
  if (!aberta) {
    return (
      <Janela id="camara" titulo="Câmara fechada" sobre="Próxima pauta" onFechar={onFechar}>
        <div className="space-y-3" data-camara="fechada">
          <p>A porta tem uma corrente. Abre quando as pautas da primeira sessão estiverem no mural, com os documentos pregados.</p>
          <ul className="list-disc space-y-1 pl-5 text-sm" data-pendentes>
            {pendentes.map((pauta) => (
              <li key={pauta.id}>
                Falta a pergunta de {pauta.autor}: {pauta.objetivo}
              </li>
            ))}
          </ul>
        </div>
      </Janela>
    );
  }
  return (
    <Janela id="camara" titulo="Câmara" sobre="A sessão de hoje" onFechar={onFechar}>
      <div data-camara="aberta">
        <div className="mb-3 flex gap-2" role="tablist">
          {(["lourdes", "mesa"] as const).map((id) => (
            <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)} className={ABA(aba === id)} data-aba={id}>
              {id === "lourdes" ? "Lourdes" : "Mesa"}
            </button>
          ))}
        </div>
        {aba === "lourdes" && <Conversa morador="lourdes" conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} onEncerrar={() => setAba("mesa")} rotuloDoFim="Ir à mesa" />}
        {aba === "mesa" && (sessao === null || materia === null ? <p data-sem-materia>Nenhuma matéria na mesa nesta edição.</p> : <Mesa sessao={sessao} materia={materia} conteudo={conteudo} progresso={progresso} onProgresso={onProgresso} />)}
      </div>
    </Janela>
  );
}

/** A mesa da Câmara: a matéria da sessão, a credencial que a mesa pede, a ata montada com dois documentos e a ata lavrada. */
function Mesa({ sessao, materia, conteudo, progresso, onProgresso }: { sessao: Sessao; materia: Materia } & Omit<JanelaDaPraca, "onFechar">) {
  const situacao = situacaoDaMateria(progresso, materia.id);
  const credencial = temItem(progresso, sessao.portao.item);
  const [recem, setRecem] = useState(false);
  const [ata, setAta] = useState<Record<string, { documento?: string; registro?: string }>>({});
  const [erros, setErros] = useState<Lavratura["erros"]>([]);
  const opcoes = useMemo(() => opcoesDaNota(progresso, conteudo.documentos), [progresso, conteudo.documentos]);
  const completa = materia.lados.every((lado) => ata[lado.id]?.documento !== undefined && ata[lado.id]?.registro !== undefined);
  const tentativas = progresso.atas[materia.id]?.tentativas ?? 0;

  if (situacao === "publicada") {
    const lavrada = ataLavrada(materia, conteudo.documentos);
    if (lavrada === null) return null;
    const mudanca = fimDaEdicao(progresso, conteudo) ? "A ata está no quadro da Câmara, e o mural está respondido: as pautas desta edição acabaram." : `A ata está no quadro de avisos da Câmara. ${objetivoDeAgora(progresso, conteudo)}`;
    return (
      <div className="space-y-4" data-ata-lavrada={materia.id}>
        <h3 className="font-serif text-xl leading-snug">{materia.titulo}</h3>
        <blockquote className="border-l-2 border-line-strong pl-3 text-sm text-ink-soft">{materia.pergunta}</blockquote>
        {lavrada.proposicao !== null && (
          <p className="text-sm" data-materia-proposicao>
            <strong>Matéria:</strong> {lavrada.proposicao.identificacao}. {lavrada.proposicao.ementa}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {lavrada.lados.map((lado) => (
            <section key={lado.lado.id} className="rounded-md border border-line bg-raised p-3" aria-label={lado.lado.rotulo} data-lado-da-ata={lado.lado.id}>
              <h4 className={ROTULO}>
                {lado.lado.rotulo} · {conteudo.pessoas[lado.lado.pessoa].nome}
              </h4>
              <DocumentoNaParede exposto={lado} />
            </section>
          ))}
        </div>
        <p className="rounded-md border border-line bg-sunken px-3 py-2 text-sm text-ink-soft" data-aviso-da-ata>
          Cada coluna diz o que o seu documento registra. A ata não compara posições: um voto no texto de um projeto e um veto a dispositivos da lei são atos diferentes, sobre textos diferentes da mesma matéria.
        </p>
        {recem && (
          <p className="rounded-md border border-ink bg-raised px-3 py-2 font-medium" data-mudanca>
            {mudanca}
          </p>
        )}
        <Link href="/comparar/#decisoes" className="inline-flex min-h-11 items-center rounded-md border border-line-strong px-5 py-2.5 no-underline" data-ver-no-atlas>
          Ver as decisões das duas pessoas no atlas
        </Link>
      </div>
    );
  }

  const campo = (lado: Materia["lados"][number], chave: "documento" | "registro", titulo: string, lista: { chave: string; texto: string }[]) => (
    <fieldset className="rounded-md border border-line bg-raised p-3" data-campo-da-ata={`${lado.id}:${chave}`}>
      <legend className="px-1 text-sm font-semibold">{titulo}</legend>
      <div className="grid gap-1.5">
        {lista.map((opcao) => (
          <label key={opcao.chave} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 leading-snug ${ata[lado.id]?.[chave] === opcao.chave ? "border-ink bg-sunken" : "border-line"}`}>
            <input
              type="radio"
              name={`ata-${lado.id}-${chave}`}
              value={opcao.chave}
              checked={ata[lado.id]?.[chave] === opcao.chave}
              onChange={() => setAta((atual) => ({ ...atual, [lado.id]: { ...atual[lado.id], [chave]: opcao.chave } }))}
              className="mt-1"
              data-opcao={`${lado.id}:${chave}:${opcao.chave}`}
            />
            <span>{opcao.texto}</span>
          </label>
        ))}
      </div>
      {erros.some((erro) => erro.lado === lado.id && erro.campo === chave) && (
        <p className="mt-2 text-sm font-medium" data-erro-da-ata={`${lado.id}:${chave}`}>
          {erros.find((erro) => erro.lado === lado.id && erro.campo === chave)!.mensagem}
        </p>
      )}
    </fieldset>
  );

  return (
    <div className="space-y-4" data-mesa={materia.id} data-situacao={situacao}>
      <h3 className="font-serif text-xl leading-snug">{materia.titulo}</h3>
      <p className="leading-snug">{materia.pergunta}</p>
      <p className="text-sm text-ink-soft">A mesa e a sessão são ficção. Os dois documentos são registros publicados neste atlas, um de cada pessoa, sobre a mesma proposição.</p>
      {situacao === "fechada" && (
        <button type="button" onClick={() => onProgresso((atual) => abrirMateria(atual, materia.id))} className={BOTAO_PRINCIPAL} data-aceitar-materia>
          Pôr a matéria na pauta
        </button>
      )}
      {situacao === "aberta" && !credencial && (
        <p className="rounded-md border border-line-strong bg-sunken px-3 py-2" data-sem-credencial>
          A mesa de imprensa pede a {ITENS[sessao.portao.item].nome.toLowerCase()}. A Lourdes sabe onde ela está.
        </p>
      )}
      {situacao === "aberta" && credencial && progresso.copias.length === 0 && <p data-sem-copias>Você ainda não levou nenhuma cópia do arquivo. A matéria deixou papel em duas gavetas, de pessoas diferentes.</p>}
      {situacao === "aberta" && credencial && progresso.copias.length > 0 && (
        <form
          className="space-y-3"
          data-lavrar-ata={materia.id}
          onSubmit={(evento) => {
            evento.preventDefault();
            if (!completa) return;
            const resultado = lavrarAta(progresso, materia, Object.fromEntries(materia.lados.map((lado) => [lado.id, { documento: ata[lado.id]!.documento!, registro: ata[lado.id]!.registro! }])), conteudo.documentos);
            onProgresso(() => resultado.progresso);
            setErros(resultado.erros);
            if (resultado.certo) setRecem(true);
          }}
        >
          <p className="text-sm text-ink-soft">As opções vêm só das cópias que você levou. Para cada lado, escolha o documento e o que ele registra.</p>
          {materia.lados.map((lado) => (
            <div key={lado.id} className="space-y-2" data-lado={lado.id}>
              <h4 className="font-semibold">
                {lado.rotulo} · {conteudo.pessoas[lado.pessoa].nome}
              </h4>
              {campo(lado, "documento", "Qual documento?", opcoes.documento)}
              {campo(lado, "registro", "O que ele registra?", opcoes.registro)}
            </div>
          ))}
          {erros.length > 0 && (
            <p className="rounded-md border border-line-strong bg-sunken px-3 py-2 text-sm" data-ata-recusada>
              A Lourdes não lavra essa: a ata não bate com os documentos. Veja o que cada lado diz e tente de novo. Tentativas: {tentativas}.
            </p>
          )}
          <button type="submit" disabled={!completa} className={BOTAO_PRINCIPAL} data-lavrar>
            Lavrar a ata
          </button>
        </form>
      )}
    </div>
  );
}
