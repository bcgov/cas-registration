import { Page, expect } from "@playwright/test";
import { assertFieldVisibility, uploadFile } from "@bciers/e2e/utils/helpers";
import { AttachmentCheckboxLabel } from "@/reporting-e2e/utils/enums";

const ATTACHMENTS = {
  UPLOAD_NOTE:
    "Please upload any of the documents below that are applicable to your report:",

  UPLOADED_FILE_NAME: "test.pdf",

  // Supplementary reports only
  SUPPLEMENTARY_ALERT:
    "Review your attachments and replace any that are no longer applicable to this report.",

  ATTACHMENT_LABELS: [
    "Verification Statement",
    "WCI.352 and WCI.362",
    "Additional reportable information",
    "Confidentiality request, if you are requesting confidentiality of this report under the B.C. Reg. 249/2015 Reporting Regulation",
  ],

  FOIPPA_NOTE_ITEMS: [
    "An operator may claim that disclosure of the information referred to in Section 44(2)(a) to (d) be prohibited under Section 21 of the Freedom of Information and Protection of Privacy Act (FOIPPA) and request that the information be kept confidential",
    "A claim must be done in accordance with Section 44(5) of the Regulation",
    "The Director under GGIRCA will be in contact with you regarding your request",
  ],
} as const;

export class AttachmentsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async uploadVerificationStatement(): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        ATTACHMENTS.UPLOAD_NOTE,
        ...ATTACHMENTS.ATTACHMENT_LABELS,
        ...ATTACHMENTS.FOIPPA_NOTE_ITEMS,
      ],
      true,
    );

    // index 0 — Verification Statement is the first upload button
    // The same button reads "Reupload attachment" once a file is already attached,
    // and uploadFile matches both, so this covers the supplementary reupload too.
    await uploadFile(this.page, 0);

    await expect(
      this.page.getByText(
        `${ATTACHMENTS.UPLOADED_FILE_NAME}- will upload on save`,
      ),
    ).toBeVisible();
  }

  /**
   * Asserts the supplementary-only state of the Attachments page before the
   * confirmation checkboxes are filled:
   * - the "replace anything no longer applicable" alert is shown
   * - the verification statement uploaded on the previous version was carried over
   * - neither confirmation checkbox is pre-checked
   */
  async verifySupplementaryAttachments(): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [ATTACHMENTS.SUPPLEMENTARY_ALERT],
      true,
    );

    // The cloned attachment renders as a download link next to a "Reupload" button
    await expect(
      this.page.getByRole("button", {
        name: ATTACHMENTS.UPLOADED_FILE_NAME,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("button", { name: /reupload attachment/i }).first(),
    ).toBeVisible();

    for (const label of Object.values(AttachmentCheckboxLabel)) {
      await expect(
        this.page.getByRole("checkbox", { name: new RegExp(label, "i") }),
      ).not.toBeChecked();
    }
  }
}
