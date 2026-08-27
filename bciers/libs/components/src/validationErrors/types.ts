/**
 * Defines the severity level of a validation item
 */
export type ValidationSeverity = "Error" | "Warning" | "Info";

/**
 * Determines how a validation error should be rendered in the UI
 */
export type ValidationRenderMode =
  "message_only" | "label_then_message" | "inline_link";

/**
 * Core error details returned from validation checks or API responses
 */
export interface ValidationItemError {
  severity: ValidationSeverity;
  message?: string;
  context?: Record<string, unknown>;
}

/**
 * Represents a single validation item paired with its specific key
 */
export interface ValidationItem<TKey extends string = string> {
  key: TKey;
  error: ValidationItemError;
}

/**
 * Arguments passed to message formatting functions
 */
export type ValidationTextArgs = {
  label?: string;
  message: string;
  error: ValidationItemError;
};

/**
 * A collection array of validation items
 */
export type ValidationErrors<TKey extends string = string> =
  ValidationItem<TKey>[];

/**
 * Base system-level error keys
 */
export type BaseValidationMessageKey = "generic_error" | "user_error";

/**
 * Extensible validation message key type
 * Allows consuming applications to merge custom domain keys with shared base keys
 */
export type ValidationMessageKey<T = string> = BaseValidationMessageKey | T;

/**
 * Configuration schema for rendering validation errors in the UI
 */
export type ValidationUIConfig<TKey extends string = string> = {
  label?: string | ((error: ValidationItemError) => string);
  priority?: number;
  renderMode: ValidationRenderMode;
  openInNewTab?: boolean;
  getHref?: (ctx: Record<string, unknown> | undefined) => string | undefined;
  getMessage?: (error: ValidationItemError) => string;
  formatMessage?: (args: {
    label?: string;
    message: string;
    error: ValidationItemError;
  }) => string;

  resolveHref: (error: ValidationItemError) => string | undefined;
  resolveLabel: (error: ValidationItemError) => string | undefined;
  resolveMessage: (error: ValidationItemError, key: TKey) => string;
  resolveFormattedMessage: (error: ValidationItemError, key: TKey) => string;
};

/**
 * Input configuration type excluding pre-computed resolver methods
 */
export type ValidationUIConfigInput<TKey extends string = string> = Omit<
  ValidationUIConfig<TKey>,
  "resolveHref" | "resolveLabel" | "resolveMessage" | "resolveFormattedMessage"
>;
