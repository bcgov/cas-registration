import { render, screen } from "@testing-library/react";
import { FieldDisplay } from "@reporting/src/app/components/finalReview/templates/FieldDisplay";
import { describe, it, expect } from "vitest";

describe("FieldDisplay", () => {
  it("renders label and string value", () => {
    render(<FieldDisplay label="Test Label" value="Test Value" />);
    expect(screen.getByText("Test Label")).toBeVisible();
    expect(screen.getByText("Test Value")).toBeVisible();
  });

  it("renders N/A for null or undefined values", () => {
    const { rerender } = render(
      <FieldDisplay label="Test Label" value={null} />,
    );
    expect(screen.getByText("N/A")).toBeVisible();

    rerender(<FieldDisplay label="Test Label" value={undefined} />);
    expect(screen.getByText("N/A")).toBeVisible();
  });

  it("renders boolean values as Yes or No", () => {
    const { rerender } = render(
      <FieldDisplay label="Test Label" value={true} />,
    );
    expect(screen.getByText("Yes")).toBeVisible();

    rerender(<FieldDisplay label="Test Label" value={false} />);
    expect(screen.getByText("No")).toBeVisible();
  });

  it("renders date values formatted when isDate is true", () => {
    render(
      <FieldDisplay label="Test Label" value="2024-01-15" isDate={true} />,
    );
    expect(screen.getByText("Jan 15, 2024")).toBeVisible();
  });

  it("renders semicolon-separated values as a list", () => {
    render(<FieldDisplay label="Test Label" value="Item 1;Item 2;Item 3" />);
    expect(screen.getByText("- Item 1")).toBeVisible();
    expect(screen.getByText("- Item 2")).toBeVisible();
    expect(screen.getByText("- Item 3")).toBeVisible();
  });

  it("renders number values with NumberField formatting when isYear is false", () => {
    render(<FieldDisplay label="Test Label" value={123456.789} />);
    // NumberField component should format the number with thousand separators
    expect(screen.getByDisplayValue("123,456.789")).toBeVisible();
  });

  it("renders year values as plain text when isYear is true", () => {
    render(<FieldDisplay label="Test Label" value={2024} isYear={true} />);
    // Should render as plain span, not in a NumberField
    expect(screen.getByText("2024")).toBeVisible();
    // Should not be in an input field
    expect(screen.queryByDisplayValue("2024")).not.toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(<FieldDisplay label="Test Label" value="100" unit="kg" />);
    expect(screen.getByText("kg")).toBeVisible();
  });

  it("applies deleted styles when isDeleted is true", () => {
    render(
      <FieldDisplay label="Test Label" value="Test Value" isDeleted={true} />,
    );
    const valueElement = screen.getByText("Test Value").parentElement;
    expect(valueElement).toHaveStyle({
      textDecoration: "line-through",
      color: "#666",
    });
  });

  it("renders separator by default", () => {
    const { container } = render(
      <FieldDisplay label="Test Label" value="Test Value" />,
    );
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });

  it("does not render separator when showSeparator is false", () => {
    const { container } = render(
      <FieldDisplay
        label="Test Label"
        value="Test Value"
        showSeparator={false}
      />,
    );
    const hr = container.querySelector("hr");
    expect(hr).not.toBeInTheDocument();
  });

  it("renders modified changes with old and new values", () => {
    render(
      <FieldDisplay
        label="Test Label"
        value="New Value"
        oldValue="Old Value"
        changeType="modified"
      />,
    );
    expect(screen.getByText("Old Value")).toBeVisible();
    expect(screen.getByText("New Value")).toBeVisible();
    expect(screen.getByText("→")).toBeVisible();
  });
});
