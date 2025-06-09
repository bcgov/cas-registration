/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, DashboardTileText } from "@/administration-e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class DashboardPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoute.ADMINISTRATION_DASHBOARD;

  readonly operatorTile: Locator;

  readonly selectOperatorTile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.operatorTile = page.getByRole("link", {
      name: DashboardTileText.TILE_OPERATOR,
    });
    this.selectOperatorTile = page.getByRole("link", {
      name: DashboardTileText.TILE_OPERATOR_SELECT,
    });
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
  }

  async clickOperatorTile() {
    await this.operatorTile.click();
  }

  async clickSelectOperatorTile() {
    await this.selectOperatorTile.click();
  }

  // ###  Assertions ###

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
