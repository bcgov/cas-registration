import { Page, expect } from "@playwright/test";
import {
  assertFieldVisibility,
  checkCheckboxByLabel,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

const PRODUCTION_DATA = {
  PAGE_TITLE: "Select the products that apply to this facility:",

  // All products linked to Bugle SFO (regulated_products: [2, 6, 7, 8])
  ALL_PRODUCTS: [
    "Limestone for sale",
    "Cement equivalent",
    "Gypsum wallboard",
    "Lime at 94.5% CaO and lime kiln dust",
  ],

  ANNUAL_PRODUCTION_INPUT_NAME: "annual_production",
  ANNUAL_PRODUCTION_VALUE: 5000,

  METHODOLOGY_LABEL: /Production Quantification/i,
  METHODOLOGY_OPTIONS: ["OBPS Calculator", "other"],
  METHODOLOGY_DEFAULT: "OBPS Calculator",
} as const;

// Maps each product name to its read-only unit value (from ReadOnlyWidget)
const PRODUCT_UNITS: Record<string, string> = {
  "Cement equivalent": "Tonne cement equivalent",
  "Gypsum wallboard": "Thousand square feet",
  "Lime at 94.5% CaO and lime kiln dust": "Tonne lime@94.5% CAO + LKD",
  "Limestone for sale": "Tonne limestone",
};

export class ProductionDataPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillProducts(productsToSelect: string[]): Promise<void> {
    await assertFieldVisibility(this.page, [PRODUCTION_DATA.PAGE_TITLE], true);

    // Assert all expected products appear as checkboxes
    for (const product of PRODUCTION_DATA.ALL_PRODUCTS) {
      await expect(
        this.page.getByRole("checkbox", { name: product }),
      ).toBeVisible();
    }

    // Select each requested product
    for (const product of productsToSelect) {
      await checkCheckboxByLabel(this.page, product);
    }

    // Verify unit text for each selected product (ReadOnlyWidget renders a div, not an input)
    for (const product of productsToSelect) {
      const unit = PRODUCT_UNITS[product];
      if (unit) {
        await expect(this.page.getByText(unit, { exact: true })).toBeVisible();
      }
    }

    // Fill annual production for each selected product
    const annualProductionInputs = this.page.getByRole("textbox", {
      name: PRODUCTION_DATA.ANNUAL_PRODUCTION_INPUT_NAME,
    });
    for (const [i] of productsToSelect.entries()) {
      await fillInputValueByLocator(
        annualProductionInputs.nth(i),
        PRODUCTION_DATA.ANNUAL_PRODUCTION_VALUE,
      );
    }

    // For each selected product: open methodology combobox, verify all options, then select default
    const methodologyComboboxes = this.page.getByRole("combobox", {
      name: PRODUCTION_DATA.METHODOLOGY_LABEL,
    });
    for (const [i] of productsToSelect.entries()) {
      await methodologyComboboxes.nth(i).click();

      for (const option of PRODUCTION_DATA.METHODOLOGY_OPTIONS) {
        await expect(
          this.page.getByRole("option", { name: option }),
        ).toBeVisible();
      }

      await this.page
        .getByRole("option", { name: PRODUCTION_DATA.METHODOLOGY_DEFAULT })
        .click();
    }
  }
}
