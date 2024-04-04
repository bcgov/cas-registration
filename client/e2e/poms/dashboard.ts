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
  TileTextDashboard,
  UserRole,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class DashboardPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  readonly operationsUrl: string =
    process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  readonly messagePending: Locator;

  readonly selectOperatorTile: Locator;

  readonly operationsTile: Locator;

  readonly operationsTileIndustry: Locator;

  readonly operatorsTile: Locator;

  readonly operatorsTileIndustry: Locator;

  readonly reportProblemLink: Locator;

  readonly userAccessManagementTileIndustry: Locator;

  constructor(page: Page) {
    this.page = page;
    this.messagePending = page.getByTestId(DataTestID.MESSAGE_PENDING);
    this.operationsTile = page.getByRole("link", {
      name: TileTextDashboard.TILE_OPERATIONS,
    });
    this.operationsTileIndustry = page.getByRole("link", {
      name: TileTextDashboard.TILE_OPERATIONS,
    });
    this.operatorsTile = page.getByRole("link", {
      name: TileTextDashboard.TILE_OPERATORS,
    });
    this.operatorsTileIndustry = page.getByText(
      TileTextDashboard.TILE_OPERATOR_MINE,
    );
    this.reportProblemLink = page.getByRole("link", {
      name: TileTextDashboard.TILE_REPORT_PROBLEM,
    });
    this.selectOperatorTile = page.getByText(
      TileTextDashboard.TILE_OPERATOR_SELECT,
    );
    this.userAccessManagementTileIndustry = page.getByRole("link", {
      name: TileTextDashboard.TILE_INDUSTRY_USERS,
    });
  }

  // ###  Actions ###

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

  async clickSelectOperatorTile() {
    await this.selectOperatorTile.click();
  }

  async clickUserAccessManagementTileIndustry() {
    await this.userAccessManagementTileIndustry.click();
  }

  async route() {
    await this.page.goto(this.url);
  }

  // ###  Assertions ###

  async dashboardTilesAreVisible(role: string) {
    switch (role) {
      case UserRole.INDUSTRY_USER_ADMIN:
        await expect(this.operatorsTileIndustry).toBeVisible();
        await expect(this.operationsTileIndustry).toBeVisible();
        await expect(this.userAccessManagementTileIndustry).toBeVisible();
        await expect(this.operationsTileIndustry).toBeVisible();
        break;
    }
    await expect(this.reportProblemLink).toBeVisible();
  }

  async hasMessagePending() {
    await expect(this.messagePending).toBeVisible();
  }

  async problemLinkIsCorrect() {
    await expect(this.reportProblemLink).toHaveAttribute(
      "href",
      LinkSrc.TILE_REPORT_PROBLEM,
    );
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = this.page.url();
    expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }
}
