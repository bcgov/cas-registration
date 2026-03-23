import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getValidationErrorMessages } from "./reportValidationMessages";

describe("reportValidationMessages", () => {
  it("renders multiple validation errors with links", () => {
    const errors = getValidationErrorMessages(
      JSON.stringify({
        errors: [
          {
            key: "missing_report_verification", // gitleaks:allow
            message: "Report verification form not found in the report.",
            fix_url: "reporting/reports/1/verification",
          },
          {
            key: "verification_statement",
            message:
              "Mandatory verification statement document was not uploaded with this report.",
            fix_url: "reporting/reports/1/verification",
          },
        ],
      }),
    );

    expect(errors).toHaveLength(2);

    const { container } = render(<>{errors}</>);

    expect(container).toHaveTextContent(
      "Verification information must be completed with this report. Please complete the Verification page.",
    );
    expect(container).toHaveTextContent(
      "A verification statement must be uploaded with this report. Please upload a verification statement on the Attachments page.",
    );

    const links = screen.getAllByRole("link", {
      name: "Click here to fix this issue.",
    });

    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/reporting/reports/1/verification");
    }
  });

  it("displays non-structured errors correctly", () => {
    const errors = getValidationErrorMessages("Generic error");

    expect(errors).toHaveLength(1);

    render(<>{errors}</>);

    expect(screen.getByText("Generic error")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders a single structured validation error from the message field", () => {
    const errors = getValidationErrorMessages(
      JSON.stringify({
        key: "missing_report_verification", // gitleaks:allow
        message: "Report verification form not found in the report.",
        fix_url: "reporting/reports/1/verification",
      }),
    );

    expect(errors).toHaveLength(1);

    const { container } = render(<>{errors}</>);

    expect(container).toHaveTextContent(
      "Verification information must be completed with this report. Please complete the Verification page.",
    );

    expect(
      screen.getByRole("link", {
        name: "Click here to fix this issue.",
      }),
    ).toHaveAttribute("href", "/reporting/reports/1/verification");
  });

  it("uses the provided message for a structured error with an unknown key", () => {
    const errors = getValidationErrorMessages(
      JSON.stringify({
        key: "unknown_key",
        message: "Something unexpected happened while validating this report.",
        fix_url: "reporting/reports/1/attachments",
      }),
    );

    expect(errors).toHaveLength(1);

    const { container } = render(<>{errors}</>);

    expect(container).toHaveTextContent(
      "Something unexpected happened while validating this report.",
    );

    expect(
      screen.getByRole("link", {
        name: "Click here to fix this issue.",
      }),
    ).toHaveAttribute("href", "/reporting/reports/1/attachments");
  });

  it("renders a mapped legacy error key without a fix link", () => {
    const errors = getValidationErrorMessages("missing_report_verification");

    expect(errors).toHaveLength(1);

    render(<>{errors}</>);

    expect(
      screen.getByText(
        "Verification information must be completed with this report. Please complete the Verification page.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("strips the allocation mismatch prefix from allocation mismatch errors", () => {
    const errors = getValidationErrorMessages(
      "Allocation Mismatch Facility ABC123 Category 42: Emissions allocated for The Facility in 'Vengeful emissions' category do not match reported emissions.",
    );

    expect(errors).toHaveLength(1);

    render(<>{errors}</>);

    expect(
      screen.getByText(
        "Emissions allocated for The Facility in 'Vengeful emissions' category do not match reported emissions.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
