import Link from "next/link";

import { PersonCard } from "@/components/PersonCard";
import { PortraitCredit } from "@/components/Portrait";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { getAtlasData } from "@/lib/content/published";
import { getCoveredSpan, getSharedSpan, listGaps } from "@/lib/data/coverage";
import { filterEvents, findPersonBySlug, getImage } from "@/lib/data/queries";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";

export default function HomePage() {
  const data = getAtlasData();
  const { edicao } = data.conjunto;
  const nomes = PROFILES.map((perfil) => perfil.nome).join(" e de ");

  // Os perfis na ordem da interface. Um perfil sem registros ainda não aparece.
  const perfis = PROFILES.flatMap((perfil) => {
    const pessoa = findPersonBySlug(data, perfil.slug);
    if (pessoa === null) return [];
    return [
      {
        pessoa,
        retrato: getImage(data, pessoa.retratoId),
        coberto: getCoveredSpan(data, pessoa.id),
        acontecimentos: filterEvents(data, { pessoaIds: [pessoa.id] }),
      },
    ];
  });
  const escala = getSharedSpan(data);

  return (
    <div className="page space-y-12 py-8 md:space-y-16 md:py-14">
      <section className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-start">
        <header className="space-y-5 lg:pt-7">
          <p className="eyebrow text-ink-soft">Linha do tempo · Mapa · Fontes</p>
          <h1 className="font-serif text-[3.25rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-7xl">
            Atlas Político
          </h1>
          <p className="reading max-w-[34rem] text-xl leading-snug">
            A trajetória pública de {nomes}, acontecimento por acontecimento, com a data, o lugar e
            o documento que sustenta cada registro.
          </p>

          {edicao === null ? (
            <p className="max-w-[34rem] border border-line-strong bg-notice px-4 py-3 text-sm">
              <strong>Em construção.</strong> Nenhuma edição de conteúdo foi publicada ainda.
            </p>
          ) : (
            <dl className="grid max-w-[34rem] grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="eyebrow text-ink-soft">Recorte</dt>
                <dd className="numerals mt-1 font-medium">
                  até {formatDate({ valor: edicao.dataDeCorte, precisao: "dia" })}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">Registros</dt>
                <dd className="numerals mt-1 font-medium">
                  {data.conjunto.acontecimentos.length} acontecimentos
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">Fontes</dt>
                <dd className="numerals mt-1 font-medium">{data.conjunto.fontes.length} documentos</dd>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <dt className="eyebrow text-ink-soft">Revisão</dt>
                <dd className="mt-1">
                  {edicao.revisao.tipo === "humana"
                    ? `Revisado em ${formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.`
                    : "Conferência com as fontes assistida por IA. Revisão humana pendente."}{" "}
                  <Link href="/metodologia" className="font-medium underline decoration-line-strong hover:decoration-ink">
                    Metodologia e fontes
                  </Link>
                </dd>
              </div>
            </dl>
          )}
        </header>

        <section aria-labelledby="perfis" className="space-y-3">
          <h2 id="perfis" className="eyebrow text-ink-soft">
            Escolha uma trajetória
          </h2>
          {perfis.length === 0 ? (
            <p className="text-ink-soft">Os perfis aparecem aqui quando houver registros revisados.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:gap-5">
              {perfis.map(({ pessoa, retrato, coberto, acontecimentos }) => (
                <li key={pessoa.id} className="flex">
                  <PersonCard
                    pessoa={pessoa}
                    retrato={retrato}
                    coberto={coberto}
                    registros={acontecimentos.length}
                    priority
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            {perfis.map(({ pessoa, retrato }) =>
              retrato === null ? <span key={pessoa.id} /> : <PortraitCredit key={pessoa.id} imagem={retrato} />,
            )}
          </div>
        </section>
      </section>

      {edicao !== null && escala !== null && perfis.length > 0 && (
        <section aria-labelledby="escala" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="space-y-1">
              <h2 id="escala" className="font-serif text-3xl font-medium tracking-tight">
                As duas trajetórias na mesma escala
              </h2>
              <p className="max-w-2xl text-sm text-ink-soft">
                Cada marca é um acontecimento registrado no atlas; as barras são cargos e funções.
                Trecho sem marca é falta de registro nesta edição, e não falta de atividade.
              </p>
            </div>
            <Link
              href="/comparar"
              className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper"
            >
              Comparar as trajetórias
            </Link>
          </div>
          <TrajectoryLanes
            domain={escala}
            dataDeCorte={edicao.dataDeCorte}
            detail="resumo"
            lanes={perfis.map(({ pessoa, coberto, acontecimentos }) => ({
              pessoa,
              acontecimentos,
              mandatos: data.conjunto.mandatos.filter((item) => item.pessoaId === pessoa.id),
              filiacoes: [],
              coberto,
              lacunas: listGaps(data, pessoa.id),
            }))}
          />
        </section>
      )}
    </div>
  );
}
