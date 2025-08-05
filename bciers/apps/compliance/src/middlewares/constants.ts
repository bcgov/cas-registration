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
  APPLY_COMPLIANCE_UNITS = "apply-compliance-units",
}
