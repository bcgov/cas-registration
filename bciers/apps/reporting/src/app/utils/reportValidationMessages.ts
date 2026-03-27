import React from "react";

type ReportValidationMessageKey =
  | "missing_report_verification"
  | "verification_statement"
  | "missing_required_attachment_confirmation"
  | "missing_existing_attachment_confirmation"
  | "missing_supplementary_report_attachment_confirmation"
  | "missing_supplementary_report_version_change";

const reportValidationMessagesMap: Record<ReportValidationMessageKey, string> =
  {
    missing_report_verification:
      "Verification information must be completed on the Verification page.",
    verification_statement:
      "A verification statement must be uploaded with this report on the Attachments page.",
    missing_required_attachment_confirmation:
      "You must confirm that all required supplementary attachments have been uploaded on the Attachments page.",
    missing_existing_attachment_confirmation:
      "You must confirm that all existing attachments are still relevant to the supplementary submission on the Attachments page.",
    missing_supplementary_report_attachment_confirmation:
      "You must confirm that all required supplementary attachments have been uploaded and existing attchments are still relecant to the the supplementary submission on the Attachments page.",
    missing_supplementary_report_version_change:
      "A reason for the changes in this supplementary report must be provided on the Review Changes page.",
  };

const reportValidationLinkTextMap: Partial<
  Record<ReportValidationMessageKey, string>
> = {
  missing_report_verification: "Verification page",
  verification_statement: "Attachments page",
  missing_required_attachment_confirmation: "Attachments page",
  missing_existing_attachment_confirmation: "Attachments page",
  missing_supplementary_report_attachment_confirmation: "Attachments page",
  missing_supplementary_report_version_change: "Review Changes page",
};

const ALLOCATION_MISMATCH_KEY_PREFIX = "allocation_mismatch_facility_";
const ALLOCATION_MISMATCH_LINK_TEXT = "Allocation of Emissions page";

type HelpfulValidationError = {
  key: string;
  message: string;
  fix_url?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isHelpfulValidationError(
  value: unknown,
): value is HelpfulValidationError {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.message === "string" &&
    typeof value.key === "string" &&
    (value.fix_url === undefined || typeof value.fix_url === "string")
  );
}

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

export function getValidationErrorMessage(
  error: unknown,
): string | React.ReactNode {
  const messages = getValidationErrorMessages(error);
  return messages[0] ?? `${error}`;
}

function getDisplayMessage(error: HelpfulValidationError): string {
  if (error.key) {
    const key = extractErrorKey(error.key);
    if (key) {
      return reportValidationMessagesMap[key];
    }
  }

  return error.message;
}

function renderHelpfulError(
  error: HelpfulValidationError,
): string | React.ReactNode {
  const message = getDisplayMessage(error);

  if (error.fix_url) {
    const key = error.key ? extractErrorKey(error.key) : undefined;
    // Allocation mismatch errors have dynamic keys, so we check for the key prefix for those
    const linkText = key
      ? reportValidationLinkTextMap[key]
      : error.key?.startsWith(ALLOCATION_MISMATCH_KEY_PREFIX)
        ? ALLOCATION_MISMATCH_LINK_TEXT
        : undefined;

    if (linkText) {
      const messageParts = message.split(linkText);
      if (messageParts.length === 2) {
        return React.createElement(
          React.Fragment,
          null,
          messageParts[0],
          React.createElement("a", { href: `/${error.fix_url}` }, linkText),
          messageParts[1],
        );
      }
    }
    return React.createElement(
      React.Fragment,
      null,
      message + " ",
      React.createElement(
        "a",
        { href: `/${error.fix_url}` },
        "Click here to fix this issue.",
      ),
    );
  }

  return message;
}

export function getValidationErrorMessages(
  error: unknown,
): (string | React.ReactNode)[] {
  if (isObjectRecord(error) && Array.isArray(error.errors)) {
    const helpfulErrors = error.errors.filter(isHelpfulValidationError);

    if (helpfulErrors.length > 0) {
      return helpfulErrors.map(renderHelpfulError);
    }
  }

  const cleanedError = cleanErrorString(error);
  if (cleanedError) {
    return [cleanedError];
  }

  return [`${error}`];
}
