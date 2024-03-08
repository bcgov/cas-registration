/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { expect, Locator, Page } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATOR;

  readonly buttonEdit: Locator;

  readonly buttonSaveAndReturn: Locator;

  readonly editInformationNote =
    /Please click on the "Edit Information" button/i;

  readonly operatorFormTitle = /Operator Information/i;

  readonly legalNameLabel = /Legal Name*/i;

  constructor(page: Page) {
    this.page = page;
    this.buttonEdit = page.getByRole("button", {
      name: /edit information/i,
    });
    this.buttonSaveAndReturn = page.getByRole("button", {
      name: /save and return to dashboard/i,
    });

    this.legalNameField = page.getByLabel(this.legalNameLabel);
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async operatorViewIsCorrect() {
    await expect(this.page.getByText(this.editInformationNote)).toBeVisible();
    await expect(this.page.getByText(this.operatorFormTitle)).toBeVisible();
    await expect(this.buttonEdit).toBeVisible();
    await expect(this.buttonSaveAndReturn).toBeVisible();
  }

  async clickEditInformation() {
    expect(this.buttonEdit).toBeEnabled();
    await this.buttonEdit.click();
  }

  async clickSaveAndReturn() {
    expect(this.buttonSaveAndReturn).toBeEnabled();
    await this.buttonSaveAndReturn.click();
  }

  async editOperatorInformation() {
    await this.legalNameField.fill("New Legal Name");
  }
}
