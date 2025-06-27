import { render, screen, fireEvent } from "@testing-library/react";
import SimpleAccordion from "./SimpleAccordion";

// Helper to get the summary button (MUI renders it as a button)
const getSummaryButton = (title: string) => {
  return screen.getByRole("button", { name: title });
};

// Common test props to reduce duplication
const defaultProps = {
  title: "Accordion Title",
  children: <div>Accordion Content</div>,
};

const renderAccordion = (props: { defaultExpanded?: boolean } = {}) => {
  return render(
    <SimpleAccordion {...defaultProps} {...props}>
      {defaultProps.children}
    </SimpleAccordion>,
  );
};

describe("SimpleAccordion", () => {
  it("renders the title", () => {
    renderAccordion();
    expect(screen.getByText("Accordion Title")).toBeVisible();
  });

  it("renders the children when expanded", () => {
    renderAccordion();
    expect(screen.getByText("Accordion Content")).toBeVisible();
  });

  it("shows the custom expand icon", () => {
    renderAccordion();
    expect(screen.getByText("▼")).toBeVisible();
  });

  it("toggles content visibility when clicked", () => {
    renderAccordion({ defaultExpanded: false });

    // Content should not be visible initially
    expect(screen.queryByText("Accordion Content")).not.toBeVisible();

    // Click the summary to expand
    fireEvent.click(getSummaryButton("Accordion Title ▼"));
    expect(screen.getByText("Accordion Content")).toBeVisible();

    // Click again to collapse
    fireEvent.click(getSummaryButton("Accordion Title ▼"));
  });
});
