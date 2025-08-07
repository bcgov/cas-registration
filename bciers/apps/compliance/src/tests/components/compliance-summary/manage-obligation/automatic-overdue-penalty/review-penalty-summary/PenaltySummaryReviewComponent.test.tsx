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
  days_late: 30,
  penalty_charge_rate: "10%",
  accumulated_penalty: "1000.00",
  accumulated_compounding: "100.00",
  total_penalty: "1100.00",
  faa_interest: "50.00",
  total_amount: "1000.00",
  data_is_fresh: true,
};

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

const getGeneratePenaltyInvoiceButton = () =>
  screen.getByRole("button", { name: "Generate Penalty Invoice" });

describe("PenaltySummaryReviewComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockWindowOpen.mockClear();

    if (!("createObjectURL" in URL)) {
      // @ts-ignore
      URL.createObjectURL = vi.fn();
    }

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-invoice-url");
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
      "/compliance-summaries/123/pay-obligation-track-payments",
    );

    const generatePenaltyInvoiceButton = getGeneratePenaltyInvoiceButton();
    expect(generatePenaltyInvoiceButton).toBeVisible();

    const continueButton = screen.getByTestId("continue-button");
    expect(continueButton).toBeVisible();
    expect(continueButton).toHaveAttribute(
      "data-url",
      "/compliance-summaries/123/download-payment-penalty-instructions",
    );
  });

  it("handles invoice generation correctly", async () => {
    const user = userEvent.setup();

    const mockBlob = new Blob(["dummy PDF"], { type: "application/pdf" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
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

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "blob:fake-invoice-url",
      "_blank",
      "noopener,noreferrer",
    );

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

    expect(mockWindowOpen).not.toHaveBeenCalled();

    const alerts = await screen.findAllByRole("alert");
    const hasErrorText = alerts.some(
      (el) =>
        el.textContent?.toLowerCase().includes("unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);
    expect(getGeneratePenaltyInvoiceButton()).toBeEnabled();
  });
});
