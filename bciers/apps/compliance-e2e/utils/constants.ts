export const SIGN_OFF_SIGNATURE_LABEL =
  "Please add your signature by typing your name here:";

export const SIGN_OFF_SUBMIT_BUTTON_TEXT = "Submit Report";

export const TEST_SIGNATURE_NAME = "Test Signer";

export const SUBMISSION_SUCCESS_TEXT = "Successful Submission";

export const INVOICE_NUMBER_FIELD = "#root_invoice_number";
export const ISSUANCE_STATUS_FIELD =
  'xpath=//label[@for="root_issuance_status"]/../following-sibling::div//span';

export const COMPLIANCE_SUMMARIES_BASE_PATH =
  "/compliance/compliance-administration/compliance-summaries";

export const REVIEW_OBLIGATION_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-obligation-report$`,
);
export const NO_OBLIGATION_URL_PATTERN = `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/review-compliance-no-obligation-report$`;

export const DOWNLOAD_PAYMENT_INSTRUCTIONS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/download-payment-instructions$`,
);

export const REQUEST_ISSUANCE_CREDITS_URL_PATTERN = new RegExp(
  `${COMPLIANCE_SUMMARIES_BASE_PATH}/\\d+/request-issuance-of-earned-credits$`,
);
