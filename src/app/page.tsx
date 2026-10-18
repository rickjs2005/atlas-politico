import Link from "next/link";

import { IntentLink } from "@/components/IntentLink";
import { PracaPreview } from "@/components/PracaPreview";
import { TrajectoryPicker, listProfiles } from "@/components/TrajectoryPicker";
import { TrajectoryLanes } from "@/features/comparison/TrajectoryLanes";
import { getAtlasData } from "@/lib/content/published";
import { getSharedSpan, listGaps } from "@/lib/data/coverage";
import { formatDate } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";

// A entrada (D-155): um documentário interativo. Primeiro o convite curto e a
// prévia leve da investigação, com a ação principal; depois, na folha de
// papel, as duas trajetórias e os números da edição. O mundo 3D da praça só
// chega depois de a pessoa decidir jogar.
export default function HomePage() {
  const data = getAtlasData();
  const { edicao } = data.conjunto;
  const nomes = PROFILES.map((perfil) => perfil.nome).join(" e de ");
  const perfis = listProfiles(data);
  const escala = getSharedSpan(data);

  return (
    <div className="palco flex flex-1 flex-col">
      {/* O convite: uma frase, a prévia e duas ações. */}
      <section aria-labelledby="titulo-da-entrada" className="page grid items-center gap-x-12 gap-y-8 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:py-20">
        <header className="space-y-5 md:space-y-6">
          <p className="eyebrow text-highlight">Documentário interativo · Linha do tempo · Mapa · Fontes · Investigação</p>
          <h1 id="titulo-da-entrada" className="font-serif text-[3.25rem] font-medium leading-[0.92] tracking-[-0.025em] md:text-[5rem] lg:text-[5.5rem]">
            Atlas Político
          </h1>
          <p className="max-w-[32rem] font-serif text-xl leading-snug text-stage-ink md:text-2xl">
            A trajetória pública de {nomes}, acontecimento por acontecimento, com a data, o lugar e o documento que sustenta cada registro. E uma praça onde
            você investiga o que cada um decidiu.
          </p>
          <div className="flex flex-wrap gap-3">
            <IntentLink href="/praca" className="btn-acao text-base" data-comecar-investigacao>
              Começar investigação
            </IntentLink>
            <IntentLink href="/comparar" className="btn-palco text-base" data-comparar-candidatos>
              Comparar candidatos
            </IntentLink>
          </div>
          <p className="max-w-[32rem] text-sm text-stage-ink-soft">
            Sem nota, sem ranking e sem recomendação de voto. Cada resposta da investigação é um documento publicado, com a fonte ao lado.
          </p>
        </header>
        <figure className="space-y-2">
          <div className="overflow-hidden border border-stage-line bg-stage-raised">
            <PracaPreview decorative className="block h-auto w-full" />
          </div>
          <figcaption className="text-xs text-stage-ink-soft">
            A Praça do Mural ao anoitecer: os moradores pregam perguntas, e quem responde precisa pregar o documento junto. Representação; os moradores são
            fictícios.
          </figcaption>
        </figure>
      </section>

      {/* A folha: as trajetórias, os números da edição e as duas na mesma escala. */}
      <div className="folha flex-1 border-t border-stage-line">
        <div className="page space-y-12 py-8 md:space-y-16 md:py-12">
          <section className="grid gap-x-16 gap-y-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)]">
            <div className="space-y-5 lg:self-start">
              <div className="space-y-3">
                <p className="eyebrow text-ink-soft">Explorar</p>
                <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight md:text-4xl">Duas trajetórias, o mesmo tratamento</h2>
                <p className="max-w-[34rem] text-ink-soft">
                  Cada pessoa tem a própria linha do tempo, o mapa dos acontecimentos e as decisões documentadas. Os dois perfis usam o mesmo cartão, na
                  mesma ordem alfabética, e nenhuma cor pertence a uma pessoa.
                </p>
              </div>
              {edicao === null ? (
                <p className="max-w-[34rem] border border-line-strong bg-notice px-4 py-3 text-sm">
                  <strong>Em construção.</strong> Nenhuma edição de conteúdo foi publicada ainda.
                </p>
              ) : (
                <dl className="grid max-w-[34rem] grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow text-ink-soft">Recorte</dt>
                    <dd className="numerals mt-1 font-medium">até {formatDate({ valor: edicao.dataDeCorte, precisao: "dia" })}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-soft">Registros</dt>
                    <dd className="numerals mt-1 font-medium">{data.conjunto.acontecimentos.length} acontecimentos</dd>
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
            <div className="lg:col-start-2">
              <TrajectoryPicker data={data} />
            </div>
          </section>

          {edicao !== null && escala !== null && perfis.length > 0 && (
            <section aria-labelledby="escala" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <div className="space-y-1">
                  <h2 id="escala" className="font-serif text-3xl font-medium tracking-tight">
                    As duas trajetórias na mesma escala
                  </h2>
                  <p className="max-w-2xl text-sm text-ink-soft">
                    Cada marca é um acontecimento registrado no atlas; as barras são cargos e funções. Trecho sem marca é falta de registro nesta edição, e
                    não falta de atividade.
                  </p>
                </div>
                <IntentLink href="/comparar" className="inline-flex min-h-11 items-center border border-ink px-4 text-sm font-medium no-underline hover:bg-ink hover:text-paper">
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
      </div>
    </div>
  );
}
