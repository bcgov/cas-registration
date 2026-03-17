import { fetchApi } from "@bciers/actions/api/fetchApi";

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

/**
 * Fetches the response from a given API endpoint.
 *
 * @param endpoint - The URL of the API endpoint.
 * @param user_guid - The unique identifier for the user, used for authorization.
 * @returns The response from the API call.
 */
export async function fetchResponse(endpoint: string, user_guid: string) {
  // Call the API using fetchApi, passing the user_guid as part of the request data.
  const response = await fetchApi(endpoint, {
    user_guid: user_guid,
  });

  // Return the response from the API.
  return response;
}

// App routing routes
export enum AppRoutes {
  ONBOARDING = "/onboarding",
  OPERATION = "/review-operation-information",
  REPORTS = "/reports",
  REVIEW = "/final-review",
  SUBMITTED = "/submitted",
  VERIFICATION = "/verification",
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
  "review-changes",
  "final-review",
  "verification",
  "attachments",
  "sign-off",
  ...reportRoutesSubmitted,
];
