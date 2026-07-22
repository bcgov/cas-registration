import { Page, expect } from "@playwright/test";

export class ReviewFacilitiesPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectFacilities(facilityNames: string[]) {
    for (const f of facilityNames) {
      await expect(
        this.page.getByRole("checkbox", { name: `${f} Facility` }),
      ).toBeChecked();
    }
  }

  async verifyFacilitiesSelected(facilityNames: string[]) {
    for (const f of facilityNames) {
      await expect(
        this.page.getByRole("checkbox", { name: `${f} Facility` }),
      ).toBeChecked();
    }
  }
}
