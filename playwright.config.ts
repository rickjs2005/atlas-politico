import { defineConfig, devices } from "@playwright/test";

// Os testes de navegador exercitam a tela de prova, que só existe no servidor
// de desenvolvimento. Porta própria, para não disputar com um `npm run dev`
// que já esteja aberto.
const PORT = 4310;

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Com movimento reduzido o MapLibre troca a animação de câmera por um
    // salto, e o teste não precisa esperar o mapa parar.
    contextOptions: { reducedMotion: "reduce" },
    // O Chromium sem interface não tem GPU: o WebGL roda por software.
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // `npm run dev` gera os dados antes de subir o servidor.
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/dev/prova/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
