import { ComplianceSummaryStatus } from "@bciers/utils/src/enums";

export const COMPLIANCE_BASE = "compliance";

/** Extracts the compliance report version ID from a given pathname. */
export const extractComplianceReportVersionId = (
  pathname: string,
): number | null => {
  const parts = pathname.split("/").filter(Boolean);
  for (const part of parts) {
    const maybeId = Number(part);
    if (!Number.isNaN(maybeId)) return maybeId;
  }
  return null;
};

/** Ensure path starts with a leading slash. */
export const absolutize = (p: string) => (p.startsWith("/") ? p : `/${p}`);

/** Match by full path segment (not substring). */
export const hasSegment = (pathname: string, seg: string) => {
  const clean = pathname.split("?")[0].split("#")[0];
  return clean.split("/").includes(seg);
};

/** Remove a trailing "/{segment}" (with optional trailing slash). */
export const stripTrailingSegment = (pathname: string, seg: string) =>
  pathname.replace(new RegExp(`/${seg}/?$`), "");

/** Build a /compliance/... path safely. */
export const joinCompliancePath = (...segs: (string | number | undefined)[]) =>
  `/${COMPLIANCE_BASE}/${segs.filter(Boolean).join("/")}`;

// App routes
export enum AppRoutes {
  ONBOARDING = "onboarding",
  REVIEW_COMPLIANCE_SUMMARIES = "compliance-summaries",
  MO_REVIEW_SUMMARY = "review-compliance-obligation-report",
  MO_APPLY_COMPLIANCE_UNITS = "apply-compliance-units",
  MO_DOWNLOAD_PAYMENT_INSTRUCTIONS = "download-payment-instructions",
  MO_PAY_OBLIGATION_TRACK_PAYMENTS = "pay-obligation-track-payments",
  MO_REVIEW_PENALTY_SUMMARY = "review-penalty-summary",
  MO_DOWNLOAD_PENALTY_PAYMENT_INSTRUCTIONS = "download-payment-penalty-instructions",
  MO_PAY_PENALTY_TRACK_PAYMENTS = "pay-penalty-track-payments",
  NO_REVIEW_SUMMARY = "review-summary",
  RI_EARNED_CREDITS = "request-issuance-of-earned-credits",
  RI_REVIEW_SUMMARY = "request-issuance-review-summary",
  RI_REVIEW_SUMMARY_CREDITS = "review-credits-issuance-request",
  RI_TRACK_STATUS = "track-status-of-issuance",
  REVIEW_BY_DIRECTOR = "review-by-director",
  REVIEW_PENALTY_SUMMARY = "review-penalty-summary",
}

export type ComplianceStatus =
  | "Invalid"
  | "Registered"
  | ComplianceSummaryStatus;

// App routes restricted to compliance report version status "No obligation or earned credits"
export const routesNoObligation = [AppRoutes.NO_REVIEW_SUMMARY];

// App routes restricted to compliance report version status "Obligation not met"
export const routesObligation = [
  AppRoutes.MO_REVIEW_SUMMARY,
  AppRoutes.MO_APPLY_COMPLIANCE_UNITS,
  AppRoutes.MO_DOWNLOAD_PAYMENT_INSTRUCTIONS,
  AppRoutes.MO_PAY_OBLIGATION_TRACK_PAYMENTS,
  AppRoutes.MO_REVIEW_PENALTY_SUMMARY,
  AppRoutes.MO_DOWNLOAD_PENALTY_PAYMENT_INSTRUCTIONS,
  AppRoutes.MO_PAY_PENALTY_TRACK_PAYMENTS,
];
export const routesObligationPenalty = [
  AppRoutes.MO_REVIEW_PENALTY_SUMMARY,
  AppRoutes.MO_DOWNLOAD_PENALTY_PAYMENT_INSTRUCTIONS,
  AppRoutes.MO_PAY_PENALTY_TRACK_PAYMENTS,
];

// App routes restricted to compliance report version status "Earned credits"
export const routesEarnedCredits = [
  AppRoutes.RI_EARNED_CREDITS,
  AppRoutes.RI_REVIEW_SUMMARY,
  AppRoutes.RI_TRACK_STATUS,
];
