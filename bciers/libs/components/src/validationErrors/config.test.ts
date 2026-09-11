import { describe, it, expect, vi } from "vitest";
import { createValidationUIConfig, defaultGenericErrorConfig } from "./config";
import type { ValidationItemError, ValidationUIConfigInput } from "./types";

describe("createValidationUIConfig", () => {
  const baseError: ValidationItemError = {
    severity: "Error",
  };

  describe("resolveHref", () => {
    it("returns undefined when getHref is not provided", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
      });

      expect(config.resolveHref(baseError)).toBeUndefined();
    });

    it("executes getHref with error.context", () => {
      const getHrefMock = vi.fn((context?: Record<string, any>) =>
        context?.id ? `/items/${context.id}` : "/items",
      );

      const config = createValidationUIConfig({
        renderMode: "inline_link",
        getHref: getHrefMock,
      });

      const errorWithContext: ValidationItemError = {
        ...baseError,
        context: { id: 42 },
      };

      const result = config.resolveHref(errorWithContext);

      expect(getHrefMock).toHaveBeenCalledWith({ id: 42 });
      expect(result).toBe("/items/42");
    });
  });

  describe("resolveLabel", () => {
    it("returns undefined when label is not provided", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
      });

      expect(config.resolveLabel(baseError)).toBeUndefined();
    });

    it("returns the static string when label is a string", () => {
      const config = createValidationUIConfig({
        renderMode: "inline_link",
        label: "Click Here",
      });

      expect(config.resolveLabel(baseError)).toBe("Click Here");
    });

    it("executes label function with the error object when label is a function", () => {
      const labelMock = vi.fn(
        (error: ValidationItemError) => `Error (${error.severity})`,
      );

      const config = createValidationUIConfig({
        renderMode: "inline_link",
        label: labelMock,
      });

      const result = config.resolveLabel(baseError);

      expect(labelMock).toHaveBeenCalledWith(baseError);
      expect(result).toBe("Error (Error)");
    });
  });

  describe("resolveMessage", () => {
    it("prefers getMessage result when getMessage is defined", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
        getMessage: () => "Custom computed message",
      });

      const errorWithMessage: ValidationItemError = {
        ...baseError,
        message: "API error message",
      };

      expect(config.resolveMessage(errorWithMessage, "test_key")).toBe(
        "Custom computed message",
      );
    });

    it("falls back to error.message when getMessage is not provided", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
      });

      const errorWithMessage: ValidationItemError = {
        ...baseError,
        message: "Direct API message",
      };

      expect(config.resolveMessage(errorWithMessage, "test_key")).toBe(
        "Direct API message",
      );
    });

    it("falls back to key when neither getMessage nor error.message are provided", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
      });

      expect(config.resolveMessage(baseError, "fallback_key")).toBe(
        "fallback_key",
      );
    });
  });

  describe("resolveFormattedMessage", () => {
    it("returns resolveMessage output when formatMessage is not defined", () => {
      const config = createValidationUIConfig({
        renderMode: "message_only",
        getMessage: () => "Standard message",
      });

      expect(config.resolveFormattedMessage(baseError, "test_key")).toBe(
        "Standard message",
      );
    });

    it("calls formatMessage with label, message, and error when formatMessage is provided", () => {
      const formatMessageMock = vi.fn(
        ({ label, message }) => `${message} -> See ${label}`,
      );

      const config = createValidationUIConfig({
        renderMode: "inline_link",
        label: "Documentation",
        getMessage: () => "Field is invalid.",
        formatMessage: formatMessageMock,
      });

      const result = config.resolveFormattedMessage(baseError, "test_key");

      expect(formatMessageMock).toHaveBeenCalledWith({
        label: "Documentation",
        message: "Field is invalid.",
        error: baseError,
      });
      expect(result).toBe("Field is invalid. -> See Documentation");
    });
  });

  describe("passthrough properties", () => {
    it("preserves extra input config properties", () => {
      const input: ValidationUIConfigInput<"custom_key"> = {
        renderMode: "inline_link",
        priority: 10,
        openInNewTab: true,
      };

      const config = createValidationUIConfig(input);

      expect(config.renderMode).toBe("inline_link");
      expect(config.priority).toBe(10);
      expect(config.openInNewTab).toBe(true);
    });
  });
});

describe("defaultGenericErrorConfig", () => {
  const baseError: ValidationItemError = {
    severity: "Error",
  };

  it("has priority 999 and renderMode message_only", () => {
    expect(defaultGenericErrorConfig.priority).toBe(999);
    expect(defaultGenericErrorConfig.renderMode).toBe("message_only");
  });

  it("returns error.message if provided", () => {
    const errorWithMsg: ValidationItemError = {
      ...baseError,
      message: "Server is unavailable",
    };

    expect(
      defaultGenericErrorConfig.resolveMessage(errorWithMsg, "generic_error"),
    ).toBe("Server is unavailable");
  });

  it("returns the default fallback message when error.message is not provided", () => {
    expect(
      defaultGenericErrorConfig.resolveMessage(baseError, "generic_error"),
    ).toBe(
      "An unexpected error has occurred. Please try again or contact support for help.",
    );
  });
});
