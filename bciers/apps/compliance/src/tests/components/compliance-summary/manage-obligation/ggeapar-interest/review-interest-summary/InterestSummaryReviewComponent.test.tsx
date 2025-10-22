import { render, screen } from "@testing-library/react";
import InterestSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/review-interest-summary/InterestSummaryReviewComponent";

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
    middleButtonText,
  }: {
    backUrl: string;
    middleButtonText?: string;
  }) => (
    <div data-testid="step-buttons">
      <button data-testid="back-button" data-url={backUrl}>
        Back
      </button>
      {middleButtonText && (
        <button data-testid="middle-button">{middleButtonText}</button>
      )}
    </div>
  ),
}));

// Mock the schema creation functions
vi.mock(
  "@/compliance/src/app/data/jsonSchema/manageObligation/ggeapar-interest/review-interest-summary/interestSummaryReviewSchema",
  () => ({
    createInterestSummaryReviewSchema: vi
      .fn()
      .mockReturnValue({ type: "object" }),
    interestSummaryReviewUiSchema: {},
  }),
);

const mockData = {
  has_penalty: true,
  penalty_status: "Not Paid",
  penalty_type: "Late Submission",
  penalty_charge_rate: "5%",
  penalty_amount: "100.00",
  faa_interest: "10.00",
  total_amount: "110.00",
  data_is_fresh: true,
};

describe("InterestSummaryReviewComponent", () => {
  it("renders the form with correct data", () => {
    render(
      <InterestSummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceReportVersionId={123}
      />,
    );

    const formBase = screen.getByTestId("form-base");
    expect(formBase).toBeVisible();

    const formData = screen.getByTestId("form-data");
    expect(formData).toHaveTextContent(JSON.stringify(mockData));
  });

  it("renders step buttons with correct back URL and middle button", () => {
    render(
      <InterestSummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceReportVersionId={123}
      />,
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeVisible();
    expect(backButton).toHaveAttribute(
      "data-url",
      "/compliance-administration/compliance-summaries/123/pay-obligation-track-payments",
    );

    const middleButton = screen.getByTestId("middle-button");
    expect(middleButton).toBeVisible();
    expect(middleButton).toHaveTextContent("Generate Interest Invoice");
  });
});
