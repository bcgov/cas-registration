import { render, screen } from "@testing-library/react";
import FormAlerts from "./FormAlerts";

vi.mock("@bciers/components/icons/AlertIcon", () => ({
  default: () => <svg data-testid="alert-icon" />,
}));

describe("FormAlerts", () => {
  test("does not render when errors is undefined", () => {
    render(<FormAlerts errors={undefined} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("does not render when errors is an empty array", () => {
    render(<FormAlerts errors={[]} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("renders multiple string errors", () => {
    const errors = ["First error", "Second error"];
    render(<FormAlerts errors={errors} />);

    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(2);
    expect(screen.getByText("First error")).toBeVisible();
    expect(screen.getByText("Second error")).toBeVisible();
  });

  test("renders the AlertIcon inside each alert", () => {
    render(<FormAlerts errors={["An error"]} />);
    expect(screen.getByTestId("alert-icon")).toBeVisible();
  });

  test("renders React nodes inside alerts", () => {
    const errors = [
      "Simple error",
      <span key="node">
        Node with <strong>bold</strong> text
      </span>,
    ];

    render(<FormAlerts errors={errors} />);

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.getByText("Simple error")).toBeVisible();
    expect(screen.getByText("bold")).toBeVisible();
  });
});
