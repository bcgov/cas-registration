// App routes
export enum AppRoutes {
  GRID_REPORTING_CURRENT_REPORTS = "reporting/reports",
}

// Report record ids
export enum ReportIDs {
  OBLIGATION_NOT_MET = "3",
  EARNED_CREDITS = "4",
  NO_OBLIGATION = "5",
}

// Report workflow routes
export enum ReportRoutes {
  SIGN_OFF = "sign-off",
  SUBMISSION = "submission",
}

// Minimal unique substrings for sign-off checkbox labels
export enum SignOffCheckboxLabel {
  COSTS = "will impact the compliance obligation of this operation",
  ERRORS = "any errors, omissions, or misstatements provided in this report",
  INFORMATION = "this information is being collected for the purpose of emission reporting",
  RECORDS = "may require records from the Operator",
  REVIEW = "I certify that I have",
}
