// 🚀  App routes
export enum AppRoute {
  CONTACTS = "administration/contacts",
  DASHBOARD = "dashboard",
  OPERATIONS = "administration/operations",
  OPERATOR_ADD = "administration/select-operator/add-operator",
  OPERATOR_SELECT = "administration/select-operator",
  OPERATOR = "administration/my-operator",
  PROFILE = "administration/profile",
  USERS = "administration/users",
  ADMINISTRATION_DASHBOARD = "administration",
}

// 🔘 button text
export enum OperatorButtonText {
  ADD_OPERATOR = "Add Operator",
  ADD_PARENT_COMPANY = "Add another parent company",
  REQUEST_ACCESS = "Request Access",
  REQUEST_ADMIN_ACCESS = "Request Administrator Access",
  SEARCH_OPERATOR = "Search Operator",
  SELECT_OPERATOR = "Select Operator",
  YES_OPERATOR = "Yes this is my operator",
}
// 💬 Dashboard tiles
export enum DashboardTileText {
  TILE_OPERATOR = "My Operator",
  TILE_OPERATOR_SELECT = "Select an Operator",
}

// E2E values
export enum OperatorE2EValue {
  FIXTURE_LEGAL_NAME = "Operator 1 Legal Name",
  INPUT_BAD_BC_CRN = "234rtf",
  INPUT_BAD_CRA = "123",
  INPUT_BAD_POSTAL = "GAR BAG",
  INPUT_BC_CRN = "AAA1111111",
  INPUT_BC_CRN_PARTNER = "BBB1111111",
  INPUT_BUSINESS_ADDRESS = "123 Street",
  INPUT_BUSINESS_ADDRESS_PARENT = "457 Street",
  INPUT_BUSINESS_STRUCTRE_0 = "General Partnership",
  INPUT_BUSINESS_STRUCTRE_1 = "BC Corporation",
  INPUT_CRA = "123454321",
  INPUT_CRA_PARENT = "223454321",
  INPUT_CRA_PARTNER = "323454321",
  INPUT_LEGAL_NAME = "New Legal Name",
  INPUT_LEGAL_NAME_PARENT = "Parent Legal Name",
  INPUT_LEGAL_NAME_PARTNER = "Partner Legal Name",
  INPUT_MUNICIPALITY = "Muni Town",
  INPUT_MUNICIPALITY_PARENT = "Parent Muni Town",
  INPUT_POSTAL_CODE = "H0H 0H0",
  INPUT_POSTAL_CODE_PARENT = "A1A 1A1",
  INPUT_PROVINCE = "Alberta",
  INPUT_PROVINCE_PARENT = "Ontario",
  SEARCH_CRA = "987654334",
  SEARCH_CRA_DENIED = "987654321",
  SEARCH_CRA_DENIED_ADMIN = "987654333",
  SEARCH_LEGAL_NAME = "Operator",
}

// Operator Form fields selectors
export enum OperatorFormField {
  BC_CRN = "BC Corporate Registry Number*",
  CRA_LABEL = "CRA Business Number*",
  BUSINESS_ADDRESS = "Business Mailing Address*",
  BUSINESS_STRUCTURE = "Business Structure*",
  CRA = "cra_business_number",
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
  NAME_CRA = "cra_business_number",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
  SEARCH_BY_LEGAL_NAME = "Search by Business Legal Name",
}

// 💬 Operator messages
export enum MessageTextOperatorSelect {
  NO_ACCESS = "You do not currently have access to",
  NO_ADMIN = "does not have Administrator access set up",
  OPERATOR_CONFIRM = "Kindly confirm if this is the operator that you represent.",
  // The actual text for REQUEST_ACCESS_CONFIRMED is "Your access request has been sent to the Administrator(s) of Existing Operator 14 Legal Name for review."
  // However, this was repeatedly failing - I suspect the (s) was causing issues with the regex expression used for searching.
  // This shortened string works consistently.
  REQUEST_ACCESS_CONFIRMED = "Your access request has been sent to the Administrator",
  REQUEST_ACCESS_ADMIN_CONFIRMED = "Your access request as administrator",
  SELECT_OPERATOR = "Which operator would you like to log in to?",
  SEARCH_BY_CANADA_REVENUE = "Search by Canada Revenue Agency (CRA) Business Number",
}

export enum ContactButtonText {
  ADD_CONTACT = "Add Contact",
}

export enum ContactFootnote {
  CONTACT_FOOTNOTE = "you can assign this representative to an operation directly",
}

// Contacts Form fields selectors
export enum ContactFormField {
  FIRST_NAME = "First Name*",
  LAST_NAME = "Last Name*",
  POSITION = "Job Title / Position*",
  EMAIL_ADDRESS = "Business Email Address*",
  TELEPHONE_NUMBER = "Business Telephone Number*",
  MAILING_ADDRESS = "Business Mailing Address*",
  MUNICIPALITY = "Municipality*",
  PROVINCE = "Province*",
  POSTAL_CODE = "Postal Code*",
}

export enum ContactE2EValue {
  FIRST_NAME = "First Name",
  LAST_NAME = "Last Name",
  POSITION = "Tester",
  EMAIL_ADDRESS = "email@email.com",
  TELEPHONE_NUMBER = "403 403 4033",
  MAILING_ADDRESS = "4 Privet Dr",
  MUNICIPALITY = "Surrey",
  PROVINCE = "Alberta",
  POSTAL_CODE = "X1X1X1",
}

export enum IDE2EValue {
  OPERATION_NAME = "Brine LFO - Registered - No BORO and BCGHG ID",
  OPERATOR_NAME = "Bravo Technologies - has parTNER operator",
  EXPECTED_BCGHG_ID = "23251810001",
  EXPECTED_BORO_ID = "25-0001",
}

export enum SnackbarMessages {
  ISSUED_BCGHG_ID = "BCGHG ID issued successfully",
  ISSUED_BORO_ID = "BORO ID issued successfully",
}
