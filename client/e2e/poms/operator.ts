/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import { AppRoute } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
import { getFieldAlerts, getFieldRequired } from "../utils/helpers";
dotenv.config({ path: "./e2e/.env.local" });

export class OperatorPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.OPERATOR;

  readonly buttonSelectOperator: Locator; // legal name search

  readonly buttonSearchOperator: Locator; // CRA number search

  readonly buttonYesThisIsMyOperator: Locator;

  readonly buttonRequestAdministratorAccess: Locator;

  readonly buttonRequestAccess: Locator;

  readonly buttonSubmit: Locator;

  readonly linkAddOperator: Locator;

  readonly confirmationMessage: RegExp;

  constructor(page: Page) {
    this.page = page;
    this.confirmationMessage =
      /Kindly confirm if this is the operator that you represent./i;
    this.buttonSelectOperator = this.page.getByRole("button", {
      name: /select operator/i,
    });
    this.buttonSearchOperator = this.page.getByRole("button", {
      name: /search operator/i,
    });
    this.buttonYesThisIsMyOperator = this.page.getByRole("button", {
      name: /yes this is my operator/i,
    });
    this.buttonRequestAdministratorAccess = this.page.getByRole("button", {
      name: /request administrator access/i,
    });
    this.buttonRequestAccess = this.page.getByRole("button", {
      name: /request access/i,
    });
    this.linkAddOperator = this.page.getByRole("link", {
      name: /add operator/i,
    });
    this.buttonSubmit = this.page.getByRole("button", {
      name: /submit/i,
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

  async selectByCraNumber(craNumber: string) {
    await this.page.getByLabel("Search by Canada Revenue").check();

    await this.page.getByPlaceholder("Enter CRA Business Number").click();
    await this.page
      .getByPlaceholder("Enter CRA Business Number")
      .fill(craNumber);
    await this.buttonSearchOperator.click();
  }

  async checkRequiredFieldValidationErrors() {
    // Locate all required fields
    const requiredFields = await getFieldRequired(this.page);
    // Submit
    await this.buttonSubmit.click();
    // Locate all alert elements within the fieldset
    const alertElements = await getFieldAlerts(this.page);
    // 🔍 Assert there to be exactly the same number of required fields and alert elements
    await expect(requiredFields?.length).toBe(alertElements.length);
  }

  // async triggerFormatValidationErrors() {
  //   // Locate all required fields within the fieldset
  //   const requiredFields = await getFieldRequired(page);
  //   if (requiredFields) {
  //     // ✔️ Set required input fields
  //     for (const input of requiredFields) {
  //       const labelText = await input.textContent();
  //       const inputField = await page.getByLabel(labelText as string);
  //       // Click the field to focus it
  //       await inputField.click();
  //       switch (labelText) {
  //         case "Phone Number*":
  //           await page.getByLabel(labelText).fill("604 401 5432"); //Format should be ### ### ####
  //           break;
  //         case "CRA Business Number*":
  //           await page.getByLabel(labelText).fill("123454321");
  //           break;
  //         case "BC Corporate Registry Number*":
  //           await page.getByLabel(labelText).fill("AAA1111111");
  //           break;
  //         case "Business Structure*":
  //           await page.getByLabel(labelText).fill("General Partnership");
  //           await page.getByText(/General Partnership/i).click();
  //           break;
  //         case "Province*":
  //           await page.getByLabel(labelText).fill("Alberta");
  //           await page.getByText(/Alberta/i).click();
  //           break;
  //         case "Postal Code*":
  //           await page.getByLabel(labelText).fill("H0H 0H0");
  //           break;
  //         default:
  //           await inputField.fill(`E2E ${labelText}`);
  //           break;
  //       }
  //     }
  //   }
  // }
}
