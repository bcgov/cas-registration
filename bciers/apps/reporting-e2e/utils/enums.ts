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

// Matching facility ids for report record ids
export enum FacilityIDs {
  OBLIGATION_NOT_MET = "9f7b0848-021e-4d08-9852-10524c4e5457",
  EARNED_CREDITS = "1",
  NO_OBLIGATION = "2",
  BUGLE_SFO = "f486f2fb-62ed-438d-bb3e-0819b51e3aff",
  BAT_LFO = "b66d0364-ad1d-42f4-93d9-82bf185c4304",
}

// Report workflow routes
export enum ReportRoutes {
  SIGN_OFF = "sign-off",
  SUBMISSION = "submission",
  REVIEW_OPERATION_INFORMATION = "review-operation-information",
  REVIEW_FACILITY_INFORMATION = "review-facility-information",
  PERSON_RESPONSIBLE = "person-responsible",
  FACILITY_REPORT_GRID = "facilities/report-information",
  REVIEW_FACILITIES = "facilities/review-facilities",
  FACILITIES = "facilities",
  ACTIVITIES = "activities",
  NON_ATTRIBUTABLE = "non-attributable",
  EMISSION_SUMMARY = "emission-summary",
  PRODUCTION_DATA = "production-data",
  ALLOCATION_OF_EMISSIONS = "allocation-of-emissions",
  ADDITIONAL_REPORTING_DATA = "additional-reporting-data",
  REVIEW_CHANGES = "review-changes",
  VALIDATION = "report-validation",
  FINAL_REVIEW = "final-review",
  ATTACHMENTS = "attachments",
}

// Attachment checkboxes
export enum AttachmentCheckboxLabel {
  UPDATED_REQUIRED = "uploaded any attachments that are required to be updated",
  STILL_RELEVANT = "previously uploaded attachments that have not been updated are still relevant",
}

// Sign-off checkboxes
export enum SignOffCheckboxLabel {
  /** Non-EIO: acknowledgement_of_review */
  REVIEW = "I certify that I have reviewed the annual report",

  /** EIO: acknowledgement_of_certification */
  CERTIFICATION = "I have reviewed this report and certify that the amount of total emissions reported",

  /** Shared across flows */
  RECORDS = "may require records from the Operator",

  /** Non-EIO */
  INFORMATION = "this information is being collected for the purpose of emission reporting",
  COSTS = "will impact the compliance obligation of this operation",

  /** EIO */
  ERRORS = "any errors, omissions, or misstatements provided in this report",

  /** Supplementary */
  NEW_VERSION = "I understand that, by submitting these changes, I am creating a new version of this annual report",

  /** Supplementary + regulated */
  CORRECTIONS = "the correction of any errors, omissions, or misstatements in the new submission",
}

export const OPERATION_NAMES = {
  OBLIGATION_NOT_MET: "Compliance SFO - Obligation not met",
  EARNED_CREDITS: "Compliance SFO - Earned credits",
  NO_OBLIGATION: "Compliance SFO - No obligation",
  BUGLE_SFO: "Bugle SFO - Registered",
  BAT_LFO: "Bat LFO - Registered - name from admin",
} as const;

export const REPORT_ID_TO_OPERATION_NAME: Record<ReportIDs, string> = {
  [ReportIDs.OBLIGATION_NOT_MET]: OPERATION_NAMES.OBLIGATION_NOT_MET,
  [ReportIDs.EARNED_CREDITS]: OPERATION_NAMES.EARNED_CREDITS,
  [ReportIDs.NO_OBLIGATION]: OPERATION_NAMES.NO_OBLIGATION,
};
