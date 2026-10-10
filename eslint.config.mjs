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
    // Saída do gerador de dados.
    "generated/**",
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
  // Dados públicos, estado, funcionalidades e componentes podem rodar no
  // navegador: não leem arquivos, não conhecem o pipeline e só usam os schemas
  // como tipo, para o Zod não ir para o bundle.
  {
    files: ["src/lib/data/**", "src/lib/state/**", "src/lib/game/**", "src/features/**", "src/components/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/content/*", "@/lib/publication/*", "node:*"],
              message:
                "Leitura de arquivos e pipeline ficam no build (src/app, src/lib/content). Receba os dados por props.",
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
  // As consultas, o formato dos dados públicos e as regras do jogo não
  // dependem da interface.
  {
    files: ["src/lib/data/**", "src/lib/game/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/state/*", "@/features/*", "@/components/*", "@/app/*", "react", "react-dom", "next", "next/*", "maplibre-gl"],
              message: "Os dados públicos são funções puras: sem React e sem depender da interface.",
            },
          ],
        },
      ],
    },
  },
  // O pipeline é puro: valida, seleciona e monta os dados em memória. Quem lê
  // e grava arquivos é src/lib/content.
  {
    files: ["src/lib/publication/**"],
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
              message: "O pipeline não lê arquivos nem conhece a interface. O disco fica em src/lib/content.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
