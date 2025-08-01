export enum Apps {
  ADMINISTRATION = "administration",
  REGISTRATION = "registration",
}
export enum Errors {
  ACCESS_TOKEN = "ErrorAccessToken",
}

export enum IDP {
  IDIR = "idir",
  BCEIDBUSINESS = "bceidbusiness",
}

export enum InternalFrontEndRoles {
  CAS_ADMIN = "cas_admin",
  CAS_ANALYST = "cas_analyst",
  CAS_DIRECTOR = "cas_director",
  CAS_VIEW_ONLY = "cas_view_only",
  CAS_PENDING = "cas_pending",
}
export enum FrontEndRoles {
  CAS_ADMIN = "cas_admin",
  CAS_ANALYST = "cas_analyst",
  CAS_DIRECTOR = "cas_director",
  CAS_VIEW_ONLY = "cas_view_only",
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
}

export enum OperationTypes {
  SFO = "Single Facility Operation",
  LFO = "Linear Facilities Operation",
  EIO = "Electricity Import Operation",
}

export enum FacilityTypes {
  SFO = "Single Facility",
  LFO = "Linear Facility",
  EIO = "Electricity Import",
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
  CHANGES_REQUESTED = "Changes Requested",
  NOT_STARTED = "Not Started",
  DRAFT = "Draft",
}

export enum Role {
  ADMIN = "admin",
  REPORTER = "reporter",
  PENDING = "pending",
}

// report operation statuses
export enum ReportOperationStatus {
  NOT_STARTED = "Not started",
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  DRAFT_SUPPLEMENTARY = "Draft Supplementary Report",
  SUBMITTED_SUPPLEMENTARY = "Submitted Supplementary Report",
}

export enum FormMode {
  CREATE = "create",
  EDIT = "edit",
  READ_ONLY = "read-only",
}

export enum IssuanceStatus {
  CREDITS_NOT_ISSUED = "Credits Not Issued in BCCR",
  ISSUANCE_REQUESTED = "Issuance Requested",
  CHANGES_REQUIRED = "Changes Required",
  APPROVED = "Approved",
  DECLINED = "Declined",
}
export enum AnalystSuggestion {
  READY_TO_APPROVE = "Ready to approve",
  REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID = "Requiring change of BCCR Holding Account ID",
  REQUIRING_SUPPLEMENTARY_REPORT = "Requiring supplementary report",
}

export enum ComplianceSummaryStatus {
  OBLIGATION_NOT_MET = "Obligation not met",
  OBLIGATION_FULLY_MET = "Obligation fully met",
  OBLIGATION_PENDING_INVOICE_CREATION = "Obligation pending invoice creation",
  EARNED_CREDITS = "Earned credits",
  NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits",
}
