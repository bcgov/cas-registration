import Link from "next/link";
import AlertNote, {
  AlertType,
} from "@bciers/components/form/components/AlertNote";
import {
  ValidationErrors,
  ValidationItemError,
  ValidationSeverity,
  ValidationUIConfig,
} from "./types";

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
}: {
  href: string;
  label: string;
  openInNewTab?: boolean;
}) {
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

function renderMessageWithInlineLink(
  text: string,
  label?: string,
  href?: string,
  openInNewTab?: boolean,
) {
  if (!label || !href || !text.includes(label)) {
    return (
      <span>
        {text}{" "}
        {label && href && (
          <ValidationLink
            href={href}
            label={label}
            openInNewTab={openInNewTab}
          />
        )}
      </span>
    );
  }

  const index = text.indexOf(label);
  const before = text.slice(0, index);
  const after = text.slice(index + label.length);

  return (
    <span>
      {before}
      <ValidationLink href={href} label={label} openInNewTab={openInNewTab} />
      {after}
    </span>
  );
}

function renderMessage<TKey extends string>(
  key: TKey,
  error: ValidationItemError,
  configMap?: Partial<Record<TKey, ValidationUIConfig<TKey>>>, // <-- Optional
) {
  const config = configMap?.[key];
  const label = config?.resolveLabel(error);
  const href = config?.resolveHref(error);
  // Keys without a UI config (e.g. generic API errors like user_error) still
  // carry a backend message, so fall back to it before showing the raw key
  const message =
    config?.resolveFormattedMessage?.(error, key) || error.message || key;

  switch (config?.renderMode) {
    case "inline_link":
      return renderMessageWithInlineLink(
        message,
        label,
        href,
        config?.openInNewTab,
      );
    case "label_then_message":
      if (!label || !href) return <span>{message}</span>;
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

export interface ValidationSummaryProps<TKey extends string = string> {
  errors?: ValidationErrors<TKey>;
  config?: Partial<Record<TKey, ValidationUIConfig<TKey>>>; // <-- Make optional with '?'
}

export function ValidationErrorSummary<TKey extends string = string>({
  errors,
  config = {}, // <-- Provide default empty object fallback
}: Readonly<ValidationSummaryProps<TKey>>) {
  if (!errors?.length) return null;

  const severityOrder: Record<ValidationSeverity, number> = {
    Error: 0,
    Warning: 1,
    Info: 2,
  };

  const sorted = errors
    .map((entry, index) => ({ ...entry, originalIndex: index }))
    .sort((a, b) => {
      const diff =
        severityOrder[a.error.severity] - severityOrder[b.error.severity];
      if (diff !== 0) return diff;

      // Safe access with fallback object
      const priorityA = config?.[a.key]?.priority ?? 999;
      const priorityB = config?.[b.key]?.priority ?? 999;
      if (priorityA !== priorityB) return priorityA - priorityB;

      return a.originalIndex - b.originalIndex;
    });

  return (
    <div className="space-y-3 mt-4">
      {sorted.map(({ key, error }, index) => (
        <AlertNote
          key={`${key}-${index}`}
          id={`validation-${key}-${index}`}
          alertType={toAlertType(error.severity)}
        >
          {renderMessage(key, error, config)}
        </AlertNote>
      ))}
    </div>
  );
}
