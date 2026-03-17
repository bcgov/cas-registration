import { render, screen } from "@testing-library/react";
import InternalInterestSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-interest-summary/InternalInterestSummaryReviewComponent";

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

const baseData = {
  has_penalty: true,
  penalty_status: "Not Paid",
  penalty_type: "Late Submission",
  penalty_amount: "100.00",
  faa_interest: "10.00",
  total_amount: "110.00",
  data_is_fresh: true,
} as any;

describe("InternalInterestSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with correct data", () => {
    render(
      <InternalInterestSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );

    expect(screen.getByText("Review Interest Summary")).toBeVisible();
    expect(screen.getByText("GGEAPAR Interest")).toBeVisible();

    expect(
      screen.getByText(
        /Financial Administration Act \(FAA\) interest is incurred and accrues at/i,
      ),
    ).toBeVisible();

    expect(screen.getByText("Status:")).toBeVisible();
    expect(screen.getByText("Due")).toBeVisible();

    expect(screen.getByText("GGEAPAR Interest Rate (Annual):")).toBeVisible();
    expect(screen.getByText("Prime + 3.00%"));

    expect(screen.getByText("GGEAPAR Interest Amount:")).toBeVisible();
    expect(screen.getByText("100.00")).toBeVisible();

    expect(screen.getByText("FAA Interest (Annual):")).toBeVisible();
    expect(screen.getByText("10.00")).toBeVisible();

    expect(screen.getByText("Total Amount:")).toBeVisible();
    expect(screen.getByText("110.00")).toBeVisible();
  });

  it("renders step buttons with correct back URL", () => {
    render(
      <InternalInterestSummaryReviewComponent
        data={baseData}
        complianceReportVersionId={123}
      />,
    );

    expect(
      screen.getByText(
        "Back: /compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
      ),
    ).toBeVisible();
  });

  it("navigates to penalty review when balance is zero and penalty is applicable", () => {
    const dataWithPenalty = {
      ...baseData,
      penalty_status: "NOT PAID",
    };

    render(
      <InternalInterestSummaryReviewComponent
        data={dataWithPenalty as any}
        complianceReportVersionId={123}
        penaltyStatus="NOT PAID"
        outstandingBalance={0}
      />,
    );

    expect(
      screen.getByText(
        "Continue: /compliance-administration/compliance-summaries/123/review-penalty-summary",
      ),
    ).toBeVisible();
  });
});
