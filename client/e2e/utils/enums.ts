export enum ActionButton {
  CONTINUE = "Continue",
  SUBMIT = "Submit",
}

export enum AppRoute {
  DASHBOARD = "dashboard",
  HOME = "home",
  PROFILE = "dashboard/profile",
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

export enum UserRole {
  CAS_PENDING = "cas_pending",
  CAS_ANALYST = "cas_analyst",
  CAS_ADMIN = "cas_admin",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
  NEW_USER = "none",
}
