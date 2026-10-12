import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE, isIndexable } from "@/lib/site";

import "./globals.css";

// Fontes locais (src/app/fonts/README.md). A sem serifa, pequena, é
// pré-carregada. A serifada não: medido na fase 8, pré-carregá-la não adianta
// a chegada do arquivo, que a folha de estilo já revela cedo, e atrasa o
// primeiro desenho das páginas de texto (docs/PERFORMANCE.md, seção Fontes).
// Enquanto ela não chega, entra um substituto de medidas ajustadas.
const newsreader = localFont({
  src: [{ path: "./fonts/newsreader-latin.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
});

const franklin = localFont({
  src: [{ path: "./fonts/libre-franklin-latin.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-franklin",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
});

// A prévia de compartilhamento: só com o domínio decidido ela ganha imagem,
// porque o endereço da imagem precisa ser absoluto (docs/DEPLOY.md). A imagem
// fica em public/share/ e é gerada por `node scripts/share-image.mjs`.
const SHARE_IMAGE = { url: "/share/atlas.png", width: 1200, height: 630, alt: `${SITE.nome}: trajetórias públicas com fontes e um jogo em fases curtas` };

export const metadata: Metadata = {
  // O endereço canônico e os endereços absolutos dependem do domínio público (src/lib/site.ts).
  ...(SITE.publicUrl === null ? {} : { metadataBase: new URL(SITE.publicUrl), alternates: { canonical: "./" } }),
  title: { default: SITE.nome, template: `%s · ${SITE.nome}` },
  description: SITE.descricao,
  // O conteúdo ainda não passou por revisão humana. A indexação é liberada em
  // src/lib/site.ts, junto com o sitemap e o robots.txt, só com o domínio.
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: SITE.nome,
    locale: "pt_BR",
    title: SITE.nome,
    description: SITE.descricao,
    ...(SITE.publicUrl === null ? {} : { images: [SHARE_IMAGE] }),
  },
  twitter: { card: SITE.publicUrl === null ? "summary" : "summary_large_image", title: SITE.nome, description: SITE.descricao },
};

// As páginas são geradas sem a consulta do endereço: o HTML traz o recorte
// padrão, e o recorte pedido só entra depois que o JavaScript lê o endereço.
// Para quem abre um link com consulta não ver primeiro a tela errada, este
// trecho roda antes de a página ser desenhada e marca o documento; o CSS
// encobre a área que vai mudar, e quem lê o endereço tira a marca
// (src/lib/state/AtlasUrlStateProvider.tsx, docs/PERFORMANCE.md).
//
// Ele fica no fim do `<body>`, e não no começo. Um script escrito no HTML
// espera a folha de estilo que vem antes dele, e enquanto espera o navegador
// para de ler a página: no começo do `<body>`, isso atrasava o primeiro
// desenho de todas as telas (de 40 a 140 ms no perfil de celular, medido). No
// fim, o HTML já foi lido quando ele roda, e a marca ainda chega antes do
// primeiro desenho.
const MARK_PENDING_QUERY =
  "try{if(/^.(politicos|comparar)(.|$)/.test(location.pathname)&&/[?&](de|ate|categorias|acontecimento)=/.test(location.search))document.documentElement.setAttribute('data-consulta','')}catch(e){}";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // A marca da consulta é posta no `<html>` antes da hidratação.
    <html lang="pt-BR" className={`${newsreader.variable} ${franklin.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Pular para o conteúdo
        </a>
        <SiteHeader />
        {/* Cada página define a própria largura: a exploração usa a tela toda. */}
        <main id="conteudo" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
        <script dangerouslySetInnerHTML={{ __html: MARK_PENDING_QUERY }} />
      </body>
    </html>
  );
}
