import { Locator, Page, expect } from "@playwright/test";
import {
  checkCheckboxByLabel,
  expectNumericInputValue,
  fillInputValueByLabel,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

export const PRODUCTION_DATA = {
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
  METHODOLOGY_DESCRIPTION_LABEL: /Methodology description/i,
} as const;

// The annual production `fillProducts` enters, so later versions can assert carry-over
export const DEFAULT_ANNUAL_PRODUCTION =
  PRODUCTION_DATA.ANNUAL_PRODUCTION_VALUE;

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

  annualProductionInput(productIndex: number): Locator {
    return this.page.locator(
      `input#root_production_data_${productIndex}_annual_production[type="text"]`,
    );
  }

  async verifyAnnualProduction(
    productIndex: number,
    expected: number,
  ): Promise<void> {
    await expectNumericInputValue(
      this.annualProductionInput(productIndex),
      expected,
    );
  }

  async fillAnnualProduction(
    productIndex: number,
    annualProduction: number,
  ): Promise<void> {
    await fillInputValueByLocator(
      this.annualProductionInput(productIndex),
      annualProduction,
    );
  }

  async fillMethodology(
    productIndex: number,
    methodology: string,
    description?: string,
  ): Promise<void> {
    const combobox = this.page
      .getByRole("combobox", { name: PRODUCTION_DATA.METHODOLOGY_LABEL })
      .nth(productIndex);

    await expect(combobox).toBeVisible();
    await combobox.click();
    await this.page.getByRole("option", { name: methodology }).click();
    await expect(combobox).toHaveValue(methodology);

    if (description !== undefined) {
      await fillInputValueByLabel(
        this.page,
        PRODUCTION_DATA.METHODOLOGY_DESCRIPTION_LABEL,
        description,
      );
    }
  }

  async fillProducts(
    productsToFill: string[],
    withSelectableProducts: string[] | undefined = undefined,
  ): Promise<void> {
    if (withSelectableProducts !== undefined) {
      // Assert all expected products appear as checkboxes
      for (const product of withSelectableProducts) {
        await expect(
          this.page.getByRole("checkbox", { name: product }),
        ).toBeVisible();
      }

      // Select each requested product
      for (const product of productsToFill) {
        await checkCheckboxByLabel(this.page, product);
      }
    }

    // Verify unit text for each selected product (InlineFieldTemplate renders unit as <p>)
    // Use nth(i) to target the unit in the specific product row
    const unitTexts = this.page.locator("p");
    for (const [i, product] of productsToFill.entries()) {
      const unit = PRODUCT_UNITS[product];
      if (unit) {
        // Find the nth occurrence of the unit text within the product data section
        const unitElement = unitTexts.filter({ hasText: unit }).nth(i);
        await expect(unitElement).toBeVisible();
      }
    }

    // Fill annual production for each selected product
    const annualProductionInputs = this.page.getByRole("textbox", {
      name: PRODUCTION_DATA.ANNUAL_PRODUCTION_INPUT_NAME,
    });
    for (const [i] of productsToFill.entries()) {
      await fillInputValueByLocator(
        annualProductionInputs.nth(i),
        PRODUCTION_DATA.ANNUAL_PRODUCTION_VALUE,
      );
    }

    // For each selected product: open methodology combobox, verify all options, then select default
    const methodologyComboboxes = this.page.getByRole("combobox", {
      name: PRODUCTION_DATA.METHODOLOGY_LABEL,
    });
    for (const [i] of productsToFill.entries()) {
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
