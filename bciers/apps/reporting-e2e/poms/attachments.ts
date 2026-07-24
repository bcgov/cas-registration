import { Page, expect } from "@playwright/test";
import { assertFieldVisibility, uploadFile } from "@bciers/e2e/utils/helpers";

const ATTACHMENTS = {
  UPLOAD_NOTE:
    "Please upload any of the documents below that are applicable to your report:",

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
    await uploadFile(this.page, 0);

    await expect(
      this.page.getByText("test.pdf- will upload on save"),
    ).toBeVisible();
  }

  async verifyVerificationStatementUploaded(
    expectedFilename: string,
  ): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        ATTACHMENTS.UPLOAD_NOTE,
        ...ATTACHMENTS.ATTACHMENT_LABELS,
        ...ATTACHMENTS.FOIPPA_NOTE_ITEMS,
      ],
      true,
    );
    await expect(this.page.getByText(`${expectedFilename}.pdf`)).toBeVisible();
    await expect(this.page.getByText("Reupload attachment")).toBeVisible();
  }
}
