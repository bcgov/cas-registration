import { Page } from "@playwright/test";
import {
  assertFieldVisibility,
  fillComboxboxWidget,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

const ALLOCATION_OF_EMISSIONS = {
  // Alert note at top of form — text is split by an embedded link, so verified in two parts
  MISSING_PRODUCT_ALERT_LINK: "production data page",
  MISSING_PRODUCT_ALERT_NOTE:
    "Note: unregulated products will not be shown below.",

  METHODOLOGY_LABEL: "Methodology",
  METHODOLOGY_OPTIONS: ["OBPS Allocation Calculator", "Other"] as const,

  BASIC_ALLOCATION_TITLE:
    "Allocate the facility's total emissions, by emission category, among its regulated products in tCO2e:",
  FUEL_EXCLUDED_TITLE:
    "Allocate the facility's total emissions, by emissions excluded by fuel type:",

  GSC_EMISSION_VALUE: 11000,
} as const;

export type AllocationMethodology =
  (typeof ALLOCATION_OF_EMISSIONS.METHODOLOGY_OPTIONS)[number];

export class AllocationOfEmissionsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fill(
    methodology: AllocationMethodology = "OBPS Allocation Calculator",
  ): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        ALLOCATION_OF_EMISSIONS.MISSING_PRODUCT_ALERT_LINK,
        ALLOCATION_OF_EMISSIONS.MISSING_PRODUCT_ALERT_NOTE,
      ],
      true,
    );

    // SelectWidget renders as MUI Autocomplete — use fillComboxboxWidget
    await fillComboxboxWidget(
      this.page,
      ALLOCATION_OF_EMISSIONS.METHODOLOGY_LABEL,
      methodology,
    );

    // Verify allocation sections appear after methodology selection
    await assertFieldVisibility(
      this.page,
      [
        ALLOCATION_OF_EMISSIONS.BASIC_ALLOCATION_TITLE,
        ALLOCATION_OF_EMISSIONS.FUEL_EXCLUDED_TITLE,
      ],
      true,
    );

    await fillInputValueByLocator(
      this.page.locator(
        // The "Cement equivalent" input for Stationary fuel combustion emissions
        "#root_basic_emission_allocation_data_4_products_0_allocated_quantity",
      ),
      ALLOCATION_OF_EMISSIONS.GSC_EMISSION_VALUE,
    );
  }
}
