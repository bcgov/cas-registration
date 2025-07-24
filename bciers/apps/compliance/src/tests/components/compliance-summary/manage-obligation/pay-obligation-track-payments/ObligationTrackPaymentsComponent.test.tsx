import { render, screen } from "@testing-library/react";
import { ObligationTrackPaymentsComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsComponent";

vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  default: ({
    backUrl,
    continueUrl,
  }: {
    backUrl: string;
    continueUrl: string;
  }) => (
    <div data-testid="step-buttons">
      <button data-testid="back-button" data-url={backUrl}>
        Back
      </button>
      <button data-testid="continue-button" data-url={continueUrl}>
        Continue
      </button>
    </div>
  ),
}));

vi.mock(
  "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema",
  async () => {
    const actual = await vi.importActual<
      typeof import("@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema")
    >(
      "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema",
    );
    return {
      ...actual,
    };
  },
);

const mockData = {
  reporting_year: "2024",
  outstanding_balance: 0.0,
  equivalent_value: 0.0,
  payments: [
    {
      id: 1,
      amount: 8000,
      received_date: "Dec 6, 2025",
      payment_method: "Credit Card",
      transaction_type: "Payment",
      payment_object_id: "RCP-001",
      payment_header: "Payment 1",
      payment_amount_received: 8000,
    },
  ],
};

const mockComplianceReportVersionId = 123;

describe("ObligationTrackPaymentsComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <ObligationTrackPaymentsComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    // Check that the main form label is present
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Pay Obligation and Track Payment(s)",
    );

    // Check Outstanding Balance label and value
    expect(screen.getByText("Outstanding Balance:")).toBeVisible();
    expect(screen.getByText("0")).toBeVisible();

    // Check Equivalent Value label and value
    expect(screen.getByText("Equivalent Value:")).toBeVisible();
    expect(screen.getByText("$0.00")).toBeVisible();

    // Check a known payment header is rendered
    expect(screen.getByText("Payment 1")).toBeVisible();

    // Check the payment received date from mockData
    expect(screen.getByText("2025-12-06")).toBeVisible();
  });

  it("renders step buttons with correct URLs", () => {
    render(
      <ObligationTrackPaymentsComponent
        data={mockData}
        complianceReportVersionId={mockComplianceReportVersionId}
      />,
    );

    expect(screen.getByTestId("back-button")).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/manage-obligation-review-summary",
    );
    expect(screen.getByTestId("continue-button")).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/automatic-overdue-penalty",
    );
  });

  it("does not render the automatic penalty alert when penalty_status is NONE", () => {
    // Clone mockData but explicitly set penalty_status to "NONE"
    const mockDataNoPenalty = { ...mockData, penalty_status: "NONE" };

    render(
      <ObligationTrackPaymentsComponent
        data={mockDataNoPenalty}
        complianceReportVersionId={789}
      />,
    );

    // Assert the penalty message is NOT in the document
    const penaltyMessage =
      /You have an automatic administrative penalty because the compliance obligation was fully met after the compliance obligation deadline/i;
    expect(screen.queryByText(penaltyMessage)).not.toBeInTheDocument();
  });

  it("renders the automatic penalty alert when penalty_status is ACCRUING", () => {
    // Clone mockData but explicitly set penalty_status to "ACCRUING"
    const mockDataWithPenalty = {
      ...mockData,
      penalty_status: "ACCRUING",
    };

    render(
      <ObligationTrackPaymentsComponent
        data={mockDataWithPenalty}
        complianceReportVersionId={456}
      />,
    );

    expect(
      screen.getByText(
        /You have an automatic administrative penalty because the compliance obligation was fully met after the compliance obligation deadline/i,
      ),
    ).toBeVisible();
  });
});
