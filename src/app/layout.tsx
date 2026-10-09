import type { Metadata } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

// Fontes locais (src/app/fonts/README.md). O pré-carregamento vale para todos
// os arquivos de uma família, e o itálico quase não aparece na primeira tela;
// por isso a serifada não é pré-carregada e entra com um substituto de medidas
// ajustadas. Afinar isso é trabalho da fase 8.
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/newsreader-latin-italic.woff2", style: "italic", weight: "200 800" },
  ],
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

export const metadata: Metadata = {
  title: { default: "Atlas Político", template: "%s · Atlas Político" },
  description:
    "Trajetórias públicas em linha do tempo, mapa e acontecimentos com fontes.",
  // O conteúdo ainda não passou por revisão humana. A indexação é liberada na
  // fase de publicação (fase 10), junto com sitemap e endereço canônico.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${franklin.variable}`}>
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
      </body>
    </html>
  );
}
