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
  ADD_OPERATOR = "Add Operator",
  ADD_PARENT_COMPANY = "Add another parent company",
  CONFIRM = "Confirm",
  CONTINUE = "Continue",
  GO_BACK = "Go Back",
  RETURN = "Return",
  REQUEST_ACCESS = "Request Access",
  REQUEST_ADMIN_ACCESS = "Request Administrator Access",
  SEARCH_OPERATOR = "Search Operator",
  SELECT_OPERATOR = "Select Operator",
  SUBMIT = "Submit",
  YES_OPERATOR = "Yes this is my operator",
}
// 💬 Dashboard tiles
export enum DashboardTileText {
  TILE_OPERATOR_SELECT = "Select Operator",
}

// E2E values
export enum E2EValue {
  FIXTURE_LEGAL_NAME = "Operator 1 Legal Name",
  INPUT_BAD_BC_CRN = "234rtf",
  INPUT_BAD_CRA = "123",
  INPUT_BAD_POSTAL = "garbage",
  INPUT_BC_CRN = "AAA1111111",
  INPUT_BUSINESS_STRUCTRE_0 = "General Partnership",
  INPUT_BUSINESS_STRUCTRE_1 = "BC Corporation",
  INPUT_CRA = "123454321",
  INPUT_LEGAL_NAME = "New Legal Name",
  INPUT_POSTAL_CODE = "H0H 0H0",
  INPUT_PROVINCE = "Alberta",
  SEARCH_CRA = "987654334",
  SEARCH_CRA_DENIED_ADMIN = "987654321",
  SEARCH_CRA_DENIED = "987654326",
  SEARCH_LEGAL_NAME = "Operator",
}

// Operator Form fields selectors
export enum OperatorFormField {
  BC_CRN = "BC Corporate Registry Number*",
  BUSINESS_STRUCTURE = "Business Structure*",
  CRA = "CRA Business Number*",
  FORM = "form",
  HEADER_OPERATOR = "Operator Information",
  HEADER_OPERATOR_ADDRESS = "Operator Address",
  HEADER_OPERATOR_PARENT = "Parent Company Information",
  HAS_PARENT_COMPANY = "Does this operator have one or more parent company?*",
  LEGAL_NAME = "Legal Name*",
  MUNICIPALITY = "Municipality*",
  POSITION = "Position Title*",
  POSTAL_CODE = "Postal Code*",
  PROVINCE = "Province*",
}

// Select Operator Form fields selectors
export enum SelectOperatorFormField {
  PLACEHOLDER_LEGAL_NAME = "Enter Business Legal Name",
  PLACEHOLDER_CRA = "Enter CRA Business Number",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Business Legal Name",
}

// 💬 Operator messages
export enum MessageTextOperatorSelect {
  NO_ACCESS = "Looks like you do not have access to",
  NO_ADMIN = "does not have Administrator access set up",
  OPERATOR_CONFIRM = "Kindly confirm if this is the operator that you represent.",
  REQUEST_ACCESS_CONFIRMED = "has been received and will be reviewed",
  REQUEST_ACCESS_ADMIN_CONFIRMED = "your", // access request for Operator 1 Legal Name
  REQUEST_ACCESS_DECLINED = "Your access request was declined by an Administrator",
  REQUEST_ACCESS_ADMIN_DECLINED = "Your access request was declined by an Administrator",
  SELECT_OPERATOR = "Which operator would you like to log in to?",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_CRA_NUMBER = "Enter CRA Business Number",
}
