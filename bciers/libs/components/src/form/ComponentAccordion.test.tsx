import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect } from "vitest";
import ComponentAccordion from "./ComponentAccordion";
import userEvent from "@testing-library/user-event";

const defaultProps = {
  content: [
    { title: "Hi", component: <div>Hello!</div> },
    { title: "Bye", component: <div>Goodbye!</div> },
  ],
};

describe("The ComponentAccordion component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("renders the accordions with titles and content expanded", () => {
    render(<ComponentAccordion {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /Hi/i })).toBeVisible();
    expect(screen.getByText(/Hello!/i)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Bye/i })).toBeVisible();
    expect(screen.getByText(/Goodbye!/i)).toBeVisible();
  });

  it("collapses a section when the section's collapse button is clicked", async () => {
    render(<ComponentAccordion {...defaultProps} />);
    userEvent.click(screen.getByRole("button", { name: /Hi/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Hello!/i)).not.toBeVisible();
    });
    expect(screen.queryByRole("button", { name: /Bye/i })).toBeVisible();
    expect(screen.getByText(/Goodbye!/i)).toBeVisible();
  });

  it("collapses and expands all when buttons are clicked", async () => {
    render(<ComponentAccordion {...defaultProps} />);
    userEvent.click(screen.getByRole("button", { name: /Collapse All/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Hello!/i)).not.toBeVisible();
      expect(screen.queryByText(/Goodbye!/i)).not.toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /Expand All/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Hello!/i)).toBeVisible();
      expect(screen.queryByText(/Goodbye!/i)).toBeVisible();
    });
  });
});
