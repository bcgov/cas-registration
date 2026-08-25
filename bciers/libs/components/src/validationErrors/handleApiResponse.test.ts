import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleApiResponse } from "./handleApiResponse";
import { ValidationErrors } from "./types";

describe("handleApiResponse", () => {
  let setErrors: ReturnType<typeof vi.fn<(errors?: ValidationErrors) => void>>;

  beforeEach(() => {
    setErrors = vi.fn();
  });

  describe("Validation Errors", () => {
    it("returns false and passes validation errors to setErrors when present", () => {
      const mockValidationErrors: ValidationErrors = [
        {
          key: "field_name",
          error: {
            severity: "Error",
            message: "Field is required",
          },
        },
      ];

      const response = {
        validation: {
          errors: mockValidationErrors,
        },
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledTimes(1);
      expect(setErrors).toHaveBeenCalledWith(mockValidationErrors);
    });

    it("prioritizes validation.errors over a generic error property", () => {
      const mockValidationErrors: ValidationErrors = [
        {
          key: "field_name",
          error: {
            severity: "Error",
            message: "Validation failed",
          },
        },
      ];

      const response = {
        validation: {
          errors: mockValidationErrors,
        },
        error: "Some generic error message",
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledWith(mockValidationErrors);
    });
  });

  describe("Generic Errors", () => {
    it("returns false and sets formatted error when response.error is a string", () => {
      const response = {
        error: "Unauthorized access",
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledTimes(1);
      expect(setErrors).toHaveBeenCalledWith([
        {
          key: "generic_error",
          error: {
            severity: "Error",
            message: "Unauthorized access",
          },
        },
      ]);
    });

    it("uses default fallback message when response.error is not a string", () => {
      const response = {
        error: { code: 500, detail: "Internal Server Error" },
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledWith([
        {
          key: "generic_error",
          error: {
            severity: "Error",
            message: "An unexpected error occurred.",
          },
        },
      ]);
    });

    it("uses default fallback message when response.error is boolean true", () => {
      const response = {
        error: true,
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledWith([
        {
          key: "generic_error",
          error: {
            severity: "Error",
            message: "An unexpected error occurred.",
          },
        },
      ]);
    });

    it("uses custom fallbackKey when provided", () => {
      type CustomKeys = "custom_fallback_key" | "other_key";

      const response = {
        error: "Custom error message",
      };

      const result = handleApiResponse<CustomKeys>(
        response,
        setErrors,
        "custom_fallback_key",
      );

      expect(result).toBe(false);
      expect(setErrors).toHaveBeenCalledWith([
        {
          key: "custom_fallback_key",
          error: {
            severity: "Error",
            message: "Custom error message",
          },
        },
      ]);
    });
  });

  describe("Success Scenarios", () => {
    it("returns true and clears errors when response is null or undefined", () => {
      const resultNull = handleApiResponse(null, setErrors);
      expect(resultNull).toBe(true);
      expect(setErrors).toHaveBeenCalledWith(undefined);

      setErrors.mockClear();

      const resultUndefined = handleApiResponse(undefined, setErrors);
      expect(resultUndefined).toBe(true);
      expect(setErrors).toHaveBeenCalledWith(undefined);
    });

    it("returns true and clears errors on a successful data payload", () => {
      const response = {
        id: "12345",
        status: "Active",
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(true);
      expect(setErrors).toHaveBeenCalledTimes(1);
      expect(setErrors).toHaveBeenCalledWith(undefined);
    });

    it("returns true and clears errors when validation.errors is an empty array", () => {
      const response = {
        validation: {
          errors: [],
        },
      };

      const result = handleApiResponse(response, setErrors);

      expect(result).toBe(true);
      expect(setErrors).toHaveBeenCalledWith(undefined);
    });
  });
});
