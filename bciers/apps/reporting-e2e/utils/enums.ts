// App routes
export enum AppRoutes {
  GRID_REPORTING_CURRENT_REPORTS = "reporting/reports",
}

export const GRID_ROOT = ".MuiDataGrid-root";
export const REPORTING_TAB = "reporting";

// Report record ids
export enum ReportIDs {
  OBLIGATION_NOT_MET = "3",
  EARNED_CREDITS = "4",
  NO_OBLIGATION = "5",
}

// Matching facility ids for report record ids
export enum FacilityIDs {
  OBLIGATION_NOT_MET = "9f7b0848-021e-4d08-9852-10524c4e5457",
  EARNED_CREDITS = "",
  NO_OBLIGATION = "",
}

// Report workflow routes
export enum ReportRoutes {
  SIGN_OFF = "sign-off",
  SUBMISSION = "submission",
  REVIEW_OPERATION_INFORMATION = "review-operation-information",
  FACILITIES = "facilities",
  PRODUCTION_DATA = "production-data",
}

// Minimal unique substrings for sign-off checkbox labels
export enum SignOffCheckboxLabel {
  COSTS = "will impact the compliance obligation of this operation",
  ERRORS = "any errors, omissions, or misstatements provided in this report",
  INFORMATION = "this information is being collected for the purpose of emission reporting",
  RECORDS = "may require records from the Operator",
  REVIEW = "I certify that I have",
}
