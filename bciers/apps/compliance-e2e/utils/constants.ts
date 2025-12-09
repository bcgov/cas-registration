// --- Obligation form ---
export const INVOICE_NUMBER_FIELD = "#root_invoice_number";

export const ISSUANCE_STATUS_FIELD =
  'xpath=//label[@for="root_issuance_status"]/../following-sibling::div//span';

// --- No Obligation form ---
export const NO_OBLIGATION_OR_CREDITS_ALERT_REGEX =
  /No compliance obligation or earned credits for this operation over the \d{4} compliance period\./i;

// --- Request Issuance form ---
export const BCCR_HOLDING_ACCOUNT_INPUT = "#root_bccr_holding_account_id";
export const BCCR_TRADING_NAME_FIELD = "#root_bccr_trading_name";
export const BCCR_HOLDING_ACCOUNT_INPUT_VALUE = "000000000000000";
export const REQUEST_ISSUANCE_BUTTON_TEXT =
  "Request Issuance of Earned Credits";

// --- Review Request Issuance form ---
export const CONTINUE_BUTTON_TEXT = "Continue";

// --- URL patterns / base paths ---

export const COMPLIANCE_SUMMARIES_BASE_PATH =
  "/compliance/compliance-administration/compliance-summaries";

// Industry / obligation review
export const REVIEW_OBLIGATION_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-obligation-report$`,
);
export const NO_OBLIGATION_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-no-obligation-report$`,
);

export const DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/download-payment-instructions$`,
);

// Industry: request issuance of earned credits
export const REQUEST_ISSUANCE_CREDITS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/request-issuance-of-earned-credits$`,
);
// Final: track status of issuance (after request issuance of earned credits)
export const TRACK_STATUS_OF_ISSUANCE_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/track-status-of-issuance$`,
);

// Analyst: review credits issuance request
export const ANALYST_CONTINUE_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-earned-credits-report$`,
);

// Director: review by director
export const DIRECTOR_CONTINUE_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-earned-credits-report$`,
);

// Route pattern for intercepting PUT /earned-credits
export const EARNED_CREDITS_PUT_ROUTE_PATTERN =
  "**/api/compliance/compliance-report-versions/*/earned-credits";

// Regex to extract compliance_report_version_id from the URL
export const EARNED_CREDITS_CRV_ID_REGEX =
  /compliance-report-versions\/(\d+)\/earned-credits/;

// Test-only integration stub endpoint
export const E2E_INTEGRATION_STUB_PATH =
  "/api/compliance/test/e2e-integration-stub";

// Scenario name used by the Django stub to call to external API
export const EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO =
  "earned_credits_request_issuance";
