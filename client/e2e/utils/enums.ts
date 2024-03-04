export enum ActionButton {
  CONTINUE = "Continue",
  SUBMIT = "Submit",
}

export enum AppRole {
  ADMIN = "admin",
}

export enum AppRoute {
  DASHBOARD = "dashboard",
  HOME = "home",
  OPERATION = "dashboard/operations/create/1",
  OPERATIONS = "dashboard/operations",
  OPERATOR = "dashboard/select-operator",
  OPERATORS = "dashboard/operators",
  PROFILE = "dashboard/profile",
  USERS = "dashboard/users",
}

export enum DataTestID {
  PROFILE = '[data-testid="nav-user-profile"]',
}

export enum Keycloak {
  FIELD_USER_LOCATOR = "id=user",
  FIELD_PW_LOCATOR = "Password",
}

export enum Login {
  CAS = "Log in with IDIR",
  INDUSTRY_USER = "Log in with Business BCeID",
}

export enum Logout {
  OUT = "Log out",
  SSO = "You are logged out",
}

export enum OperatorStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
  CHANGES_REQUESTED = "Changes Requested",
}

export enum OperatorUUID {
  DEFAULT = "4242ea9d-b917-4129-93c2-db00b7451051",
}

export enum UserOperatorStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
}
export enum UserOperatorUUID {
  DEFAULT = "9bb541e6-41f5-47d3-8359-2fab4f5bc4c0",
}

export enum UserRole {
  CAS_PENDING = "cas_pending",
  CAS_ANALYST = "cas_analyst",
  CAS_ADMIN = "cas_admin",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
  NEW_USER = "none",
}
