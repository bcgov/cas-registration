import { render, screen } from "@testing-library/react";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import userEvent from "@testing-library/user-event";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceUnitsGrid",
  () => ({
    ComplianceUnitsGrid: () => <div>Compliance Units Applied</div>,
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid",
  () => ({
    MonetaryPaymentsGrid: () => <div>Monetary Payments Made</div>,
  }),
);

const mockData: ComplianceSummaryReviewPageData = {
  id: 2,
  obligation_id: "24-0019-3-3",
  operation_name: "Compliance SFO - Obligation not met",
  operation_bcghg_id: "13219990046",
  reporting_year: 2025,
  excess_emissions: 5264.635,
  emissions_attributable_for_compliance: 5500.0,
  emissions_limit: 235.365,
  credited_emissions: 0.0,
  outstanding_balance: 421170.8,
  compliance_charge_rate: 80.0,
  equivalent_value: 421170.8,
  outstanding_balance_equivalent_value: 33693664.0,
  status: "Obligation not met",
  monetary_payments: { rows: [], row_count: 0 },
  applied_units_summary: {
    compliance_report_version_id: "2",
    applied_compliance_units: { rows: [], row_count: 0 },
  },
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
    expect(screen.getByText("2025 Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Monetary Payments Made")).toBeVisible();
    expect(screen.getByText("Compliance Units Applied")).toBeVisible();
    expect(screen.getByText("Outstanding Compliance Obligation")).toBeVisible();
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
    const hasErrorText = alerts.some((el) =>
      el.textContent?.toLowerCase().includes("unable to generate invoice"),
    );
    expect(hasErrorText).toBe(true);
    expect(getGenerateButton()).toBeEnabled();
  });
});
