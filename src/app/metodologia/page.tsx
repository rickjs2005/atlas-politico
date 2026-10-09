// Metodologia pública do atlas: o que ele registra, como seleciona, de onde
// tira cada afirmação, como foi revisado e como sugerir uma correção.
//
// O texto segue as decisões editoriais documentadas (docs/EDITORIAL.md,
// docs/SOURCES.md e docs/CONTENT-REVIEW.md). Os números e as datas vêm dos
// dados gerados da edição, e não do texto: mudam sozinhos com o conteúdo.

import type { Metadata } from "next";
import Link from "next/link";

import { CategoryLabel } from "@/components/Category";
import { EditionStatus } from "@/components/EditionStatus";
import { SourceCatalog } from "@/components/SourceList";
import { getAtlasData } from "@/lib/content/published";
import { MIN_GAP_YEARS, getCoverage } from "@/lib/data/coverage";
import { findPersonBySlug, listSourcesOf, type SourceUse } from "@/lib/data/queries";
import type { Categoria } from "@/lib/domain/categories";
import { formatDate, formatPeriod } from "@/lib/domain/dates";
import { PROFILES } from "@/lib/domain/profiles";
import { SITE } from "@/lib/site";

import { CorrectionTemplate } from "./CorrectionTemplate";

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Como o atlas seleciona os acontecimentos, que fontes usa, como foi revisado, o que as datas, os lugares e a comparação podem dizer, e como sugerir uma correção.",
};

const SECTIONS = [
  { id: "objetivo", titulo: "Objetivo e escopo" },
  { id: "selecao", titulo: "Seleção dos acontecimentos" },
  { id: "fontes", titulo: "Fontes" },
  { id: "revisao", titulo: "Revisão" },
  { id: "datas", titulo: "Datas" },
  { id: "lugares", titulo: "Lugares" },
  { id: "comparacao", titulo: "Lacunas e limites da comparação" },
  { id: "edicao", titulo: "Edição e atualização" },
  { id: "correcao", titulo: "Como sugerir uma correção" },
  { id: "creditos", titulo: "Créditos" },
  { id: "catalogo", titulo: "Fontes desta edição" },
] as const;

// Os cinco motivos de seleção, um por categoria (docs/EDITORIAL.md, seção Seleção).
const MOTIVOS: { categoria: Categoria; motivo: string; exemplos: string }[] = [
  {
    categoria: "mandatos-e-funcoes",
    motivo: "Mudança de cargo ou função",
    exemplos: "Eleição para a presidência de um sindicato, cargo na Mesa do Senado, presidência de comissão, nomeação suspensa",
  },
  {
    categoria: "eleicoes",
    motivo: "Eleição disputada, vencida ou perdida",
    exemplos: "Candidatura, resultado, registro indeferido, convenção que oficializa a candidatura",
  },
  {
    categoria: "partidos-e-aliancas",
    motivo: "Filiação, saída de partido ou aliança",
    exemplos: "Fundação de partido, mudança de legenda",
  },
  {
    categoria: "atuacao-institucional",
    motivo: "Ato institucional documentado",
    exemplos: "Decreto, liderança partidária, relatoria de projeto aprovado",
  },
  {
    categoria: "marcos-historicos",
    motivo: "Episódio que alterou a trajetória",
    exemplos: "Greve, prisão, condenação, anulação, denúncia e seu desfecho",
  },
];

const h2 = "font-serif text-3xl font-medium tracking-tight";
const h3 = "eyebrow text-ink-soft";
const prose = "reading max-w-[42rem] text-[1.0625rem] leading-relaxed";
const items = "max-w-[42rem] space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed";
const list = `${items} list-disc`;
const ordered = `${items} list-decimal`;
const textLink = "underline decoration-line-strong hover:decoration-ink";

/** A organização que publica: a autoria até a vírgula ou o parêntese do nome de quem assina. */
const organizationOf = (autoria: string) => autoria.split(/\s*[,(]/)[0]!.trim();

function groupByOrganization(fontes: readonly SourceUse[]): { nome: string; fontes: SourceUse[] }[] {
  const grupos = new Map<string, SourceUse[]>();
  for (const uso of fontes) {
    const nome = organizationOf(uso.fonte.autoria);
    grupos.set(nome, [...(grupos.get(nome) ?? []), uso]);
  }
  // A lista já vem em ordem de autoria: os grupos saem na mesma ordem.
  return [...grupos].map(([nome, itens]) => ({ nome, fontes: itens }));
}

export default function MethodologyPage() {
  const data = getAtlasData();
  const { edicao, imagens, acontecimentos, mandatos, filiacoes, pessoas, fontes } = data.conjunto;
  const registros = [...pessoas, ...mandatos, ...filiacoes, ...acontecimentos];
  const citacoes = registros.reduce((total, registro) => total + registro.fontes.length, 0);
  const catalogo = groupByOrganization(listSourcesOf(data, registros));
  const nomes = PROFILES.map((perfil) => perfil.nome).join(" e de ");
  const corte = edicao === null ? null : formatDate({ valor: edicao.dataDeCorte, precisao: "dia" });
  const perfis = PROFILES.flatMap((perfil) => {
    const pessoa = findPersonBySlug(data, perfil.slug);
    return pessoa === null ? [] : [{ pessoa, cobertura: getCoverage(data, pessoa.id) }];
  });

  return (
    <div className="page py-8 md:py-12">
      <header className="max-w-3xl space-y-4 border-b border-ink pb-8">
        <p className="eyebrow text-ink-soft">Como o atlas é feito</p>
        <h1 className="font-serif text-5xl font-medium leading-none tracking-tight md:text-6xl">
          Metodologia
        </h1>
        <p className="reading text-xl leading-snug">
          O que o atlas registra, como seleciona, de onde tira cada afirmação, como foi revisado e o
          que a comparação pode e não pode dizer.
        </p>
        <EditionStatus edicao={edicao} />
      </header>

      <div className="mt-8 grid gap-x-14 gap-y-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Nesta página" className="lg:sticky lg:top-6 lg:self-start">
          <p className={h3}>Nesta página</p>
          <ol className="mt-2 grid gap-x-6 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {SECTIONS.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`} className={`inline-flex min-h-11 items-center lg:min-h-8 ${textLink}`}>
                  {secao.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-12 [&>section]:scroll-mt-6 [&>section]:space-y-4">
          <section id="objetivo" aria-labelledby="titulo-objetivo">
            <h2 id="titulo-objetivo" className={h2}>
              Objetivo e escopo
            </h2>
            <p className={prose}>
              O atlas registra a trajetória pública de {nomes}: cargos, eleições, partidos, atos
              institucionais e episódios que mudaram o rumo da carreira. Cada registro tem a data na
              precisão conhecida, o lugar quando ele está documentado e as fontes que o sustentam.
            </p>
            <p className={prose}>
              Não registra opinião, vida privada, pesquisa de intenção de voto nem declaração
              isolada. Não diz se uma decisão foi justa, se um resultado foi bom ou se uma pessoa tem
              razão.
            </p>
            {edicao !== null && (
              <p className="numerals max-w-[42rem] text-sm text-ink-soft" data-numeros>
                Esta edição tem {acontecimentos.length} acontecimentos, {mandatos.length} cargos e
                funções, {filiacoes.length} filiações partidárias e {fontes.length} fontes, com
                registros até {corte}.
              </p>
            )}
          </section>

          <section id="selecao" aria-labelledby="titulo-selecao">
            <h2 id="titulo-selecao" className={h2}>
              Seleção dos acontecimentos
            </h2>
            <p className={prose}>
              Um fato vira acontecimento quando se encaixa em um de cinco motivos. Cada motivo
              corresponde a uma categoria, a mesma que aparece nos filtros.
            </p>
            <div className="max-w-[48rem] overflow-x-auto">
              <table className="w-full min-w-[34rem] border-y border-line text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className={`py-2 pr-4 ${h3}`}>
                      Motivo
                    </th>
                    <th scope="col" className={`py-2 pr-4 ${h3}`}>
                      Categoria
                    </th>
                    <th scope="col" className={`py-2 ${h3}`}>
                      Exemplos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MOTIVOS.map((item) => (
                    <tr key={item.categoria} className="align-top">
                      <th scope="row" className="py-2 pr-4 font-medium">
                        {item.motivo}
                      </th>
                      <td className="whitespace-nowrap py-2 pr-4">
                        <CategoryLabel categoria={item.categoria} />
                      </td>
                      <td className="py-2 text-ink-soft">{item.exemplos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className={h3}>Regras que valem para os dois perfis</h3>
            <ul className={list}>
              <li>
                <strong className="font-semibold">Mesmo critério, mesma ordem de fontes.</strong> Um
                tipo de fato que entra para uma pessoa entra para a outra, se estiver documentado.
              </li>
              <li>
                <strong className="font-semibold">De 15 a 20 acontecimentos por pessoa.</strong> É um
                limite de escopo, e não uma meta. Fato sem sustentação suficiente fica em rascunho,
                fora do site.
              </li>
              <li>
                <strong className="font-semibold">Fatos encadeados são reunidos.</strong> A posse
                entra no contexto da eleição correspondente. O período de cada cargo fica na lista
                de cargos e funções.
              </li>
              <li>
                <strong className="font-semibold">Episódio em andamento não entra.</strong>{" "}
                Investigação ou controvérsia sem decisão e sem documento oficial fica fora do
                conjunto.
              </li>
              <li>
                <strong className="font-semibold">Episódios judiciais.</strong> O texto diz quem
                decidiu, em que instância e em que data. Investigação, denúncia, condenação e
                anulação são palavras diferentes e não se substituem. Todo registro de condenação ou
                de denúncia informa o desfecho conhecido até a data de corte.
              </li>
              <li>
                <strong className="font-semibold">Carreiras de duração diferente não são niveladas.</strong>{" "}
                O atlas não estica nem comprime uma trajetória para caber na outra.
              </li>
              <li>
                <strong className="font-semibold">A mesma apresentação.</strong> Os dois perfis usam
                as mesmas telas, a mesma moldura de retrato e as mesmas seções, com os nomes em ordem
                alfabética. Nenhuma cor identifica uma pessoa ou um partido.
              </li>
            </ul>
          </section>

          <section id="fontes" aria-labelledby="titulo-fontes">
            <h2 id="titulo-fontes" className={h2}>
              Fontes
            </h2>
            <p className={prose}>
              A evidência vem do documento lido. Cada documento foi baixado e lido; a busca na web
              serviu só para localizar endereços. Cada citação diz onde olhar no documento e o que
              aquele trecho sustenta no registro.
            </p>
            <h3 className={h3}>Ordem de preferência</h3>
            <ol className={ordered}>
              <li>Dado oficial estruturado: Tribunal Superior Eleitoral, Senado Federal, Câmara dos Deputados.</li>
              <li>Nota ou notícia do próprio órgão que decidiu: tribunais e Ministério Público.</li>
              <li>Agências públicas de notícias: Agência Brasil, Agência Senado, Agência Câmara.</li>
              <li>Biografia institucional, que serve à cronologia e nem sempre traz dia e mês.</li>
              <li>Jornalismo, com veículo e data.</li>
            </ol>
            <ul className={list}>
              <li>
                <strong className="font-semibold">Jornalismo tem uso restrito.</strong> Entra quando
                não foi localizado documento oficial para o fato, ou para registrar o desdobramento de
                um caso. O texto do acontecimento diz qual veículo informa o quê.
              </li>
              <li>
                <strong className="font-semibold">Declaração tem autor.</strong> O que é declaração ou
                avaliação aparece atribuído: &ldquo;a defesa afirmou&rdquo;, &ldquo;segundo a Agência
                Senado&rdquo;.
              </li>
              <li>
                <strong className="font-semibold">Texto próprio.</strong> Nada é copiado das fontes
                além de expressões curtas entre aspas, quando a expressão é o próprio dado.
              </li>
              <li>
                <strong className="font-semibold">Divergência não é descartada.</strong> Quando dois
                documentos se contradizem, o atlas adota uma versão e registra a divergência na
                documentação do projeto.
              </li>
            </ul>
            {edicao !== null && (
              <p className="numerals max-w-[42rem] text-sm text-ink-soft">
                Nesta edição: {fontes.length} documentos e {citacoes} citações. A lista completa está
                em{" "}
                <a href="#catalogo" className={textLink}>
                  Fontes desta edição
                </a>
                .
              </p>
            )}
          </section>

          <section id="revisao" aria-labelledby="titulo-revisao">
            <h2 id="titulo-revisao" className={h2}>
              Revisão
            </h2>
            <p className={prose}>
              A pesquisa começa como rascunho. Só entra nas páginas o registro conferido contra as
              fontes, com a indicação de quem conferiu e quando. Cada registro diz se a conferência
              foi assistida por IA ou feita por uma pessoa, e a revisão humana só é registrada quando
              de fato aconteceu.
            </p>
            {edicao !== null && edicao.revisao.tipo === "assistida-por-ia" && (
              <>
                <h3 className={h3}>O que foi feito nesta edição</h3>
                <ul className={list} data-revisao="assistida-por-ia">
                  <li>
                    Toda a conferência foi assistida por IA ({edicao.revisao.revisadoPor}), em{" "}
                    {formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.{" "}
                    <strong className="font-semibold">Nenhuma pessoa revisou este conjunto.</strong>
                  </li>
                  <li>
                    Para cada citação foram anotados os trechos literais do documento que a
                    sustentam, e um verificador conferiu se cada trecho existe na cópia baixada do
                    documento.
                  </li>
                  <li>Cada resumo e cada contexto foi relido contra esses trechos, à procura de afirmação sem apoio.</li>
                  <li>
                    Essa conferência prova que o trecho existe no documento. Não prova que o texto do
                    atlas o interpreta bem: esse juízo depende da revisão humana, que está pendente.
                  </li>
                </ul>
                {edicao.revisao.observacoes !== undefined && (
                  <p className="max-w-[42rem] border-l-2 border-ink-faint pl-3 text-sm text-ink-soft">
                    Nota da edição: {edicao.revisao.observacoes}
                  </p>
                )}
              </>
            )}
            {edicao !== null && edicao.revisao.tipo === "humana" && (
              <p className={prose} data-revisao="humana">
                Esta edição foi revisada por {edicao.revisao.revisadoPor} em{" "}
                {formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}.
              </p>
            )}
          </section>

          <section id="datas" aria-labelledby="titulo-datas">
            <h2 id="titulo-datas" className={h2}>
              Datas
            </h2>
            <ul className={list}>
              <li>
                <strong className="font-semibold">A precisão é a da fonte:</strong> dia, mês ou ano.
                O atlas não completa uma data parcial. Quando só o ano está documentado, a página
                diz isso.
              </li>
              <li>
                <strong className="font-semibold">Na linha do tempo,</strong> um acontecimento de que
                só se sabe o ano ocupa o ano inteiro, e não um dia escolhido.
              </li>
              <li>
                <strong className="font-semibold">Ordem.</strong> Quando as datas de dois registros
                não decidem qual veio antes, a lista avisa que a ordem não está documentada.
              </li>
              <li>
                <strong className="font-semibold">Períodos.</strong> O início ou o fim de um cargo ou
                de uma filiação pode não estar documentado: o registro diz &ldquo;início não
                documentado&rdquo; ou &ldquo;fim não documentado&rdquo;, e esse limite não vira data.
                &ldquo;Em curso&rdquo; quer dizer em vigor na data de corte da edição.
              </li>
              <li>
                <strong className="font-semibold">Recorte por anos.</strong> Os filtros de período
                usam anos de calendário, com as duas pontas inclusas. Um cargo de datas incompletas
                que pode ou não tocar o período aparece como presença incerta.
              </li>
            </ul>
          </section>

          <section id="lugares" aria-labelledby="titulo-lugares">
            <h2 id="titulo-lugares" className={h2}>
              Lugares
            </h2>
            <ul className={list}>
              <li>
                <strong className="font-semibold">O lugar é o do fato documentado.</strong> Decisão
                de tribunal usa o município-sede, quando ele aparece no documento lido.
              </li>
              <li>
                <strong className="font-semibold">Toda coordenada é uma aproximação declarada:</strong>{" "}
                o centro do município ou do estado. Nenhum ponto é um endereço.
              </li>
              <li>
                <strong className="font-semibold">Sem ponto inventado.</strong> Eleição nacional não
                tem ponto municipal. Acontecimento sem lugar no documento fica sem ponto, e o texto
                diz por quê. Os dois continuam na lista, na linha do tempo e no painel.
              </li>
              <li>
                <strong className="font-semibold">Pontos não formam um trajeto.</strong> A ordem dos
                acontecimentos no tempo não comprova deslocamento.
              </li>
            </ul>
          </section>

          <section id="comparacao" aria-labelledby="titulo-comparacao">
            <h2 id="titulo-comparacao" className={h2}>
              Lacunas e limites da comparação
            </h2>
            <p className={prose}>
              A comparação põe as duas trajetórias no mesmo intervalo de anos, com as mesmas
              categorias e na mesma escala. Ela mostra o que o atlas registra para cada pessoa, e
              só isso.
            </p>
            <ul className={list}>
              <li>
                <strong className="font-semibold">Quantidade é acervo.</strong> O número de
                acontecimentos é o que esta edição selecionou e documentou. Não mede atividade,
                produtividade nem desempenho. O atlas não soma, não ordena e não dá nota.
              </li>
              <li>
                <strong className="font-semibold">Período sem registro é lacuna.</strong> Um trecho de{" "}
                {MIN_GAP_YEARS} anos ou mais sem acontecimentos aparece como &ldquo;sem
                registros&rdquo;. Indica falta de pesquisa nesta edição, e não falta de atividade
                pública.
              </li>
              <li>
                <strong className="font-semibold">Cargos diferentes não são equiparados.</strong> Cada
                cargo aparece com a instituição e o período. A tela não diz que um vale o mesmo que
                outro.
              </li>
              <li>
                <strong className="font-semibold">Coberturas diferentes.</strong> A edição não cobre
                as duas trajetórias desde o mesmo ano. O trecho anterior ao começo da cobertura de uma
                pessoa aparece como &ldquo;fora da cobertura desta edição&rdquo;.
              </li>
            </ul>
            {perfis.length > 0 && (
              <>
                <h3 className={h3}>O que esta edição cobre</h3>
                <dl className="max-w-[42rem] divide-y divide-line border-y border-line text-sm" data-cobertura>
                  {perfis.map(({ pessoa, cobertura }) => (
                    <div key={pessoa.id} className="space-y-1 py-3">
                      <dt className="font-medium">
                        {pessoa.nome}
                        <span className="numerals font-normal text-ink-soft">
                          {" "}
                          · {cobertura === null ? "período não declarado" : formatPeriod(cobertura.periodo)}
                        </span>
                      </dt>
                      {cobertura?.observacao !== undefined && (
                        <dd className="text-ink-soft">{cobertura.observacao}</dd>
                      )}
                    </div>
                  ))}
                </dl>
              </>
            )}
          </section>

          <section id="edicao" aria-labelledby="titulo-edicao">
            <h2 id="titulo-edicao" className={h2}>
              Edição e atualização
            </h2>
            {edicao === null ? (
              <p className={prose}>Nenhuma edição de conteúdo foi publicada ainda.</p>
            ) : (
              <>
                <dl className="grid max-w-[42rem] grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-sm sm:grid-cols-3" data-edicao={edicao.versao}>
                  <div>
                    <dt className={h3}>Versão</dt>
                    <dd className="numerals mt-1 font-medium">{edicao.versao}</dd>
                  </div>
                  <div>
                    <dt className={h3}>Data de corte</dt>
                    <dd className="numerals mt-1 font-medium">{corte}</dd>
                  </div>
                  <div>
                    <dt className={h3}>Última conferência</dt>
                    <dd className="numerals mt-1 font-medium">
                      {formatDate({ valor: edicao.revisao.revisadoEm, precisao: "dia" })}
                    </dd>
                  </div>
                </dl>
                <p className={prose}>
                  Nenhum registro é posterior à data de corte. O que aconteceu depois dela não está no
                  atlas, e o que estava em curso naquele dia aparece como &ldquo;em curso&rdquo;.
                </p>
                <ul className={list}>
                  <li>Correção de um registro existente muda o terceiro número da versão.</li>
                  <li>Inclusão de acontecimentos muda o segundo.</li>
                  <li>A versão 1.0.0 fica reservada para a primeira edição com revisão humana completa.</li>
                  <li>O atlas não promete prazo de atualização: informa a data de corte e a da última conferência.</li>
                </ul>
                <h3 className={h3}>Registro de alterações</h3>
                <ol className="max-w-[42rem] divide-y divide-line border-y border-line text-sm" data-alteracoes>
                  {edicao.alteracoes.map((alteracao) => (
                    <li key={`${alteracao.data}:${alteracao.descricao}`} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
                      <span className="numerals font-medium">
                        {formatDate({ valor: alteracao.data, precisao: "dia" })}
                      </span>
                      <span className="text-ink-soft">{alteracao.descricao}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <section id="correcao" aria-labelledby="titulo-correcao">
            <h2 id="titulo-correcao" className={h2}>
              Como sugerir uma correção
            </h2>
            <p className={prose}>
              Qualquer pessoa pode apontar um erro. O apontamento é conferido contra a fonte citada
              e, se for preciso, contra uma fonte nova, que passa a fazer parte do catálogo. Toda
              correção entra no registro de alterações, com a data, a descrição e os registros
              afetados.
            </p>
            {SITE.correctionChannel === null ? (
              <p className="max-w-[42rem] border border-line-strong bg-notice px-4 py-3 text-sm" data-canal="pendente">
                <strong className="font-semibold">Canal ainda não definido.</strong> O endereço para
                enviar sugestões depende de uma decisão do responsável pelo projeto e vai aparecer
                aqui. Até lá, o modelo abaixo reúne o que uma sugestão precisa ter para ser
                conferida.
              </p>
            ) : (
              <p className={prose} data-canal="definido">
                Envie a sugestão para{" "}
                <a href={SITE.correctionChannel.href} className={textLink}>
                  {SITE.correctionChannel.rotulo}
                </a>
                , com as informações do modelo abaixo.
              </p>
            )}
            <div className="max-w-[42rem]">
              <CorrectionTemplate
                events={acontecimentos.map(({ slug, titulo }) => ({ slug, titulo }))}
                edition={edicao === null ? null : `${edicao.versao}, com registros até ${corte}`}
              />
            </div>
          </section>

          <section id="creditos" aria-labelledby="titulo-creditos">
            <h2 id="titulo-creditos" className={h2}>
              Créditos
            </h2>

            <div className="max-w-[42rem] space-y-2">
              <h3 className={h3}>Imagens</h3>
              {imagens.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhuma imagem nesta edição.</p>
              ) : (
                <ul className="divide-y divide-line border-y border-line text-sm">
                  {imagens.map((imagem) => (
                    <li key={imagem.id} className="space-y-1 py-3" data-imagem={imagem.id}>
                      <p className="font-medium">{imagem.credito}</p>
                      <p className="text-ink-soft">Autoria: {imagem.autoria}</p>
                      <p className="text-ink-soft">{imagem.condicoesDeUso}</p>
                      <p className="text-ink-soft">
                        No atlas, a imagem é exibida em tons de cinza e recortada.{" "}
                        <a href={imagem.origem} target="_blank" rel="noreferrer" className={textLink}>
                          Página de origem<span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="max-w-[42rem] space-y-2">
              <h3 className={h3}>Mapa e tipografia</h3>
              <ul className="space-y-1 text-sm text-ink-soft">
                <li>Contornos do mapa: Natural Earth, domínio público.</li>
                <li>Coordenadas dos lugares: centro do município ou do estado, pela API de malhas do IBGE.</li>
                <li>
                  Tipos: Newsreader e Libre Franklin, sob a SIL Open Font License 1.1, servidos pelo
                  próprio site.
                </li>
              </ul>
            </div>
          </section>

          <section id="catalogo" aria-labelledby="titulo-catalogo">
            <h2 id="titulo-catalogo" className={h2}>
              Fontes desta edição
            </h2>
            <p className={prose}>
              Os documentos que sustentam os registros, agrupados por quem os publicou. Cada um traz
              a data do documento, a data de acesso e a quantidade de registros que o citam. O trecho
              usado em cada registro está junto dele: na página do acontecimento, ou ao lado de cada
              cargo e de cada filiação no{" "}
              {PROFILES.map((perfil, indice) => (
                <span key={perfil.slug}>
                  {indice > 0 && " e no "}
                  <Link href={`/politicos/${perfil.slug}`} className={textLink}>
                    perfil de {perfil.nome}
                  </Link>
                </span>
              ))}
              .
            </p>
            <div className="max-w-[48rem] space-y-6" data-catalogo={fontes.length}>
              {catalogo.map((grupo) => (
                <section key={grupo.nome} className="space-y-1.5">
                  <h3 className="text-sm font-semibold">
                    {grupo.nome}{" "}
                    <span className="numerals font-normal text-ink-soft">({grupo.fontes.length})</span>
                  </h3>
                  <SourceCatalog entries={grupo.fontes} />
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
