import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
// 1. Import the unused-imports plugin
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // 2. Register the plugin
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-console": "warn",

      // 3. Turn off core TS rule so it doesn't conflict with the plugin
      "@typescript-eslint/no-unused-vars": "off",

      // 4. Configure strict unused checks for variables, functions, and classes
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // 5. Configure strict unused checks for imports (with auto-fix support)
      "unused-imports/no-unused-imports": "error",

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "logs/",
      "src/db/generated/",
      "eslint.config.js",
    ],
  },
);
