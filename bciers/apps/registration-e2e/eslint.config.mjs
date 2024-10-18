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
    ignores: ["!**/*"],
}, ...compat.extends(
    "plugin:@nx/react-typescript",
    "next",
    "plugin:playwright/recommended",
    "../../.eslintrc.json",
), {
    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["apps/registration-e2e/tsconfig(.*)?.json"],
            tsConfigRootDir: "./",
        },
    },
}, {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {},
}, {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {},
}, {
    files: ["**/*.js", "**/*.jsx"],
    rules: {},
}, {
    files: ["src/**/*.{ts,js,tsx,jsx}"],
    rules: {},
}];