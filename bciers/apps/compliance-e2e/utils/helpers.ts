import type { Page } from "@playwright/test";
import type { ComplianceInvoiceType } from "@/compliance-e2e/utils/constants";

import { ReviewComplianceObligationPOM } from "@/compliance-e2e/poms/manage-obligation/review-compliance-obligation";
import { ObligationInvoicePOM } from "@/compliance-e2e/poms/manage-obligation/obligation-invoice";

function getVersionIdFromUrl(url: string): number {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  const candidate = parts.at(-2);
  const id = Number(candidate);

  if (!candidate || Number.isNaN(id)) {
    throw new Error(`Could not parse versionId from url: ${url}`);
  }

  return id;
}

/**
 * Generates a compliance invoice (obligation / penalty) and returns a parsed Invoice POM.
 */
export async function generateComplianceInvoice(opts: {
  page: Page;
  reviewPOM: ReviewComplianceObligationPOM;
  type: ComplianceInvoiceType;
}): Promise<ObligationInvoicePOM> {
  const { page, reviewPOM, type } = opts;

  const versionId = getVersionIdFromUrl(page.url());
  const pdfBuffer = await reviewPOM.generateInvoiceAndGetPdfBuffer(
    versionId,
    type,
  );

  return ObligationInvoicePOM.fromBuffer(pdfBuffer);
}
