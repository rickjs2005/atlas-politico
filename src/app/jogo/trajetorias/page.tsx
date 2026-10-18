import type { Metadata } from "next";

import { CharacterSelect, type CharacterOption } from "@/features/game/CharacterSelect";
import { getAtlasData } from "@/lib/content/published";
import { findPersonBySlug, getImage } from "@/lib/data/queries";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";
import { buildGameContent, buildProgressKeys } from "@/lib/game/content";

export const metadata: Metadata = {
  title: "Jogar · Trajetórias",
  description: "Conheça as duas trajetórias em fases curtas: um marco, uma explicação e uma pergunta por fase, com as fontes do atlas.",
};

export default function GameEntryPage() {
  const data = getAtlasData();
  // A ordem é a dos perfis, alfabética. Um perfil sem fase publicada não aparece.
  const opcoes: CharacterOption[] = PROFILES.flatMap((perfil) => {
    const trajetoria = buildGameContent(data, perfil.slug, "historico");
    const pessoa = findPersonBySlug(data, perfil.slug);
    const primeira = trajetoria?.fases[0];
    if (trajetoria === null || pessoa === null || primeira === undefined) return [];
    return [
      {
        slug: perfil.slug,
        nome: pessoa.nome,
        retrato: getImage(data, pessoa.retratoId),
        // A entrada não carrega os registros: leva o título e o período de cada fase, e o que o progresso salvo precisa para ser lido.
        fases: trajetoria.fases.map(({ id, sala, numero, titulo, periodo }) => ({ id, sala, numero, titulo, periodo })),
        previa: { cena: primeira.cena, epoca: primeira.epoca },
        aprofundamentos: trajetoria.salas.filter((sala) => sala.id !== "historico"),
        chaves: buildProgressKeys(data, perfil.slug),
      },
    ];
  });

  if (opcoes.length === 0) {
    return (
      <div className="page space-y-4 py-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Jogo</h1>
        <p className="max-w-2xl text-ink-soft">O jogo depende de fases publicadas no conteúdo do atlas. Ainda não há nenhuma.</p>
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
