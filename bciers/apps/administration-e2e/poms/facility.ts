/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition. *
 */
import { Locator, Page, expect } from "@playwright/test";
// ☰ Enums
import {
  FacilityButtonText,
  FacilityFormField,
} from "@/administration-e2e/utils/enums";
import {
  assertSuccessfulSnackbar,
  checkAlertMessage,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  searchGridByUniqueValue,
  waitForGridReady,
} from "@bciers/e2e/utils/helpers";
import { FrontendMessages } from "@bciers/utils/src/enums";

export class FacilityPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ###  Actions ###

  // OperationPOM has searchOperationByName usable with this
  async goToOperationFacilities(row: Locator, linkName: string | RegExp) {
    await row.first().getByRole("link", { name: linkName }).click();
    await this.assertViewFacilitiesNoteIsVisible();
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

  // Search the Facilities grid by name and open the matching facility's view/edit page
  async openFacilityByName(facilityName: string) {
    await this.searchFacilitiesGrid(/facility name/i, facilityName);
    await this.openFacilityFromGrid(facilityName);
  }

  async setCoordinates(latitude: string, longitude: string) {
    await fillInputValueByLabel(
      this.page,
      FacilityFormField.LATITUDE,
      latitude,
    );
    await fillInputValueByLabel(
      this.page,
      FacilityFormField.LONGITUDE,
      longitude,
    );
  }

  async saveExpectingValidationError(expectedFieldError?: RegExp | string) {
    await clickButton(this.page, /save/i);
    await checkAlertMessage(
      this.page,
      "This form can't be saved yet. Please fix the errors above",
    );
    if (expectedFieldError) {
      await expect(this.page.getByText(expectedFieldError)).toBeVisible();
    }
  }

  async saveSuccessfully() {
    await clickButton(this.page, /save/i);
    await assertSuccessfulSnackbar(
      this.page,
      FrontendMessages.SUBMIT_CONFIRMATION,
    );
  }

  // ###  Assertions ###

  async stabilizeFacilityForm() {
    await expect(this.page.getByText(FacilityFormField.NAME)).toBeVisible();
    await expect(this.page.getByText(FacilityFormField.TYPE)).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: /save/i }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: /back/i }),
    ).toBeVisible();
  }

  async assertFieldsReadOnly(locatorIds: Record<string, string>) {
    for (const id of Object.values(locatorIds)) {
      await expect(this.page.locator(`#${id}`)).toBeVisible();
      await expect(this.page.locator(`#${id}`)).toHaveClass(/read-only/i);
    }
  }

  async assertFieldsEditableExcept<T extends Record<string, string>>(
    locatorIds: T,
    alwaysReadOnlyKeys: ReadonlyArray<keyof T>,
  ) {
    for (const key of Object.keys(locatorIds) as Array<keyof T>) {
      const id = locatorIds[key];
      if (alwaysReadOnlyKeys.includes(key)) {
        await expect(this.page.locator(`#${id}`)).toHaveClass(/read-only/i);
      } else {
        await expect(this.page.locator(`#${id}`)).toBeVisible();
        await expect(this.page.locator(`#${id}`)).not.toHaveClass(/read-only/i);
      }
    }
  }

  async assertViewFacilitiesNoteIsVisible() {
    const note = "View the facilities of this operation here.";
    await expect(this.page.getByText(note)).toBeVisible();
  }

  async assertEditButtonVisible() {
    const editButton = this.page.getByRole("button", { name: /edit/i });
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();
  }

  async assertAddFacilityButtonVisible(expected: boolean) {
    const addButton = this.page.getByRole("button", {
      name: FacilityButtonText.ADD_FACILITY,
    });
    if (expected) {
      await expect(addButton).toBeVisible();
    } else {
      await expect(addButton).toBeHidden();
    }
  }

  async assertValueVisible(text: string, expected: boolean) {
    const locator = this.page.getByText(text).first();
    if (expected) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).toBeHidden();
    }
  }
}
