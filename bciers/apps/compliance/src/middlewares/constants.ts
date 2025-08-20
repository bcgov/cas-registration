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
  MO_REVIEW_SUMMARY = "manage-obligation-review-summary",
  MO_APPLY_COMPLIANCE_UNITS = "apply-compliance-units",
  NO_REVIEW_SUMMARY = "review-summary",
  RI_EARNED_CREDITS = "request-issuance-of-earned-credits",
  RI_REVIEW_SUMMARY = "request-issuance-review-summary",
  RI_REVIEW_SUMMARY_CREDITS = "review-credits-issuance-request",
  RI_TRACK_STATUS = "track-status-of-issuance",
  REVIEW_BY_DIRECTOR = "review-by-director",
}

export type ComplianceStatus =
  | "Invalid"
  | "Registered"
  | ComplianceSummaryStatus;

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
