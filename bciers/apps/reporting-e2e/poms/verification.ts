import { Page } from "@playwright/test";
import {
  fillComboxboxWidget,
  fillInputValueByLabel,
} from "@bciers/e2e/utils/helpers";

const VERIFICATION = {
  BODY_NAME_LABEL: "Verification body name",
  BODY_NAME_VALUE: "Test Verification Body",

  ACCREDITED_BY_LABEL: "Accredited by",
  ACCREDITED_BY_VALUE: "ANAB",
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
}
