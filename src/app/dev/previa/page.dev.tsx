// Guia da prévia da fase 4: o caminho pelas quatro telas, os tokens e os
// estados de cada componente, com dados reais. Existe só no servidor de
// desenvolvimento (extensão `.dev.tsx`, ver next.config.ts).

import type { Metadata } from "next";
import Link from "next/link";

import { getAtlasData } from "@/lib/content/published";
import { filterEvents } from "@/lib/data/queries";
import { PROFILES } from "@/lib/domain/profiles";

import { StatesGallery } from "./StatesGallery";

export const metadata: Metadata = { title: "Prévia da fase 4" };

const CORES = [
  ["Papel", "--atlas-paper", "bg-paper"],
  ["Papel elevado", "--atlas-paper-raised", "bg-raised"],
  ["Papel rebaixado", "--atlas-paper-sunken", "bg-sunken"],
  ["Tinta", "--atlas-ink", "bg-ink"],
  ["Tinta suave", "--atlas-ink-soft", "bg-ink-soft"],
  ["Tinta tênue", "--atlas-ink-faint", "bg-ink-faint"],
  ["Linha", "--atlas-line", "bg-line"],
  ["Linha forte", "--atlas-line-strong", "bg-line-strong"],
  ["Acento (seleção)", "--atlas-accent", "bg-accent"],
  ["Acento suave", "--atlas-accent-soft", "bg-accent-soft"],
  ["Aviso", "--atlas-notice", "bg-notice"],
  ["Mar do mapa", "--atlas-map-sea", "bg-map-sea"],
  ["Mandatos e funções", "--atlas-cat-mandatos", "bg-cat-mandatos"],
  ["Eleições", "--atlas-cat-eleicoes", "bg-cat-eleicoes"],
  ["Partidos e alianças", "--atlas-cat-partidos", "bg-cat-partidos"],
  ["Atuação institucional", "--atlas-cat-atuacao", "bg-cat-atuacao"],
  ["Marcos históricos", "--atlas-cat-marcos", "bg-cat-marcos"],
] as const;

export default function PreviewGuidePage() {
  const data = getAtlasData();
  const acontecimentos = filterEvents(data);
  const exemplos = [
    ["Com dois lugares", acontecimentos.find((item) => item.localizacao.tipo === "lugares" && item.localizacao.lugarIds.length > 1)],
    ["Sem ponto no mapa", acontecimentos.find((item) => item.localizacao.tipo === "nacional")],
    ["Data com precisão de ano", acontecimentos.find((item) => item.data.precisao === "ano")],
    ["Ligado às duas pessoas", acontecimentos.find((item) => item.pessoaIds.length > 1)],
  ] as const;

  return (
    <div className="page space-y-12 py-8 md:py-12">
      <header className="max-w-3xl space-y-4 border-b border-ink pb-8">
        <p className="eyebrow text-ink-soft">Fase 4 · experiência e direção visual</p>
        <h1 className="font-serif text-5xl font-medium leading-none tracking-tight md:text-6xl">
          Guia da prévia
        </h1>
        <p className="reading">
          As quatro telas da prévia são as próprias rotas do atlas. Esta página reúne os caminhos
          de entrada, os tokens e cada componente nos estados que a interface precisa prever.
        </p>
        <p className="border border-line-strong bg-notice px-4 py-3 text-sm">
          Esta página existe só no servidor de desenvolvimento e não entra no build de produção.
          Os registros são os da edição atual, com conferência assistida por IA e revisão humana
          pendente.
        </p>
      </header>

      <section aria-labelledby="telas" className="space-y-4">
        <h2 id="telas" className="font-serif text-3xl font-medium tracking-tight">
          Telas
        </h2>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h3 className="eyebrow text-ink-soft">Entrada</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/" className="underline decoration-line-strong hover:decoration-ink">
                  Página inicial
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="eyebrow text-ink-soft">Exploração</h3>
            <ul className="space-y-1 text-sm">
              {PROFILES.map((perfil) => (
                <li key={perfil.slug}>
                  <Link
                    href={`/politicos/${perfil.slug}`}
                    className="underline decoration-line-strong hover:decoration-ink"
                  >
                    Trajetória de {perfil.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="eyebrow text-ink-soft">Acontecimento</h3>
            <ul className="space-y-1 text-sm">
              {exemplos.map(
                ([rotulo, item]) =>
                  item && (
                    <li key={rotulo}>
                      <Link
                        href={`/acontecimentos/${item.slug}`}
                        className="underline decoration-line-strong hover:decoration-ink"
                      >
                        {rotulo}
                      </Link>
                    </li>
                  ),
              )}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="eyebrow text-ink-soft">Comparação</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/comparar" className="underline decoration-line-strong hover:decoration-ink">
                  As duas trajetórias
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="tipografia" className="space-y-5">
        <h2 id="tipografia" className="font-serif text-3xl font-medium tracking-tight">
          Tipografia
        </h2>
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="eyebrow text-ink-soft">Newsreader · títulos, datas por extenso e leitura</p>
            <p className="font-serif text-7xl font-medium leading-[0.95] tracking-[-0.02em]">Atlas Político</p>
            <p className="font-serif text-[3.25rem] font-medium leading-[1.08] tracking-[-0.015em]">
              Título de acontecimento
            </p>
            <p className="font-serif text-2xl font-medium leading-tight tracking-tight">Título no painel de leitura</p>
            <p className="reading max-w-xl">
              Texto de leitura, em 18 pixels com entrelinha de 1,65. Serve ao resumo e ao contexto
              de cada acontecimento, <em>com itálico para notas</em> e ênfase.
            </p>
          </div>
          <div className="space-y-4">
            <p className="eyebrow text-ink-soft">Libre Franklin · interface, rótulos e números</p>
            <p className="numerals text-[2.5rem] font-semibold leading-none tracking-tight">8 de janeiro de 2023</p>
            <p className="numerals text-[1.0625rem] font-semibold">1975 · 1989 · 2002 · 2018 · 2026</p>
            <p className="text-sm">Texto de interface, em 14 pixels: botões, filtros, listas e metadados.</p>
            <p className="text-xs text-ink-soft">Texto pequeno, em 12 pixels: créditos e notas de precisão.</p>
            <p className="eyebrow text-ink-soft">Rótulo de seção em caixa alta</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="cores" className="space-y-4">
        <h2 id="cores" className="font-serif text-3xl font-medium tracking-tight">
          Cores
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          {CORES.map(([nome, token, classe]) => (
            <li key={token} className="space-y-1">
              <span className={`block h-12 border border-ink-faint ${classe}`} />
              <span className="block text-sm font-medium">{nome}</span>
              <code className="block text-[0.6875rem] text-ink-soft">{token}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="estados" className="space-y-6">
        <h2 id="estados" className="font-serif text-3xl font-medium tracking-tight">
          Componentes e estados
        </h2>
        <StatesGallery data={data} />
      </section>
    </div>
  );
}
