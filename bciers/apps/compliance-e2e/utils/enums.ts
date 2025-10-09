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

// export enum ExternalUserStatusToActionBinding {
//     EARNED_CREDITS_NOT_REQUESTED = Actions.REQUEST_ISSUANCE_OF_CREDITS,
//     EARNED_CREDITS_REQUESTED = Actions.VIEW_DETAILS,
//     EARNED_CREDITS_CHANGES_REQUIRED = Actions.REQUEST_ISSUANCE_OF_CREDITS,
//     EARNED_CREDITS_APPROVED = Actions.VIEW_DETAILS,
//     EARNED_CREDITS_DECLINED = Actions.VIEW_DETAILS,
//     OBLIGATION_FULLY_MET = Actions.VIEW_DETAILS,
//     OBLIGATION_NOT_MET = Actions.
// }
