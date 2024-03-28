import { AppRole, AppRoute, UserRole } from "@/e2e/utils/enums";

export const baseUrlSetup = "http://localhost:8000/api/registration/test-setup";

//
export const headersOperations: Record<string, string[]> = {
  [UserRole.CAS_ADMIN]: [
    "BC GHG ID",
    "Operator",
    "Operation",
    "Submission Date",
    "BORO ID",
    "Application Status",
    "Action",
  ],
  [UserRole.INDUSTRY_USER_ADMIN]: [
    "BC GHG ID",
    "Operation",
    "Submission Date",
    "BORO ID",
    "Application Status",
    "Action",
  ],
};

export const headersOperators: Record<string, string[]> = {
  [UserRole.CAS_ADMIN]: [
    "Request\n ID",
    "First\n Name",
    "Last\n Name",
    "Email",
    "BCeID Business Name",
    "Operator Legal Name",
    "Status",
    "Action",
  ],
  [UserRole.INDUSTRY_USER_ADMIN]: [
    "Request\n ID",
    "First\n Name",
    "Last\n Name",
    "Email",
    "BCeID Business Name",
    "Operator Legal Name",
    "Status",
    "Action",
  ],
};

// 🚨 Object literal policing route access by role
export const appRouteRoles: Record<AppRoute, UserRole[]> = {
  [AppRoute.DASHBOARD]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
  ],
  [AppRoute.HOME]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
    UserRole.NEW_USER,
  ],
  [AppRoute.OPERATION]: [UserRole.INDUSTRY_USER_ADMIN],
  [AppRoute.OPERATIONS]: [
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER_ADMIN,
  ],
  [AppRoute.OPERATOR]: [UserRole.INDUSTRY_USER, UserRole.INDUSTRY_USER_ADMIN],
  [AppRoute.OPERATORS]: [UserRole.CAS_ANALYST, UserRole.CAS_ADMIN],
  [AppRoute.PROFILE]: [
    UserRole.CAS_PENDING,
    UserRole.CAS_ANALYST,
    UserRole.CAS_ADMIN,
    UserRole.INDUSTRY_USER,
    UserRole.INDUSTRY_USER_ADMIN,
    UserRole.NEW_USER,
  ],
  [AppRoute.USERS]: [UserRole.CAS_ADMIN, UserRole.INDUSTRY_USER_ADMIN],
};
