import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getValidationErrorMessages } from "./reportValidationMessages";

const FIX_LINK_TEXT = "Click here to fix this issue.";
const VERIFICATION_PAGE_PATH = "/reporting/reports/1/verification";
const VERIFICATION_MESSAGE =
  "Verification information must be completed on the Verification page.";

describe("reportValidationMessages", () => {
  it("renders multiple validation errors with links", () => {
    render(
      <>
        {getValidationErrorMessages({
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
        })}
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Verification page" }),
    ).toHaveAttribute("href", VERIFICATION_PAGE_PATH);
    expect(
      screen.getByRole("link", { name: "Attachments page" }),
    ).toHaveAttribute("href", VERIFICATION_PAGE_PATH);
  });

  it("displays non-structured errors correctly", () => {
    render(<>{getValidationErrorMessages("Generic error")}</>);

    expect(screen.getByText("Generic error")).toBeVisible();
  });

  it("renders a validation error with a mapped link", () => {
    const { container } = render(
      <>
        {getValidationErrorMessages({
          errors: [
            {
              key: "missing_report_verification", // gitleaks:allow
              message: "Message that gets overridden.",
              fix_url: "reporting/reports/1/verification",
            },
          ],
        })}
      </>,
    );
    expect(container).toHaveTextContent(VERIFICATION_MESSAGE);
    expect(
      screen.getByRole("link", { name: "Verification page" }),
    ).toHaveAttribute("href", VERIFICATION_PAGE_PATH);
  });

  it("uses the provided message and default link for an error with an unknown key and a provided url", () => {
    render(
      <>
        {getValidationErrorMessages({
          errors: [
            {
              key: "unknown_key",
              message:
                "Something unexpected happened while validating this report.",
              fix_url: "reporting/reports/report/repo/rep/r",
            },
          ],
        })}
      </>,
    );

    expect(
      screen.getByText(
        "Something unexpected happened while validating this report.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: FIX_LINK_TEXT })).toHaveAttribute(
      "href",
      "/reporting/reports/report/repo/rep/r",
    );
  });

  it("renders a dynamic allocation mismatch key with an allocation page link", () => {
    render(
      <>
        {getValidationErrorMessages({
          errors: [
            {
              key: "allocation_mismatch_facility_123ABC_category_23", // gitleaks:allow
              message:
                "Emissions reported for Test Facility in 'Flared Gas' category do not match the allocations on the Allocation of Emissions page.",
              fix_url:
                "reporting/reports/1/facilities/123ABC/allocation-of-emissions",
            },
          ],
        })}
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Allocation of Emissions page" }),
    ).toHaveAttribute(
      "href",
      "/reporting/reports/1/facilities/123ABC/allocation-of-emissions",
    );
  });
});
