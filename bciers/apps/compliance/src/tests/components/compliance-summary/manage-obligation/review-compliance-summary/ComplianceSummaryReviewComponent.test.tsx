import { render, screen } from "@testing-library/react";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import userEvent from "@testing-library/user-event";

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid",
  () => ({
    ComplianceUnitsGrid: () => <div>Mock Compliance Units Grid</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid",
  () => ({
    MonetaryPaymentsGrid: () => <div>Mock Monetary Payments Grid</div>,
  }),
);

const mockData = {
  reportingYear: "2025",
  emissionsAttributableForCompliance: "1200.0000",
  emissionLimit: "1000.0000",
  excessEmissions: "200.0000",
  obligationId: "25-0001-1-1",
  complianceChargeRate: "80.00",
  equivalentValue: "16000.00",
  outstandingBalance: "300.0000",
  outstandingBalanceEquivalentValue: "17000.00",
  penaltyStatus: "Accruing",
  penaltyType: "Automatic Overdue",
  penaltyChargeRate: "0.38",
  daysLate: "3",
  accumulatedPenalty: "91.5",
  accumulatedCompounding: "0.35",
  penaltyToday: "92.55",
  faaInterest: "1.00",
  totalAmount: "93.55",
};

const setupComponent = (id = "123") =>
  render(
    <ComplianceSummaryReviewComponent
      data={mockData}
      complianceSummaryId={id}
    />,
  );

const getGenerateButton = () =>
  screen.getByRole("button", { name: "Generate Compliance Invoice" });

describe("ComplianceSummaryReviewComponent", () => {
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

  it("renders the component with all sections", () => {
    setupComponent();
    expect(screen.getByText("Review 2025 Compliance Summary")).toBeVisible();
    expect(screen.getByText("From 2025 Report")).toBeVisible();
    expect(screen.getByText("1200.0000")).toBeVisible();
    expect(screen.getByText("1000.0000")).toBeVisible();
    expect(screen.getByText("200.0000")).toBeVisible();
    expect(screen.getByText("25-0001-1-1")).toBeVisible();
    expect(screen.getByText(/80\.00/)).toBeVisible();
    expect(screen.getByText(/16000\.00/)).toBeVisible();
    expect(screen.getByText("Mock Compliance Units Grid")).toBeVisible();
    expect(screen.getByText("Mock Monetary Payments Grid")).toBeVisible();
    expect(screen.getByText("300.0000")).toBeVisible();
    expect(screen.getByText(/17000\.00/)).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(/penalty/i);
    expect(getGenerateButton()).toBeEnabled();
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

    setupComponent();

    await user.click(getGenerateButton());

    expect(fetch).toHaveBeenCalledWith("/compliance/api/invoice/123", {
      method: "GET",
      cache: "no-store",
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      "blob:fake-invoice-url",
      "_blank",
      "noopener,noreferrer",
    );

    expect(getGenerateButton()).toBeEnabled();
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

    setupComponent("999");

    await user.click(getGenerateButton());

    expect(fetch).toHaveBeenCalledWith("/compliance/api/invoice/999", {
      method: "GET",
      cache: "no-store",
    });

    expect(mockWindowOpen).not.toHaveBeenCalled();

    const alerts = await screen.findAllByRole("alert");
    const hasErrorText = alerts.some(
      (el) =>
        el.textContent?.toLowerCase().includes("unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);
    expect(getGenerateButton()).toBeEnabled();
  });
});
