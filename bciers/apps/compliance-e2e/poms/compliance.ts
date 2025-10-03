/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Page } from "@playwright/test";
import { AppRoute } from "@bciers/e2e/utils/enums";
import * as dotenv from "dotenv";

dotenv.config({ path: "./e2e/.env.local" });

export class CompliancePOM {
  readonly page: Page;

  readonly complainceSummariesUrl: string =
    process.env.E2E_BASEURL + AppRoute.COMPLIANCE_SUMMARIES;

  readonly currentReportingUrl: string =
    process.env.E2E_BASEURL + AppRoute.CURRENT_REPORTS_GRID;

  readonly obligationNotMetUrl: string = `${process.env.E2E_BASEURL}${AppRoute.REPORTING}/3/sign-off`;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async routeToComplianceSummaries() {
    await this.page.goto(this.complainceSummariesUrl);
  }

  async routeToReportingGrid() {
    await this.page.goto(this.currentReportingUrl);
  }

  async routeToObligationNotMet() {
    await this.page.goto(this.obligationNotMetUrl);
  }

  // ###  Assertions ###
  async goToPage(url: string) {
    await this.page.goto(process.env.E2E_BASEURL + url);
  }
}
