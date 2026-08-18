import {
  ValidationItemError,
  ValidationUIConfig,
  ValidationUIConfigInput,
} from "./types";

/**
 * Generic factory to create standard UI configuration objects for validation error keys.
 */
export function createValidationUIConfig<TKey extends string = string>(
  config: ValidationUIConfigInput<TKey>,
): ValidationUIConfig<TKey> {
  return {
    ...config,
    resolveHref(error: ValidationItemError) {
      return this.getHref?.(error.context);
    },
    resolveLabel(error: ValidationItemError) {
      return typeof this.label === "function" ? this.label(error) : this.label;
    },
    resolveMessage(error: ValidationItemError, key: TKey) {
      return this.getMessage?.(error) ?? error.message ?? key;
    },
    resolveFormattedMessage(error: ValidationItemError, key: TKey) {
      const label = this.resolveLabel(error);
      const message = this.resolveMessage(error, key);

      if (this.formatMessage) {
        return this.formatMessage({ label, message, error });
      }

      return message;
    },
  };
}

/**
 * Default fallback configuration usable across any domain or application.
 */
export const defaultGenericErrorConfig = createValidationUIConfig({
  renderMode: "message_only",
  priority: 999,
  getMessage: (error) =>
    error.message ??
    "An unexpected error has occurred. Please try again or contact support for help.",
});
