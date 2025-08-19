import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, useSessionRole } from "@bciers/testConfig/mocks";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/met-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";

// Mock the router
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

const mockData = {
  id: 1,
  operation_name: "Test Operation",
  reporting_year: 2024,
  compliance_charge_rate: 80.0,
  excess_emissions: 0,
  emissions_limit: "90.0",
  obligation_id: "test-obligation-id",
  outstanding_balance: 0.0,
  equivalent_value: 0.0,
  status: "Obligation fully met",
  outstanding_balance_equivalent_value: 0.0,
};

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user");
  });

  it("renders the form with correct schema fields and headers", () => {
    render(<ComplianceSummaryReviewComponent data={mockData} />);

    // Check form title
    expect(screen.getByText("Review 2024 Obligation Summary")).toBeVisible();
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
