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
  SfoPageLocators,
  LfoPageLocators,
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
import { FacilityTypes, FrontendMessages } from "@bciers/utils/src/enums";

export class FacilityPOM {
  readonly page: Page;
  // Field Locators
  readonly streetAddress: Locator;
  readonly municipality: Locator;
  readonly province: Locator;
  readonly postalCode: Locator;
  readonly latitude: Locator;
  readonly longitude: Locator;

  readonly sfoLocators: Record<string, Locator>;
  readonly lfoLocators: Record<string, Locator>;

  private readonly sfoReadOnlyKeys: ReadonlyArray<string> = [
    "name",
    "type",
    "province",
  ];
  private readonly lfoReadOnlyKeys: ReadonlyArray<string> = ["province"];

  constructor(page: Page) {
    this.page = page;

    // Initialize SFO locators (section 2)
    this.sfoLocators = {
      streetAddress: page.locator(`#${SfoPageLocators.streetAddress}`),
      municipality: page.locator(`#${SfoPageLocators.municipality}`),
      province: page.locator(`#${SfoPageLocators.province}`),
      postalCode: page.locator(`#${SfoPageLocators.postalCode}`),
      latitude: page.locator(`#${SfoPageLocators.latitude}`),
      longitude: page.locator(`#${SfoPageLocators.longitude}`),
    };

    // Initialize LFO locators (section 1)
    this.lfoLocators = {
      streetAddress: page.locator(`#${LfoPageLocators.streetAddress}`),
      municipality: page.locator(`#${LfoPageLocators.municipality}`),
      province: page.locator(`#${LfoPageLocators.province}`),
      postalCode: page.locator(`#${LfoPageLocators.postalCode}`),
      latitude: page.locator(`#${LfoPageLocators.latitude}`),
      longitude: page.locator(`#${LfoPageLocators.longitude}`),
    };
  }

  // ###  Actions ###

  async clickEdit() {
    await clickButton(this.page, /edit/i);
  }

  async clickCancel() {
    await clickButton(this.page, /cancel/i);
  }

  async updateMunicipality(municipality: string) {
    await fillInputValueByLabel(
      this.page,
      FacilityFormField.MUNICIPALITY,
      municipality,
    );
  }

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

  async assertFieldStates(
    facilityType: FacilityTypes.SFO | FacilityTypes.LFO,
    allReadOnly: boolean = false,
  ) {
    const isSfo = facilityType === FacilityTypes.SFO;
    const locators = isSfo ? this.sfoLocators : this.lfoLocators;
    const readOnlyKeys = isSfo ? this.sfoReadOnlyKeys : this.lfoReadOnlyKeys;

    for (const [key, locator] of Object.entries(locators)) {
      await expect(locator).toBeVisible();

      if (allReadOnly || readOnlyKeys.includes(key)) {
        await expect(locator).toHaveClass(/read-only/i);
      } else {
        await expect(locator).not.toHaveClass(/read-only/i);
      }
    }
  }

  async assertFieldsReadOnly(
    facilityType: FacilityTypes.SFO | FacilityTypes.LFO,
  ) {
    await this.assertFieldStates(facilityType, true);
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
