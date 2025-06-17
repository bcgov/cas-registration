import { render, screen } from "@testing-library/react";
import AlertNote from "./AlertNote";

// Mock the AlertIcon component
vi.mock("@bciers/components/icons", () => ({
  AlertIcon: () => <svg role="img" aria-label="alert" />,
}));

describe("AlertNote", () => {
  it("renders with children content and default icon", () => {
    render(<AlertNote>Test message</AlertNote>);

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent("Test message");
    expect(screen.getByRole("img", { name: "alert" })).toBeVisible();
  });

  it("renders with custom icon", () => {
    const CustomIcon = () => (
      <svg role="img" aria-label="custom alert">
        Custom
      </svg>
    );
    render(<AlertNote icon={<CustomIcon />}>Test message</AlertNote>);

    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent("Test message");
    expect(screen.getByRole("img", { name: "custom alert" })).toBeVisible();
    expect(
      screen.queryByRole("img", { name: "alert" }),
    ).not.toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<AlertNote>Test message</AlertNote>);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass(
      "bg-bc-light-blue",
      "text-bc-text",
      "mb-2",
      "items-center",
    );
  });
});
