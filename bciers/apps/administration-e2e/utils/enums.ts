// 🚀  App routes
export enum AppRoute {
  CONTACTS = "administration/contacts",
  DASHBOARD = "administration",
  OPERATIONS = "administration/operations",
  OPERATOR_SELECT = "administration/select-operator",
  OPERATOR = "administration/my-operator",
  PROFILE = "administration/profile",
  USERS = "administration/users",
}

// 🔘 button text
export enum ButtonText {
  ADD_OPERATION = "Add Operation",
  ADD_OPERATOR = "Add Operator",
  ADD_PARENT_COMPANY = "Add another parent company",
  APPLICATION_APPROVE = "Approve application",
  APPLICATION_REJECT = "Reject application",
  APPLICATION_REQUEST_CHANGE = "Request Changes",
  APPLICATION_REQUEST_CHANGE_CANCEL = "Cancel Change Request",
  APPLICATION_REQUEST_CHANGE_CONFIRM = "Confirm Change Request",
  APPLICATION_REQUEST_CHANGE_UNDO = "Undo Request Changes",
  APPROVE = "Approve",
  CANCEL = "Cancel",
  CONFIRM = "Confirm",
  CONTINUE = "Continue",
  DECLINE = "Decline",
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
  UNDO = "Undo",
  VIEW_DETAILS = "View Details",
  YES_OPERATOR = "Yes this is my operator",
}

// 💬 Dashboard tiles
export enum DashboardTileText {
  TILE_OPERATIONS = "Operations",
  TILE_OPERATOR_MINE = "My Operator",
  TILE_OPERATOR_SELECT = "Select an Operator",
}

// E2E values
export enum E2EValue {
  FIXTURE_EXISTING = "Existing",
  FIXTURE_LEGAL_NAME = "Operator 1 Legal Name",
  FIXTURE_NAICS = "211110 - Oil and gas extraction (except oil sands)",
  FIXTURE_OPERATOR_NEW = "New Operator",
  FIXTURE_OPERATOR_EXISTING = "Existing Operator",
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
  SEARCH_CRA = "987654324",
  SEARCH_CRA_DENIED = "987654321",
  SEARCH_LEGAL_NAME = "Operator",
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

// 💬 Operator messages
export enum MessageTextOperatorSelect {
  INPUT_CRA = "Enter CRA Business Number",
  NO_ACCESS = "Looks like you do not have access to",
  NO_ADMIN = "does not have Administrator access set up",
  OPERATOR_CONFIRM = "Kindly confirm if this is the operator that you represent.",
  REQUEST_ACCESS = "Your access request has been sent",
  REQUEST_ADD = "Your request to add",
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
export enum MessageTextResponse {
  SETUP_SUCCESS = "Test setup complete.",
}

// 📝 Status LOV Operator
import { OperatorStatus } from "@bciers/utils/enums";
export { OperatorStatus };

// 🤳 UUIDs Operator
export enum OperatorUUID {
  DEFAULT = "4242ea9d-b917-4129-93c2-db00b7451051",
}

// 📝 Status LOV Operation
import { OperationStatus } from "@bciers/utils/enums";
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
import { UserOperatorStatus } from "@bciers/utils/enums";
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
