import { render, screen } from "@testing-library/react";
import { InternalComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent";

// Mock the step buttons to assert the backUrl
vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  __esModule: true,
  default: ({ backUrl }: { backUrl: string }) => (
    <div>Mock Buttons - {backUrl}</div>
  ),
}));

describe("InternalComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseData = {
    id: 99,
    reporting_year: 2030,
    operation_name: "Test Operation",
    obligation_id: "24-0001-1-1",
    compliance_charge_rate: 80.0,
    equivalent_value: 800.0,
    outstanding_balance_tco2e: 10.0,
    outstanding_balance_equivalent_value: 800.0,
  } as any;

  it("renders section headers", () => {
    render(<InternalComplianceSummaryReviewComponent data={baseData} />);

    expect(
      screen.getByText("Review 2030 Compliance Obligation Report"),
    ).toBeVisible();
    expect(screen.getByText("2030 Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Outstanding Compliance Obligation")).toBeVisible();
  });

  it("renders all field labels", () => {
    render(<InternalComplianceSummaryReviewComponent data={baseData} />);

    expect(screen.getByText("Obligation ID:")).toBeVisible();
    expect(screen.getByText("2030 Compliance Charge Rate:")).toBeVisible();
    expect(screen.getAllByText("Equivalent Value:")).toHaveLength(2);
    expect(screen.getByText("Outstanding Balance:")).toBeVisible();
  });

  it("renders step buttons with back URL", () => {
    render(<InternalComplianceSummaryReviewComponent data={baseData} />);
    expect(
      screen.getByText("Mock Buttons - /compliance-summaries"),
    ).toBeInTheDocument();
  });
});
