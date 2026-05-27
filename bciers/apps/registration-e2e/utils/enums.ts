// 🚀 App routes for transfer pages
export enum TransferRoute {
  TRANSFERS = "registration/transfers",
  TRANSFER_ENTITY = "registration/transfers/transfer-entity",
}

// E2E values sourced from bc_obps/registration/fixtures/mock/
export enum TransferE2EValues {
  // Operators
  FROM_OPERATOR_NAME = "Bravo Technologies - has parTNER operator",
  TO_OPERATOR_NAME = "Alpha Enterprises",

  // Operation transfer
  OPERATION_NAME = "Bugle SFO - Registered",

  // Facility transfer
  FROM_OPERATION_NAME = "Banana LFO - Registered",
  TO_OPERATION_NAME = "Airplane LFO - Registered",
  FACILITY_NAME = "Facility 3",

  // Pre-existing fixture transfer used for edit/cancel tests
  FIXTURE_PENDING_OPERATION_NAME = "Bangles SFO",
  FIXTURE_PENDING_FACILITY_NAME = "Facility 10",

  // Effective dates
  PAST_DATE = "2024-01-01",
  FUTURE_DATE = "2099-12-31",
  NEW_EFFECTIVE_DATE = "2099-06-15",
}

// 📝 Transfer status values
export enum TransferStatus {
  TO_BE_TRANSFERRED = "To be transferred",
  TRANSFERRED = "Transferred",
}
