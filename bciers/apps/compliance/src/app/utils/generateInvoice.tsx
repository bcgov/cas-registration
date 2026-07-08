"use client";

import { ComplianceInvoiceTypes } from "@bciers/utils/src/enums";

const generateInvoice = async (
  complianceReportVersionId: number,
  invoiceType: ComplianceInvoiceTypes,
) => {
  let typeForUrl: string;

  switch (invoiceType) {
    case ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY:
      typeForUrl = "automatic-overdue-penalty";
      break;
    case ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY:
      typeForUrl = "late-submission-penalty";
      break;
    default:
      typeForUrl = "obligation";
  }

  const url = `/compliance/api/invoice/${complianceReportVersionId}/${typeForUrl}`;

  // NOTE: do not pass "noopener" here — it forces window.open to return null,
  // which would leave the new tab empty and navigate the current page instead.
  const previewTab = window.open("", "_blank");

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    const contentType = res.headers.get("Content-Type") || "";

    // Handle error or JSON payload
    if (contentType.includes("application/json")) {
      previewTab?.close();

      let payload: any = { message: `Failed with status ${res.status}` };

      try {
        payload = await res.json();
      } catch {
        // ignore invalid JSON
      }

      if (typeof payload.message === "string") {
        throw new Error(
          payload.message ||
            `Failed to generate penalty invoice (status ${res.status})`,
        );
      }

      return;
    }

    // Handle non-JSON response errors
    if (!res.ok) {
      previewTab?.close();
      throw new Error(
        `Failed to generate penalty invoice (status ${res.status})`,
      );
    }

    // Navigate the tab directly to the route URL so the browser previews the
    // PDF inline and honours the Content-Disposition filename when the user
    // downloads it (a blob URL would download as a random UUID instead).
    if (previewTab) {
      previewTab.location.href = url;
    } else {
      // Popup was blocked; fall back to navigating the current window.
      window.location.href = url;
    }
  } catch (err) {
    previewTab?.close();
    throw err;
  }
};

export default generateInvoice;
