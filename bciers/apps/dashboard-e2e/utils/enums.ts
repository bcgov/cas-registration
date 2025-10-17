export enum DashboardTiles {
  ADMINISTRATION = "Administration",
  REGISTRATION = "Registration",
  REPORTING = "Reporting",
  COMPLIANCE = "Compliance",
  REPORT_A_PROBLEM = "Report a Problem",
  INTERNAL_USER_ACCESS_REQUEST = "Clean Growth User Access Management",
  TRANSFERS = "Transfers",
}

export const InternalDashboardTiles: ReadonlyArray<DashboardTiles> = [
  DashboardTiles.ADMINISTRATION,
  DashboardTiles.TRANSFERS,
  DashboardTiles.REPORTING,
  DashboardTiles.COMPLIANCE,
  DashboardTiles.INTERNAL_USER_ACCESS_REQUEST,
  DashboardTiles.REPORT_A_PROBLEM,
];

export const ExternalDashboardTiles: ReadonlyArray<DashboardTiles> = [
  DashboardTiles.ADMINISTRATION,
  DashboardTiles.REGISTRATION,
  DashboardTiles.REPORTING,
  DashboardTiles.COMPLIANCE,
  DashboardTiles.REPORT_A_PROBLEM,
];

export enum AdministrationTileText {
  SELECT_OPERATOR = "Select an Operator",
  MY_OPERATOR = "My Operator",
  OPERATIONS = "Operations",
  TRANSFER = "Report transfer of operation or facility",
  CONTACTS = "Contacts",
  ACCESS_REQUEST = "Users and Access Requests",
}

export enum ExternalDashboardLinks {
  SELECT_OPERATOR = "Select an Operator",
  MY_OPERATOR = "My Operator",
  OPERATIONS = "Operations",
  REPORT_TRANSFER_OF_OPERATION_OR_FACILITY = "Report transfer of operation or facility",
  CONTACTS = "Contacts",
  USERS_AND_ACCESS_REQUESTS = "Users and Access Requests",
  REGISTER_AN_OPERATION = "Register an Operation",
  VIEW_ANNUAL_REPORTS = "View Annual Reports",
  VIEW_PAST_REPORTS = "View Past Reports",
  MY_COMPLIANCE = "My Compliance",
  BC_CARBON_REGISTRY = "B.C. Carbon Registry",
  REPORT_PROBLEM = "Report problems to GHGRegulator@gov.bc.ca",
}

export enum InternalDashboardLinks {
  OPERATORS = "Operators",
  OPERATIONS = "Operations",
  OPERATOR_ADMIN_ACCESS_REQUEST = "Operator Administrators and Access Requests",
  CONTACTS = "Contacts",
  TRANSFER = "Transfers",
  ANNUAL_REPORTS = "Annual Reports",
  PREVIOUS_REPORTS = "Previous Years Reports",
  REPORT_ATTACHMENTS = "Report Attachments",
  COMPLIANCE_SUMMARIES = "Compliance Summaries",
  INVOICES = "Invoices",
  TRANSFER_OPERATION_OR_FACILITY = "Transfer an operation or facility",
  ACCESS_REQUEST = "Access Requests",
  REPORT_PROBLEM = "Report problems to GHGRegulator@gov.bc.ca",
}
