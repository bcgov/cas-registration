/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@/administration-e2e/utils/enums";
import { stabilizeGrid } from "@bciers/e2e/utils/helpers";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperationPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
    const operationsLink = await this.page.getByRole("link", {
      name: "Operations",
    });
    await operationsLink.click();
  }

  async searchOperationByName(operation: string, operator: string) {
    await this.page
      .getByLabel(/Operator Legal Name/i)
      .getByPlaceholder(/Search/i)
      .fill(operator);
    await this.page
      .getByLabel(/Operation Name/i)
      .getByPlaceholder(/Search/i)
      .fill(operation);

    const row = this.page.getByRole("row").filter({ hasText: operation });
    await stabilizeGrid(this.page, 1);
    await expect(row).toBeVisible();
    return row;
  }

  async goToOperation(row: Locator) {
    const viewOperation = await row.getByRole("link", {
      name: /view operation/i,
    });
    await expect(viewOperation).toBeVisible();
    await viewOperation.click();
  }

  // ###  Assertions ###
}
