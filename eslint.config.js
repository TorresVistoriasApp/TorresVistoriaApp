import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * As camadas só podem enxergar para "dentro": modules -> infra -> core -> shared -> config.
 * O script `npm run lint:architecture` aplica as mesmas regras no CI.
 */
const MODULES = ["torres-vistoria", "torres-consulta", "admin"];

/** Um módulo enxerga os outros apenas pelo barrel `@/modules/<nome>`. */
function crossModuleRestriction(owner) {
  return MODULES.filter((name) => name !== owner).map((name) => ({
    group: [`@/modules/${name}/*`],
    message: `Importe apenas de "@/modules/${name}" (API pública do módulo).`,
  }));
}

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "playwright-report",
      "test-results",
      "src/infra/supabase/database.types.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/core/*", "@/infra/*", "@/modules/*", "@/layouts/*", "@/routes/*", "@/providers/*"],
              message:
                "`shared` é a camada mais reutilizável: só pode depender de `@/config` e dela mesma.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*", "@/layouts/*", "@/providers/*"],
              message:
                "`core` define as regras do negócio para todos os produtos; conhecer um módulo específico inverte a dependência.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/infra/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*", "@/layouts/*", "@/routes/*"],
              message:
                "`infra` só entrega acesso técnico (Supabase, storage, cache). Escrita com formato de produto pertence ao repositório do módulo.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
  ...MODULES.map((owner) => ({
    files: [`src/modules/${owner}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": ["error", { patterns: crossModuleRestriction(owner) }],
    },
  })),
);
