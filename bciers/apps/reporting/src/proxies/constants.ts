export const REPORTING_BASE = "reporting";
export const REPORT_BASE = "reports";
export const REPORT_VERSION_BASE = "report-version";
export const REPORT_VERSION_API_BASE = `${REPORTING_BASE}/${REPORT_VERSION_BASE}/`;
export const REPORT_APP_BASE = `/${REPORTING_BASE}/${REPORT_BASE}/`;

/**
 * Extracts the report version ID from a given pathname.
 * Assumes the URL follows the pattern: `/reporting/reports/{versionId}/...`
 */
export const extractReportVersionId = (pathname: string): number | null => {
  const parts = pathname.split("/").filter(Boolean);
  const reportsIndex = parts.indexOf("reports");

  if (reportsIndex !== -1 && parts.length > reportsIndex + 1) {
    const versionId = Number(parts[reportsIndex + 1]);
    return Number.isNaN(versionId) ? null : versionId;
  }

  return null;
};

// App routing routes
export enum AppRoutes {
  OPERATION = "/review-operation-information",
  REPORTS = "/reports",
  REVIEW = "/final-review",
  SUBMITTED = "/submitted",
  VERIFICATION = "/verification",
  VALIDATION = "/report-validation",
}

// App routes restricted to LFO operations
export const reportRoutesLFO = [
  "review-facilities",
  "report-information",
  "review-facility-information",
  "end-of-facility-report",
  "operation-emission-summary",
];

// App routes restricted to New Entrant
export const restrictedRoutesNewEntrant = ["new-entrant-information"];

// App routes restricted to EIO
export const restrictedRoutesEIO = ["electricity-import-data"];

// App routes restricted to Submitted
export const restrictedRoutesSubmitted = ["submitted", "submission"];

// App routes restricted to Supplementary Report
export const restrictedSupplementaryReport = ["review-changes"];

// App routes for submitted report
export const reportRoutesSubmitted = ["submitted", "submission"];

// App routes for Reporting Operation operations
export const reportRoutesReportingOperation = [
  "review-operation-information",
  "person-responsible",
  "activities",
  "non-attributable",
  "emission-summary",
  "additional-reporting-data",
  "report-validation",
  "review-changes",
  "final-review",
  "verification",
  "attachments",
  "sign-off",
  ...reportRoutesLFO,
  ...reportRoutesSubmitted,
];

// App routes for EIO report
export const reportRoutesEIO = [
  "review-operation-information",
  "person-responsible",
  "electricity-import-data",
  "report-validation",
  "review-changes",
  "final-review",
  "verification",
  "attachments",
  "sign-off",
  ...reportRoutesSubmitted,
];
