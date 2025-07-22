import { JWT } from "next-auth/jwt";
import { IDP } from "@bciers/utils/src/enums";
import { fetchApi } from "@bciers/actions/api/fetchApi";

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

/**
 * Retrieves the user role (identity provider) from the given JWT token.
 *
 * @param token - The JWT token containing user details, or null if not available.
 * @returns The user role as an IDP enum if present; otherwise, returns null.
 */
export const getUserRole = (token: JWT | null): IDP | null => {
  if (!token) {
    return null;
  }
  return (token.identity_provider as IDP) || null;
};

// App routing routes
export enum AppRoutes {
  ONBOARDING = "/onboarding",
  REVIEW_COMPLIANCE_SUMMARY = "compliance-summaries/manage-obligation-review-summary",
  APPLY_COMPLIANCE_UNITS = "compliance-summaries/apply-compliance-units",
}
