// App routes
export enum AppRoutes {
  GRID_COMPLIANCE_SUMMARIES = "compliance/compliance-administration",
}

// Compliance Categories
export enum ComplianceOperations {
  NO_OBLIGATION = "Compliance SFO - No obligation or earned credits",
  EARNED_CREDITS = "Compliance SFO - Earned credits",
  OBLIGATION_NOT_MET = "Compliance SFO - Obligation not met",
}

export enum ComplianceDisplayStatus {
  NO_OBLIGATION = "No obligation or earned credits",
  OBLIGATION_NOT_MET = "Obligation - not met",
  EARNED_CREDITS_NOT_REQUESTED = "Earned credits - not requested",
  EARNED_CREDITS_REQUESTED = "Earned credits - issuance requested",
  EARNED_CREDITS_CHANGES_REQUIRED = "Earned credits - changes required",
  EARNED_CREDITS_APPROVED = "Earned credits - approved",
  EARNED_CREDITS_DECLINED = "Earned credits - declined",
}

export enum ComplianceTaskTitles {
  DOWNLOAD_PAYMENT_INSTRUCTIONS = "Download Payment Instructions",
  REQUEST_ISSUANCE = "Request Issuance of Earned Credits",
  REVIEW_REQUEST_ISSUANCE = "Review Credits Issuance Request",
  REVIEW_BY_DIRECTOR = "Review by Director",
}

// Grid Columns
export enum ComplianceSummariesGridHeaders {
  DISPLAY_STATUS = "display_status",
}

// Grid Action Text

export enum GridActionText {
  REQUEST_ISSUANCE_CREDITS = "Request Issuance of Credits",
  REVIEW_REQUEST_ISSUANCE = "Review Credits Issuance Request",
  MANAGE_OBLIGATION = "Manage Obligation",
  VIEW_DETAILS = "View Details",
  CONTACT_US = "Contact Us",
  REVIEW_CHANGE_REQUIRED = "Review Change Required",
}
