import {
  OperationStatus,
  OperatorStatus,
  UserOperatorStatus,
} from "@bciers/utils/enums";

// 🤳 app roles
export enum AppRole {
  ADMIN = "admin",
}

// 🔘 button text
export enum ButtonText {
  APPROVE = "Approve",
  CANCEL = "Cancel",
  CONFIRM = "Confirm",
  CONTINUE = "Continue",
  DECLINE = "Decline",
  EDIT = "Edit",
  EDIT_INFO = "Edit Information",
  EXPAND_ALL = "Expand All",
  GO_BACK = "Go Back",
  RETURN = "Return",
  SAVE_CONTINUE = "Save and Continue",
  SAVE_RETURN_DASHBOARD = "Save and Return to Dashboard",
  SUBMIT = "Submit",
  UNDO = "Undo",
  VIEW_DETAILS = "View Details",
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

// 👋 playwright ID selectors targeting an HTML element
export enum DataTestID {
  BREADCRUMB_LAST = "breadcrumb-last-item",
  ERROR_PROFILE = "alert-error-user-profile",
  GRID = ".MuiDataGrid-root", // not working: "grid-root",
  MESSAGE_PENDING = "dashboard-pending-message",
  NOTFOUND = "not-found",
  PROFILE = "nav-user-profile",
  OPERATION_APPROVED_MESSAGE = "operation-approved-message",
  OPERATION_BORO_ID_MESSAGE = "operation-boro-id-message",
  OPERATION_DECLINED_MESSAGE = "operation-declined-message",
  OPERATION_FIELD_TEMPLATE = "field-template-label",
  OPERATION_HEADER_TEMPLATE = "multistep-header-title",
  MODAL = "modal",
  ARROW_DROPDOWN_ICON = "ArrowDropDownIcon",
}

// E2E values
export enum E2EValue {
  FIXTURE_NAICS = "211110 - Oil and gas extraction (except oil sands)",
  FIXTURE_SFO = "Single Facility Operation",
  INPUT_BAD_BC_CRN = "234rtf",
  INPUT_BAD_CRA = "123",
  INPUT_BAD_PHONE = "111",
  INPUT_BAD_POSTAL = "garbage",
  INPUT_BAD_WEB_SITE = "bad website",
  INPUT_BC_CRN = "AAA1111111",
  INPUT_BUSINESS_STRUCTRE = "General Partnership",
  INPUT_CRA = "123454321",
  INPUT_EMAIL = "test@test.com",
  INPUT_FIRST_NAME = "Test First Name",
  INPUT_LAST_NAME = "Test Last Name",
  INPUT_LEGAL_NAME = "New Legal Name",
  INPUT_OPERATION_NAME = "Test Operation Name",
  INPUT_PHONE = "604 401 5432",
  INPUT_PROFILE_USERNAME = "e2e_ first name* e2e_ last name*",
  INPUT_POSITION = "Test Position Title",
  INPUT_POSTAL_CODE = "H0H 0H0",
  INPUT_PROVINCE = "Alberta",
  INPUT_WEB_SITE = "https://www.website.com",
  PASSWORD = "_PASSWORD",
  PREFIX = "E2E_",
  STORAGE = "_STORAGE_STATE",
}

// 👋 Form fields selectors
export enum FormField {
  BC_CRN = "BC Corporate Registry Number*",
  BUSINESS_STRUCTURE = "Business Structure*",
  CRA = "CRA Business Number*",
  EMAIL = "Email Address*",
  FORM = "form",
  FIELDSET_OPERATOR = "fieldset#root",
  FIELDSET_PARENT_COMPANY_0 = "fieldset#root_parent_operators_array_0",
  FIELDSET_PARENT_COMPANY_1 = "fieldset#root_parent_operators_array_1",
  FIRST_NAME = "First Name*",
  HAS_PARENT_COMPANY = "#root_operator_has_parent_operators-0",
  IS_BUSINESS_ADDRESS_SAME = "Is the business mailing address the same as the physical address?",
  LAST_NAME = "Last Name*",
  LEGAL_NAME = "Legal Name*",
  MUNICIPALITY = "Municipality*",
  MUNICIPALITY_PHYSICAL = "#root_physical_municipality",
  MUNICIPALITY_MAILING = "#root_mailing_municipality",
  NAICS_CODE = "root_naics_code_id",
  OPERATION_NAME = "Operation Name*",
  OPERATION_TYPE = "Operation Type*",
  PHONE = "Phone Number*",
  PLACEHOLDER_LEGAL_NAME = "Enter Business Legal Name",
  PLACEHOLDER_CRA = "Enter CRA Business Number",
  POSITION = "Position Title*",
  POSTAL_CODE = "Postal Code*",
  POSTAL_CODE_PHYSICAL = "#root_physical_postal_code",
  POSTAL_CODE_MAILING = "#root_mailing_postal_code",
  PROVINCE = "Province*",
  PROVINCE_PHYSICAL = "#root_physical_province",
  PROVINCE_MAILING = "#root_mailing_province",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Business Legal Name",
  TITLE = "Operator Information",
  WEB_SITE = "Website (optional)",
  YES = "Yes",
}

// 👋 Form sections selectors
export enum FormSection {
  INFO_OPERATOR = "Operator Information",
  INFO_OPERATION = "Operation Information",
  INFO_POINT_CONTACT = "Point Of Contact",
  INFO_STATUTORY_DECLARATION = "Statutory Declaration",
  INFO_STATUTORY_DISCLAIMER = "Statutory Declaration and Disclaimer",
  INFO_USER = "User Information",
}

// 👋 keycloak selectors
export enum Keycloak {
  FIELD_USER_LOCATOR = "id=user",
  FIELD_PW_LOCATOR = "Password",
}

// 🔗 link src
export enum LinkSrc {
  TILE_REPORT_PROBLEM = "mailto:GHGRegulator@gov.bc.ca",
}

// 💬 Operations messages
export enum MessageTextOperations {
  ALERT_CARBON_TAX_EXEMPTION_APPROVED = "You have approved the application for a B.C. OBPS Regulated Operation ID.",
  ALERT_CARBON_TAX_EXEMPTION_DECLINED = "You have declined the application for a B.C. OBPS Regulated Operation ID.",
  NOTE_INTERNAL = "Once “Approved,” a B.C. OBPS Regulated Operation ID will be issued for the operation",
}

// 💬 Response messages
export enum MessageTextResponse {
  SETUP_SUCCESS = "Test setup complete.",
  SUBMIT_CONFIRMATION = "All changes have been successfully saved",
}

// 📝 Status LOV Operator
export { OperatorStatus };

// 🤳 UUIDs Operator
export enum OperatorUUID {
  DEFAULT = "4242ea9d-b917-4129-93c2-db00b7451051",
}

// 📝 Status LOV Operation
export { OperationStatus };

// 💬 Dashboard tiles
export enum TileTextDashboard {
  TILE_OPERATIONS = "Operations ➤",
  TILE_OPERATIONS_MINE = "My Operations",
  TILE_OPERATOR_MINE = "0 pending action(s) required",
  TILE_OPERATOR_SELECT = "1 pending action(s) required",
  TILE_OPERATORS = "Operators ➤",
  TILE_INDUSTRY_USERS = "User Access Management ➤",
  TILE_REPORT_PROBLEM = "Report problems to GHGRegulator@gov.bc.ca",
}

// 📝 Status LOV UserOperator
export { UserOperatorStatus };

// 🤳 UUIDs UserOperator
export enum UserOperatorUUID {
  INDUSTRY_USER_ADMIN = "9bb541e6-41f5-47d3-8359-2fab4f5bc4c0",
}

// 👋  Table data field selectors
export enum TableDataField {
  STATUS = "status",
  BCEID_BUSINESS_NAME = "bceid_business_name",
  NAME = "name",
  LEGAL_NAME = "legal_name",
}

export enum OperationTableDataField {
  STATUS = "status",
  BCGHG_ID = "bcghg_id",
  BORO_ID = "bc_obps_regulated_operation",
  OPERATION = "name",
  OPERATOR = "operator",
  SUBMISSION_DATE = "submission_date",
}

// Operation table header selectors
export enum OperationTableHeaders {
  ACTIONS = "Actions",
  BCGHG_ID = "BC GHG ID",
  BORO_ID = "BORO ID",
  OPERATION = "Operation",
  OPERATOR = "Operator",
  STATUS = "Application Status",
  SUBMISSION_DATE = "Submission Date",
}

// 👤  User roles
export enum UserRole {
  CAS_PENDING = "cas_pending",
  CAS_ANALYST = "cas_analyst",
  CAS_ADMIN = "cas_admin",
  INDUSTRY_USER = "industry_user",
  INDUSTRY_USER_ADMIN = "industry_user_admin",
  NEW_USER = "none",
}
