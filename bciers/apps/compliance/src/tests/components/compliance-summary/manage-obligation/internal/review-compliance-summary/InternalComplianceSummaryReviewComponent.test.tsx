import { render, screen, within } from "@testing-library/react";
import { InternalComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";

useRouter.mockReturnValue({
  query: {},
  push: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

// Mock the step buttons to assert the backUrl and continueUrl
vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
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
    applied_units_summary: {
      compliance_report_version_id: 123,
      applied_compliance_units: {
        row_count: 1,
        rows: [
          {
            id: "1",
            type: "Earned Credits",
            serial_number: "BC-789-012",
            vintage_year: "2029",
            quantity_applied: 50,
            equivalent_value: 4000,
          },
        ],
        can_apply_compliance_units: true,
      },
    },
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

  it("renders the compliance units applied section without the apply button or the BCCR banner", () => {
    render(
      <InternalComplianceSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );

    expect(screen.getByText("Compliance Units Applied")).toBeVisible();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByText("Earned Credits")).toBeVisible();
    expect(within(rows[1]).getByText("BC-789-012")).toBeVisible();
    expect(within(rows[1]).getByText("$4,000.00")).toBeVisible();

    expect(
      screen.queryByRole("button", { name: "Apply Compliance Units" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
