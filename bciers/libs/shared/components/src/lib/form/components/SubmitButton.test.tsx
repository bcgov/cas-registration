import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import SubmitButton from "@/app/components/form/SubmitButton";

const defaultProps = {
  label: "i am a nice label",
};

describe("The SubmitButton component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("shows the correct label", () => {
    render(<SubmitButton {...defaultProps} />);
    expect(screen.getByText(/i am a nice label/i)).toBeVisible();
  });
  it("is disabled when appropriate", () => {
    render(<SubmitButton {...defaultProps} disabled />);
    expect(
      screen.getByRole("button", { name: /i am a nice label/i }),
    ).toBeDisabled();
  });
});
