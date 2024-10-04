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

export enum FrontendMessages {
  SUBMIT_CONFIRMATION = "All changes have been successfully saved",
}

export enum OperationStatus {
  NOT_STARTED = "Not Started",
  DRAFT = "Draft",
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
  REGISTERED = "Registered",
  CHANGES_REQUESTED = "Changes Requested",
  TEMPORARILY_SHUTDOWN = "Temporarily Shutdown",
  TRANSFERRED = "Transferred",
  CLOSED = "Closed",
}

export enum OperationTypes {
  SFO = "Single Facility Operation",
  LFO = "Linear Facility Operation",
}

export enum FacilityTypes {
  SFO = "Single Facility",
  LFO = "Linear Facility",
}

export enum OperatorStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
  CHANGES_REQUESTED = "Changes Requested",
}

export enum UserOperatorRoles {
  ADMIN = "admin",
  REPORTER = "reporter",
  PENDING = "pending",
}

export enum UserOperatorStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
}

// user statuses
export enum Status {
  MYSELF = "Myself",
  APPROVED = "Approved",
  DECLINED = "Declined",
  PENDING = "Pending",
  DRAFT = "Draft",
  CHANGES_REQUESTED = "Changes Requested",
  NOT_STARTED = "Not Started",
}
