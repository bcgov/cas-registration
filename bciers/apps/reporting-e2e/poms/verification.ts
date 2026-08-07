import { Page, expect } from "@playwright/test";
import {
  assertFieldVisibility,
  fillComboxboxWidget,
  fillInputValueByLabel,
} from "@bciers/e2e/utils/helpers";

const VERIFICATION = {
  BODY_NAME_LABEL: "Verification body name",
  BODY_NAME_VALUE: "Test Verification Body",

  ACCREDITED_BY_LABEL: "Accredited by",
  ACCREDITED_BY_VALUE: "ANAB",

  SUPPLEMENTARY_INFO_NOTE:
    "you must upload a new verification statement in the attachments page",
} as const;

export class VerificationPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fill(): Promise<void> {
    await fillInputValueByLabel(
      this.page,
      VERIFICATION.BODY_NAME_LABEL,
      VERIFICATION.BODY_NAME_VALUE,
    );

    await fillComboxboxWidget(
      this.page,
      VERIFICATION.ACCREDITED_BY_LABEL,
      VERIFICATION.ACCREDITED_BY_VALUE,
    );

    const noLabel = this.page.locator("label").filter({ hasText: /^No$/ });
    await noLabel.click();
  }

  /**
   * Asserts the supplementary-only info note is rendered, and that the verification
   * details carried over from the previous version.
   */
  async verifySupplementaryCarryOver(): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [VERIFICATION.SUPPLEMENTARY_INFO_NOTE],
      true,
    );

    await expect(
      this.page.getByLabel(new RegExp(VERIFICATION.BODY_NAME_LABEL, "i")),
    ).toHaveValue(VERIFICATION.BODY_NAME_VALUE);
    await expect(
      this.page.getByRole("combobox", {
        name: new RegExp(VERIFICATION.ACCREDITED_BY_LABEL, "i"),
      }),
    ).toHaveValue(VERIFICATION.ACCREDITED_BY_VALUE);
  }
}
