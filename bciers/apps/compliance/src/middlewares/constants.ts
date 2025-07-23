export const COMPLIANCE_BASE = "compliance/";
export const COMPLIANCE_REPORT_BASE = "compliance-summaries/";
export const COMPLIANCE_API_BASE = `${COMPLIANCE_BASE}`;
export const COMPLIANCE_APP_BASE = `/${COMPLIANCE_BASE}/`;

/**
 * Extracts the report version ID from a given pathname.
 * Assumes the URL follows the pattern: `<app>/<subsection>/<id>/...`
 */
export const extractComplianceReportVersionId = (
  pathname: string,
): number | null => {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length >= 3) {
    const versionId = Number(parts[2]);
    return Number.isNaN(versionId) ? null : versionId;
  }

  return null;
};

// App routing routes
export enum AppRoutes {
  ONBOARDING = "/onboarding",
  REVIEW_COMPLIANCE_SUMMARY = "compliance-summaries/manage-obligation-review-summary",
  APPLY_COMPLIANCE_UNITS = "compliance-summaries/apply-compliance-units",
}
