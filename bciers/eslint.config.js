const nx = require("@nx/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");
const tseslint = require("typescript-eslint");
const nextPlugin = require("@next/eslint-plugin-next");
const playwrightPlugin = require("eslint-plugin-playwright");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");
const importPlugin = require("eslint-plugin-import");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.nx/cache/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/vite.config.*.timestamp*",
      "**/vitest.config.*.timestamp*",
      "vite.config.**s.timestamp-*",
      "vitest.config.**s.timestamp-*",
      "**/tests/performance/**",
    ],
  },
  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("prettier"),
  // Base configuration for all files
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@nx": nx,
      "@typescript-eslint": tseslint.plugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.base.json",
        },
      },
    },
    rules: {
      // Nx rules
      "@nx/enforce-module-boundaries": "off",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // React rules for modern React (17+)
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/require-default-props": "off",
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".jsx", ".tsx"] },
      ],

      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // Accessibility rules
      ...jsxA11yPlugin.configs.recommended.rules,

      // General code quality
      "no-console": "warn",
      "no-var": "error",
      "prefer-const": "error",

      // Import rules
      "import/extensions": [
        "error",
        "never",
        {
          json: "always",
        },
      ],
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/test.{ts,tsx,js,jsx}",
            "**/test-*.{ts,tsx,js,jsx}",
            "**/*{.,_}{test,spec}.{ts,tsx,js,jsx}",
            "**/e2e/**/*.{ts,tsx,js,jsx}",
            "**/playwright.config.{ts,js}",
            "**/tailwind.config.{ts,js}",
            "**/next.config.{ts,js}",
            "**/.happo.{ts,js}",
            "**/happo.config.{ts,js}",
          ],
        },
      ],
      "import/prefer-default-export": "off",
    },
  },
  // Happo config files override
  {
    files: ["**/happo.config.ts", "**/happo-base.config.js"],
    rules: {
      "import/extensions": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
  // Next.js apps - add plugin once for all apps
  {
    files: ["apps/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
  },
  // App-specific Next.js rules
  ...[
    { app: "administration", path: "apps/administration/app" },
    { app: "compliance", path: "apps/compliance/src/app" },
    { app: "dashboard", path: "apps/dashboard/app" },
    { app: "registration", path: "apps/registration/app" },
    { app: "reporting", path: "apps/reporting/src/app" },
  ].map(({ app, path }) => ({
    files: [`apps/${app}/**/*.{ts,tsx,js,jsx}`],
    rules: {
      "@next/next/no-html-link-for-pages": ["error", path],
    },
  })),
  // Playwright config for e2e tests
  {
    files: ["**/*e2e/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      playwright: playwrightPlugin,
    },
    rules: {
      ...playwrightPlugin.configs.recommended.rules,
    },
  },
  // Config files - disable strict rules
  {
    files: [
      "*.config.{js,ts}",
      "**/*.config.{js,ts}",
      "**/next.config*.js",
      "**/tailwind*.{js,ts}",
      "**/postcss.config.js",
      "**/playwright.config*.{js,ts}",
      "**/vitest.config*.{js,ts,mts}",
      "eslint.config.js",
      "babel.config.js",
      "commitlint.config.js",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-extraneous-dependencies": "off",
      "import/extensions": "off",
    },
  },
  // Disable type-aware linting for JavaScript config files
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
];
