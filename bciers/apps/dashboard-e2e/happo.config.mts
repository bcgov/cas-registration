import { defineConfig, type Config } from "happo";
import { baseConfig } from "../../happo-base.config.js";

const project = "cas-dashboard";
const projectPrefix = project.replace(/-/g, "_").toUpperCase();

export default defineConfig({
  ...baseConfig,
  apiKey: process.env[`${projectPrefix}_HAPPO_API_KEY`],
  apiSecret: process.env[`${projectPrefix}_HAPPO_API_SECRET`],
  project,
} as Config);
