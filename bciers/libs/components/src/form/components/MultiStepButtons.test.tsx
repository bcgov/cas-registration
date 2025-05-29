import MultiStepButtons from "@bciers/components/form/components/MultiStepButtons";
import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { useSessionRole } from "@bciers/testConfig/mocks";

const defaultProps = {
  allowBackNavigation: true,
  baseUrl: "anything.com",
  cancelUrl: "https://www.test.com/",
  classNames: "garbage",
  disabled: true,
  isSubmitting: false,
  stepIndex: 0, // steps are 0-indexed in the props but 1-indexed in the app
  steps: ["step 1", "step 2", "step 3"],
};

describe("The MultiStepButtons component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("industry_user_admin");
  });

  it("renders correct buttons for industry users on first step when view-only", () => {
    render(<MultiStepButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons for industry users on middle steps when view-only", () => {
    render(<MultiStepButtons {...defaultProps} stepIndex={1} />);
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons for industry users on final step when view-only", () => {
    render(<MultiStepButtons {...defaultProps} stepIndex={2} />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons for industry users on first step when editable", () => {
    render(<MultiStepButtons {...defaultProps} disabled={false} />);
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Save and Continue" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons for industry users on middle steps when editable", () => {
    render(
      <MultiStepButtons {...defaultProps} stepIndex={1} disabled={false} />,
    );
    expect(
      screen.getByRole("button", { name: "Save and Continue" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons for industry users on final step when editable", () => {
    render(
      <MultiStepButtons {...defaultProps} stepIndex={2} disabled={false} />,
    );
    expect(screen.getByRole("button", { name: "Submit" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("renders correct buttons text when overriding submitButtonText prop", () => {
    render(
      <MultiStepButtons
        {...defaultProps}
        submitButtonText="I like a new name"
        disabled={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: "I like a new name" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("shows CAS users correct buttons on first step", () => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("cas_admin");
    render(<MultiStepButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("shows CAS users correct buttons on middle steps", () => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("cas_admin");
    render(<MultiStepButtons {...defaultProps} stepIndex={1} />);
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
  });

  it("shows CAS users correct buttons on final step", () => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("cas_admin");
    render(<MultiStepButtons {...defaultProps} stepIndex={2} />);
    expect(screen.getByRole("button", { name: "Back" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Save and Continue" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Submit" }),
    ).not.toBeInTheDocument();
  });

  it("does not show the Back button when allowBackNavigation is false", () => {
    render(<MultiStepButtons {...defaultProps} allowBackNavigation={false} />);

    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("Back button has correct link", () => {
    render(<MultiStepButtons {...defaultProps} stepIndex={2} />);
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "anything.com/2",
    );
  });
  it("Cancel button link is correct", () => {
    render(<MultiStepButtons {...defaultProps} />);

    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "https://www.test.com/",
    );
  });
  it("Next button has correct link", async () => {
    render(<MultiStepButtons {...defaultProps} />);

    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "anything.com/2",
    );
  });
  it("Save and Continue has correct link", () => {
    render(<MultiStepButtons {...defaultProps} stepIndex={1} />);

    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "anything.com/3",
    );
  });
});
