import { Page, expect } from "@playwright/test";
import { AppRoutes, ReportRoutes } from "../utils/enums";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { FORM_BUTTON_TEXT } from "@/reporting-e2e/utils/constants";
import { ProductionDataPOM } from "@/reporting-e2e/poms/production-data";
import {
  AllocationOfEmissionsPOM,
  AllocationMethodology,
} from "@/reporting-e2e/poms/allocation-of-emissions";
import {
  assertFieldVisibility,
  checkCheckboxById,
  checkFormFieldsReadOnly,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

const GSC_ACTIVITY = {
  SOURCE_TYPE_LABEL:
    "General stationary combustion of fuel or waste with production of useful energy",
  SOURCE_TYPE_SLUG: "gscWithProductionOfUsefulEnergy",

  UNIT_NAME_LABEL: "GSC Unit Name",
  UNIT_TYPE_LABEL: "GSC Unit Type",
  UNIT_TYPE_VALUE: "Kiln",

  FUEL_NAME_LABEL: "Fuel Name",
  FUEL_NAME_VALUE: "Diesel",
  FUEL_UNIT_VALUE: "kilolitres",
  FUEL_CLASSIFICATION_LABEL: "Fuel Classification",
  FUEL_CLASSIFICATION_VALUE: "Non-biomass",
  FUEL_DESCRIPTION_LABEL: "Fuel Description",
  FUEL_DESCRIPTION_VALUE: "Diesel fuel for stationary combustion",
  ANNUAL_FUEL_AMOUNT_INPUT_NAME: "annualFuelAmount",
  ANNUAL_FUEL_AMOUNT_FIELD_LABEL: /^Annual Fuel Amount\*$/,
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

export type ReviewFacilityInformationValues = {
  facilityName?: string;
  facilityType?: string;
  activityStates?: Record<string, boolean>;
  expectedCheckedCount?: number;
};

const DEFAULT_LFO_REVIEW_FACILITY_INFORMATION: Required<ReviewFacilityInformationValues> = {
  facilityName: "Default Facility Name",
  facilityType: "Medium Facility",
  activityStates: {
    "General stationary combustion excluding line tracing (at SFO) General": true,
    Ammonia: false,
  },
  expectedCheckedCount: 1,
};

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

  emissionsSummaryUrl(): string {
    return `facilities/${this.facilityId}/${ReportRoutes.EMISSION_SUMMARY}`;
  }

  productionDataUrl(): string {
    return `/facilities/${this.facilityId}/${ReportRoutes.PRODUCTION_DATA}`;
  }

  allocationOfEmissionsUrl(): string {
    return `/facilities/${this.facilityId}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`;
  }

  async fillGscActivity(): Promise<void> {
    // Check the GSC source type checkbox

    await checkCheckboxById(this.page, `root_${GSC_ACTIVITY.SOURCE_TYPE_SLUG}`);

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

    const fuelClassification = this.page.getByRole("textbox", {
      name: GSC_ACTIVITY.FUEL_CLASSIFICATION_LABEL,
    });
    await expect(fuelClassification).toHaveValue(
      GSC_ACTIVITY.FUEL_CLASSIFICATION_VALUE,
    );
    await checkFormFieldsReadOnly([fuelClassification]);

    // Fill fuel description
    await fillInputValueByLabel(
      this.page,
      GSC_ACTIVITY.FUEL_DESCRIPTION_LABEL,
      GSC_ACTIVITY.FUEL_DESCRIPTION_VALUE,
    );

    // Verify annual fuel amount label is visible
    await expect(
      this.page.getByText(GSC_ACTIVITY.ANNUAL_FUEL_AMOUNT_FIELD_LABEL, {
        exact: true,
      }),
    ).toBeVisible();

    // Verify fuel unit is displayed next to the input
    await expect(
      this.page.getByText(GSC_ACTIVITY.FUEL_UNIT_VALUE, {
        exact: true,
      }),
    ).toBeVisible();

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

  async verifyNonAttributable(expectedValue: boolean): Promise<void> {
    await assertFieldVisibility(this.page, [NON_ATTRIBUTABLE.INFO_NOTE], true);
    
    const yesLabel = this.page.locator("label").filter({ hasText: /^Yes$/ });
    await expect(yesLabel).toBeVisible();
    const noLabel = this.page.locator("label").filter({ hasText: /^No$/ });
    await expect(noLabel).toBeVisible();
    if (expectedValue) {
      await expect(yesLabel).toBeChecked();
      await expect(noLabel).not.toBeChecked();
    } else {
      await expect(yesLabel).not.toBeChecked();
      await expect(noLabel).toBeChecked();
    }
  }

  async verifyEmissionSummary(): Promise<void> {
    await verifyFormTitle(this.page, EMISSION_SUMMARY.TITLE);
  }

  async fillProductionData(
    productsToSelect: string[] = ["Cement equivalent"],
    productsAvailable: string[] | undefined = undefined,
  ): Promise<void> {
    const productionData = new ProductionDataPOM(this.page);
    await productionData.fillProducts(productsToSelect, productsAvailable);
  }

  async verifyAllocationAlerts(): Promise<void> {
    const allocationOfEmissions = new AllocationOfEmissionsPOM(this.page);
    await allocationOfEmissions.validateProductAlertVisible();
  }

  async fillAllocationOfEmissions(
    methodology: AllocationMethodology = "OBPS Allocation Calculator",
  ): Promise<void> {
    const allocationOfEmissions = new AllocationOfEmissionsPOM(this.page);
    await allocationOfEmissions.fill(methodology);
  }
}

export class LFOFacilityReportPOM extends SFOFacilityReportPOM {
  private readonly url: string;

  constructor(page: Page, facilityId: string) {
    super(page, facilityId);
    this.url = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                    ${this.facilityId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // -----------------
  // URL builders
  // -----------------

  facilityReportCompletedUrl(): string {
    return `/facilities/${this.facilityId}/${ReportRoutes.FACILITY_REPORT_COMPLETED}`;
  }

  // -----------------
  // LFO-specific page: Facility specific information
  // -----------------

  private reviewFacilityInformationValues(
    values: ReviewFacilityInformationValues = {},
  ): Required<ReviewFacilityInformationValues> {
    // dictionary structure of expected values for an LFO facility on the Review Facility Information page, with defaults for any missing values
    return {
      facilityName:
        values.facilityName ?? DEFAULT_LFO_REVIEW_FACILITY_INFORMATION.facilityName,
      facilityType:
        values.facilityType ?? DEFAULT_LFO_REVIEW_FACILITY_INFORMATION.facilityType,
      activityStates:
        values.activityStates ?? DEFAULT_LFO_REVIEW_FACILITY_INFORMATION.activityStates,
      expectedCheckedCount:
        values.expectedCheckedCount ??
        DEFAULT_LFO_REVIEW_FACILITY_INFORMATION.expectedCheckedCount,
    };
  }

  async fillReviewFacilityInformation(
    values: ReviewFacilityInformationValues = {},
  ): Promise<void> {
    const reviewValues = this.reviewFacilityInformationValues(values);
    const checkedActivities = this.page.getByRole("checkbox", { checked: true });

    await this.page
      .getByRole("combobox", { name: "Facility type" })
      .fill(reviewValues.facilityType);

    for (const [activityName, checked] of Object.entries(
      reviewValues.activityStates,
    )) {
      await this.page
        .getByRole("checkbox", {
          name: activityName,
        })
        .setChecked(checked);
    }

    await expect(checkedActivities).toHaveCount(
      reviewValues.expectedCheckedCount,
    );
  }

  async verifyReviewFacilityInformation(
    values: ReviewFacilityInformationValues = {},
  ): Promise<void> {
    const reviewValues = this.reviewFacilityInformationValues(values);
    const checkedActivities = this.page.getByRole("checkbox", { checked: true });

    const facilityNameInput = this.page.locator(
      'input#root_facility_name[name="facility_name"]',
    );

    await expect(facilityNameInput).toBeVisible();
    await expect(facilityNameInput).toBeDisabled();
    await expect(facilityNameInput).toHaveValue(reviewValues.facilityName);

    await expect(
      this.page.getByRole("combobox", { name: "Facility type" }),
    ).toHaveValue(reviewValues.facilityType);

    for (const [activityName, checked] of Object.entries(
      reviewValues.activityStates,
    )) {
      const checkbox = this.page.getByRole("checkbox", {
        name: activityName,
      });

      if (checked) {
        await expect(checkbox).toBeChecked();
      } else {
        await expect(checkbox).not.toBeChecked();
      }
    }

    await expect(checkedActivities).toHaveCount(
      reviewValues.expectedCheckedCount,
    );
  }

  override async fillAllocationOfEmissions(
    methodology: AllocationMethodology = "OBPS Allocation Calculator",
  ): Promise<void> {
    const allocationOfEmissions = new AllocationOfEmissionsPOM(this.page);
    await allocationOfEmissions.validateProductAlertVisible(false);
    await allocationOfEmissions.fill(methodology);
  }

  // -----------------
  // LFO-specific page: Facility Report Completed
  // -----------------

  async verifyFacilityReportCompleted(): Promise<void> {
    await expect(
      this.page.getByText("End of facility report for:"),
    ).toBeVisible();
  }

  async returnToAllFacilityReports(): Promise<void> {
    await clickButton(this.page, FORM_BUTTON_TEXT.RETURN_TO_FACILITY_REPORTS, {
      waitForUrl: new RegExp(ReportRoutes.FACILITY_REPORT_GRID),
    });
  }

  // -----------------
  // LFO-specific page: Facility Information for specific facilities
  // -----------------
  async verifyBarkHQFacilityInformation(): Promise<void> {
    await this.verifyReviewFacilityInformation({
      facilityName: "Bark HQ",
      facilityType: "Large Facility",
      activityStates: {
        "General stationary combustion excluding line tracing (at SFO)": true,
        "Cement production": true,
      },
      expectedCheckedCount: 2,
    });
  }

  async verifyBarkFacility42Information(): Promise<void> {
    await this.verifyReviewFacilityInformation({
      facilityName: "Facility 42",
      facilityType: "Small Facility",
      activityStates: {
        "General stationary combustion excluding line tracing (at SFO) General":
          true,
        Ammonia: false,
      },
      expectedCheckedCount: 1,
    });
  }

  async verifyAndUpdateBarkHQFacilityGSCActivityForm(): Promise<void> {
    const gscWithCheckbox = this.page.locator('#root_gscWithProductionOfUsefulEnergy');
    await expect(gscWithCheckbox).toBeChecked();
    const gscWithoutCheckbox = this.page.locator('#root_gscWithoutProductionOfUsefulEnergy');
    await expect(gscWithoutCheckbox).toBeChecked();

    // -- GSC with production of useful energy
    await expect(this.page.locator("#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_gscUnitType")).toHaveValue("Kiln");
    await expect(this.page.locator("#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_fuelType_fuelName")).toHaveValue("Hydrogen");
    // update Annual Fuel Amount value from 345
    const fuelAmountInput = this.page.locator("#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_annualFuelAmount");
    await expect(fuelAmountInput).toHaveValue("345");
    await fuelAmountInput.clear();
    await fuelAmountInput.fill("355");
    const gasType = this.page.locator(
      'input#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_gasType[role="combobox"]:not([disabled])',
    );
    await expect(gasType).toHaveValue("CO2");
    // update Emissions value from 1,563
    await this.page.locator("#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_emission").fill("1714");
    await expect(this.page.locator("#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_methodology_methodology")).toHaveValue("Replacement Methodology");

    // -- GSC without production of useful energy
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_gscUnitType")).toHaveValue("Other");
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_gscUnitDescription")).toHaveValue("something else");
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_fuels_0_fuelType_fuelName")).toHaveValue("Carpet fibre");
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_fuels_0_annualFuelAmount")).toHaveValue("6");
    await expect(
      this.page.locator(
        'input#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_gasType[role="combobox"]:not([disabled])',
      ),
    ).toHaveValue("CO2");
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_emission")).toHaveValue("13");
    await expect(this.page.locator("#root_sourceTypes_gscWithoutProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_methodology_methodology")).toHaveValue("Replacement Methodology");
  }

  async verifyAndUpdateBarkHQFacilityCementActivityForm(): Promise<void> {
    await expect(this.page.locator('input#root_sourceTypes_calcinationUsedToProductClinker_emissions_0_gasType[role="combobox"]:not([disabled])')).toHaveValue("CO2");
    await expect(this.page.locator("#root_sourceTypes_calcinationUsedToProductClinker_emissions_0_emission")).toHaveValue("9,462");
    await expect(this.page.locator("#root_sourceTypes_calcinationUsedToProductClinker_emissions_0_timesMissingDataProceduresWereFollowed")).toHaveValue("2");
    const methodologyLocator = this.page.locator("#root_sourceTypes_calcinationUsedToProductClinker_emissions_0_methodology_methodology");
    await expect(methodologyLocator).toHaveValue('Oxidation Emissions');
    // update methodology to CEMS
    await methodologyLocator.fill("CEMS");
  }
}
