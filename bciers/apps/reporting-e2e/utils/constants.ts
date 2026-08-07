export const SIGN_OFF_SIGNATURE_LABEL =
  "Please add your signature by typing your name here:";

export const SIGN_OFF_SIGNATURE_NAME = "Test Signer";

export const SIGN_OFF_SUBMIT_BUTTON_TEXT = "Submit Report";

export const SUBMISSION_SUCCESS_TEXT = "Successful Submission";

export const SUBMISSION_SUCCESS_MESSAGE = {
  INITIAL: "You successfully submitted your report.",
  SUPPLEMENTARY: "You have successfully submitted a supplementary report.",
} as const;

export const REVIEW_CHANGES_DEFAULT_REASON = "Reason for change default";

export const REVIEW_CHANGES_REASON_LABEL = "Reason for change";

export const REVIEW_CHANGES_TEXT = {
  HEADING: "Review Changes",
  COMPLIANCE_NOTE:
    "Your compliance obligation may be affected by changes to the values you have made.",
  NO_CHANGES_DETECTED:
    "No changes detected between the selected report versions.",
  GSC_ACTIVITY: "General stationary combustion excluding line tracing",
} as const;

export const REVIEW_CHANGES_SECTIONS = {
  FACILITY: "Report Information",
  EMISSION_SUMMARY: "Emissions Summary (in tCO2e)",
  PRODUCTION_DATA: "Production Data",
  ALLOCATION_OF_EMISSIONS: "Allocation of Emissions",
  OPERATION_EMISSION_SUMMARY: "Operation Emission Summary (In tCO₂e)",
  COMPLIANCE_SUMMARY: "Compliance Summary",
} as const;

export const REVIEW_CHANGES_LABELS = {
  // Activity data
  EMISSION: "Emission",
  EQUIVALENT_EMISSION: "Equivalent Emission",
  // Emissions Summary / Operation Emission Summary
  ATTRIBUTABLE_FOR_REPORTING: "Emissions attributable for reporting",
  ATTRIBUTABLE_FOR_REPORTING_THRESHOLD:
    "Emissions attributable for reporting threshold",
  STATIONARY_FUEL_COMBUSTION: "Stationary fuel combustion emissions",
  // Production Data
  ANNUAL_PRODUCTION: "Annual Production",
  METHODOLOGY: "Production Quantification Methodology",
  METHODOLOGY_DESCRIPTION: "Production Methodology Description",
  // Allocation of Emissions
  TOTAL_EMISSIONS: "Total Emissions",
  TOTAL_ATTRIBUTABLE_FOR_REPORTING:
    "Total emissions attributable for reporting",
  // Compliance Summary — the capitalization differs from Emissions Summary
  EMISSIONS_ATTRIBUTABLE_FOR_REPORTING: "Emissions Attributable for Reporting",
  EMISSIONS_ATTRIBUTABLE_FOR_COMPLIANCE:
    "Emissions Attributable for Compliance",
  ALLOCATED_COMPLIANCE_EMISSIONS: "Allocated Compliance Emissions",
} as const;

// Report history grid — the newest version renders as "Current Version",
// older ones as "Version N" counting up from the oldest.
export const REPORT_HISTORY_CURRENT_VERSION = "Current Version";

export const reportHistoryVersionLabel = (version: number): string =>
  `Version ${version}`;

// Grid action menu items
export const GRID_ACTION_TEXT = {
  CREATE_SUPPLEMENTARY_REPORT: "Create supplementary report",
} as const;

// Dialog titles
export const DIALOG_TITLES = {
  CONFIRMATION: "Confirmation",
} as const;

// Dialog button labels
export const DIALOG_BUTTON_TEXT = {
  CONFIRM: "Confirm",
  CANCEL: "Cancel",
} as const;

// Form submit / navigation buttons
export const FORM_BUTTON_TEXT = {
  START: "Start",
  SAVE_AND_CONTINUE: "Save & Continue",
  SAVE: "Save",
  BACK: "Back",
  CONTINUE: "Continue",
  CANCEL: "Cancel",
  RETURN_TO_FACILITY_REPORTS: "Return To All Facility Reports",
} as const;

// Scenario name used by the Django stub to call to external API
export const SIGN_OFF_REPORT_SCENARIO = "submit_report";
export const REPORTING_REPORTS_BASE_PATH = "/reporting/reports";

// Action button text on the current reports grid
export const ACTION_BUTTON_TEXT = {
  START: "Start",
  CONTINUE: "Continue",
  VIEW_DETAILS: "View Details",
  VIEW_REPORT: "View Report",
  REPORT_HISTORY: "Report history",
  // Submission page shortcut, rendered for supplementary reports only
  VIEW_REPORT_HISTORY: "View report history",
  RETURN_TO_REPORT_TABLE: "Return to report table",
} as const;

export const GRID_BUTTON_TEXT = {
  FILE_PREVIOUS_YEARS_REPORT: "File previous years report",
} as const;
