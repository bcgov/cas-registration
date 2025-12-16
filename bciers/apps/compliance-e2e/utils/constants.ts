// MUI grid
export const GRID_ROOT = ".MuiDataGrid-root";

// --- No Obligation form ---
export const NO_OBLIGATION_OR_CREDITS_ALERT_REGEX =
  /No compliance obligation or earned credits for this operation over the \d{4} compliance period\./i;

// --- Obligation form ---
export const INVOICE_NUMBER_FIELD = "#root_invoice_number";

export const ISSUANCE_STATUS_FIELD =
  'xpath=//label[@for="root_issuance_status"]/../following-sibling::div//span';

// --- Request Issuance form ---
export const BCCR_HOLDING_ACCOUNT_INPUT = "#root_bccr_holding_account_id";
export const BCCR_HOLDING_ACCOUNT_INPUT_VALUE = "000000000000000";
export const BCCR_TRADING_NAME_FIELD = "#root_bccr_trading_name";
export const REQUEST_ISSUANCE_BUTTON_TEXT =
  "Request Issuance of Earned Credits";

// --- Review Request Issuance form ---
export const ANALYST_SUGGESTION_INPUT = "#root_analyst_suggestion";
export const CONTINUE_BUTTON_TEXT = "Continue";

// --- Approve/Decline Director Review Request Issuance form ---
export const APPROVE_BUTTON_TEXT = "Approve";

// --- URL patterns / base paths ---

export const COMPLIANCE_SUMMARIES_BASE_PATH =
  "/compliance/compliance-administration/compliance-summaries";

// Industry / no obligation review
export const NO_OBLIGATION_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-no-obligation-report$`,
);

// Industry / obligation review
export const REVIEW_OBLIGATION_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-obligation-report$`,
);
export const DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/download-payment-instructions$`,
);

// Industry / earned credits / request issuance of earned credits url
export const REQUEST_ISSUANCE_CREDITS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/request-issuance-of-earned-credits$`,
);

// Industry: regex to extract compliance_report_version_id from the endpoint request
export const EARNED_CREDITS_REQUEST_ISSUANCE_CRV_ID =
  /compliance-summaries\/(\d+)\/request-issuance-of-earned-credit/;

// Industry: scenario name used by the Django stub
export const EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO =
  "earned_credits_request_issuance";

// Analyst: review credits issuance request url
export const REVIEW_REQUEST_ISSUANCE_CREDITS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-credits-issuance-request$`,
);
// Director: review by director url
export const REVIEW_BY_DIRECTOR_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-by-director$`,
);

// Extract CRV id from director submit URL
export const DIRECTOR_REVIEW_CRV_ID =
  /compliance-summaries\/(\d+)\/review-by-director/;

// Scenario name used by the Django stub
export const EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO =
  "earned_credits_director_approve";
