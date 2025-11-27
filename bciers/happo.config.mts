import { defineConfig, type Config } from "happo";
// @ts-ignore - CommonJS module
import { baseConfig } from "./happo-base.config.js";

export default defineConfig({
  ...baseConfig,
  project: process.env.HAPPO_PROJECT || "default",
} as Config);
