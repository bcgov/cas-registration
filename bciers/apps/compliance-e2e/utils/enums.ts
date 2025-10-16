export enum Actions {
  VIEW_DETAILS = "View Details",
  REQUEST_ISSUANCE_OF_CREDITS = "Request Issuance of Credits",
  PENDING_INVOICE_CREATION = "Pending Invoice Creation",
  MANAGE_OBLIGATION = "Manage Obligation",
}

export enum ComplianceStatus {
  EARNED_CREDITS_NOT_REQUESTED = "Earned credits - not requested",
  EARNED_CREDITS_REQUESTED = "Earned credits - issuance requested",
  EARNED_CREDITS_APPROVED = "Earned credits - approved",
  EARNED_CREDITS_DECLINED = "Earned credits - declined",
  EARNED_CREDITS_CHANGES_REQUIRED = "Earned credits - changes required",
  OBLIGATION_NOT_MET = "Obligation - not met",
  OBLIGATION_FULLY_MET = "Obligation - met",
  OBLIGATION_PENDING_INVOICE = "Obligation - pending invoice creation",
  NO_OBLIGATION_OR_EARNED_CREDITS = "No obligation or earned credits",
}

export const EarnedCredits: ReadonlyArray<ComplianceStatus> = [
  ComplianceStatus.EARNED_CREDITS_NOT_REQUESTED,
  ComplianceStatus.EARNED_CREDITS_REQUESTED,
  ComplianceStatus.EARNED_CREDITS_APPROVED,
  ComplianceStatus.EARNED_CREDITS_DECLINED,
  ComplianceStatus.EARNED_CREDITS_CHANGES_REQUIRED,
];

export const Obligation: ReadonlyArray<ComplianceStatus> = [
  ComplianceStatus.OBLIGATION_FULLY_MET,
  ComplianceStatus.OBLIGATION_NOT_MET,
  ComplianceStatus.OBLIGATION_PENDING_INVOICE,
];

export const NoObligationOrEarnedCredits: ReadonlyArray<ComplianceStatus> = [
  ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
];

export enum Operations {
  EARNED_CREDITS = "Compliance SFO - Earned credits",
  OBLIGATION = "Compliance SFO - Obligation not met",
  NO_OBLIGATION_OR_EARNED_CREDITS = "Compliance SFO - No obligation or earned credits",
}

export enum Paths {
  REVIEW_COMPLIANCE_EARNED_CREDITS_REPORT = "review-compliance-earned-credits-report",
  REVIEW_COMPLIANCE_OBLIGATION_REPORT = "review-compliance-obligation-report",
  REVIEW_COMPLIANCE_NO_OBLIGATION_REPORT = "review-compliance-no-obligation-report",
  PENDING_INVOICE_CREATION = "#",
  TRACK_STATUS_OF_ISSUANCE = "track-status-of-issuance",
  REVIEW_CREDITS_ISSUANCE_REQUEST = "review-credits-issuance-request",
  REVIEW_BY_DIRECTOR = "review-by-director",
}

export enum BCCRValues {
  BCCR_HOLDING_ACCOUNT_ID_BRAVO = "103200000028732",
  BCCR_TRADING_NAME_BRAVO = "Bravo Technologies",
  // BCCR_HOLDING_ACCOUNT_ID_SEPEHR = "103200000028824"
}

export enum AlertNotes {
  EARNED_CREDITS_NOT_REQUESTED = "The earned credits have not been issued yet.",
  EARNED_CREDITS_REQUESTED = "Your request has been submitted successfully.",
  APPROVED_BY_ANALYST = "Once the issuance request is approved, the earned credits will be issued to the holding account as identified above in B.C. Carbon Registry.",
}

export enum Comments {
  ANALYST_COMMENT = "E2E Analyst comment",
  DIRECTOR_COMMENT = "E2E Director comment",
}
