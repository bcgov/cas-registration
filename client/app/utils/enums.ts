export enum Errors {
  ACCESS_TOKEN = "ErrorAccessToken",
}

export enum IDP {
  IDIR = "idir",
  BCEIDBUSINESS = "bceidbusiness",
}

export enum AppRoles {
  CAS_ADMIN = "cas_admin",
  CAS_ANALYST = "cas_analyst",
  CAS_PENDING = "cas_pending",
  INDUSTRY_USER = "industry_user", // note: UserOperatorRoles below gives finer control over industry_user permissions
}

export enum UserOperatorRoles {
  INDUSTRY_USER_REPORTER = "industry_user_reporter",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
}

export enum Status {
  MYSELF = "Myself",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PENDING = "Pending",
  DRAFT = "Draft",
  CHANGES_REQUESTED = "Changes Requested",
}
