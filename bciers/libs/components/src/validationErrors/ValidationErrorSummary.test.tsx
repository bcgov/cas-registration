import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ValidationErrorSummary,
  ValidationErrors,
} from "@bciers/components/validationErrors";
import { validationUIConfig } from "@reporting/src/app/components/validationErrors/config";
import { ValidationMessageKey } from "@reporting/src/app/components/validationErrors/types";

describe("ValidationErrorSummary", () => {
  it("renders nothing when there are no errors", () => {
    const { container } = render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={[]}
        config={validationUIConfig}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the backend message for keys without a UI config", () => {
    const errors: ValidationErrors = [
      {
        // Generic API error keys (e.g. user_error) have no reporting UI config
        key: "user_error" as ValidationErrors[number]["key"],
        error: {
          severity: "Error",
          message: "Your business BCeID does not have access to this operator.",
        },
      },
    ];

    render(<ValidationErrorSummary errors={errors} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your business BCeID does not have access to this operator.",
    );
    expect(screen.queryByText("user_error")).not.toBeInTheDocument();
  });

  it("sorts validation entries by severity with errors before warnings", () => {
    const errors: ValidationErrors = [
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

    render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={errors}
        config={validationUIConfig}
      />,
    );

    const alerts = screen.getAllByRole("alert");

    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Critical failure. Meltdown imminent.");
    expect(alerts[1]).toHaveTextContent(
      "Verification information must be completed on the Verification page.",
    );
  });

  it("sorts by priority within the same severity", () => {
    const errors: ValidationErrors = [
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

    render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={errors}
        config={validationUIConfig}
      />,
    );

    const alerts = screen.getAllByRole("alert");

    expect(alerts[0]).toHaveTextContent("higher priority message");
    expect(alerts[1]).toHaveTextContent("lower priority message");
  });

  it("keeps original order when severity and priority are equal", () => {
    const errors: ValidationErrors = [
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

    render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={errors}
        config={validationUIConfig}
      />,
    );

    const alerts = screen.getAllByRole("alert");

    expect(alerts[0]).toHaveTextContent("first");
    expect(alerts[1]).toHaveTextContent("second");
  });

  it("renders inline link messages with expected destination", () => {
    const errors: ValidationErrors = [
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

    render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={errors}
        config={validationUIConfig}
      />,
    );

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
    const errors: ValidationErrors = [
      {
        key: "generic_error",
        error: {
          severity: "Error",
          message: "Something went wrong. Very wrong.",
        },
      },
    ];

    render(
      <ValidationErrorSummary<ValidationMessageKey>
        errors={errors}
        config={validationUIConfig}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong. Very wrong.",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
