import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Fronteiras entre camadas (docs/ARCHITECTURE.md). O domínio não conhece
  // arquivos, React nem as outras camadas.
  {
    files: ["src/lib/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/content/*",
                "@/lib/state/*",
                "@/features/*",
                "@/components/*",
                "@/app/*",
                "react",
                "react-dom",
                "next",
                "next/*",
                "node:*",
                "maplibre-gl",
              ],
              message: "O domínio é puro: sem I/O, sem React e sem depender das outras camadas.",
            },
          ],
        },
      ],
    },
  },
  // Estado, funcionalidades e componentes podem rodar no navegador: não leem
  // arquivos e só usam os schemas como tipo, para o Zod não ir para o bundle.
  {
    files: ["src/lib/state/**", "src/features/**", "src/components/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/content/*"],
              message: "A leitura de conteúdo fica nas páginas (src/app). Receba os dados por props.",
            },
            {
              group: ["@/lib/domain/schemas", "zod"],
              allowTypeImports: true,
              message: "Importe os tipos por @/lib/domain/types; os schemas Zod ficam no build.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
