import { render, screen } from "@testing-library/react";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";

describe("ComplianceNavigationPage", () => {
  const defaultProps = {
    activeTab: 0,
  };

  it("renders the heading", () => {
    render(<ComplianceNavigationPage {...defaultProps} />);
    const heading = screen.getByText("My Compliance");
    expect(heading).toBeVisible();
  });

  it("renders the Tabs component", () => {
    render(<ComplianceNavigationPage {...defaultProps} />);
    const tabList = screen.getByRole("tablist");
    expect(tabList).toHaveAttribute("aria-label", "compliance navigation tabs");
    expect(screen.getByText("Compliance Summaries")).toBeVisible();
    expect(screen.getByText("Payment Summaries")).toBeVisible();
  });

  it("sets the correct active tab", () => {
    render(<ComplianceNavigationPage activeTab={1} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toBeVisible();
  });

  it("renders children and ensures they are visible", () => {
    const testChild = <div data-testid="test-child">Child Content</div>;
    render(
      <ComplianceNavigationPage {...defaultProps}>
        {testChild}
      </ComplianceNavigationPage>,
    );
    const child = screen.getByTestId("test-child");
    expect(child).toHaveTextContent("Child Content");
    expect(child).toBeVisible();
  });

  it("displays the heading with correct styles", () => {
    render(<ComplianceNavigationPage {...defaultProps} />);
    const heading = screen.getByText("My Compliance");
    expect(heading).toHaveClass("text-2xl", "font-bold", "text-bc-bg-blue");
    expect(heading).toBeVisible();
  });
});
