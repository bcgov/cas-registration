import { render, screen } from "@testing-library/react";
import PenaltySummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/review-penalty-summary/PenaltySummaryReviewComponent";
import userEvent from "@testing-library/user-event";

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
  penalty_charge_rate: "10%",
  total_penalty: "1100.00",
  faa_interest: "50.00",
  total_amount: "1000.00",
};

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// A fake browser tab returned by window.open that the util navigates to the PDF.
let fakeTab: { location: { href: string }; close: ReturnType<typeof vi.fn> };

const getGeneratePenaltyInvoiceButton = () =>
  screen.getByRole("button", { name: "Generate Penalty Invoice" });

describe("PenaltySummaryReviewComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    fakeTab = { location: { href: "" }, close: vi.fn() };
    mockWindowOpen.mockReset();
    mockWindowOpen.mockReturnValue(fakeTab);
    vi.stubGlobal("open", mockWindowOpen);
  });
  it("renders the form with correct data", () => {
    render(
      <PenaltySummaryReviewComponent
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

  it("renders step buttons with correct URLs", () => {
    render(
      <PenaltySummaryReviewComponent
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

    const generatePenaltyInvoiceButton = getGeneratePenaltyInvoiceButton();
    expect(generatePenaltyInvoiceButton).toBeVisible();

    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeVisible();
    expect(continueButton).toHaveAttribute(
      "data-url",
      "/compliance-administration/compliance-summaries/123/download-payment-penalty-instructions",
    );
  });

  it("uses pay-interest-penalty-track-payments as back URL when obligation is fully paid and hasLateSubmissionPenalty is true", () => {
    render(
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceReportVersionId={456}
        hasLateSubmissionPenalty
        outstandingBalance={0}
      />,
    );

    const backButton = screen.getByTestId("back-button");
    expect(backButton).toBeVisible();
    expect(backButton).toHaveAttribute(
      "data-url",
      "/compliance-administration/compliance-summaries/456/pay-interest-penalty-track-payments",
    );

    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeVisible();
    expect(continueButton).toHaveAttribute(
      "data-url",
      "/compliance-administration/compliance-summaries/456/download-payment-penalty-instructions",
    );
  });

  it("handles invoice generation correctly", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
      }),
    );

    render(
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceReportVersionId={123}
      />,
    );

    await user.click(getGeneratePenaltyInvoiceButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/invoice/123/automatic-overdue-penalty",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    // A preview tab is opened synchronously, then navigated directly to the
    // route URL so the browser honours the Content-Disposition filename.
    expect(mockWindowOpen).toHaveBeenCalledWith("", "_blank");
    expect(fakeTab.location.href).toBe(
      "/compliance/api/invoice/123/automatic-overdue-penalty",
    );
    expect(fakeTab.close).not.toHaveBeenCalled();

    expect(getGeneratePenaltyInvoiceButton()).toBeEnabled();
  });

  it("displays an error when invoice generation fails", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({
          message: "Unable to generate invoice",
        }),
      }),
    );

    render(
      <PenaltySummaryReviewComponent
        data={mockData}
        reportingYear={2024}
        complianceReportVersionId={999}
      />,
    );

    await user.click(getGeneratePenaltyInvoiceButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/invoice/999/automatic-overdue-penalty",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    // The placeholder tab is opened, then closed on error (never navigated).
    expect(mockWindowOpen).toHaveBeenCalledWith("", "_blank");
    expect(fakeTab.close).toHaveBeenCalled();
    expect(fakeTab.location.href).toBe("");

    const alerts = await screen.findAllByRole("alert");
    const hasErrorText = alerts.some((el) =>
      el.textContent?.toLowerCase().includes("unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);
    expect(getGeneratePenaltyInvoiceButton()).toBeEnabled();
  });
});
