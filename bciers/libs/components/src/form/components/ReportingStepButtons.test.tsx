import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";

const defaultProps = {
  allowBackNavigation: true,
  backUrl: "https://www.test.com/",
  continueUrl: "https://www.test.com/continued",
  isSaving: false,
  isSuccess: false,
  saveButtonDisabled: false,
};

describe("The ReportingStepButtons component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correct buttons", () => {
    render(<ReportingStepButtons {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: "Continue" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Save" }),
    ).toBeInTheDocument();
  });

  it("does not show the Back button when allowBackNavigation is false", () => {
    render(<ReportingStepButtons {...defaultProps} allowBackNavigation={false} />);

    expect(
      screen.queryByRole("link", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("Back button has correct link", () => {
    render(<ReportingStepButtons {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "https://www.test.com/",
    );
  });

  it("Continue button has correct link", async () => {
    render(<ReportingStepButtons {...defaultProps} />);

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "https://www.test.com/continued",
    );
  });

  it("Save button operates properly", () => {
    // Check Save button to be default
    render(<ReportingStepButtons {...defaultProps}/>);
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    // Check spinner is visible when saving
    render(<ReportingStepButtons {...defaultProps} isSaving={true}/>);
    expect(screen.getByRole("progress")).toBeVisible();
    //  Check success when saving is over
    render(<ReportingStepButtons {...defaultProps} isSuccess={true}/>);
    expect(screen.getByRole("button", { name: "✅ Success" })).toBeVisible();
  });
});
