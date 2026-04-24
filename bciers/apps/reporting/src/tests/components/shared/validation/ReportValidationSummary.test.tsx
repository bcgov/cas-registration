import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import type { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

describe("ReportValidationSummary", () => {
  it("renders nothing when there are no errors", () => {
    const { container } = render(<ReportValidationSummary errors={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("sorts validation entries by severity with errors before warnings", () => {
    const errors: ReportValidationErrors = [
      {
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Warning",
          message:
            "Verification information must be completed on the Verification page.",
          context: { report_version_id: 12 },
        },
      },
      {
        key: "generic_error",
        error: {
          severity: "Error",
          message: "Critical failure. Meltdown imminent.",
        },
      },
    ];

    render(<ReportValidationSummary errors={errors} />);

    const alerts = screen.getAllByRole("alert");

    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Critical failure. Meltdown imminent.");
    expect(alerts[1]).toHaveTextContent(
      "Verification information must be completed on the Verification page.",
    );
  });

  it("sorts by priority within the same severity", () => {
    const errors: ReportValidationErrors = [
      {
        // priority 4
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          message: "lower priority message",
          context: { report_version_id: 1 },
        },
      },
      {
        // priority 2
        key: "operation_boro_id", // gitleaks:allow
        error: {
          severity: "Error",
          message: "higher priority message",
          context: { report_version_id: 1 },
        },
      },
    ];

    render(<ReportValidationSummary errors={errors} />);

    const alerts = screen.getAllByRole("alert");

    expect(alerts[0]).toHaveTextContent("higher priority message");
    expect(alerts[1]).toHaveTextContent("lower priority message");
  });

  it("keeps original order when severity and priority are equal", () => {
    const errors: ReportValidationErrors = [
      {
        // priority 4
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          message: "first",
          context: { report_version_id: 1 },
        },
      },
      {
        // priority 4
        key: "verification_statement", // gitleaks:allow
        error: {
          severity: "Error",
          message: "second",
          context: { report_version_id: 1 },
        },
      },
    ];

    render(<ReportValidationSummary errors={errors} />);

    const alerts = screen.getAllByRole("alert");

    expect(alerts[0]).toHaveTextContent("first");
    expect(alerts[1]).toHaveTextContent("second");
  });

  it("renders inline link messages with expected destination", () => {
    const errors: ReportValidationErrors = [
      {
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          message:
            "Verification information must be completed on the Verification page.",
          context: {
            report_version_id: 42,
          },
        },
      },
    ];

    render(<ReportValidationSummary errors={errors} />);

    const verificationLink = screen.getByRole("link", {
      name: "Verification page",
    });

    expect(verificationLink).toHaveAttribute(
      "href",
      "/reports/42/verification",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Verification information must be completed on the Verification page.",
    );
  });

  it("renders message-only entries without links", () => {
    const errors: ReportValidationErrors = [
      {
        key: "generic_error",
        error: {
          severity: "Error",
          message: "Something went wrong. Very wrong.",
        },
      },
    ];

    render(<ReportValidationSummary errors={errors} />);

    expect(screen.getByText("Something went wrong. Very wrong.")).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
