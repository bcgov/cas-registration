import { render, screen } from "@testing-library/react";
import PenaltySummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewComponent";

// Mock the FormBase component
vi.mock("@bciers/components/form/FormBase", () => ({
  default: ({
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
    middleButtonText,
    onMiddleButtonClick,
  }: {
    backUrl: string;
    continueUrl: string;
    middleButtonText?: string;
    onMiddleButtonClick?: () => void;
  }) => (
    <div data-testid="step-buttons">
      <button data-testid="back-button" data-url={backUrl}>
        Back
      </button>
      {middleButtonText && (
        <button data-testid="middle-button" onClick={onMiddleButtonClick}>
          {middleButtonText}
        </button>
      )}
      <button data-testid="continue-button" data-url={continueUrl}>
        Continue
      </button>
    </div>
  ),
}));

// Mock the schema creation functions
vi.mock(
  "@/compliance/src/app/data/jsonSchema/manageObligation/automatic-overdue-penalty/review-penalty-summary/penaltySummaryReviewSchema",
  () => ({
    createPenaltySummaryReviewSchema: vi
      .fn()
      .mockReturnValue({ type: "object" }),
    penaltySummaryReviewUiSchema: {},
  }),
);

const mockData = {
  penalty_status: "Overdue",
  penalty_type: "Automatic",
  days_late: 30,
  penalty_charge_rate: "10%",
  accumulated_penalty: "1000.00",
  accumulated_compounding: "100.00",
  total_penalty: "1100.00",
  faa_interest: "50.00",
  total_amount: "1000.00",
};

describe("PenaltySummaryReviewComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
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
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceSummaryId="123"
      />,
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeVisible();
    expect(backButton).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/pay-obligation-track-payments",
    );

    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeVisible();
    expect(continueButton).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/download-payment-instructions",
    );
  });

  it("renders middle button for generating penalty invoice", () => {
    render(
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceSummaryId="123"
      />,
    );

    const middleButton = screen.getByTestId("middle-button");
    expect(middleButton).toBeVisible();
    expect(middleButton).toHaveTextContent("Generate Penalty Invoice");
  });
});
