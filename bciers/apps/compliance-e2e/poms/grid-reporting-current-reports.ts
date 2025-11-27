/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
import { AppRoute } from "@/compliance-e2e/utils/enums";

export class GridReportingCurrentReportsPOM {
  readonly page: Page;

  readonly url: string =
    process.env.E2E_BASEURL + AppRoute.GRID_REPORTING_CURRENT_REPORTS;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
  }

  async clickContinueReport(row: Locator) {
    const buttonContinue = await row.getByRole("link", {
      name: /continue/i,
    });
    await expect(buttonContinue).toBeVisible();
    await buttonContinue.click();
  }

  // ###  Assertions ###
}
