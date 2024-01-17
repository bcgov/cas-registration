export enum Errors {
  ACCESS_TOKEN = "ErrorAccessToken",
}

export enum IDP {
  IDIR = "idir",
  BCEIDBUSINESS = "bceidbusiness",
}

export enum FrontEndRoles {
  CAS_ADMIN = "cas_admin",
  CAS_ANALYST = "cas_analyst",
  CAS_PENDING = "cas_pending",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
}

export enum UserOperatorRoles {
  REPORTER = "reporter",
  ADMIN = "admin",
  N_A = "None",
}

export enum Status {
  MYSELF = "Myself",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  PENDING = "Pending",
  DRAFT = "Draft",
  CHANGES_REQUESTED = "Changes Requested",
}
