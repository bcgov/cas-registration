import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("ComplianceStepButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders back and continue buttons when URLs are provided", () => {
    render(<ComplianceStepButtons backUrl="/back" continueUrl="/continue" />);

    const backButton = screen.getByRole("button", { name: /back/i });
    const continueButton = screen.getByRole("button", { name: /continue/i });

    expect(backButton).toBeVisible();
    expect(continueButton).toBeVisible();

    expect(backButton).toHaveTextContent("Back");
    expect(continueButton).toHaveTextContent("Continue");
  });

  it("renders custom button text when provided", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        backButtonText="Go Back"
        continueButtonText="Save and Continue"
      />,
    );

    const backButton = screen.getByRole("button", { name: /go back/i });
    const continueButton = screen.getByRole("button", {
      name: /save and continue/i,
    });

    expect(backButton).toHaveTextContent("Go Back");
    expect(continueButton).toHaveTextContent("Save and Continue");
  });

  it("disables buttons when disabled props are true", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        backButtonDisabled={true}
        submitButtonDisabled={true}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    const continueButton = screen.getByRole("button", { name: /continue/i });

    expect(backButton).toBeDisabled();
    expect(continueButton).toBeDisabled();
  });

  it("renders middle button when text and click handler are provided", () => {
    const mockMiddleClick = vi.fn();

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        middleButtonText="Save Draft"
        onMiddleButtonClick={mockMiddleClick}
      />,
    );

    const middleButton = screen.getByRole("button", { name: /save draft/i });
    expect(middleButton).toBeVisible();
    expect(middleButton).toHaveTextContent("Save Draft");

    fireEvent.click(middleButton);
    expect(mockMiddleClick).toHaveBeenCalledTimes(1);
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

    expect(screen.queryByTestId("middle-button")).not.toBeInTheDocument();
  });

  it("calls onBackClick when back button is clicked", () => {
    const mockBackClick = vi.fn();

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        onBackClick={mockBackClick}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    fireEvent.click(backButton);
    expect(mockBackClick).toHaveBeenCalledTimes(1);
  });

  it("calls onContinueClick when continue button is clicked", () => {
    const mockContinueClick = vi.fn();

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        onContinueClick={mockContinueClick}
      />,
    );

    const continueButton = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueButton);
    expect(mockContinueClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom styles when style prop is provided", () => {
    const customStyle = {
      marginTop: "50px",
      backgroundColor: "rgb(255, 0, 0)",
    };

    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        style={customStyle}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    const container = backButton.closest("div")?.parentElement;
    expect(container).toHaveStyle("margin-top: 50px");
    expect(container).toHaveStyle("background-color: rgb(255, 0, 0)");
  });

  it("renders custom buttons when provided", () => {
    render(
      <ComplianceStepButtons
        backUrl="/back"
        continueUrl="/continue"
        customButtons={<button data-testid="custom-button">Custom</button>}
      />,
    );

    const customButton = screen.getByRole("button", { name: /custom/i });
    expect(customButton).toBeVisible();
    expect(customButton).toHaveTextContent("Custom");
  });

  it("renders children when provided", () => {
    render(
      <ComplianceStepButtons backUrl="/back" continueUrl="/continue">
        <button data-testid="child-button">Child</button>
      </ComplianceStepButtons>,
    );

    const childButton = screen.getByRole("button", { name: /child/i });
    expect(childButton).toBeVisible();
    expect(childButton).toHaveTextContent("Child");
  });
});
