import { render, screen } from "@testing-library/react";
import { ObligationTrackPaymentsComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsComponent";

// Mock the FormBase component
vi.mock("@bciers/components/form", () => ({
  FormBase: ({
    children,
    formData,
  }: {
    children: React.ReactNode;
    formData: any;
  }) => (
    <div data-testid="form-base">
      <div data-testid="form-data">{JSON.stringify(formData)}</div>
      {children}
    </div>
  ),
}));

// Mock the ComplianceStepButtons component
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

// Mock the schema creation functions
vi.mock(
  "@/compliance/src/app/data/jsonSchema/manageObligation/payObligationTrackPaymentsSchema",
  () => ({
    createPayObligationTrackPaymentsSchema: vi
      .fn()
      .mockReturnValue({ type: "object" }),
    payObligationTrackPaymentsUiSchema: {},
  }),
);

const mockData = {
  reportingYear: "2024",
  outstandingBalance: "0",
  equivalentValue: "0.00",
  paymentReceivedDate: "Dec 6, 2025",
  paymentAmountReceived: "8,000.00",
};

describe("ObligationTrackPaymentsComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <ObligationTrackPaymentsComponent
        data={mockData}
        complianceSummaryId="123"
      />,
    );

    const formBase = screen.getByTestId("form-base");
    expect(formBase).toBeVisible();

    const formData = screen.getByTestId("form-data");
    expect(formData).toHaveTextContent(JSON.stringify(mockData));
  });

  it("renders step buttons with correct URLs", () => {
    render(
      <ObligationTrackPaymentsComponent
        data={mockData}
        complianceSummaryId="123"
      />,
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeVisible();
    expect(backButton).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/manage-obligation-review-summary",
    );

    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeVisible();
    expect(continueButton).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/automatic-overdue-penalty",
    );
  });
});
