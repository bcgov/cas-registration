import { IssuanceStatus } from "@bciers/utils/src/enums";

// MUI grid
export const GRID_ROOT = ".MuiDataGrid-root";

//  Compliance tab
export const COMPLIANCE_SUMMARIES_TAB = "compliance summaries";

// --- No Obligation form ---
export const NO_OBLIGATION_OR_CREDITS_ALERT_REGEX =
  /No compliance obligation or earned credits for this operation over the \d{4} compliance period\./i;

// --- Obligation form ---
export const INVOICE_NUMBER_FIELD = "#root_invoice_number";
export const GENERATE_INVOICE_BUTTON_TEXT = "Generate Compliance Invoice";

export const ISSUANCE_STATUS_FIELD =
  'xpath=//label[@for="root_issuance_status"]/../following-sibling::div//span';

// --- Request Issuance form ---
export const BCCR_HOLDING_ACCOUNT_INPUT_VALUE = "000000000000000";
export const BCCR_TRADING_NAME_FIELD_VALUE = "Mock Trading Name Inc.";
export const REQUEST_ISSUANCE_BUTTON_TEXT =
  "Request Issuance of Earned Credits";

// --- Review Request Issuance form ---
export const ANALYST_SUGGESTION_INPUT = "#root_analyst_suggestion";
export const CONTINUE_BUTTON_TEXT = "Continue";
export const FINAL_SUGGESTION_LOCKED_ERROR =
  "Updates are not allowed after the analyst has provided a final suggestion";

// --- Approve/Decline Director Review Request Issuance form ---
export const APPROVE_BUTTON_TEXT = "Approve";
export const DECLINE_BUTTON_TEXT = "Decline";

export type DirectorDecision =
  | IssuanceStatus.APPROVED
  | IssuanceStatus.DECLINED;

export const DECISION_TO_BUTTON: Record<DirectorDecision, string> = {
  [IssuanceStatus.APPROVED]: APPROVE_BUTTON_TEXT,
  [IssuanceStatus.DECLINED]: DECLINE_BUTTON_TEXT,
};

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

// Industry: scenario name used by the Django stub
export const EARNED_CREDITS_REQUEST_ISSUANCE_SCENARIO =
  "earned_credits_request_issuance";

// Analyst: review credits issuance request url
export const REVIEW_REQUEST_ISSUANCE_CREDITS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-credits-issuance-request/?(?:\\?.*)?$`,
);
export const TRACK_ISSUANCE_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/track-status-of-issuance/?(?:\\?.*)?$`,
);
// Director: review by director url
export const REVIEW_BY_DIRECTOR_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-by-director/?(?:\\?.*)?$`,
);

// Scenario name used by the Django stub for APPROVE (DECLINE doesn't need stub)
export const EARNED_CREDITS_DIRECTOR_APPROVE_SCENARIO =
  "earned_credits_director_approve";

// --- Invoice API ---
export const COMPLIANCE_INVOICE_API_BASE = "/compliance/api/invoice";
export type ComplianceInvoiceType =
  | "obligation"
  | "automatic-overdue-penalty"
  | "late-submission-penalty";

// --- Invoice PDF content ---
export const INVOICE_VOID_WATERMARK_REGEX = /VOID/i;
export const FEES_AND_ADJUSTMENTS_TEXT = "Fees and Adjustments";
export const INVOICE_NUMBER_LABEL_REGEX = /Invoice\s+#:/i;
export const DEFAULT_ADJUSTMENT_REGEX = /Supplementary Report Adjustment/i;

// Outstanding balance values matching E2E invoice mock data
export const INITIAL_OUTSTANDING_BALANCE_REGEX = /13[,.]?458/;
export const POST_ADJUSTMENT_OUTSTANDING_BALANCE_REGEX = /2[,.]?921/;
