import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";

const defaultProps = {
  allowBackNavigation: true,
  backUrl: "https://www.test.com/",
  continueUrl: "https://www.test.com/continued",
  isSaving: false,
  isSuccess: false,
  isRedirecting: false,
  saveButtonDisabled: false,
  saveAndContinue: () => {},
  isSignOffPage: false,
};

describe("The ReportingStepButtons component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders correct buttons", () => {
    render(<ReportingStepButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Save & Continue" })).toBeInTheDocument();
  });

  it("does not show the Back button when allowBackNavigation is false", () => {
    render(
      <ReportingStepButtons {...defaultProps} />,
    );

    expect(
      screen.queryByRole("link", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("shows Submit Report button on Sign Off Page", () => {
    render(
      <ReportingStepButtons {...defaultProps} isSignOffPage={true} />,
    );

    expect(
      screen.queryByRole("button", { name: "Submit Report" }),
    ).toBeInTheDocument();
  });

  it("Save button operates properly", () => {
    // Check Save button to be default
    render(<ReportingStepButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
    // Check spinner is visible when saving
    render(<ReportingStepButtons {...defaultProps} isSaving={true} />);
    expect(screen.getByRole("progress")).toBeVisible();
    //  Check success when saving is over
    render(<ReportingStepButtons {...defaultProps} isSuccess={true} />);
    expect(screen.getByRole("button", { name: "✅ Success" })).toBeVisible();
  });

  it("Save & Continue button operates properly", () => {
    // Check Save button to be default
    render(<ReportingStepButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Save & Continue" })).toBeVisible();
    // Check spinner is visible when saving
    render(<ReportingStepButtons {...defaultProps} isSaving={true} />);
    expect(screen.getByRole("progressContinuing")).toBeVisible();
    //  Check redirecting when saving is over
    render(<ReportingStepButtons {...defaultProps} isRedirecting={true} />);
    expect(screen.getByRole("button", { name: "✅ Redirecting..." })).toBeVisible();
  });
});
