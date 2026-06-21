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
import { validationUIConfig } from "./config";

type ValidationLinkProps = {
  href: string;
  label: string;
  openInNewTab?: boolean;
};

type ReportValidationSummaryProps = {
  errors?: ReportValidationErrors;
};

// Maps backend severity to AlertNote type
function toAlertType(severity: ValidationSeverity): AlertType {
  switch (severity) {
    case "Error":
      return "ERROR";
    case "Warning":
      return "ALERT";
    default:
      return "DEFAULT";
  }
}

function ValidationLink({
  href,
  label,
  openInNewTab,
}: Readonly<ValidationLinkProps>) {
  if (openInNewTab) {
    return (
      <a
        href={href}
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="underline">
      {label}
    </Link>
  );
}

// Replaces label text in message with a clickable link (inline)
// Else fall back to label as link
function renderMessageWithInlineLink(
  text: string,
  label?: string,
  href?: string,
  openInNewTab?: boolean,
) {
  if (!label || !href) {
    return <span>{text}</span>;
  }

  if (!text.includes(label)) {
    return (
      <span>
        {text}{" "}
        <ValidationLink href={href} label={label} openInNewTab={openInNewTab} />
      </span>
    );
  }

  const [before, ...rest] = text.split(label);
  const after = rest.join(label);

  return (
    <span>
      {before}
      <ValidationLink href={href} label={label} openInNewTab={openInNewTab} />
      {after}
    </span>
  );
}

// Renders message based on config-defined render mode
function renderValidationMessage(
  key: ReportValidationMessageKey,
  error: ReportValidationError,
) {
  const config = validationUIConfig[key];
  const label = config?.resolveLabel(error);
  const href = config?.resolveHref(error);
  const message = config?.resolveFormattedMessage(error, key) || key;

  switch (config?.renderMode) {
    case "inline_link":
      return renderMessageWithInlineLink(
        message,
        label,
        href,
        config?.openInNewTab,
      );

    case "label_then_message":
      if (!label || !href) {
        return <span>{message}</span>;
      }

      return (
        <span>
          <ValidationLink
            href={href}
            label={label}
            openInNewTab={config?.openInNewTab}
          />
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
    Error: 0,
    Warning: 1,
  };

  const sortedEntries = errors
    .map((entry, index) => ({ ...entry, originalIndex: index }))
    .sort((a, b) => {
      const severityDiff =
        severityOrder[a.error.severity] - severityOrder[b.error.severity];

      if (severityDiff !== 0) return severityDiff;

      const priorityA = validationUIConfig[a.key]?.priority ?? 999;
      const priorityB = validationUIConfig[b.key]?.priority ?? 999;

      if (priorityA !== priorityB) return priorityA - priorityB;

      return a.originalIndex - b.originalIndex;
    });

  return (
    <div className="space-y-3 mt-4">
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
