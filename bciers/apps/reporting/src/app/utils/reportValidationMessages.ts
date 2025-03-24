type ReportValidationMessageKey =
  | "missing_report_verification"
  | "verification_statement"
  | "emission"
  | "fuelType"
  | "gasType";

const reportValidationMessagesMap: Record<ReportValidationMessageKey, string> =
  {
    missing_report_verification:
      "Verification information must be completed with this report. Please complete the Verification page.",
    verification_statement:
      "A verification statement must be uploaded with this report. Please upload a verification statement on the Attachments page.",
    emission: "Emission is missing Emission.",
    fuelType: "Fuel is missing Fuel Name.",
    gasType: "Emission is missing Gas Type.",
  };

function extractErrorKey(
  error: unknown,
): ReportValidationMessageKey | undefined {
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

  // Check if the error string exactly matches one of the keys.
  for (const key of Object.keys(reportValidationMessagesMap)) {
    if (trimmedError === key) {
      return key as ReportValidationMessageKey;
    }
  }

  return undefined;
}

export function getValidationErrorMessage(error: unknown): string {
  const key = extractErrorKey(error);
  if (key) {
    return reportValidationMessagesMap[key];
  }
  return `${error}`;
}
