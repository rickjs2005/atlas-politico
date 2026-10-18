// Os passos de uma pauta e da matéria da mesa (D-155), puros: o que falta
// fazer, na ordem, com o passo de agora à frente. O cartão da praça mostra um
// passo por vez ("Passo 2 de 4"); o documento inteiro, as fontes e as
// ressalvas continuam alcançáveis nas janelas. Nada aqui dá nota: um passo
// feito é só um passo feito.

import { ITENS } from "./praca";
import { camaraAberta, documentosDaPauta, gavetaAberta, materiaDaSessao, pautaAberta, pautasDaSessao, sessaoDeAgora, situacaoDaMateria, situacaoDaPauta, temItem, tipoDaPauta, type Roteiro } from "./regras";
import type { ConteudoDaPraca, Gaveta, LugarId, Materia, Pauta, ProgressoDaPraca } from "./tipos";

export interface Passo {
  id: "aceitar" | "chave" | "copiar" | "montar" | "materia" | "credencial" | "lavrar";
  /** A instrução, curta, em uma linha. */
  texto: string;
  feito: boolean;
  /** Onde o passo acontece, para a lista sem a cena e para a placa. */
  lugar: LugarId;
}

const nomeDaGaveta = (gaveta: Gaveta) => gaveta.rotulo;

/** O que se faz no mural para responder, por tipo de pauta. */
function textoDeMontar(pauta: Pauta): string {
  switch (tipoDaPauta(pauta)) {
    case "campo":
      return "No mural, conferir a data que o campo Data da cópia registra.";
    case "natureza":
      return "No mural, dizer qual documento é o pedido e o que o campo Ação dele registra.";
    case "ordem":
      return "No mural, pôr os dois documentos na ordem do campo Data.";
    default:
      return "No mural, montar a nota: o documento, a data e o que ele registra.";
  }
}

/** Os passos de uma pauta, na ordem, com o que já está feito. */
export function passosDaPauta(progresso: ProgressoDaPraca, pauta: Pauta, conteudo: Pick<ConteudoDaPraca, "gavetas">): Passo[] {
  const situacao = situacaoDaPauta(progresso, pauta.id);
  const necessarios = documentosDaPauta(pauta);
  const gavetas = necessarios.flatMap((id) => conteudo.gavetas.filter((gaveta) => gaveta.documentos.includes(id)));
  const unicas = gavetas.filter((gaveta, i) => gavetas.findIndex((outra) => outra.id === gaveta.id) === i);
  const passos: Passo[] = [{ id: "aceitar", texto: `No mural, aceitar a pergunta de ${pauta.autor}.`, feito: situacao !== "fechada", lugar: "mural" }];
  // A gaveta que pede um item ganha um passo, que fica na lista (feito) depois que o item chega: a contagem de passos não muda no meio.
  for (const gaveta of unicas.filter((item) => item.precisa !== null)) {
    const item = gaveta.precisa!;
    passos.push({ id: "chave", texto: `Conseguir a ${ITENS[item].nome.toLowerCase()}: a gaveta ${nomeDaGaveta(gaveta)} está trancada, e o Escrivão deixou um bilhete.`, feito: gavetaAberta(gaveta, progresso) && temItem(progresso, item), lugar: "arquivo" });
  }
  const copiadas = necessarios.every((id) => progresso.copias.includes(id));
  passos.push({
    id: "copiar",
    texto: unicas.length === 1 ? `No arquivo, abrir a gaveta ${nomeDaGaveta(unicas[0]!)} e levar a cópia do documento pedido.` : `No arquivo, levar as cópias das gavetas ${unicas.map(nomeDaGaveta).join(" e ")}.`,
    feito: copiadas,
    lugar: "arquivo",
  });
  passos.push({ id: "montar", texto: textoDeMontar(pauta), feito: situacao === "publicada", lugar: "mural" });
  return passos;
}

/** Os passos da matéria da mesa: pôr na pauta, a credencial, as cópias dos dois lados, lavrar. */
export function passosDaMateria(progresso: ProgressoDaPraca, materia: Materia, conteudo: Pick<ConteudoDaPraca, "gavetas" | "sessoes">): Passo[] {
  const situacao = situacaoDaMateria(progresso, materia.id);
  const sessao = conteudo.sessoes.find((item) => item.id === materia.sessao);
  const passos: Passo[] = [{ id: "materia", texto: "Na Câmara, pôr a matéria da sessão na pauta.", feito: situacao !== "fechada", lugar: "camara" }];
  if (sessao !== undefined) passos.push({ id: "credencial", texto: `Conseguir a ${ITENS[sessao.portao.item].nome.toLowerCase()}: a mesa a pede, e a Lourdes sabe onde está.`, feito: temItem(progresso, sessao.portao.item), lugar: "camara" });
  const gavetas = materia.lados.flatMap((lado) => conteudo.gavetas.filter((gaveta) => gaveta.id === lado.gaveta));
  passos.push({ id: "copiar", texto: `No arquivo, levar as cópias das gavetas ${gavetas.map(nomeDaGaveta).join(" e ")}: um documento de cada lado.`, feito: materia.lados.every((lado) => progresso.copias.includes(lado.documento)), lugar: "arquivo" });
  passos.push({ id: "lavrar", texto: "Na mesa da Câmara, lavrar a ata com os dois documentos, cada um com o que registra.", feito: situacao === "publicada", lugar: "camara" });
  return passos;
}

/** O passo de agora: da pauta aberta, ou da matéria na pauta; `null` quando não há o que fazer passo a passo. */
export function passoDeAgora(progresso: ProgressoDaPraca, conteudo: Pick<ConteudoDaPraca, "gavetas" | "sessoes"> & Roteiro): { passos: Passo[]; indice: number; de: string } | null {
  const sessao = sessaoDeAgora(progresso, conteudo);
  if (sessao === null) return null;
  const aberta = pautaAberta(progresso, pautasDaSessao(sessao, conteudo));
  const escolher = (passos: Passo[], de: string) => {
    const indice = passos.findIndex((passo) => !passo.feito);
    return indice === -1 ? null : { passos, indice, de };
  };
  if (aberta !== null) return escolher(passosDaPauta(progresso, aberta, conteudo), aberta.autor);
  const materia = materiaDaSessao(sessao, conteudo);
  if (materia !== null && camaraAberta(progresso, conteudo) && situacaoDaMateria(progresso, materia.id) === "aberta") return escolher(passosDaMateria(progresso, materia, conteudo), "a mesa da Câmara");
  return null;
}
