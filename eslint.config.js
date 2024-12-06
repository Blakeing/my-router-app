import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import { fileURLToPath } from "url";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default tseslint.config({
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.json"],
      tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  settings: {
    react: {
      version: "19.0",
    },
  },
  plugins: {
    react,
  },
  rules: {
    ...tseslint.configs.recommendedTypeChecked.rules,
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
    ...pluginRouter.configs["flat/recommended"],
  },
});
