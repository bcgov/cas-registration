/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  ChangeRegistrationPurposeE2EValues,
} from "@/administration-e2e/utils/enums";
import {
  searchGridByUniqueValue,
  stabilizeGrid,
} from "@bciers/e2e/utils/helpers";
import { RegistrationPurposes } from "@/administration-e2e/utils/enums";
import {
  OperationFields,
  RegulatedOperationFields,
  ReportingOperationFields,
} from "@/administration-e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

export class OperationPOM {
  readonly page: Page;

  readonly url: string = process.env.E2E_BASEURL + AppRoute.DASHBOARD;

  readonly operationsUrl: string =
    process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  readonly registrationPurposeXPath: string = `//*[@id="root_section3_registration_purpose_select"]`;

  private _registrationPurpose?: string;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.url);
    const operationsLink = await this.page.getByRole("link", {
      name: "Operations",
      exact: true,
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

  async fetchValidFields(registrationPurpose: string) {
    switch (registrationPurpose) {
      case RegistrationPurposes.NEW_ENTRANT_OPERATION:
      case RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION:
        return Object.values(OperationFields);
      case RegistrationPurposes.REPORTING_OPERATION:
        return Object.values(ReportingOperationFields);
      case RegistrationPurposes.OBPS_REGULATED_OPERATION:
        return Object.values(RegulatedOperationFields);
      default:
        return [];
    }
  }

  async assertFieldVisibility(fields: string[], visible: boolean) {
    for (const field of fields) {
      await expect(this.page.getByText(field)).toBeVisible({
        visible: visible,
      });
    }
  }

  async goToOperation(row: Locator) {
    const viewOperation = await row.getByRole("link", {
      name: /view operation/i,
    });
    await expect(viewOperation).toBeVisible();
    await viewOperation.click();
  }

  async findRowByBcghgId(bcghgid) {
    const row = await searchGridByUniqueValue(
      this.page,
      ChangeRegistrationPurposeE2EValues.BCGHG_ID_FIELD_NAME,
      bcghgid,
    );
    await stabilizeGrid(this.page, 1);

    return row;
  }

  // ###  Assertions ###
  /**
   * Check if the correct fields are visible for the given registration purpose.
   * Fields should be hidden only for ELECTRICITY_IMPORT_OPERATION.
   */
  async assertCorrectFieldsAreVisible(registrationPurpose: string) {
    const fields = await this.fetchValidFields(registrationPurpose);
    if (
      registrationPurpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION
    ) {
      this.assertFieldVisibility(fields, false);
    } else {
      this.assertFieldVisibility(fields, true);
    }
  }
}
