import { render, screen } from "@testing-library/react";
import ApplyComplianceUnitsPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the reporting year utility
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  __esModule: true,
  getReportingYear: vi.fn().mockResolvedValue({
    reporting_year: 2024,
    report_due_date: "2025-03-31",
    reporting_window_end: "2025-03-31",
  }),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { ApplyComplianceUnits: 0 },
  }),
);

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    penalty_status: "NONE",
    outstanding_balance_tco2e: 5,
    reporting_year: 2024,
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the main component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent",
  () => ({
    default: () => <div>Mock Apply Component</div>,
  }),
);

describe("ApplyComplianceUnitsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct components and generates task list", async () => {
    render(
      await ApplyComplianceUnitsPage({ compliance_report_version_id: 123 }),
    );

    // Check components are rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Apply Component")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      {
        penaltyStatus: "NONE",
        outstandingBalance: 5,
        reportingYear: 2024,
      },
      ActivePage.ApplyComplianceUnits,
    );
  });
});
