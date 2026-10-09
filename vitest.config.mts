import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const local = (caminho: string) => fileURLToPath(new URL(caminho, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": local("./src"),
      "server-only": local("./tests/stubs/server-only.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
