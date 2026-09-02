/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  AppRoute,
  FacilityButtonText,
  FacilityFormField,
} from "@/administration-e2e/utils/enums";
import {
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  searchGridByUniqueValue,
  stabilizeGrid,
  waitForGridReady,
} from "@bciers/e2e/utils/helpers";

export class FacilityPOM {
  readonly page: Page;

  readonly operationsUrl: string =
    process.env.E2E_BASEURL + AppRoute.OPERATIONS;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  async route() {
    await this.page.goto(this.operationsUrl);
  }

  async searchOperationByName(operationName: string): Promise<Locator> {
    const row = await searchGridByUniqueValue(
      this.page,
      /operation name/i,
      operationName,
    );
    await stabilizeGrid(this.page, 1);
    return row;
  }

  // Navigate from the Operations grid to an operation's Facilities page via its grid action-cell link
  async goToOperationFacilities(
    operationName: string,
    linkName: string | RegExp,
  ) {
    const row = await this.searchOperationByName(operationName);
    await row.first().getByRole("link", { name: linkName }).click();
    await this.page.waitForLoadState();
  }

  async clickAddFacility() {
    await clickButton(this.page, FacilityButtonText.ADD_FACILITY, {
      waitForUrl: /add-facility/,
    });
  }

  async fillAddFacilityForm(
    name: string,
    type: string,
    latitude?: string,
    longitude?: string,
  ) {
    await fillInputValueByLabel(this.page, FacilityFormField.NAME, name);
    await fillComboxboxWidget(this.page, FacilityFormField.TYPE, type);
    if (latitude !== undefined) {
      await fillInputValueByLabel(
        this.page,
        FacilityFormField.LATITUDE,
        latitude,
      );
    }
    if (longitude !== undefined) {
      await fillInputValueByLabel(
        this.page,
        FacilityFormField.LONGITUDE,
        longitude,
      );
    }
  }

  // Open an existing facility's view/edit page from a row on the Facilities grid
  async openFacilityFromGrid(facilityName: string) {
    await waitForGridReady(this.page);
    const row = this.page.getByRole("row").filter({ hasText: facilityName });
    await expect(row.first()).toBeVisible();
    await row
      .first()
      .getByRole("link", { name: /view details/i })
      .click();
    await this.page.waitForLoadState();
  }

  async searchFacilitiesGrid(
    field: string | RegExp,
    value: string,
  ): Promise<Locator> {
    return searchGridByUniqueValue(this.page, field, value);
  }
}
