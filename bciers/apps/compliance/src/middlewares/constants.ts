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

// App routes
export enum AppRoutes {
  ONBOARDING = "onboarding",
  REVIEW_COMPLIANCE_SUMMARIES = "compliance-summaries",
  MO_REVIEW_SUMMARY = "manage-obligation-review-summary",
  MO_APPLY_COMPLIANCE_UNITS = "apply-compliance-units",
  NO_REVIEW_SUMMARY = "review-summary",
  RI_REVIEW_SUMMARY_ISSUANCE = "request-issuance-review-summary",
  RI_REVIEW_CREDITS_ISSUANCE = "request-issuance-of-earned-credits",
  RI_TRACK_STATUS_ISSUANCE = "track-status-of-issuance",
  REVIEW_BY_DIRECTOR = "review-by-director",
}

// Compiance Report Version Status
export enum ComplianceReportVersionStatus {
  OBLIGATION_NOT_MET = "Obligation not met",
  EARNED_CREDITS = "Earned credits",
  NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits",
}

// App routes restricted to compliance report version status "No obligation or earned credits"
export const routesNoObligation = ["review-summary"];

// App routes restricted to compliance report version status "Obligation not met"
export const routesObligation = [
  "apply-compliance-units",
  "download-payment-instructions",
  "manage-obligation-review-summary",
  "pay-obligation-track-payments",
];

// App routes restricted to compliance report version status "Earned credits"
export const routesEarnedCredits = [
  "request-issuance-of-earned-credits",
  "request-issuance-review-summary",
  "track-status-of-issuance",
];
