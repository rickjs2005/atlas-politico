import type { Metadata } from "next";

import { CharacterSelect, type CharacterOption } from "@/features/game/CharacterSelect";
import { getAtlasData } from "@/lib/content/published";
import { findPersonBySlug, getImage } from "@/lib/data/queries";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent, playableChapters } from "@/lib/game/content";
import { signaturesOf } from "@/lib/game/progress";

export const metadata: Metadata = {
  title: "Jogo",
  description:
    "Escolha uma pessoa, controle o personagem pelos cenários de cada período e recolha os registros do atlas, com data e fontes, para avançar pelos capítulos.",
};

export default function GameEntryPage() {
  const data = getAtlasData();
  // A ordem é a dos perfis, alfabética. Um perfil sem registros publicados não aparece.
  const opcoes: CharacterOption[] = PROFILES.flatMap((perfil) => {
    const content = buildGameContent(data, perfil.slug);
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (content === null || pessoa === null) return [];
    const capitulos = playableChapters(content);
    if (capitulos.length === 0) return [];
    // A entrada não carrega os registros: leva só a assinatura atual de cada tarefa, para ler o progresso salvo.
    return [{ slug: perfil.slug, nome: pessoa.nome, retrato: getImage(data, pessoa.retratoId), capitulos, assinaturas: signaturesOf(capitulos, content) }];
  });

  if (opcoes.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Jogo</h1>
        <p className="max-w-2xl text-ink-soft">O jogo depende de acontecimentos publicados. Ainda não há capítulos jogáveis.</p>
      </div>
    );
  }

  // A mesma frase da entrada do atlas: o jogo usa o mesmo conteúdo.
  const { edicao } = data.conjunto;
  const notaDeRevisao =
    edicao !== null && edicao.revisao.tipo === "humana"
      ? `Revisado em ${formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.`
      : "Conferência com as fontes assistida por IA. Revisão humana pendente.";

  return <CharacterSelect opcoes={opcoes} notaDeRevisao={notaDeRevisao} />;
}
