import { render, screen } from "@testing-library/react";
import FormValidationError from "./FormValidationError";

describe("FormValidationError", () => {
  it("renders the alert with the default message", () => {
    render(<FormValidationError />);
    expect(
      screen.getByText(
        /This form can't be saved yet. Please fix the errors above./i,
      ),
    ).toBeVisible();
  });

  it("renders the alert with a custom message when provided", () => {
    render(<FormValidationError message="Custom error." />);
    expect(screen.getByText("Custom error.")).toBeVisible();
    expect(
      screen.queryByText(
        /This form can't be saved yet. Please fix the errors above./i,
      ),
    ).not.toBeInTheDocument();
  });
});
