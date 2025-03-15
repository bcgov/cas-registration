import { JWT } from "next-auth/jwt";
import { IDP } from "@bciers/utils/src/enums";
import { fetchApi } from "@bciers/actions/api/fetchApi";

export const getUserRole = (token: JWT | null): IDP | null => {
  if (!token) {
    return null;
  }
  return (token.identity_provider as IDP) || null;
};

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

// Paths for LFO operations
export const reportPathsLFO = [
  "review-facilities",
  "report-information",
  "review-facility-information",
  "end-of-facility-report",
  "operation-emission-summary",
];

// Paths routing
export enum routes {
  FINAL_REVIEW = "final-review",
  ONBOARDING = "/onboarding",
  OPERATION = "review-operation-information",
  SUBMITTED = "submitted",
  VERIFICATION = "verification",
}

export async function fetchResponse(endpoint: string, user_guid: string) {
  const response = await fetchApi(endpoint, {
    user_guid: user_guid,
  });
  return response;
}
