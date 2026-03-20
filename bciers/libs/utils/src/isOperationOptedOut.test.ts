import { isOperationOptedOut } from "./isOperationOptedOut";

describe("isOperationOptedOut", () => {
  it("returns true when operation opted out final reporting year is less than reporting year", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: 2024,
        reportingYear: 2025,
      }),
    ).toBe(true);
  });

  it("returns true when operation opted out final reporting year equals reporting year", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: 2025,
        reportingYear: 2025,
      }),
    ).toBe(true);
  });

  it("returns false when operation opted out final reporting year is greater than reporting year", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: 2026,
        reportingYear: 2025,
      }),
    ).toBe(false);
  });

  it("returns false when operation opted out final reporting year is null", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: null,
        reportingYear: 2025,
      }),
    ).toBe(false);
  });

  it("returns false when operation opted out final reporting year is undefined", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: undefined,
        reportingYear: 2025,
      }),
    ).toBe(false);
  });

  it("returns false when reporting year is null", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: 2024,
        reportingYear: null,
      }),
    ).toBe(false);
  });

  it("returns false when reporting year is undefined", () => {
    expect(
      isOperationOptedOut({
        operationOptedOutFinalReportingYear: 2024,
        reportingYear: undefined,
      }),
    ).toBe(false);
  });
});
