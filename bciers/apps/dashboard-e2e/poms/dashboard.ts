/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@/administration-e2e/utils/enums";

// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { linkIsVisible } from "@bciers/e2e/utils/helpers";

dotenv.config({ path: "./e2e/.env.local" });

export class DashboardPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async urlIsCorrect(expectedPath: string, fromBaseUrl?: boolean) {
    if (fromBaseUrl) {
      expectedPath = process.env.E2E_BASEURL + expectedPath;
    }
    const currentUrl = this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(expectedPath.toLowerCase());
  }

  async goToPage(url: string) {
    await this.page.goto(process.env.E2E_BASEURL + url);
  }

  async assertMailToLinkIsVisible(tile: string, link: string) {
    const mailToLink = this.page.locator(`a[href^="${link}"]`).first();
    await linkIsVisible(this.page, tile, true);
    await expect(mailToLink).toHaveAttribute("href", `${link}`);
  }
}
