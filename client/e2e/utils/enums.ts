export enum ActionButton {
  CONTINUE = "Continue",
  SUBMIT = "Submit",
}

export enum AppRoute {
  DASHBOARD = "/dashboard",
  HOME = "/home",
  PROFILE = "/dashboard/profile",
}

export enum DataTestID {
  PROFILE = '[data-testid="nav-user-profile"]',
}

export enum LoginLink {
  CAS = "Log in with IDIR",
  INDUSTRY_USER = "Log in with Business BCeID",
  OUT = "Log out",
}

export enum UserRole {
  CAS_PENDING = "cas_pending",
  CAS_ANALYST = "cas_analyst",
  CAS_ADMIN = "cas_admin",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
  NEW_USER = "none",
}
