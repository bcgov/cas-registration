import { render, screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";
import InternalComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewPage";

// Mocks
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn(),
}));

vi.mock("@/compliance/src/app/utils/getComplianceAppliedUnits", () => ({
  default: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList",
  () => ({
    generateReviewObligationPenaltyTaskList: vi.fn(() => [
      { type: "Page", title: "Mock Page 1" },
      { type: "Page", title: "Mock Page 2" },
    ]),
    ActivePage: {
      ReviewComplianceObligationReport: "ReviewComplianceObligationReport",
      ReviewPenaltySummary: "ReviewPenaltySummary",
    },
  }),
);

vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/InternalComplianceSummaryReviewComponent",
  () => ({
    InternalComplianceSummaryReviewComponent: ({ data }: any) => (
      <div>
        <div>Mock Internal Review Component - {data.reporting_year}</div>
        <div>
          Applied units rows -{" "}
          {data.applied_units_summary.applied_compliance_units.row_count}
        </div>
      </div>
    ),
  }),
);

import { getComplianceSummary } from "@/compliance/src/app/utils/getComplianceSummary";
import getComplianceAppliedUnits from "@/compliance/src/app/utils/getComplianceAppliedUnits";
import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

describe("InternalComplianceSummaryReviewPage (Manage Obligation)", () => {
  const mockComplianceReportVersionId = 456;
  const mockData = {
    id: 2,
    reporting_year: 2026,
    operation_name: "Mock Operation",
    excess_emissions: 0,
    has_late_submission_penalty: true,
    penalty_status: "NOT PAID",
    outstanding_balance_tco2e: 0,
  } as any;
  const mockAppliedUnits = {
    rows: [{ id: "1" }],
    row_count: 1,
    can_apply_compliance_units: true,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (getComplianceSummary as Mock).mockResolvedValue(mockData);
    (getComplianceAppliedUnits as Mock).mockResolvedValue(mockAppliedUnits);
  });

  it("fetches data, generates internal task list (2 pages), and renders layout with internal review component", async () => {
    render(
      await InternalComplianceSummaryReviewPage({
        compliance_report_version_id: mockComplianceReportVersionId,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mock Layout")).toBeVisible();
      expect(
        screen.getByText("Mock Internal Review Component - 2026"),
      ).toBeVisible();
      expect(screen.getByText("Applied units rows - 1")).toBeVisible();
    });

    expect(getComplianceSummary).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
    expect(getComplianceAppliedUnits).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
    );
    expect(generateReviewObligationPenaltyTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      {
        reportingYear: mockData.reporting_year,
        penaltyStatus: mockData.penalty_status,
        outstandingBalance: mockData.outstanding_balance_tco2e,
        hasLateSubmissionPenalty: mockData.has_late_submission_penalty,
      },
      ActivePage.ReviewComplianceObligationReport,
    );
  });
});
