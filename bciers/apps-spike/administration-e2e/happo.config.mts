import { defineConfig, type Config } from "happo";
import { baseConfig } from "../../happo-base.config.js";

export default defineConfig({
  ...baseConfig,
  project: "cas-administration",
} as Config);
