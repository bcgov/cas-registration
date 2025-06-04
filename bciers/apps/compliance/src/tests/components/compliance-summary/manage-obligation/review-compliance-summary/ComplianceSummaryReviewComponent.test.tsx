import { render, screen } from "@testing-library/react";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import userEvent from "@testing-library/user-event";

// Mock window.open to behave synchronously
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// Mock the grid components
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

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
    vi.restoreAllMocks();
  });

  it("renders the component with all sections", () => {
    render(
      <ComplianceSummaryReviewComponent
        data={mockData}
        complianceSummaryId="123"
      />,
    );

    // Check form title
    expect(screen.getByText("Review 2025 Compliance Summary")).toBeVisible();

    // Check Summary Section
    expect(screen.getByText("From 2025 Report")).toBeVisible();
    expect(
      screen.getByText("Emissions Attributable for Compliance:"),
    ).toBeVisible();
    expect(screen.getByText("1200.0000")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[0]).toBeVisible();

    expect(screen.getByText("Emissions Limit:")).toBeVisible();
    expect(screen.getByText("1000.0000")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[1]).toBeVisible();

    expect(screen.getByText("Excess Emissions:")).toBeVisible();
    expect(screen.getByText("200.0000")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[2]).toBeVisible();

    // Check Obligation Section
    expect(screen.getByText("2025 Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Obligation ID:")).toBeVisible();
    expect(screen.getByText("25-0001-1-1")).toBeVisible();
    expect(screen.getByText("2025 Compliance Charge Rate:")).toBeVisible();
    expect(screen.getByText(/80\.00/i)).toBeVisible();
    expect(screen.getByText("/tCO2e")).toBeVisible();
    expect(screen.getAllByText("Equivalent Value:")[0]).toBeVisible();
    expect(screen.getByText(/16000\.00/i)).toBeVisible();

    // Check grid components are rendered
    expect(screen.getByText("Compliance Units Applied")).toBeVisible();
    expect(screen.getByText("Mock Compliance Units Grid")).toBeVisible();
    expect(screen.getByText("Monetary Payments Made")).toBeVisible();
    expect(screen.getByText("Mock Monetary Payments Grid")).toBeVisible();

    // Check Outstanding Balance Section
    expect(screen.getByText("Outstanding Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Outstanding Balance:")).toBeVisible();
    expect(screen.getByText("300.0000")).toBeVisible();
    expect(screen.getAllByText("tCO2e")[3]).toBeVisible();
    expect(screen.getAllByText("Equivalent Value:")[1]).toBeVisible();
    expect(screen.getByText(/17000\.00/i)).toBeVisible();

    // Check Penalty Section
    expect(
      screen.getByText("Automatic Overdue Penalty (as of Today):"),
    ).toBeVisible();

    // Check Penalty Alert Note
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "The automatic administrative penalty will continue accruing until the compliance obligation is fully met. Once fully met, you will receive the final administrative penalty invoice.",
    );

    expect(screen.getByText("Penalty Status:")).toBeVisible();
    expect(screen.getByText("Accruing")).toBeVisible();
    expect(screen.getByText("Penalty Type:")).toBeVisible();
    expect(screen.getByText("Automatic Overdue")).toBeVisible();
    expect(screen.getByText("Penalty Rate (Daily):")).toBeVisible();
    expect(screen.getByText("0.38")).toBeVisible();
    expect(screen.getByText("%")).toBeVisible();
    expect(screen.getByText("Days Late:")).toBeVisible();
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("Accumulated Penalty:")).toBeVisible();
    expect(screen.getByText(/91\.5/i)).toBeVisible();
    expect(screen.getByText("Accumulated Compounding:")).toBeVisible();
    expect(screen.getByText(/0\.35/i)).toBeVisible();
    expect(screen.getByText("Penalty (as of Today):")).toBeVisible();
    expect(screen.getByText(/92\.55/i)).toBeVisible();

    // Check FAA Interest and Total Amount
    expect(screen.getByText("FAA Interest (as of Today):")).toBeVisible();
    expect(screen.getByText(/1\.00/i)).toBeVisible();
    expect(screen.getByText("Total Amount (as of Today):")).toBeVisible();
    expect(screen.getByText(/93\.55/i)).toBeVisible();

    // Check navigation buttons
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeVisible();

    // Check Generate Invoice button
    const generateInvoiceButton = screen.getByRole("button", {
      name: "Generate Compliance Invoice",
    });
    expect(generateInvoiceButton).toBeVisible();
    expect(generateInvoiceButton).not.toBeDisabled();
  });

  it("handles invoice generation correctly", async () => {
    const user = userEvent.setup();

    // Mock `fetch` to return a successful response with a Blob
    const mockBlob = new Blob(["dummy PDF"], { type: "application/pdf" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
      } as unknown as Response),
    );

    // Define `URL.createObjectURL` (JSDOM doesn’t provide it by default)
    const fakeUrl = "blob:fake-invoice-url";
    (URL as any).createObjectURL = vi.fn(() => fakeUrl);

    render(
      <ComplianceSummaryReviewComponent
        data={mockData}
        complianceSummaryId="123"
      />,
    );

    const generateInvoiceButton = screen.getByRole("button", {
      name: "Generate Compliance Invoice",
    });
    expect(generateInvoiceButton).toBeEnabled();

    // Click the button to trigger handleGenerateInvoice()
    await user.click(generateInvoiceButton);

    // Verify `fetch` was called with the correct URL and options
    expect(fetch).toHaveBeenCalledWith("/compliance/api/invoice/123", {
      method: "GET",
      cache: "no-store",
    });

    // Verify `createObjectURL` was called with the returned Blob
    expect((URL as any).createObjectURL).toHaveBeenCalledWith(mockBlob);

    // Verify `window.open` was called with the fake URL and correct args
    expect(mockWindowOpen).toHaveBeenCalledWith(
      fakeUrl,
      "_blank",
      "noopener,noreferrer",
    );

    // 7) Finally, the button should be re‐enabled
    expect(
      screen.getByRole("button", { name: "Generate Compliance Invoice" }),
    ).toBeEnabled();
  });

  it("displays an error when invoice generation fails", async () => {
    const user = userEvent.setup();

    // 1) Mock `fetch` to return a non-OK response with an `errors` object
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          errors: { invoice: ["Unable to generate invoice"] },
        }),
      } as unknown as Response),
    );

    render(
      <ComplianceSummaryReviewComponent
        data={mockData}
        complianceSummaryId="999"
      />,
    );

    const generateInvoiceButton = screen.getByRole("button", {
      name: "Generate Compliance Invoice",
    });
    expect(generateInvoiceButton).toBeEnabled();

    // Click to trigger the failing case
    await user.click(generateInvoiceButton);

    // Verify `fetch` was called with the correct URL
    expect(fetch).toHaveBeenCalledWith("/compliance/api/invoice/999", {
      method: "GET",
      cache: "no-store",
    });

    // Ensure `window.open` was not called
    expect(mockWindowOpen).not.toHaveBeenCalled();

    // Confirm the error message is displayed in an alert role
    const allAlerts = await screen.findAllByRole("alert");
    const hasErrorText = allAlerts.some(
      (node) => node.textContent?.includes("Unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);

    // Finally, the button should be re‐enabled after the error
    expect(
      screen.getByRole("button", { name: "Generate Compliance Invoice" }),
    ).toBeEnabled();
  });
});
