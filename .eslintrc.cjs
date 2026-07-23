/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.typecheck.json",
    sourceType: "module",
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  env: { node: true, es2022: true },
  ignorePatterns: ["dist", "node_modules", "coverage", "*.cjs"],
  overrides: [
    {
      files: ["examples/**/*.ts"],
      rules: { "no-console": "off" },
    },
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    // Xero's own API docs enumerate common values for fields like Status/Type
    // (e.g. "ACTIVE" | "ARCHIVED") but accept arbitrary strings server-side.
    // `"ACTIVE" | "ARCHIVED" | string` is a deliberate, widely-used TS idiom
    // that gives editor autocomplete for the documented values while still
    // accepting anything the API might return — not actually redundant for
    // the humans using it, even though the type system alone collapses it.
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }]
  },
};
