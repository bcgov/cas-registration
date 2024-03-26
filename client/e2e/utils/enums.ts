// 🔘 button text
export enum ActionClick {
  ADD_OPERATION = "Add Operation",
  CONTINUE = "Continue",
  EXPAND_ALL = "Expand All",
  OPERATORS = "Operators",
  OPERATIONS = "Operations",
  SAVE_CONTINUE = "Save and Continue",
  SUBMIT = "Submit",
  VIEW_DETAILS = "View Details",
}

// 🤳 app roles
export enum AppRole {
  ADMIN = "admin",
}

// 🚀  App routes
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

// 👋 playwright selectors
export enum AriaLabel {
  APPLICATION_APPROVE = "Approve application",
  APPLICATION_REJECT = "Reject application",
  APPLICATION_REQUEST_CHANGE = "Request Changes",
  APPLICATION_REQUEST_CHANGE_CANCEL = "Cancel Change Request",
  APPLICATION_REQUEST_CHANGE_CONFIRM = "Confirm Change Request",
  APPLICATION_REQUEST_CHANGE_UNDO = "Undo Request Changes",
  MODAL_CANCEL = "Confirm",
  MODAL_CONFIRM = "Confirm",
}

// 👋 playwright selectors targeting an HTML element
export enum DataTestID {
  ERROR_PROFILE = '[data-testid="alert-error-user-profile"]',
  GRID = ".MuiDataGrid-root", // '[data-testid="grid-root"]',
  MESSAGE_PENDING = '[data-testid="dashboard-pending-message"]',
  NOTFOUND = '[data-testid="grid-root"]',
  PROFILE = '[data-testid="nav-user-profile"]',
  OPERATION_APPROVED_MESSAGE = '[data-testid="operation-approved-message"]',
  OPERATION_DECLINED_MESSAGE = '[data-testid="operation-declined-message"]',
  MODAL = '[data-testid="modal"]',
}

// 🏁 Form sections
export enum FormSection {
  INFO_OPERATOR = "Operator Information",
  INFO_OPERATION = "Operation Information",
  INFO_CONTACT = "Point Of Contact",
  INFO_STATUTORY = "Statutory Declaration and Disclaimer",
  INFO_USER = "User Information",
}

// 👋 keycloak selectors
export enum Keycloak {
  FIELD_USER_LOCATOR = "id=user",
  FIELD_PW_LOCATOR = "Password",
}

// 🔘 button text
export enum Login {
  CAS = "Log in with IDIR",
  INDUSTRY_USER = "Log in with Business BCeID",
}

// 🔘 button text
export enum Logout {
  OUT = "Log out",
  SSO = "You are logged out",
}

// 📝 Status LOV Operator
export enum OperatorStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
  CHANGES_REQUESTED = "Changes Requested",
}

// 🤳 UUIDs Operator
export enum OperatorUUID {
  DEFAULT = "4242ea9d-b917-4129-93c2-db00b7451051",
}

// 📝 Status LOV Operation
export enum OperationStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
}

// 📝 Status LOV UserOperator
export enum UserOperatorStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  DECLINED = "Declined",
}

// 🤳 UUIDs UserOperator
export enum UserOperatorUUID {
  INDUSTRY_USER_ADMIN = "9bb541e6-41f5-47d3-8359-2fab4f5bc4c0",
}

// 🏁 Table data field
export enum TableDataField {
  STATUS = "status",
}

//  // 👤  User roles
export enum UserRole {
  CAS_PENDING = "cas_pending",
  CAS_ANALYST = "cas_analyst",
  CAS_ADMIN = "cas_admin",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
  NEW_USER = "none",
}

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
