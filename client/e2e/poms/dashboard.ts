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

  readonly msgPending: Locator;

  readonly selectOperatorTile: Locator;

  readonly operationsTile: Locator;

  readonly operationsTileIndustry: Locator;

  readonly operatorsTile: Locator;

  readonly operatorsTileIndustry: Locator;

  readonly reportProblemLink: Locator;

  readonly userAccessManagementTile: Locator;

  constructor(page: Page) {
    this.page = page;
    this.msgPending = this.page.locator(DataTestID.MESSAGE_PENDING);
    this.selectOperatorTile = this.page.getByText(
      "1 pending action(s) required",
    );

    this.page = page;
    this.operationsTile = page.getByRole("link", { name: /.*operations.*/i });
    this.operatorsTile = page.getByRole("link", { name: /.*operator.*/i });
    this.operatorsTileIndustry = page.locator("#My-Operator-link");
    this.operationsTileIndustry = page.locator("#My-Operations-link");
    this.reportProblemLink = page.getByRole("link", {
      name: "Report problems to GHGRegulator@gov.bc.ca",
    });
    this.userAccessManagementTile = page.locator(
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
    expect(
      this.page.getByRole("heading", { name: "My Operator" }),
    ).toBeVisible();
    expect(
      this.page.getByRole("heading", { name: "My Operations" }),
    ).toBeVisible();
    expect(
      this.page.getByRole("heading", { name: "User Access Management" }),
    ).toBeVisible();
    expect(
      this.page.getByRole("heading", { name: "Report a Problem" }),
    ).toBeVisible();
  }

  async clickOperationsTile() {
    await this.operationsTile.click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickOperationsTileIndustry() {
    await this.operationsTileIndustry.click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickOperatorsTile() {
    await this.operatorsTile.click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickOperatorsTileIndustry() {
    await this.operatorsTileIndustry.click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickUserAccessManagementTileIndustry() {
    await this.userAccessManagementTile.click();
    await this.page.waitForLoadState("networkidle");
  }
}
