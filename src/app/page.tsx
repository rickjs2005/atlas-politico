import Link from "next/link";

import { IntentLink } from "@/components/IntentLink";
import { PersonCard } from "@/components/PersonCard";
import { PortraitCredit } from "@/components/Portrait";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { getAtlasData } from "@/lib/content/published";
import { getCoveredSpan, getSharedSpan, listGaps } from "@/lib/data/coverage";
import { filterEvents, findPersonBySlug, getImage } from "@/lib/data/queries";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";
import { countPlayableChapters } from "@/lib/game/content";
import { gameHref } from "@/lib/state/links";

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
        // Capítulos do jogo que os registros publicados já permitem jogar.
        capitulos: countPlayableChapters(data, perfil.slug),
      },
    ];
  });
  const temJogo = perfis.some((perfil) => perfil.capitulos > 0);
  const escala = getSharedSpan(data);

  return (
    <div className="page space-y-12 py-7 md:space-y-16 md:py-14">
      {/* Em tela estreita a ordem é: o que é o atlas, as duas trajetórias para
          escolher e, só então, os números da edição. Em tela larga, o texto e os
          números ficam à esquerda, centrados na altura dos cartões. */}
      <section className="grid gap-x-16 gap-y-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-y-8">
        <header className="space-y-4 md:space-y-5 lg:self-end">
          <p className="eyebrow text-ink-soft">Linha do tempo · Mapa · Fontes · Jogo</p>
          <h1 className="font-serif text-[3.25rem] font-medium leading-[0.95] tracking-[-0.02em] md:text-7xl">
            Atlas Político
          </h1>
          <p className="reading max-w-[34rem] text-xl leading-snug">
            A trajetória pública de {nomes}, acontecimento por acontecimento, com a data, o lugar e
            o documento que sustenta cada registro.
          </p>
        </header>

        <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
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
                  <Link href="/metodologia" prefetch={false} className="font-medium underline decoration-line-strong hover:decoration-ink">
                    Metodologia e fontes
                  </Link>
                </dd>
              </div>
            </dl>
          )}
        </div>

        <section
          aria-labelledby="perfis"
          className="space-y-3 max-lg:row-start-2 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
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
                  />
                </li>
              ))}
            </ul>
          )}
          {/* O jogo: o mesmo acesso para os dois, logo abaixo de cada cartão. */}
          {temJogo && (
            <div className="grid grid-cols-2 gap-3 md:gap-5" data-secao="jogo">
              {perfis.map(({ pessoa, capitulos }) =>
                capitulos === 0 ? (
                  <span key={pessoa.id} />
                ) : (
                  <IntentLink
                    key={pessoa.id}
                    href={gameHref(pessoa.slug)}
                    data-jogar-entrada={pessoa.slug}
                    className="flex min-h-11 flex-col items-center justify-center border border-ink bg-ink px-3 py-2 text-center text-sm font-medium leading-tight text-paper no-underline hover:bg-ink-soft"
                  >
                    <span>Jogar com {pessoa.nome}</span>
                    <span className="numerals text-xs font-normal text-paper/80">
                      {capitulos} {capitulos === 1 ? "capítulo" : "capítulos"}
                    </span>
                  </IntentLink>
                ),
              )}
            </div>
          )}
          {temJogo && (
            <p className="text-sm text-ink-soft">
              No jogo, você percorre cada trajetória em capítulos e recolhe os registros do atlas.{" "}
              <Link
                href={gameHref()}
                prefetch={false}
                className="inline-flex min-h-11 items-center font-medium underline decoration-line-strong hover:decoration-ink md:min-h-0"
              >
                Como é o jogo
              </Link>
            </p>
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
            <IntentLink
              href="/comparar"
              className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper"
            >
              Comparar as trajetórias
            </IntentLink>
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
