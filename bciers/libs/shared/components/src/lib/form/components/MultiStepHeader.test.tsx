import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";

import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";

const defaultProps = {
  step: 0, // steps are 0-indexed in the props but 1-indexed in the app
  steps: ["step one", "step two", "step three"],
};

describe("The MultiStepHeader component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("reduces the width of the title if there are more than 2 steps", () => {
    render(<MultiStepHeader {...defaultProps} />);
    expect(screen.getAllByTestId("multistep-header-title")[0]).toHaveClass(
      "lg:w-36",
    );
  });

  it("does not reduce the width of the title if there are fewer than 2 steps", () => {
    render(<MultiStepHeader {...defaultProps} steps={["just me"]} />);
    expect(screen.getAllByTestId("multistep-header-title")[0]).not.toHaveClass(
      "lg:w-36",
    );
  });

  it("renders the step numbers and titles correctly", () => {
    render(<MultiStepHeader {...defaultProps} />);
    expect(screen.getByText(/1/i)).toBeVisible();
    expect(screen.getByText(/2/i)).toBeVisible();
    expect(screen.getByText(/3/i)).toBeVisible();
    expect(screen.getByText(/step one/i)).toBeVisible();
    expect(screen.getByText(/step two/i)).toBeVisible();
    expect(screen.getByText(/step three/i)).toBeVisible();
  });

  it("colour-codes the steps correctly", () => {
    render(<MultiStepHeader {...defaultProps} />);
    expect(screen.getByText(/1/i)).toHaveClass("bg-bc-yellow");
    expect(screen.getByText(/2/i)).toHaveClass("bg-bc-primary-blue");
    expect(screen.getByText(/3/i)).toHaveClass("bg-bc-primary-blue");
  });

  it("shows the line between steps", () => {
    render(<MultiStepHeader {...defaultProps} />);
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });
});
