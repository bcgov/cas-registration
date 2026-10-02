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
 * Default fallback configuration usable across any domains
 */
export const defaultGenericErrorConfig = createValidationUIConfig({
  renderMode: "message_only",
  priority: 999,
  getMessage: (error) =>
    error.message ??
    "An internal server error has occurred. Please contact ghgregulator@gov.bc.ca for help.",
});

/**
 * Shared configuration map containing system-level fallbacks
 */
export const sharedValidationUIConfig: Record<
  "generic_error" | "user_error",
  ValidationUIConfig<any>
> = {
  generic_error: defaultGenericErrorConfig,
  user_error: createValidationUIConfig({
    renderMode: "message_only",
    priority: 990,
    getMessage: (error) => error.message ?? "An unexpected error occurred.",
  }),
};
