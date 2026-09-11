import { render, screen } from "@testing-library/react";
import type { Mock } from "vitest";
import PenaltyCalculatorPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorPage";
import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";
import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn(),
}));

vi.mock("@/compliance/src/app/utils/getPenaltyAccrualCalculationData", () => ({
  getPenaltyAccrualCalculationData: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList",
  () => ({
    generateReviewObligationPenaltyTaskList: vi.fn(() => [
      { type: "Page", title: "Task 1" },
    ]),
    ActivePage: {
      PenaltyCalculator: "PenaltyCalculator",
    },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyCalculatorComponent",
  () => ({
    __esModule: true,
    default: ({
      complianceReportVersionId,
      initialPenaltyType,
      initialFinalDayOfPenaltyAccrual,
      penaltyData,
    }: {
      complianceReportVersionId: number;
      initialPenaltyType: string;
      initialFinalDayOfPenaltyAccrual: string;
      penaltyData: any;
    }) => (
      <div>
        <div>Penalty Calculator Component</div>
        <div>Version: {complianceReportVersionId}</div>
        <div>Penalty Type: {initialPenaltyType}</div>
        <div>Final Day: {initialFinalDayOfPenaltyAccrual}</div>
        <div>Penalty Data Total: {String(penaltyData?.total_penalty)}</div>
      </div>
    ),
  }),
);

describe("PenaltyCalculatorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (getComplianceSummary as Mock).mockResolvedValue({
      reporting_year: 2031,
      penalty_status: "NOT PAID",
      outstanding_balance_tco2e: 5,
      has_late_submission_penalty: true,
      has_overdue_penalty: true,
    });

    (getPenaltyAccrualCalculationData as Mock).mockResolvedValue({
      total_penalty: 123.45,
      days_late: 4,
      daily_accumulated_list: [],
    });
  });

  it("uses provided search params, fetches data, and renders child component", async () => {
    render(
      await PenaltyCalculatorPage({
        compliance_report_version_id: 456,
        searchParams: {
          penalty_type: "ggeapar",
          final_day_of_penalty_accrual: "2026-09-01",
        },
      }),
    );

    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Penalty Calculator Component")).toBeVisible();
    expect(screen.getByText("Version: 456")).toBeVisible();
    expect(screen.getByText("Penalty Type: ggeapar")).toBeVisible();
    expect(screen.getByText("Final Day: 2026-09-01")).toBeVisible();
    expect(screen.getByText("Penalty Data Total: 123.45")).toBeVisible();

    expect(getComplianceSummary).toHaveBeenCalledWith(456);
    expect(getPenaltyAccrualCalculationData).toHaveBeenCalledWith(456, {
      penalty_type: "ggeapar",
      final_day_of_penalty_accrual: "2026-09-01",
    });

    expect(generateReviewObligationPenaltyTaskList).toHaveBeenCalledWith(
      456,
      {
        reportingYear: 2031,
        penaltyStatus: "NOT PAID",
        outstandingBalance: 5,
        hasLateSubmissionPenalty: true,
        hasOverduePenalty: true,
      },
      ActivePage.PenaltyCalculator,
    );
  });

  it("falls back to automatic_overdue and today's date when search params are missing", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-18T12:00:00.000Z"));

    render(
      await PenaltyCalculatorPage({
        compliance_report_version_id: 789,
      }),
    );

    expect(screen.getByText("Penalty Type: automatic_overdue")).toBeVisible();
    expect(screen.getByText("Final Day: 2026-02-18")).toBeVisible();

    expect(getPenaltyAccrualCalculationData).toHaveBeenCalledWith(789, {
      penalty_type: "automatic_overdue",
      final_day_of_penalty_accrual: "2026-02-18",
    });

    vi.useRealTimers();
  });
});
