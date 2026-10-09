"use client";

// Guia de estados da prévia: cada componente da base visual nos estados que a
// interface precisa prever, com dados reais da edição. Existe só no servidor
// de desenvolvimento e serve de referência para as fases 5 a 8.

import { useState } from "react";

import { CategoryLabel } from "@/components/Category";
import { DateMark } from "@/components/DateMark";
import { Portrait } from "@/components/Portrait";
import { SourceList } from "@/components/SourceList";
import { PeriodLane } from "@/components/time/PeriodLane";
import { EventList } from "@/features/events/EventList";
import { EventPanel } from "@/features/events/EventPanel";
import { MapFallback } from "@/features/map/MapView";
import { CategoryFilter } from "@/features/timeline/CategoryFilter";
import { PeriodControl } from "@/features/timeline/PeriodControl";
import { Timeline } from "@/features/timeline/Timeline";
import { getCoveredSpan } from "@/lib/data/coverage";
import { filterPoints } from "@/lib/data/points";
import { filterEvents, getEventView, getImage, getSources, listMandatesAt } from "@/lib/data/queries";
import type { AtlasData } from "@/lib/data/types";
import { CATEGORIAS, type Categoria } from "@/lib/domain/categories";

function Specimen({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-ink pt-4">
      <header className="space-y-1">
        <h3 className="font-serif text-2xl font-medium tracking-tight">{title}</h3>
        {note !== undefined && <p className="max-w-3xl text-sm text-ink-soft">{note}</p>}
      </header>
      {children}
    </section>
  );
}

export function StatesGallery({ data }: { data: AtlasData }) {
  const pessoa = data.conjunto.pessoas.at(-1)!;
  const outra = data.conjunto.pessoas[0]!;
  const todos = filterEvents(data, { pessoaIds: [pessoa.id] });
  const dominio = getCoveredSpan(data, pessoa.id) ?? { de: 2000, ate: 2026 };
  const corte = data.conjunto.edicao?.dataDeCorte ?? "2026-10-08";

  const [selecionado, setSelecionado] = useState<string | null>(todos[1]?.slug ?? null);
  const [periodo, setPeriodo] = useState<{ de: number | null; ate: number | null }>({ de: 2016, ate: null });
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const noRecorte = filterEvents(data, { pessoaIds: [pessoa.id], periodo, categorias });
  const exemplos = {
    dia: todos.find((item) => item.data.precisao === "dia"),
    mes: todos.find((item) => item.data.precisao === "mes"),
    ano: todos.find((item) => item.data.precisao === "ano"),
    semPonto: todos.find((item) => item.localizacao.tipo !== "lugares"),
  };
  const aberto = todos.find((item) => item.slug === selecionado) ?? null;
  const fontes = exemplos.dia ? getEventView(data, exemplos.dia).citacoes : [];
  const mandatosDaOutra = data.conjunto.mandatos.filter((item) => item.pessoaId === outra.id);
  const filiacoesDaOutra = data.conjunto.filiacoes.filter((item) => item.pessoaId === outra.id);

  return (
    <div className="space-y-10">
      <Specimen
        title="Data na precisão conhecida"
        note="O ano vem em destaque. Dia e mês só aparecem quando a fonte os informa; uma data de que só se sabe o ano mostra só o ano."
      >
        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {([exemplos.dia, exemplos.mes, exemplos.ano] as const).map(
            (item) =>
              item && (
                <li key={item.id} className="space-y-1">
                  <DateMark data={item.data} />
                  <p className="text-xs text-ink-soft">precisão: {item.data.precisao}</p>
                </li>
              ),
          )}
        </ul>
      </Specimen>

      <Specimen
        title="Categorias"
        note="Forma, cor e nome. A forma e o nome identificam a categoria mesmo sem a cor."
      >
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {CATEGORIAS.map((categoria) => (
            <li key={categoria}>
              <CategoryLabel categoria={categoria} />
            </li>
          ))}
        </ul>
      </Specimen>

      <Specimen
        title="Período e categorias"
        note="Os dois controles alteram o mesmo recorte que a lista, a linha do tempo e o mapa leem. Experimente um período sem registros."
      >
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <PeriodControl domain={dominio} periodo={periodo} onChange={(de, ate) => setPeriodo({ de, ate })} />
          <CategoryFilter
            selected={categorias}
            counts={
              Object.fromEntries(
                CATEGORIAS.map((categoria) => [
                  categoria,
                  filterEvents(data, { pessoaIds: [pessoa.id], periodo, categorias: [categoria] }).length,
                ]),
              ) as Record<Categoria, number>
            }
            onToggle={(categoria) =>
              setCategorias((atual) =>
                atual.includes(categoria) ? atual.filter((item) => item !== categoria) : [...atual, categoria],
              )
            }
            onClear={() => setCategorias([])}
          />
        </div>
      </Specimen>

      <Specimen
        title="Linha do tempo"
        note="Marcas com a forma da categoria. Data parcial ganha um traço que cobre o mês ou o ano inteiro. O trecho fora do período fica hachurado. Barra tracejada e sem ponta indica limite não documentado."
      >
        <div className="border border-line bg-raised pb-2">
          <Timeline
            domain={dominio}
            allEvents={todos}
            visible={noRecorte}
            selectedSlug={selecionado}
            onSelect={setSelecionado}
            periodo={periodo}
            dataDeCorte={corte}
            label={`Linha do tempo de ${pessoa.nome}`}
            lanes={[
              {
                rotulo: "Cargos e funções",
                itens: data.conjunto.mandatos
                  .filter((item) => item.pessoaId === pessoa.id)
                  .map((item) => ({
                    id: item.id,
                    rotulo: item.cargo,
                    descricao: `${item.cargo}, ${item.instituicao}`,
                    periodo: item.periodo,
                  })),
              },
            ]}
          />
        </div>
        <div className="space-y-2">
          <p className="eyebrow text-ink-soft">
            Partidos de {outra.nome}: limites desconhecidos e períodos sem data
          </p>
          <div className="border border-line bg-raised p-3">
            <PeriodLane
              rotulo={`Partidos de ${outra.nome}`}
              itens={filiacoesDaOutra.map((item) => ({
                id: item.id,
                rotulo: item.partido.sigla,
                descricao: `${item.partido.sigla} (${item.partido.nome})`,
                periodo: item.periodo,
              }))}
              domain={getCoveredSpan(data, outra.id) ?? dominio}
              dataDeCorte={corte}
            />
          </div>
          <p className="eyebrow text-ink-soft">Cargos de {outra.nome}: períodos sobrepostos em fileiras</p>
          <div className="border border-line bg-raised p-3">
            <PeriodLane
              rotulo={`Cargos de ${outra.nome}`}
              itens={mandatosDaOutra.map((item) => ({
                id: item.id,
                rotulo: item.cargo,
                descricao: `${item.cargo}, ${item.instituicao}`,
                periodo: item.periodo,
              }))}
              domain={getCoveredSpan(data, outra.id) ?? dominio}
              dataDeCorte={corte}
            />
          </div>
        </div>
      </Specimen>

      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
        <Specimen
          title="Lista de acontecimentos"
          note="Item normal, item selecionado (filete e fundo de acento, mais o estado no botão) e item sem ponto no mapa."
        >
          <EventList items={noRecorte.slice(0, 5)} selectedSlug={selecionado} onSelect={setSelecionado} />
        </Specimen>

        <Specimen
          title="Recorte sem registros"
          note="A mensagem diz que falta registro no atlas, e não que faltou atividade, e oferece a saída."
        >
          <EventList
            items={[]}
            selectedSlug={null}
            onSelect={() => {}}
            emptyMessage={
              <div className="space-y-2 px-3">
                <p className="font-medium text-ink">Nenhum registro do atlas neste recorte.</p>
                <p>
                  Isso indica falta de registro nesta edição, e não falta de atividade pública no
                  período.
                </p>
                <button type="button" className="min-h-11 font-medium text-ink underline decoration-line-strong">
                  Limpar período e categorias
                </button>
              </div>
            }
          />
        </Specimen>

        <Specimen
          title="Painel de leitura"
          note="Acontecimento sem imagem: a data ocupa o lugar de destaque. Com o botão de fechar e o caminho para a página."
        >
          <div className="border border-line bg-raised p-5">
            <EventPanel
              event={aberto ? getEventView(data, aberto) : null}
              roles={aberto ? listMandatesAt(data, pessoa.id, aberto.data) : []}
              image={aberto ? getImage(data, aberto.imagemId) : null}
              href={aberto ? `/acontecimentos/${aberto.slug}` : undefined}
              onClose={() => setSelecionado(null)}
            />
          </div>
        </Specimen>

        <Specimen
          title="Acontecimento sem coordenadas"
          note="Sem ponto no mapa por abrangência nacional ou por falta de lugar nas fontes. O painel e a lista dizem o motivo."
        >
          <div className="border border-line bg-raised p-5">
            <EventPanel event={exemplos.semPonto ? getEventView(data, exemplos.semPonto) : null} />
          </div>
        </Specimen>

        <Specimen
          title="Fontes"
          note="Estado normal e estado de fonte indisponível. O segundo ainda não tem dado que o acione: a conferência de links é da fase 9."
        >
          <SourceList
            entries={fontes.map((entrada, indice) => ({ ...entrada, indisponivel: indice === 1 }))}
          />
        </Specimen>

        <Specimen
          title="Fontes do perfil"
          note="A mesma lista serve a pessoa, mandato, filiação e acontecimento."
        >
          <SourceList entries={getSources(data, pessoa)} density="compacta" />
        </Specimen>

        <Specimen
          title="Mapa indisponível"
          note="Sem WebGL, sem o pacote do mapa ou sem resposta em 15 segundos: os lugares do recorte viram lista, com a mesma seleção."
        >
          <div className="h-80">
            <MapFallback
              features={filterPoints(data.pontos, noRecorte.slice(0, 6))}
              selectedSlug={selecionado}
              onSelect={setSelecionado}
            />
          </div>
        </Specimen>

        <Specimen
          title="Mapa carregando e imagem do acontecimento"
          note="À esquerda, o que aparece enquanto o mapa carrega. À direita, a área reservada à imagem de um acontecimento, com a linha de crédito; nenhum acontecimento desta edição tem imagem."
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid h-48 place-items-center border border-ink-faint bg-map-sea text-sm text-ink-soft">
              Carregando o mapa…
            </div>
            <figure className="space-y-1.5">
              <div className="grid aspect-[16/10] place-items-center border border-dashed border-ink-faint bg-sunken text-center text-xs text-ink-soft">
                imagem do acontecimento
                <br />
                16:10
              </div>
              <figcaption className="text-xs text-ink-faint">Foto: autoria e crédito</figcaption>
            </figure>
          </div>
        </Specimen>

        <Specimen
          title="Retrato"
          note="A mesma moldura e o mesmo tratamento para os dois perfis. Sem arquivo, as iniciais ocupam a mesma área."
        >
          <ul className="grid grid-cols-3 gap-4">
            {data.conjunto.pessoas.map((item) => (
              <li key={item.id} className="space-y-1">
                <Portrait nome={item.nome} imagem={getImage(data, item.retratoId)} sizes="200px" />
                <p className="text-xs text-ink-soft">{item.nome}</p>
              </li>
            ))}
            <li className="space-y-1">
              <Portrait nome="Nome Exemplo" imagem={null} sizes="200px" />
              <p className="text-xs text-ink-soft">sem retrato disponível</p>
            </li>
          </ul>
        </Specimen>
      </div>
    </div>
  );
}
