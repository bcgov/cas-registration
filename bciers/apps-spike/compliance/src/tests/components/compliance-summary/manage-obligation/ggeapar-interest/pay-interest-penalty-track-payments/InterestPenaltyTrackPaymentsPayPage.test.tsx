import { render, screen } from "@testing-library/react";
import InterestPenaltyTrackPaymentsPayPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/pay-interest-penalty-track-payments/InterestPenaltyTrackPaymentsPayPage";
import { actionHandler } from "@bciers/actions";
import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(() => ["mock-task"]),
    ActivePage: {
      PayInterestPenaltyTrackPayments: "PayInterestPenaltyTrackPayments",
    },
  }),
);

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    penalty_status: "NOT PAID",
    outstanding_balance_tco2e: 0,
    reporting_year: 2024,
    has_late_submission_penalty: true,
    has_overdue_penalty: false,
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the core component rendered inside the page
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/ggeapar-interest/pay-interest-penalty-track-payments/InterestPenaltyTrackPaymentsComponent",
  () => ({
    InterestPenaltyTrackPaymentsComponent: ({
      data,
      complianceReportVersionId,
    }: {
      data: any;
      complianceReportVersionId: number;
    }) => (
      <div data-testid="interest-penalty-track-payments-component">
        Mock Component - ID: {complianceReportVersionId}
        <div data-testid="component-data">{JSON.stringify(data)}</div>
      </div>
    ),
  }),
);

describe("InterestPenaltyTrackPaymentsPayPage", () => {
  const mockPenaltyWithPaymentsData = {
    reporting_year: 2024,
    outstanding_amount: "1000.00",
    penalty_status: "NOT PAID",
    payment_data: {
      rows: [
        {
          id: 1,
          amount: 1000.0,
          received_date: "Aug 5, 2025",
          payment_method: "EFT",
          payment_object_id: "INT123456",
        },
      ],
      row_count: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (actionHandler as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (url.includes("late-submission-penalty-summary")) {
          return Promise.resolve(mockPenaltyWithPaymentsData);
        }
        if (url.includes("reporting/reporting-year")) {
          return Promise.resolve({
            reporting_year: 2024,
            report_due_date: "2025-03-31",
            reporting_window_end: "2025-03-31",
          });
        }
        return Promise.resolve({});
      },
    );
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await InterestPenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 111,
      }),
    );

    // Ensure the layout and mocked component render
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Component - ID: 111")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      111,
      {
        penaltyStatus: "NOT PAID",
        outstandingBalance: 0,
        reportingYear: 2024,
        hasLateSubmissionPenalty: true,
        hasOverduePenalty: false,
      },
      ActivePage.PayInterestPenaltyTrackPayments,
    );
  });

  it("passes correct data to the component", async () => {
    render(
      await InterestPenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 222,
      }),
    );

    const componentData = screen.getByTestId("component-data");
    const data = JSON.parse(componentData.textContent || "{}");

    expect(data).toEqual({
      reporting_year: 2024,
      outstanding_amount: "1000.00",
      penalty_status: "NOT PAID",
      payment_data: {
        rows: [
          {
            id: 1,
            amount: 1000.0,
            received_date: "Aug 5, 2025",
            payment_method: "EFT",
            payment_object_id: "INT123456",
          },
        ],
        row_count: 1,
      },
      payments: [
        {
          id: 1,
          amount: 1000.0,
          received_date: "Aug 5, 2025",
          payment_method: "EFT",
          payment_object_id: "INT123456",
        },
      ],
    });
  });

  it("passes correct compliance summary ID to the component", async () => {
    render(
      await InterestPenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 333,
      }),
    );

    expect(screen.getByText("Mock Component - ID: 333")).toBeVisible();
  });
});
