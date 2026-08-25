export type ValidationSeverity = "Error" | "Warning" | "Info";

export type ValidationRenderMode =
  "message_only" | "label_then_message" | "inline_link";

export interface ValidationItemError {
  severity: ValidationSeverity;
  message?: string;
  context?: Record<string, unknown>;
}

export interface ValidationItem<TKey extends string = string> {
  key: TKey;
  error: ValidationItemError;
}

export type ValidationTextArgs = {
  label?: string;
  message: string;
  error: ValidationItemError;
};

// A collection of validation items
export type ValidationErrors<TKey extends string = string> =
  ValidationItem<TKey>[];

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

export type ValidationUIConfigInput<TKey extends string = string> = Omit<
  ValidationUIConfig<TKey>,
  "resolveHref" | "resolveLabel" | "resolveMessage" | "resolveFormattedMessage"
>;
