/* eslint config for RiskRadar */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:prettier/recommended"
  ],
  plugins: ["import"],
  settings: {
    "import/resolver": {
      node: { extensions: [".js"] }
    }
  },
  rules: {
    // Code quality
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-undef": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "import/no-unresolved": "error",
    "import/order": ["warn", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }],
    "prefer-const": "warn",
    "eqeqeq": ["warn", "always"],

    // Prettier integration
    "prettier/prettier": "warn"
  },
  overrides: [
    {
      files: ["netlify/functions/**/*.js"],
      env: {
        node: true
      },
      rules: {
        "no-console": "off" // functions mogen loggen (kan later via env-gate)
      }
    }
  ],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".netlify/",
    "coverage/"
  ]
};
