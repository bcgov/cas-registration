import { defineConfig } from "@playwright/test";
import playwrightBaseConfig from "../../playwright.config.base";

const config = {
  ...playwrightBaseConfig,
};

if (process.env.E2E_TIMEOUT) {
  config.expect = {
    timeout: Number(process.env.E2E_TIMEOUT),
  };
}

export default defineConfig(config);
