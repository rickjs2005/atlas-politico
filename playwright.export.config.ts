import { defineConfig, devices } from "@playwright/test";

// Testes e capturas sobre a saída estática (`out/`), servida como uma
// hospedagem de arquivos serviria. É o que confere o que só existe no build
// de produção: quais arquivos cada página pede, e quando.
//
//   npm run build
//   npm run test:export       confere o carregamento adiado e as páginas sem o mapa
//   npm run test:journeys     roda sobre a saída as jornadas dos testes de navegador (docs/QA.md)
//   npm run capture:finish    refaz as capturas de docs/capturas/fase-8/
//
// `OUT_DIR` troca a pasta servida, e `CAPTURE_DIR`, a pasta das capturas.
const PORT = 4311;

const env: Record<string, string> = { PORT: String(PORT), QUIET: "1" };
if (process.env.OUT_DIR) env.OUT_DIR = process.env.OUT_DIR;

export default defineConfig({
  testDir: "tests/export",
  outputDir: "test-results/export",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    contextOptions: { reducedMotion: "reduce" },
    // O Chromium sem interface não tem GPU: o WebGL roda por software.
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [
    {
      name: "exportacao",
      testMatch: "**/*.spec.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // As jornadas com dados reais de `tests/e2e/`, que no dia a dia rodam
      // contra o servidor de desenvolvimento. Aqui rodam contra a saída: é o
      // que a pessoa recebe. Ficam de fora só as telas de prova e a de dados,
      // que são rotas de desenvolvimento e não existem no build.
      name: "jornadas",
      testDir: "tests/e2e",
      testMatch: ["acabamento", "comparacao", "investigacao", "jogo", "linha-do-tempo", "mapa", "mundo", "paginas", "previa"].map(
        (nome) => `**/${nome}.spec.ts`,
      ),
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "capturas",
      testMatch: "**/*.capture.ts",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "node scripts/preview.mjs",
    url: `http://localhost:${PORT}/`,
    env,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
