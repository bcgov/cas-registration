import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ComplianceStepButtons from "./ComplianceStepButtons";

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

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByTestId("continue-button")).toBeInTheDocument();

    expect(screen.getByTestId("back-button")).toHaveTextContent("Back");
    expect(screen.getByTestId("continue-button")).toHaveTextContent("Continue");
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

    expect(screen.getByTestId("back-button")).toHaveTextContent("Go Back");
    expect(screen.getByTestId("continue-button")).toHaveTextContent(
      "Save and Continue",
    );
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

    expect(screen.getByTestId("back-button")).toBeDisabled();
    expect(screen.getByTestId("continue-button")).toBeDisabled();
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

    const middleButton = screen.getByTestId("middle-button");
    expect(middleButton).toBeInTheDocument();
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

    fireEvent.click(screen.getByTestId("back-button"));
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

    fireEvent.click(screen.getByTestId("continue-button"));
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

    const container = screen.getByTestId("back-button").closest("div")
      ?.parentElement;
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

    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    expect(screen.getByTestId("custom-button")).toHaveTextContent("Custom");
  });

  it("renders children when provided", () => {
    render(
      <ComplianceStepButtons backUrl="/back" continueUrl="/continue">
        <button data-testid="child-button">Child</button>
      </ComplianceStepButtons>,
    );

    expect(screen.getByTestId("child-button")).toBeInTheDocument();
    expect(screen.getByTestId("child-button")).toHaveTextContent("Child");
  });
});
