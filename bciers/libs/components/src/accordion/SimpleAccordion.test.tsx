import { render, screen, fireEvent } from "@testing-library/react";
import SimpleAccordion from "./SimpleAccordion";

// Helper to get the summary button (MUI renders it as a button)
const getSummaryButton = (title: string) => {
  return screen.getByRole("button", { name: title });
};

describe("SimpleAccordion", () => {
  it("renders the title", () => {
    render(
      <SimpleAccordion title="Accordion Title">
        <div>Accordion Content</div>
      </SimpleAccordion>,
    );
    expect(screen.getByText("Accordion Title")).toBeVisible();
  });

  it("renders the children when expanded", () => {
    render(
      <SimpleAccordion title="Accordion Title">
        <div>Accordion Content</div>
      </SimpleAccordion>,
    );
    expect(screen.getByText("Accordion Content")).toBeVisible();
  });

  it("shows the custom expand icon", () => {
    render(
      <SimpleAccordion title="Accordion Title">
        <div>Accordion Content</div>
      </SimpleAccordion>,
    );
    expect(screen.getByText("▼")).toBeVisible();
  });

  it("toggles content visibility when clicked", () => {
    render(
      <SimpleAccordion title="Accordion Title" defaultExpanded={false}>
        <div>Accordion Content</div>
      </SimpleAccordion>,
    );
    // Content should not be visible initially
    expect(screen.queryByText("Accordion Content")).not.toBeVisible();

    // Click the summary to expand
    fireEvent.click(getSummaryButton("Accordion Title ▼"));
    expect(screen.getByText("Accordion Content")).toBeVisible();

    // Click again to collapse
    fireEvent.click(getSummaryButton("Accordion Title ▼"));
  });
});
