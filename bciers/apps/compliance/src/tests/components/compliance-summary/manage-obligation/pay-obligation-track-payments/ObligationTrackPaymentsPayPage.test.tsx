import { render, screen } from "@testing-library/react";
import ObligationTrackPaymentsPayPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsPayPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { actionHandler } from "@bciers/actions";

// Mock the actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { PayObligationTrackPayments: 4 },
  }),
);

// Mock the task list data fetching function
vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    penalty_status: "NONE",
    outstanding_balance: 5,
    reporting_year: 2024,
  }),
}));

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/pay-obligation-track-payments/ObligationTrackPaymentsComponent",
  () => ({
    ObligationTrackPaymentsComponent: ({
      data,
      complianceReportVersionId,
    }: {
      data: any;
      complianceReportVersionId: number;
    }) => (
      <div data-testid="obligation-track-payments-component">
        Mock Component - ID: {complianceReportVersionId}
        <div data-testid="component-data">{JSON.stringify(data)}</div>
      </div>
    ),
  }),
);

describe("ObligationTrackPaymentsPayPage", () => {
  const mockObligationWithPaymentsData = {
    reporting_year: 2024,
    outstanding_balance: 0.0,
    equivalent_value: 0.0,
    obligation_id: "test-obligation-id",
    penalty_status: "NONE",
    payment_data: {
      data_is_fresh: true,
      rows: [
        {
          id: 1,
          amount: 8000.0,
          received_date: "Dec 6, 2025",
          payment_method: "Credit Card",
          payment_object_id: "REC123456",
        },
      ],
      row_count: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock actionHandler to return the consolidated data structure
    (actionHandler as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (url.includes("/obligation")) {
          return Promise.resolve(mockObligationWithPaymentsData);
        }
        return Promise.resolve({});
      },
    );
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await ObligationTrackPaymentsPayPage({
        compliance_report_version_id: 123,
      }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Component - ID: 123")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      123,
      {
        penaltyStatus: "NONE",
        outstandingBalance: 5,
        reportingYear: 2024,
      },
      ActivePage.PayObligationTrackPayments,
    );
  });

  it("passes correct data to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({
        compliance_report_version_id: 456,
      }),
    );

    const componentData = screen.getByTestId("component-data");
    const data = JSON.parse(componentData.textContent || "{}");

    expect(data).toEqual({
      reporting_year: 2024,
      outstanding_balance: 0,
      equivalent_value: 0,
      obligation_id: "test-obligation-id",
      penalty_status: "NONE",
      payment_data: {
        data_is_fresh: true,
        rows: [
          {
            id: 1,
            amount: 8000.0,
            received_date: "Dec 6, 2025",
            payment_method: "Credit Card",
            payment_object_id: "REC123456",
          },
        ],
        row_count: 1,
      },
      payments: [
        {
          id: 1,
          amount: 8000.0,
          received_date: "Dec 6, 2025",
          payment_method: "Credit Card",
          payment_object_id: "REC123456",
        },
      ],
    });
  });

  it("passes correct compliance summary ID to the component", async () => {
    render(
      await ObligationTrackPaymentsPayPage({
        compliance_report_version_id: 789,
      }),
    );

    expect(screen.getByText("Mock Component - ID: 789")).toBeVisible();
  });
});
