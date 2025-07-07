import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ComplianceNavigationPage from "@/compliance/src/app/components/compliance-navigation/ComplianceNavigationPage";
import { getSessionRole } from "@bciers/testConfig/mocks";
import { FrontEndRoles } from "@bciers/utils/src/enums";

describe("ComplianceNavigationPage", () => {
  const defaultProps = {
    activeTab: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionRole).mockResolvedValue(FrontEndRoles.INDUSTRY_USER);
  });

  it("renders the heading for external user", async () => {
    render(await ComplianceNavigationPage(defaultProps));
    const heading = await screen.getByText("My Compliance");
    expect(heading).toBeVisible();
  });

  it("renders the heading for internal user", async () => {
    vi.mocked(getSessionRole).mockResolvedValueOnce(FrontEndRoles.CAS_ADMIN);

    render(await ComplianceNavigationPage(defaultProps));
    const heading = await screen.findByText("Compliance Administration");
    expect(heading).toBeVisible();
  });

  it("renders the Tabs component", async () => {
    render(await ComplianceNavigationPage(defaultProps));
    const tabList = screen.getByRole("tablist");
    expect(tabList).toHaveAttribute("aria-label", "compliance navigation tabs");
    expect(screen.getByText("Compliance Summaries")).toBeVisible();
    expect(screen.getByText("Payment Summaries")).toBeVisible();
  });

  it("sets the correct active tab", async () => {
    render(await ComplianceNavigationPage({ activeTab: 1 }));
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toBeVisible();
  });

  it("renders children and ensures they are visible", async () => {
    const testChild = <div data-testid="test-child">Child Content</div>;
    render(
      await ComplianceNavigationPage({ ...defaultProps, children: testChild }),
    );
    const child = screen.getByTestId("test-child");
    expect(child).toHaveTextContent("Child Content");
    expect(child).toBeVisible();
  });

  it("displays the heading with correct styles", async () => {
    render(await ComplianceNavigationPage(defaultProps));
    const heading = screen.getByText("My Compliance");
    expect(heading).toHaveClass("text-2xl", "font-bold", "text-bc-bg-blue");
    expect(heading).toBeVisible();
  });
});
