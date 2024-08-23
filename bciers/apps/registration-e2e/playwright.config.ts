import { defineConfig } from "@playwright/test";
import playwrightBaseConfig from "../../playwright.config.base";

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000/registration";

export default defineConfig({
  ...playwrightBaseConfig,
  use: {
    baseURL,
  },
});
