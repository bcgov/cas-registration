import nx from "@nx/eslint-plugin";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/*",
        "**/node_modules",
        "**/vite.config.**s.timestamp-*",
        "**/vitest.config.**s.timestamp-*",
    ],
}, ...compat.extends("airbnb-typescript", "prettier"), {
    plugins: {
        "@nx": nx,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            vi: true,
        },
    },

    rules: {
        "@next/next/no-html-link-for-pages": ["off"],
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/naming-convention": "error",
        "no-console": 1,
        "no-var": 2,

        "import/extensions": ["error", "never", {
            json: "always",
        }],

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: [
                "**/test.{ts,tsx,js,jsx}",
                "**/test-*.{ts,tsx,js,jsx}",
                "**/*{.,_}{test,spec}.{ts,tsx,js,jsx}",
                "**/e2e/**/*.{ts,tsx,js,jsx}",
                "**/playwright.config.{ts,js}",
                "**/tailwind.config.{ts,js}",
                "**/next.config.{ts,js}",
                "**/.happo.{ts,js}",
            ],
        }],

        "@typescript-eslint/quotes": ["error", "double", {
            avoidEscape: true,
            allowTemplateLiterals: true,
        }],

        "@nx/enforce-module-boundaries": ["off", {
            enforceBuildableLibDependency: true,
            allow: ["@/"],

            depConstraints: [{
                sourceTag: "*",
                onlyDependOnLibsWithTags: ["*"],
            }],
        }],
    },
}, {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
}, {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {},
}, {
    files: ["**/*.js", "**/*.jsx"],
    rules: {},
}];