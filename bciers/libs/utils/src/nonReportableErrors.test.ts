import isNonReportableError, {
  NON_REPORTABLE_ERROR_KEYS,
} from "@bciers/utils/src/nonReportableErrors";

const buildError = (key: string) => ({
  key,
  error: { severity: "Error", message: "Something went wrong" },
});

describe("isNonReportableError", () => {
  it("returns true when every error is flagged as non-reportable", () => {
    NON_REPORTABLE_ERROR_KEYS.forEach((key) => {
      expect(isNonReportableError({ errors: [buildError(key)] })).toBe(true);
    });
  });

  it("returns false for reportable keys", () => {
    expect(
      isNonReportableError({ errors: [buildError("generic_error")] }),
    ).toBe(false);
  });

  it("returns false when only some errors are non-reportable", () => {
    expect(
      isNonReportableError({
        errors: [buildError("user_error"), buildError("generic_error")],
      }),
    ).toBe(false);
  });

  it("returns false for bodies without a usable errors list", () => {
    expect(isNonReportableError({ errors: [] })).toBe(false);
    expect(isNonReportableError({ message: "No errors key" })).toBe(false);
    expect(isNonReportableError(undefined)).toBe(false);
  });

  it("returns false when an error is missing its key", () => {
    expect(isNonReportableError({ errors: [{ error: {} }] })).toBe(false);
  });
});
