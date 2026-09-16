import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actionHandler, useSearchParams } from "@bciers/testConfig/mocks";
import PenaltyCalculatorComponent from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorComponent";
import {
  CalculatedPenalty,
  PenaltyType,
  PenaltyTypeStatus,
} from "@/compliance/src/app/types";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock("@/compliance/src/app/components/ComplianceStepButtons", () => ({
  default: ({ backUrl }: { backUrl: string }) => <div>Back: {backUrl}</div>,
}));

const COMPLIANCE_REPORT_VERSION_ID = 123;

const buildPenaltyData = (
  overrides: Partial<CalculatedPenalty> = {},
): CalculatedPenalty => ({
  automatic_overdue_penalty_status: PenaltyTypeStatus.ACCRUING,
  ggeapar_interest_status: PenaltyTypeStatus.NONE,
  penalty_type: PenaltyType.AUTOMATIC_OVERDUE,
  days_late: 5,
  total_penalty: "50.25",
  daily_accumulated_list: [
    {
      date: "2026-01-01",
      interest_rate: "0.38",
      daily_penalty: "10.00",
      daily_compounded: "1.00",
      accumulated_penalty: "10.00",
      accumulated_compounded: "1.00",
    },
  ],
  ...overrides,
});

const renderComponent = (penaltyData = buildPenaltyData()) =>
  render(
    <PenaltyCalculatorComponent
      complianceReportVersionId={COMPLIANCE_REPORT_VERSION_ID}
      penaltyData={penaltyData}
      finalDayOfPenaltyAccrual="2026-01-15"
    />,
  );

describe("PenaltyCalculatorComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the penalty data it was given", () => {
    renderComponent();

    expect(screen.getByText("Accruing")).toBeVisible();
    expect(screen.getByText("$50.25")).toBeVisible();
    expect(screen.getByText("5")).toBeVisible();
    expect(screen.getByRole("gridcell", { name: "2026-01-01" })).toBeVisible();
    expect(
      screen.getByText(
        `Back: /compliance-administration/compliance-summaries/${COMPLIANCE_REPORT_VERSION_ID}/review-compliance-obligation-report`,
      ),
    ).toBeVisible();
  });

  it("preselects the penalty type the data was calculated for", () => {
    renderComponent();

    expect(
      screen.getByRole("radio", { name: "Automatic overdue" }),
    ).toBeChecked();
    expect(screen.getByRole("radio", { name: "GGEAPAR" })).not.toBeChecked();
  });

  it("recalculates against the newly selected penalty type", async () => {
    actionHandler.mockResolvedValue(
      buildPenaltyData({
        penalty_type: PenaltyType.LATE_SUBMISSION,
        ggeapar_interest_status: PenaltyTypeStatus.ACCRUING,
        days_late: 9,
        total_penalty: "99.99",
        daily_accumulated_list: [
          {
            date: "2099-12-31",
            interest_rate: "0.50",
            daily_penalty: "77.00",
            daily_compounded: "7.00",
            accumulated_penalty: "77.00",
            accumulated_compounded: "7.00",
          },
        ],
      }),
    );
    renderComponent();

    await userEvent.click(screen.getByRole("radio", { name: "GGEAPAR" }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        expect.stringContaining(
          `requested_penalty_type=${encodeURIComponent(PenaltyType.LATE_SUBMISSION)}`,
        ),
        "GET",
        "",
      );
    });

    expect(await screen.findByText("$99.99")).toBeVisible();
    expect(screen.getByText("9")).toBeVisible();

    // The grid seeds its rows on mount, so it has to swap over too.
    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("2099-12-31")).toBeInTheDocument();
    expect(within(grid).queryByText("2026-01-01")).not.toBeInTheDocument();
  });

  it("explains an inapplicable penalty type rather than showing a stale figure", async () => {
    actionHandler.mockResolvedValue(
      buildPenaltyData({
        penalty_type: PenaltyType.LATE_SUBMISSION,
        ggeapar_interest_status: PenaltyTypeStatus.NOT_APPLICABLE,
        days_late: 0,
        total_penalty: "0.00",
        daily_accumulated_list: [],
      }),
    );
    renderComponent();

    await userEvent.click(screen.getByRole("radio", { name: "GGEAPAR" }));

    expect(
      await screen.findByText(/GGEAPAR interest only applies to obligations/i),
    ).toBeVisible();
    expect(screen.getByText("$0.00")).toBeVisible();
    expect(screen.queryByText("$50.25")).not.toBeInTheDocument();
  });

  it("renders each accrual row in the grid", () => {
    renderComponent(
      buildPenaltyData({
        daily_accumulated_list: [
          {
            date: "2026-01-01",
            interest_rate: "0.38",
            daily_penalty: "10.00",
            daily_compounded: "1.00",
            accumulated_penalty: "10.00",
            accumulated_compounded: "1.00",
          },
          {
            date: "2026-01-02",
            interest_rate: "0.38",
            daily_penalty: "20.00",
            daily_compounded: "2.00",
            accumulated_penalty: "30.00",
            accumulated_compounded: "3.00",
          },
        ],
      }),
    );

    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("2026-01-01")).toBeVisible();
    expect(within(grid).getByText("2026-01-02")).toBeVisible();
    expect(within(grid).getByText("30.00")).toBeVisible();
  });
});
