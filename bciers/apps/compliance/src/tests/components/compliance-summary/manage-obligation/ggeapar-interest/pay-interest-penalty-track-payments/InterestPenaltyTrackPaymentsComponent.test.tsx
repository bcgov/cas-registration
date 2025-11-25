import { render, screen } from "@testing-library/react";
import { InterestPenaltyTrackPaymentsComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/pay-interest-penalty-track-payments/InterestPenaltyTrackPaymentsComponent";
import { PenaltyStatus } from "@bciers/utils/src/enums";

// Mock ComplianceStepButtons to inspect URLs easily
vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  default: ({ backUrl }: { backUrl: string }) => (
    <div data-testid="step-buttons">
      <button data-testid="back-button" data-url={backUrl}>
        Back
      </button>
    </div>
  ),
}));

// Pass-through mock for schema import so we don't load RJSF in unit tests
vi.mock(
  "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/pay-interest-penalty-track-payments/payInterestPenaltyTrackPaymentsSchema",
  async () => {
    const actual = await vi.importActual<
      typeof import("@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/pay-interest-penalty-track-payments/payInterestPenaltyTrackPaymentsSchema")
    >(
      "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/pay-interest-penalty-track-payments/payInterestPenaltyTrackPaymentsSchema",
    );
    return { ...actual };
  },
);

const baseData = {
  reporting_year: 2024,
  outstanding_amount: "2500.0",
  penalty_status: PenaltyStatus.ACCRUING,
  payment_data: {
    rows: [
      {
        id: 1,
        amount: 1000,
        received_date: "2025-08-05",
        payment_method: "EFT",
        payment_object_id: "INT123",
      },
    ],
    row_count: 1,
  },
  payments: [
    {
      id: 1,
      amount: 1000,
      received_date: "2025-08-05",
      payment_method: "EFT",
      payment_object_id: "INT123",
      payment_header: "Payment 1",
    },
  ],
};

const complianceReportVersionId = 999;

describe("InterestPenaltyTrackPaymentsComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <InterestPenaltyTrackPaymentsComponent
        data={baseData}
        complianceReportVersionId={complianceReportVersionId}
      />,
    );

    // Form title
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Pay Interest and Track Payment(s)",
    );

    // Section header
    expect(screen.getByText("Outstanding Interest")).toBeVisible();
    expect(screen.getByText("$2,500.00")).toBeVisible();
    expect(screen.getByText("Payment 1")).toBeVisible();
  });

  it("renders step buttons with the correct back URL", () => {
    render(
      <InterestPenaltyTrackPaymentsComponent
        data={baseData}
        complianceReportVersionId={complianceReportVersionId}
      />,
    );

    expect(screen.getByTestId("back-button")).toHaveAttribute(
      "data-url",
      "/compliance-administration/compliance-summaries/999/download-interest-payment-instructions",
    );
  });

  it("shows outstanding interest note when not paid", () => {
    render(
      <InterestPenaltyTrackPaymentsComponent
        data={baseData}
        complianceReportVersionId={111}
      />,
    );

    expect(
      screen.getByText(/Please pay the outstanding interest/i),
    ).toBeVisible();
  });

  it("shows success note when interest is paid", () => {
    const paidData = {
      ...baseData,
      outstanding_amount: "0",
      penalty_status: PenaltyStatus.PAID,
    };

    render(
      <InterestPenaltyTrackPaymentsComponent
        data={paidData}
        complianceReportVersionId={222}
      />,
    );

    expect(
      screen.getByText(
        /Your payment\(s\) has been received and applied successfully/i,
      ),
    ).toBeVisible();
  });
});
