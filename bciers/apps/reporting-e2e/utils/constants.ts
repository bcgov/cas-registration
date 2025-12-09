export const SIGN_OFF_SIGNATURE_LABEL =
  "Please add your signature by typing your name here:";

export const SIGN_OFF_SUBMIT_BUTTON_TEXT = "Submit Report";

export const TEST_SIGNATURE_NAME = "Test Signer";

export const SUBMISSION_SUCCESS_TEXT = "Successful Submission";

// sign-off form
export const SUBMIT_REPORT_ROUTE_PATTERN = "**/reporting/reports/*/sign-off";

export const DJANGO_API_BASE_URL = (
  process.env.API_URL ?? "http://127.0.0.1:8000/api/"
).replace(/\/+$/, "");
export const E2E_INTEGRATION_STUB_PATH = "/compliance/e2e-integration-stub";
export const SUBMIT_REPORT_SCENARIO = "submit_report";
