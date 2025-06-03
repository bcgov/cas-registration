import { render, screen, fireEvent } from "@testing-library/react";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useRouter } from "@bciers/testConfig/mocks";

// Mock the router
const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});

describe("ComplianceStepButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders back and continue buttons with default text", () => {
    render(<ComplianceStepButtons backUrl="/back" continueUrl="/continue" />);

    const backButton = screen.getByRole("button", { name: "Back" });
    const continueButton = screen.getByRole("button", { name: "Continue" });

    expect(backButton).toBeVisible();
    expect(continueButton).toBeVisible();
    expect(backButton).toHaveClass("border-bc-blue", "text-bc-links");
    expect(continueButton).toHaveClass("bg-bc-blue");
  });

  it("navigates to correct URLs when buttons are clicked", () => {
    render(<ComplianceStepButtons backUrl="/back" continueUrl="/continue" />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(mockPush).toHaveBeenCalledWith("/back");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(mockPush).toHaveBeenCalledWith("/continue");
  });

  it("uses custom button text when provided", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        backButtonText="Previous"
        continueButtonText="Next"
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeVisible();
  });

  it("disables buttons when specified", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        backButtonDisabled
        submitButtonDisabled
      />,
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Back" })).toHaveClass(
      "disabled:border-bc-grey",
      "disabled:text-bc-grey-bg",
    );
    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass(
      "disabled:bg-bc-grey",
      "disabled:text-bc-grey-bg",
    );
  });

  it("calls custom click handlers when provided", () => {
    const onBackClick = vi.fn();
    const onContinueClick = vi.fn();

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        onBackClick={onBackClick}
        onContinueClick={onContinueClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBackClick).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinueClick).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders middle button when text and handler are provided", () => {
    const onMiddleButtonClick = vi.fn();

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        middleButtonText="Save Draft"
        onMiddleButtonClick={onMiddleButtonClick}
      />,
    );

    const middleButton = screen.getByRole("button", { name: "Save Draft" });
    expect(middleButton).toBeVisible();
    expect(middleButton).toHaveClass("border-bc-blue", "text-bc-links");

    fireEvent.click(middleButton);
    expect(onMiddleButtonClick).toHaveBeenCalled();
  });

  it("does not render middle button when middleButtonActive is false", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        middleButtonText="Save Draft"
        onMiddleButtonClick={vi.fn()}
        middleButtonActive={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Save Draft" }),
    ).not.toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <ComplianceStepButtons backUrl="/back" continueUrl="/continue">
        <button>Child Button</button>
      </ComplianceStepButtons>,
    );

    expect(screen.getByRole("button", { name: "Child Button" })).toBeVisible();
  });

  it("applies custom className", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        className="custom-class"
      />,
    );

    const container = screen
      .getByRole("button", { name: "Back" })
      .closest(".flex");
    expect(container).toHaveClass("custom-class");
  });
});
