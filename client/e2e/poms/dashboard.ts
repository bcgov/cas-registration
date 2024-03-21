/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute, DataTestID } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class DashboardPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  readonly operationsUrl: string =
    process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  readonly msgPending: Locator;

  readonly selectOperatorTile: Locator;

  readonly operationsTile: Locator;

  readonly operationsTileIndustry: Locator;

  readonly operatorsTile: Locator;

  readonly operatorsTileIndustry: Locator;

  readonly reportProblemLink: Locator;

  readonly userAccessManagementTileIndustry: Locator;

  constructor(page: Page) {
    this.page = page;
    this.msgPending = this.page.locator(DataTestID.MESSAGE_PENDING);
    this.selectOperatorTile = this.page.getByText(
      "1 pending action(s) required",
    );

    this.page = page;
    this.operationsTile = page.getByRole("link", { name: /.*operations.*/i });
    this.operatorsTile = page.getByRole("link", { name: /.*operator.*/i });
    // the id to select these as these as we will start adding notifications to the tiles
    // the operators tile link text is just `0 pending action(s) required`
    this.operatorsTileIndustry = page.locator("#My-Operator-link");
    this.operationsTileIndustry = page.locator("#My-Operations-link");
    this.reportProblemLink = page.getByRole("link", {
      name: "Report problems to GHGRegulator@gov.bc.ca",
    });
    this.userAccessManagementTileIndustry = page.locator(
      "#User-Access-Management-link",
    );
  }

  async route() {
    await this.page.goto(this.url);
  }

  async hasMessagePending() {
    await expect(this.msgPending).toBeVisible();
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async clickSelectOperatorTile() {
    await this.selectOperatorTile.click();
  }

  async dashboardTilesAreVisibleIndustryAdmin() {
    await this.page.waitForSelector(".dashboard-tile-container");
    await this.page.waitForSelector("#My-Operator-link");
    await this.page.waitForSelector("#My-Operations-link");
    await this.page.waitForSelector("#User-Access-Management-link");
    await this.page.waitForSelector("#Report-a-Problem-link");
  }

  async clickOperationsTile() {
    await this.operationsTile.click();
  }

  async clickOperationsTileIndustry() {
    await this.operationsTileIndustry.click();
  }

  async clickOperatorsTile() {
    await this.operatorsTile.click();
  }

  async clickOperatorsTileIndustry() {
    await this.operatorsTileIndustry.click();
  }

  async clickUserAccessManagementTileIndustry() {
    await this.userAccessManagementTileIndustry.click();
  }
}
