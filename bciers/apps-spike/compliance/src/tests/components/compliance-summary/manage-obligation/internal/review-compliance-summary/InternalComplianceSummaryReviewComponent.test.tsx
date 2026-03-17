import { render, screen } from "@testing-library/react";
import { InternalComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent";

// Mock the step buttons to assert the backUrl and continueUrl
vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  __esModule: true,
  default: ({
    backUrl,
    continueUrl,
  }: {
    backUrl: string;
    continueUrl?: string;
  }) => (
    <div>
      <div>Back: {backUrl}</div>
      <div>Continue: {continueUrl}</div>
    </div>
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
    render(
      <InternalComplianceSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );

    expect(
      screen.getByText("Review 2030 Compliance Obligation Report"),
    ).toBeVisible();
    expect(screen.getByText("2030 Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Outstanding Compliance Obligation")).toBeVisible();
  });

  it("renders all field labels", () => {
    render(
      <InternalComplianceSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );

    expect(screen.getByText("Obligation ID:")).toBeVisible();
    expect(screen.getByText("2030 Compliance Charge Rate:")).toBeVisible();
    expect(screen.getAllByText("Equivalent Value:")).toHaveLength(2);
    expect(screen.getByText("Outstanding Balance:")).toBeVisible();
  });

  it("renders step buttons with back URL", () => {
    render(
      <InternalComplianceSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );
    expect(
      screen.getByText("Back: /compliance-administration/compliance-summaries"),
    ).toBeVisible();
  });

  it("navigates to interest review when there is a late submission penalty", () => {
    const dataWithInterest = {
      ...baseData,
      outstanding_balance_tco2e: 0,
      has_late_submission_penalty: true,
      penalty_status: "NOT PAID",
    };

    render(
      <InternalComplianceSummaryReviewComponent
        data={dataWithInterest as any}
        complianceReportVersionId={123}
      />,
    );

    expect(
      screen.getByText(
        "Continue: /compliance-administration/compliance-summaries/123/review-interest-summary",
      ),
    ).toBeVisible();
  });

  it("navigates to penalty review when balance is zero and penalty is applicable", () => {
    const dataWithPenalty = {
      ...baseData,
      outstanding_balance_tco2e: 0,
      has_late_submission_penalty: false,
      penalty_status: "NOT PAID",
    };

    render(
      <InternalComplianceSummaryReviewComponent
        data={dataWithPenalty as any}
        complianceReportVersionId={123}
      />,
    );

    expect(
      screen.getByText(
        "Continue: /compliance-administration/compliance-summaries/123/review-penalty-summary",
      ),
    ).toBeVisible();
  });
});
