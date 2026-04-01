import { render, screen } from "@testing-library/react";
import FormValidationError from "./FormValidationError";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  default: () => <svg data-testid="alert-icon" />,
}));

describe("FormValidationError", () => {
  it("renders the alert with error styling, icon, and provided message", () => {
    render(<FormValidationError message="Something went wrong." />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
    expect(screen.getByText("Something went wrong.")).toBeVisible();
    expect(screen.getByTestId("alert-icon")).toBeVisible();
  });
});
