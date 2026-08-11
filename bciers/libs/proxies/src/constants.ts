import { JWT } from "next-auth/jwt";
import { IDP } from "@bciers/utils/src/enums";

// Dashboard routing routes
export enum DashboardRoutes {
  AUTH = "/auth",
  UNAUTH = "/unauth",
  DECLINED = "/dashboard/declined",
  ERROR = "/dashboard/error",
  ONBOARDING = "/onboarding",
  DASHBOARD = "/dashboard",
  PROFILE = "/administration/profile",
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
