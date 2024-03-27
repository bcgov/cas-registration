/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  DataTestID,
  LinkSrc,
  MessageTextDashboard,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class DashboardPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  readonly messagePending: Locator;

  readonly selectOperatorTile: Locator;

  readonly operationsTile: Locator;

  readonly operatorsTile: Locator;

  readonly reportProblemLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messagePending = page.locator(DataTestID.MESSAGE_PENDING);
    this.selectOperatorTile = page.getByText(
      MessageTextDashboard.DASHBOARD_TILE_OPERATOR_SELECT,
    );
    this.operationsTile = page.getByRole("link", {
      name: MessageTextDashboard.DASHBOARD_TILE_OPERATIONS,
    });
    this.operatorsTile = page.getByRole("link", {
      name: MessageTextDashboard.DASHBOARD_TILE_OPERATORS,
    });

    this.reportProblemLink = page.getByRole("link", {
      name: MessageTextDashboard.REPORT_PROBLEM,
    });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async hasMessagePending() {
    await expect(this.messagePending).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async problemLinkIsCorrect() {
    await expect(this.reportProblemLink).toHaveAttribute(
      "href",
      LinkSrc.REPORT_PROBLEM,
    );
  }

  async clickSelectOperatorTile() {
    await this.selectOperatorTile.click();
  }

  async clickOperationsTile() {
    await this.operationsTile.click();
  }

  async clickOperatorsTile() {
    await this.operatorsTile.click();
  }
}
