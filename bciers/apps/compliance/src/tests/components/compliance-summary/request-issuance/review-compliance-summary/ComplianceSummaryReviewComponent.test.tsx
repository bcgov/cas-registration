import { render, screen, fireEvent, within } from "@testing-library/react";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewComponent";
import { useRouter, useSessionRole } from "@bciers/testConfig/mocks";

// Mock the router
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

const mockComplianceSummaryId = "123";
const mockData = {
  operation_name: "Test Operation",
  reporting_year: 2024,
  excess_emissions: -15.0,
  emission_limit: "100.0",
  emissions_attributable_for_compliance: "85.0",
  earned_credits_amount: 15,
  issuance_status: "Issuance not requested",
  earned_credits_issued: false,
  id: 123,
};

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user");
  });

  it("renders the form with correct schema fields and headers", () => {
    render(
      <ComplianceSummaryReviewComponent
        complianceSummaryId={mockComplianceSummaryId}
        data={mockData}
        isCasStaff={false}
      />,
    );

    // Check form title
    expect(screen.getByText("Review 2024 Compliance Summary")).toBeVisible();

    // Check Summary section
    expect(screen.getByText("From 2024 Report")).toBeVisible();
    expect(
      screen.getByText("Emissions Attributable for Compliance:"),
    ).toBeVisible();
    expect(screen.getByText("85.0")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[0]).toBeVisible();
    expect(screen.getByText("Emissions Limit:")).toBeVisible();
    expect(screen.getByText("100.0")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[1]).toBeVisible();
    expect(screen.getByText("Excess Emissions:")).toBeVisible();
    expect(screen.getByText(-15.0)).toBeVisible();
    expect(screen.getAllByText("tCO2e")[2]).toBeVisible();

    // Check Earned Credits section
    expect(screen.getByText("Earned Credits")).toBeVisible();
    expect(screen.getByText("Earned Credits:")).toBeVisible();
    expect(screen.getByText("15")).toBeVisible();
    expect(screen.getByText("Status of Issuance:")).toBeVisible();
    expect(screen.getByText("Issuance not requested")).toBeVisible();

    // Check alert note
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "The earned credits have not been issued yet. You may request issuance of them as long as you have an active trading account in the B.C. Carbon Registry (BCCR). Once issued, you may trade or use them to meet your compliance obligation.",
    );
    const bccrLink = within(alertNote).getByRole("link", {
      name: "B.C. Carbon Registry",
    });
    expect(bccrLink).toBeVisible();
    expect(bccrLink).toHaveAttribute(
      "href",
      "https://carbonregistry.gov.bc.ca/bccarbonregistry",
    );
    expect(bccrLink).toHaveAttribute("target", "_blank");
    expect(bccrLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders navigation buttons with correct urls", () => {
    render(
      <ComplianceSummaryReviewComponent
        complianceSummaryId={mockComplianceSummaryId}
        data={mockData}
        isCasStaff={false}
      />,
    );

    // Check button text and states
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    expect(backButton).not.toBeDisabled();

    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeVisible();
    expect(continueButton).not.toBeDisabled();

    // Verify router push is called with correct URLs when buttons are clicked
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/compliance-summaries");

    fireEvent.click(continueButton);
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-summaries/123/request-issuance-of-earned-credits",
    );
  });
});
