import { Page, expect } from "@playwright/test";
import { AppRoutes, ReportRoutes } from "../utils/enums";
import { waitForGridReady } from "@bciers/e2e/utils/helpers";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import {
  assertFieldVisibility,
  checkCheckboxByLabel,
  checkFormFieldsReadOnly,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

const GSC_ACTIVITY = {
  SOURCE_TYPE_LABEL:
    "General stationary combustion of fuel or waste with production of useful energy",

  UNIT_NAME_LABEL: "GSC Unit Name",
  UNIT_TYPE_LABEL: "GSC Unit Type",
  UNIT_TYPE_VALUE: "Kiln",

  FUEL_NAME_LABEL: "Fuel Name",
  FUEL_NAME_VALUE: "Diesel",
  FUEL_UNIT_LABEL: "Fuel Unit",
  FUEL_UNIT_VALUE: "kilolitres",
  FUEL_CLASSIFICATION_LABEL: "Fuel Classification",
  FUEL_CLASSIFICATION_VALUE: "Non-biomass",
  FUEL_DESCRIPTION_LABEL: "Fuel Description",
  FUEL_DESCRIPTION_VALUE: "Diesel fuel for stationary combustion",
  ANNUAL_FUEL_AMOUNT_INPUT_NAME: "annualFuelAmount",
  ANNUAL_FUEL_AMOUNT_VALUE: 12000,

  GAS_TYPE_LABEL: "Gas Type",
  GAS_TYPE_VALUE: "CO2",

  CAS_REGISTRY_NUMBER_LABEL: "CAS Registry Number",

  EMISSION_INPUT_NAME: "emission",
  EMISSION_VALUE: 11000,

  METHODOLOGY_LABEL: "Methodology",
  METHODOLOGY_VALUE: "Default HHV/Default EF",
} as const;

const NON_ATTRIBUTABLE = {
  INFO_NOTE:
    "Report activities for which the facility emissions exceed 100 t CO2e and are not captured by one of the reportable activities.",
  EXCEEDED_LABEL: "Did your non-attributable emissions exceed 100 tCO2e?",
} as const;

const EMISSION_SUMMARY = {
  TITLE: "Emissions Summary (in tCO2e)",
} as const;

export class SFOFacilityReportPOM {
  readonly page: Page;
  readonly facilityId: string;

  constructor(page: Page, facilityId: string) {
    this.page = page;
    this.facilityId = facilityId;
  }

  async saveAndContinue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, {
      inForm: true,
      waitForUrl,
    });
  }

  async clickContinue(waitForUrl?: RegExp): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.CONTINUE, { waitForUrl });
  }

  // -----------------
  // URL builders
  // -----------------

  nonAttributableUrl(): string {
    return `/facilities/${this.facilityId}/${ReportRoutes.NON_ATTRIBUTABLE}`;
  }

  async fillGscActivity(): Promise<void> {
    // Check the GSC source type checkbox
    await checkCheckboxByLabel(this.page, GSC_ACTIVITY.SOURCE_TYPE_LABEL);

    // Fill unit name
    await fillInputValueByLabel(
      this.page,
      GSC_ACTIVITY.UNIT_NAME_LABEL,
      "Unit 1",
    );

    // Select unit type
    await fillComboxboxWidget(
      this.page,
      GSC_ACTIVITY.UNIT_TYPE_LABEL,
      GSC_ACTIVITY.UNIT_TYPE_VALUE,
    );

    // Select fuel name
    await fillComboxboxWidget(
      this.page,
      GSC_ACTIVITY.FUEL_NAME_LABEL,
      GSC_ACTIVITY.FUEL_NAME_VALUE,
      true,
    );

    // Verify fuel unit and fuel classification are read-only
    const fuelUnit = this.page.getByRole("textbox", {
      name: GSC_ACTIVITY.FUEL_UNIT_LABEL,
    });
    const fuelClassification = this.page.getByRole("textbox", {
      name: GSC_ACTIVITY.FUEL_CLASSIFICATION_LABEL,
    });
    await expect(fuelUnit).toHaveValue(GSC_ACTIVITY.FUEL_UNIT_VALUE);
    await expect(fuelClassification).toHaveValue(
      GSC_ACTIVITY.FUEL_CLASSIFICATION_VALUE,
    );
    await checkFormFieldsReadOnly([fuelUnit, fuelClassification]);

    // Fill fuel description
    await fillInputValueByLabel(
      this.page,
      GSC_ACTIVITY.FUEL_DESCRIPTION_LABEL,
      GSC_ACTIVITY.FUEL_DESCRIPTION_VALUE,
    );

    // Fill annual fuel amount (targeted by name — RJSF deep nesting breaks label association)
    await fillInputValueByLocator(
      this.page.getByRole("textbox", {
        name: GSC_ACTIVITY.ANNUAL_FUEL_AMOUNT_INPUT_NAME,
      }),
      GSC_ACTIVITY.ANNUAL_FUEL_AMOUNT_VALUE,
    );

    // Select gas type
    await fillComboxboxWidget(
      this.page,
      GSC_ACTIVITY.GAS_TYPE_LABEL,
      GSC_ACTIVITY.GAS_TYPE_VALUE,
    );

    // Verify CAS Registry Number label and "Computed upon saving" are visible
    await assertFieldVisibility(
      this.page,
      [GSC_ACTIVITY.CAS_REGISTRY_NUMBER_LABEL, "Computed upon saving"],
      true,
    );

    // Fill emission amount
    await fillInputValueByLocator(
      this.page.getByRole("textbox", {
        name: GSC_ACTIVITY.EMISSION_INPUT_NAME,
        exact: true,
      }),
      GSC_ACTIVITY.EMISSION_VALUE,
    );

    // Add methodology
    await fillComboxboxWidget(
      this.page,
      GSC_ACTIVITY.METHODOLOGY_LABEL,
      GSC_ACTIVITY.METHODOLOGY_VALUE,
    );
  }

  async fillNonAttributable(): Promise<void> {
    await assertFieldVisibility(this.page, [NON_ATTRIBUTABLE.INFO_NOTE], true);

    const noLabel = this.page.locator("label").filter({ hasText: /^No$/ });
    await expect(noLabel).toBeVisible();
    await noLabel.click();
  }

  async verifyEmissionSummary(): Promise<void> {
    await assertFieldVisibility(this.page, [EMISSION_SUMMARY.TITLE], true);
  }

  async fillProductionData(): Promise<void> {}

  async fillAllocationOfEmissions(): Promise<void> {}
}

export class LFOFacilityReportPOM extends SFOFacilityReportPOM {
  private readonly url: string;

  constructor(page: Page, facilityId: string) {
    super(page, facilityId);
    this.url = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                    ${this.facilityId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // Utils

  async route(): Promise<void> {
    await this.page.goto(this.url);
    await waitForGridReady(this.page, { timeout: 30_000 });
  }

  // -----------------
  // Page 1 — Facility specific information
  // -----------------

  async fillReviewFacilityInformation(): Promise<void> {
    this.page
      .getByRole("combobox", { name: "Facility type" })
      .selectOption("Medium Facility");
  }
}
