export const COMPLIANCE_BASE = "compliance";

/**
 * Extracts the compliance report version ID from a given pathname.
 */
export const extractComplianceReportVersionId = (
  pathname: string,
): number | null => {
  const parts = pathname.split("/").filter(Boolean);
  for (const part of parts) {
    const maybeId = Number(part);
    if (!Number.isNaN(maybeId)) {
      return maybeId;
    }
  }
  return null;
};

// App routing routes
export enum AppRoutes {
  ONBOARDING = "onboarding",
  REVIEW_COMPLIANCE_SUMMARIES = "compliance-summaries",
  REVIEW_SUMMARY = "review-summary",
  APPLY_COMPLIANCE_UNITS = "apply-compliance-units",
}

// Compiance Report Version Status
export enum ComplianceReportVersionStatus {
  OBLIGATION_NOT_MET = "Obligation not met",
  OBLIGATION_FULLY_MET = "Obligation fully met",
  OBLIGATION_PENDING_INVOICE_CREATION = "Obligation pending invoice creation",
  EARNED_CREDITS = "Earned credits",
  NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits",
}
