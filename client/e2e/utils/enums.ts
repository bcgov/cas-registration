// 🤳 app roles
export enum AppRole {
  ADMIN = "admin",
}
// 🔘 button text
export enum ButtonText {
  ADD_OPERATION = "Add Operation",
  CANCEL = "Cancel",
  CONFIRM = "Confirm",
  CONTINUE = "Continue",
  EDIT = "Edit Information",
  EXPAND_ALL = "Expand All",
  GO_BACK = "Go Back",
  LOGIN_CAS = "Log in with IDIR",
  LOGIN_INDUSTRY_USER = "Log in with Business BCeID",
  LOGOUT = "Log out",
  LOGOUT_SSO = "You are logged out",
  NEXT = "Next",
  OPERATORS = "Operators",
  OPERATIONS = "Operations",
  PDF_PREVIEW = "Preview",
  RETURN = "Return",
  RETURN_OPERATIONS = "Return to Operations List",
  REQUEST_ACCESS = "Request Access",
  REQUEST_ADMIN_ACCESS = "Request Administrator Access",
  SAVE_CONTINUE = "Save and Continue",
  SAVE_RETURN_DASHBOARD = "Save and Return to Dashboard",
  SEARCH_OPERATOR = "Search Operator",
  SELECT_OPERATOR = "Select Operator",
  SUBMIT = "Submit",
  VIEW_DETAILS = "View Details",
  YES_OPERATOR = "Yes this is my operator",
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
}

// 👋 playwright selectors targeting an HTML element
export enum DataTestID {
  ERROR_PROFILE = '[data-testid="alert-error-user-profile"]',
  GRID = ".MuiDataGrid-root", //'[data-testid="grid-root"]',
  MESSAGE_PENDING = '[data-testid="dashboard-pending-message"]',
  NOTFOUND = '[data-testid="not-found"]',
  PROFILE = '[data-testid="nav-user-profile"]',
  OPERATION_APPROVED_MESSAGE = '[data-testid="operation-approved-message"]',
  OPERATION_DECLINED_MESSAGE = '[data-testid="operation-declined-message"]',
  MODAL = '[data-testid="modal"]',
}

// E2E values
export enum E2EValue {
  FIXTURE_LEGAL_NAME = "Operator 1 Legal Name",
  FIXTURE_NAICS = "211110 - Oil and gas extraction (except oil sands)",
  INPUT_CRA = "987654321",
  INPUT_EMAIL = "test@test.com",
  INPUT_FIRST_NAME = "Test First Name",
  INPUT_LAST_NAME = "Test Last Name",
  INPUT_LEGAL_NAME = "Operator",
  INPUT_LEGAL_NAME_NEW = "New Legal Name",
  INPUT_OPERATION_NAME = "Test Operation Name",
  INPUT_PHONE = "604 401 5432",
  INPUT_PROFILE_USERNAME = "e2e_ first name* e2e_ last name*",
  INPUT_POSITION = "Test Position Title",
  PASSWORD = "_PASSWORD",
  PREFIX = "E2E_",
  STORAGE = "_STORAGE",
}

// 🏁 Form sections
export enum FormSection {
  INFO_OPERATOR = "Operator Information",
  INFO_OPERATION = "Operation Information",
  INFO_POINT_CONTACT = "Point Of Contact",
  INFO_STATUTORY = "Statutory Declaration and Disclaimer",
  INFO_USER = "User Information",
}
// 🔍 pom locators
export enum FormTextOperatorSelect {
  INPUT_CRA = "Enter CRA Business Number",
  INPUT_LEGAL_NAME = "Enter Business Legal Name",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Business Legal Name",
}
export enum FormTextOperator {
  TITLE = "Operator Information",
}
export enum FormTextOperation {
  NAME = "Operation Name*",
  POC_FIRST_NAME = "First Name*",
  POC_LAST_NAME = "Last Name*",
  POC_POSITION = "Position Title*",
  POC_EMAIL = "Email Address*",
  POC_PHONE = "Phone Number*",
  SFO = "Single Facility Operation",
}

// 👋 keycloak selectors
export enum Keycloak {
  FIELD_USER_LOCATOR = "id=user",
  FIELD_PW_LOCATOR = "Password",
}

// 🔗 link src
export enum LinkSrc {
  PDF_FILE = "mock_file.pdf",
  REPORT_PROBLEM = "mailto:GHGRegulator@gov.bc.ca",
}

// 💬 Dashboard messages
export enum MessageTextDashboard {
  DASHBOARD_TILE_OPERATIONS = "Operations ➤",
  DASHBOARD_TILE_OPERATIONS_MINE = "My Operations",
  DASHBOARD_TILE_OPERATOR_MINE = "My Operator",
  DASHBOARD_TILE_OPERATOR_SELECT = "1 pending action(s) required",
  DASHBOARD_TILE_OPERATORS = "Operators ➤",
  DASHBOARD_TILE_INDUSTRY_USERS = "User Access Management",
  REPORT_PROBLEM = "Report problems to GHGRegulator@gov.bc.ca",
}

// 💬 Operations messages
export enum MessageTextOperations {
  ALERT_CARBON_TAX_EXEMPTION_APPROVED = "You have approved the request for carbon tax exemption.",
  ALERT_CARBON_TAX_EXEMPTION_DECLINED = "You have declined the request for carbon tax exemption.",
  NOTE_INTERNAL = "Once “Approved,” a B.C. OBPS Regulated Operation ID will be issued for the operation",
}

// 💬 Operator messages
export enum MessageTextOperatorSelect {
  INPUT_CRA = "Enter CRA Business Number",
  NO_ACCESS = "Looks like you do not have access to",
  NO_ADMIN = "does not have Administrator access set up",
  OPERATOR_CONFIRM = "Kindly confirm if this is the operator that you represent.",
  REQUEST_ACCESS = "Your access request has been sent",
  REQUEST_ADMIN = "has been received and will be reviewed",
  SELECT_OPERATOR = "Which operator would you like to log in to?",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_CRA_NUMBER = "Enter CRA Business Number",
}

// 💬 Operator messages
export enum MessageTextOperator {
  EDIT_INFO = 'Please click on the "Edit Information" button',
}

// 💬 Operators messages
export enum MessageTextOperators {
  ALERT_NEW_OPERATOR_NEEDS_APPROVE = "Operator must be approved before approving or declining users.",
  ALERT_ADMIN_APPROVED = "You have approved the prime admin request.",
  ALERT_ADMIN_DECLINED = "You have declined the prime admin request.",
  ALERT_OPERATOR_APPROVED = "You have approved the creation of the new operator.",
  ALERT_OPERATOR_DECLINED = "You have declined the creation of the new operator.",
  NOTE_INTERNAL = "Once “Approved,” the user will have access to their operator dashboard with full admin permissions, and can grant access and designate permissions to other authorized users there.",
  NOTE_NEW = "Note: This is a new operator. You must approve this operator before approving its admin.",
}

// 💬 Response messages
export enum MessageTexResponse {
  SETUP_SUCCESS = "Test setup complete.",
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
