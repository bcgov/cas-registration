import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, useSessionRole } from "@bciers/testConfig/mocks";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/no-obligation/review-summary/ComplianceSummaryReviewComponent";

// Mock the router
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

const mockData = {
  reporting_year: 2024,
  excess_emissions: 0,
  emission_limit: "0",
  emissions_attributable_for_compliance: "0",
  id: 123,
};

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user");
  });

  it("renders the form with correct schema fields and headers", () => {
    render(<ComplianceSummaryReviewComponent data={mockData} />);

    // Check form title
    expect(screen.getByText("Review 2024 Compliance Summary")).toBeVisible();

    // Check Summary section
    expect(screen.getByText("From 2024 Report")).toBeVisible();
    expect(
      screen.getByText("Emissions Attributable for Compliance:"),
    ).toBeVisible();
    expect(screen.getAllByText("0")[0]).toBeVisible();
    expect(screen.getAllByText("tCO2e")[0]).toBeVisible();
    expect(screen.getByText("Emissions Limit:")).toBeVisible();
    expect(screen.getAllByText("0")[1]).toBeVisible();
    expect(screen.getAllByText("tCO2e")[1]).toBeVisible();
    expect(screen.getByText("Excess Emissions:")).toBeVisible();
    expect(screen.getAllByText(0)[2]).toBeVisible();
    expect(screen.getAllByText("tCO2e")[2]).toBeVisible();

    // Check alert note
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "No compliance obligation or earned credits for this operation over the 2024 compliance period.",
    );
  });

  it("renders back button with correct urls", () => {
    render(<ComplianceSummaryReviewComponent data={mockData} />);

    // Check button text and states
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    expect(backButton).not.toBeDisabled();

    const continueButton = screen.queryByRole("button", { name: "Continue" });
    expect(continueButton).toBeNull();

    // Verify router push is called with correct URLs when buttons are clicked
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/compliance-summaries");
  });
});
