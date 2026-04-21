import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import type { ReportValidationErrors } from "./types";

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

  it("renders inline link messages with expected destination", () => {
    const errors: ReportValidationErrors = [
      {
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          context: { report_version_id: 42 },
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
