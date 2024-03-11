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

export class OperationPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATION;

  readonly buttonCancel: Locator;

  readonly buttonNext: Locator;

  readonly buttonSaveAndContinue: Locator;

  readonly buttonSubmit: Locator;

  readonly operationPage1Title: Locator;

  readonly operationPage2Title: Locator;

  readonly operationPage3Title: Locator;

  readonly returnToOperationsListButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonSaveAndContinue = page.getByRole("button", {
      name: /save and continue/i,
    });
    this.operationPage1Title = page.getByLabel("Operation Information");
    this.operationPage2Title = page.getByLabel("Point of Contact");
    this.operationPage3Title = page.getByLabel("Statutory Declaration");
    this.buttonCancel = page.getByRole("button", {
      name: /cancel/i,
    });
    this.buttonNext = page.getByRole("button", {
      name: /next/i,
    });
    this.buttonSubmit = page.getByRole("button", {
      name: /submit/i,
    });
    this.returnToOperationsListButton = page.getByRole("button", {
      name: /return to operations list/i,
    });
  }

  async route() {
    await this.page.goto(this.url);
  }

  async urlIsCorrect() {
    const path = this.url;
    const currentUrl = await this.page.url();
    await expect(currentUrl.toLowerCase()).toMatch(path.toLowerCase());
  }

  async operationFormIsVisible() {
    await this.page.waitForSelector("form");
    await this.operationPage1Title;
    // Check for the presence of the multistep form headers
    await this.page.locator(
      ".multistep-header-title[text()='Operation Information']",
    );
    await this.page.locator(
      ".multistep-header-title[text()='Point of Contact']",
    );
    await this.page.locator(
      ".multistep-header-title[text()='Statutory Declaration']",
    );
  }

  async operationFormStep2IsVisible() {
    await this.operationPage2Title;
  }

  async operationFormStep3IsVisible() {
    await this.operationPage3Title;
  }

  async operationSuccessfulSubmissionIsVisible() {
    await this.page.getByText(
      "Your application for the B.C. OBPS Regulated Operation ID for Test Operation Name has been received.",
    );
    await this.page.getByText(
      "Once approved, you will receive a confirmation email.",
    );
    await this.page.getByText(
      "You can then log back in and view the B.C. OBPS Regulated Operation ID for Test Operation Name.",
    );
  }

  async clickCancelButton() {
    await this.buttonCancel.click();
  }

  async clickNextButton() {
    await this.buttonNext.click();
  }

  async clickReturnToOperationsList() {
    await this.returnToOperationsListButton.click();
  }

  async clickSaveAndContinue() {
    await this.buttonSaveAndContinue.click();
  }

  async clickSubmitButton() {
    await this.buttonSubmit.click();
  }

  async fillOperationFormPage1() {
    // Fill out the operation information form
    await this.page.getByLabel("Operation Name*").fill("Test Operation Name");

    await this.page.getByTestId("root_type").click();
    await this.page
      .getByRole("option", { name: "Single Facility Operation" })
      .click();

    await this.page.getByTestId("root_naics_code_id").click();
    await this.page
      .getByRole("option", {
        name: "211110 - Oil and gas extraction (except oil sands)",
      })
      .click();
  }

  async fillOperationFormPage2() {
    // Fill out the point of contact form
    await this.page.getByLabel("Yes").click();
    await this.page.getByLabel("First Name*").fill("Test First Name");
    await this.page.getByLabel("Last Name*").fill("Test Last Name");
    await this.page.getByLabel("Position Title*").fill("Test Position Title");
    await this.page.getByLabel("Email Address*").fill("test@test.com");
    await this.page.getByLabel("Phone Number*").fill("403 777 7777");
  }

  async addFile() {
    const input = this.page.locator('input[type="file"]');
    await input.setInputFiles("./e2e/assets/test.pdf");
    expect(this.page.getByText("test.pdf")).toBeVisible();
  }
}
