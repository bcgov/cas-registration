type ReportValidationMessageKey =
  | "missing_report_verification"
  | "verification_statement"
  | "fuelType"
  | "gasType"
  | "missing_required_attachment_confirmation"
  | "missing_existing_attachment_confirmation"
  | "missing_supplementary_report_attachment_confirmation";

const reportValidationMessagesMap: Record<ReportValidationMessageKey, string> =
  {
    missing_report_verification:
      "Verification information must be completed with this report. Please complete the Verification page.",
    verification_statement:
      "A verification statement must be uploaded with this report. Please upload a verification statement on the Attachments page.",
    fuelType: "Fuel is missing Fuel Name.",
    gasType: "Emission is missing Gas Type.",
    missing_required_attachment_confirmation:
      "You must confirm that all required supplementary attachments have been uploaded on the Attachments page.",
    missing_existing_attachment_confirmation:
      "You must confirm that all existing attachments are still relevant to the supplementary submission on the Attachments page.",
    missing_supplementary_report_attachment_confirmation:
      "No attachment confirmation found for this report version. Please confirm the attachments on the Attachments page.", // Added the message here
  };

function extractErrorKey(
  error: string,
): ReportValidationMessageKey | undefined {
  for (const key of Object.keys(reportValidationMessagesMap)) {
    if (error === key) {
      return key as ReportValidationMessageKey;
    }
  }
  return undefined;
}

function cleanErrorString(error: unknown): string {
  const errorStr =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  let trimmedError = errorStr.trim();

  // If the error string is wrapped in single or double quotes, remove them.
  if (
    (trimmedError.startsWith("'") && trimmedError.endsWith("'")) ||
    (trimmedError.startsWith('"') && trimmedError.endsWith('"'))
  ) {
    trimmedError = trimmedError.slice(1, -1).trim();
  }

  return trimmedError;
}

function getAllocationMismatchMessage(errorStr: string): string {
  // Everything before the colon is the error key, and looks scary, so we strip it out.
  const msgStartIndex = errorStr.indexOf(":");
  return msgStartIndex !== -1
    ? errorStr.substring(msgStartIndex + 1).trim()
    : "";
}

function handleAllocationMismatchError(errorStr: string): string | undefined {
  const prefix = "Allocation Mismatch Facility ";
  if (errorStr.startsWith(prefix)) {
    return `${getAllocationMismatchMessage(errorStr)}`;
  }
  return undefined;
}

export function getValidationErrorMessage(error: unknown): string {
  const errorString = cleanErrorString(error);
  const key = extractErrorKey(errorString);
  if (key) {
    return reportValidationMessagesMap[key];
  }

  const allocationMismatchError = handleAllocationMismatchError(errorString);
  if (allocationMismatchError) {
    return allocationMismatchError;
  }

  return `${error}`;
}
