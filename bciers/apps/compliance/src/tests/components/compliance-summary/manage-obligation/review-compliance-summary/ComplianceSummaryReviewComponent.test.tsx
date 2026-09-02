import { render, screen } from "@testing-library/react";
import { ComplianceSummaryReviewComponent } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent";
import userEvent from "@testing-library/user-event";
import { ComplianceSummaryReviewPageData } from "@/compliance/src/app/types";
import { ComplianceSummaryStatus } from "@bciers/utils/src/enums";

// Mocks
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen;

// A fake browser tab returned by window.open that the util navigates to the PDF.
let fakeTab: { location: { href: string }; close: ReturnType<typeof vi.fn> };

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

// Mock breadcrumb hook
vi.mock("@bciers/components", async () => {
  const actual =
    await vi.importActual<typeof import("@bciers/components")>(
      "@bciers/components",
    );
  return {
    ...actual,
    useBreadcrumb: () => ({ lastTitle: null, setLastTitle: vi.fn() }),
  };
});

const mockData: ComplianceSummaryReviewPageData = {
  id: 2,
  has_late_submission_penalty: false,
  has_overdue_penalty: false,
  max_credit_usage_percentage: 0,
  requires_manual_handling: false,
  obligation_id: "24-0019-3-3",
  operation_name: "Compliance SFO - Obligation not met",
  reporting_year: 2025,
  excess_emissions: 5264.635,
  emissions_attributable_for_compliance: "5500.0",
  emissions_limit: "235.365",
  compliance_charge_rate: 80.0,
  equivalent_value: 421170.8,
  outstanding_balance_equivalent_value: 33693664.0,
  status: "Obligation not met" as ComplianceSummaryStatus,
  monetary_payments: { rows: [], row_count: 0 },
  applied_units_summary: {
    compliance_report_version_id: 2,
    applied_compliance_units: {
      rows: [],
      row_count: 0,
      can_apply_compliance_units: false,
    },
  },
  faa_interest: "0.00",
  automatic_overdue_penalty_amount: "0.00",
  ggeapar_interest_amount: "0.00",
  is_maximum_penalty_reached: false,
};

const setupComponent = (id = 123, data = mockData) =>
  render(
    <ComplianceSummaryReviewComponent
      data={data}
      complianceReportVersionId={id}
    />,
  );

const getGenerateButton = () =>
  screen.getByRole("button", { name: "Generate Compliance Invoice" });

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    fakeTab = { location: { href: "" }, close: vi.fn() };
    mockWindowOpen.mockReset();
    mockWindowOpen.mockReturnValue(fakeTab);
    vi.stubGlobal("open", mockWindowOpen);
  });

  it("renders the component with all sections", () => {
    setupComponent();
    expect(
      screen.getByText("Review 2025 Compliance Obligation Report"),
    ).toBeVisible();
    expect(screen.getByText("2025 Compliance Obligation")).toBeVisible();
    expect(screen.getByText("Monetary Payments Made")).toBeVisible();
    expect(screen.getByText("Compliance Units Applied")).toBeVisible();
    expect(screen.getByText("Outstanding Compliance Obligation")).toBeVisible();
    expect(getGenerateButton()).toBeEnabled();
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

    setupComponent();

    await user.click(getGenerateButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/invoice/123/obligation",
      {
        method: "GET",
        cache: "no-store",
      },
    );

    // A preview tab is opened synchronously, then navigated directly to the
    // route URL so the browser honours the Content-Disposition filename.
    expect(mockWindowOpen).toHaveBeenCalledWith("", "_blank");
    expect(fakeTab.location.href).toBe(
      "/compliance/api/invoice/123/obligation",
    );
    expect(fakeTab.close).not.toHaveBeenCalled();

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

    setupComponent(999);

    await user.click(getGenerateButton());

    expect(fetch).toHaveBeenCalledWith(
      "/compliance/api/invoice/999/obligation",
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
    expect(getGenerateButton()).toBeEnabled();
  });

  describe("accruing penalties", () => {
    it("shows the accruing automatic overdue penalty amount as of today", () => {
      setupComponent(123, {
        ...mockData,
        automatic_overdue_penalty_amount: "3800.00",
      });

      expect(screen.getByText("Automatic Overdue Penalty")).toBeVisible();
      expect(screen.getByText("Amount as of today:")).toBeVisible();
      expect(screen.getByText("$3,800.00")).toBeVisible();
    });

    it("shows the accruing GGEAPAR interest amount as of today", () => {
      setupComponent(123, {
        ...mockData,
        ggeapar_interest_amount: "1250.00",
      });

      expect(screen.getByText("GGEAPAR Interest")).toBeVisible();
      expect(screen.getByText("Amount as of today:")).toBeVisible();
      expect(screen.getByText("$1,250.00")).toBeVisible();
    });

    it("shows the FAA interest accrued on the outstanding obligation", () => {
      setupComponent(123, { ...mockData, faa_interest: "1000.00" });

      expect(screen.getByText("FAA interest as of today:")).toBeVisible();
      expect(screen.getByText("$1,000.00")).toBeVisible();
    });

    it("does not show penalty sections when nothing is accruing", () => {
      setupComponent();

      expect(
        screen.queryByText("Automatic Overdue Penalty"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("GGEAPAR Interest")).not.toBeInTheDocument();
      expect(screen.queryByText("Amount as of today:")).not.toBeInTheDocument();
    });

    it("still shows the FAA interest label as $0 when none has accrued", () => {
      setupComponent();

      expect(screen.getByText("FAA interest as of today:")).toBeVisible();
      expect(screen.getByText("$0.00")).toBeVisible();
    });
  });
});
