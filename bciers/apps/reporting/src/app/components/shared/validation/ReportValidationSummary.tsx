import Link from "next/link";
import AlertNote, {
  AlertType,
} from "@bciers/components/form/components/AlertNote";

import type {
  ReportValidationError,
  ReportValidationErrors,
  ReportValidationMessageKey,
  ValidationSeverity,
} from "./types";
import {
  getFormattedValidationMessage,
  getValidationErrorHref,
  getValidationErrorLabel,
  getValidationUIConfig,
} from "./utils";

type ReportValidationSummaryProps = {
  errors?: ReportValidationErrors;
};

// Maps backend severity to AlertNote type
function toAlertType(severity: ValidationSeverity): AlertType {
  switch (severity) {
    case "error":
      return "ERROR";
    case "warning":
      return "ALERT";
    default:
      return "DEFAULT";
  }
}

// Replaces label text in message with a clickable link (inline)
// Note: validationUIConfig label must exactly match the text in the validationUIConfig message
function renderMessageWithInlineLink(
  text: string,
  label?: string,
  href?: string,
) {
  if (!label || !href || !text.includes(label)) {
    return <span>{text}</span>;
  }

  const [before, ...rest] = text.split(label);
  const after = rest.join(label);

  return (
    <span>
      {before}
      <Link href={href} className="underline">
        {label}
      </Link>
      {after}
    </span>
  );
}

// Renders message based on config-defined render mode
function renderValidationMessage(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
) {
  const config = getValidationUIConfig(key);
  const label = getValidationErrorLabel(key, error);
  const href = getValidationErrorHref(key, error);
  const message = getFormattedValidationMessage(key, error);

  switch (config?.renderMode) {
    case "inline_link":
      return renderMessageWithInlineLink(message, label, href);

    case "label_then_message":
      if (!label || !href) {
        return <span>{message}</span>;
      }

      return (
        <span>
          <Link href={href} className="underline">
            {label}
          </Link>
          : {message}
        </span>
      );

    case "message_only":
    default:
      return <span>{message}</span>;
  }
}

export default function ReportValidationSummary({
  errors,
}: Readonly<ReportValidationSummaryProps>) {
  if (!errors?.length) return null;

  const severityOrder: Record<ValidationSeverity, number> = {
    error: 0,
    warning: 1,
  };

  const sortedEntries = [...errors].sort(
    (a, b) => severityOrder[a.error.severity] - severityOrder[b.error.severity],
  );

  return (
    <div className="space-y-3">
      {sortedEntries.map(({ key, error }, index) => (
        <AlertNote
          key={`${key}-${index}`}
          id={`report-validation-${key}-${index}`}
          alertType={toAlertType(error.severity)}
        >
          {renderValidationMessage(key, error)}
        </AlertNote>
      ))}
    </div>
  );
}
