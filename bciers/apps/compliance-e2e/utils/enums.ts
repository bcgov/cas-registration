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
  EARNED_CREDITS = "Earned credits - not requested",
  OBLIGATION_NOT_MET = "Obligation - not met",
}

export enum ComplianceTaskTitles {
  DOWNLOAD_PAYMENT_INSTRUCTIONS = "Download Payment Instructions",
}

// Grid Columns
export enum ComplianceSummariesGridHeaders {
  DISPLAY_STATUS = "display_status",
}

// Grid Action Text
export enum GridActionText {
  MANAGE_OBLIGATION = "Manage Obligation",
  VIEW_DETAILS = "View Details",
  CONTACT_US = "Contact Us",
}
