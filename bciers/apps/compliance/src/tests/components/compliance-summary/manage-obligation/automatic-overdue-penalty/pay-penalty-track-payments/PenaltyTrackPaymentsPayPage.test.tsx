import { render, screen } from "@testing-library/react";
import PenaltyTrackPaymentsPayPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/pay-penalty-track-payments/PenaltyTrackPaymentsPayPage";
import {
  generateAutomaticOverduePenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import { actionHandler } from "@bciers/actions";

// Mock the actionHandler
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList",
  () => ({
    generateAutomaticOverduePenaltyTaskList: vi.fn(),
    ActivePage: { PayPenaltyTrackPayments: "PayPenaltyTrackPayments" },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the core component rendered inside the page
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/automatic-overdue-penalty/pay-penalty-track-payments/PenaltyTrackPaymentsComponent",
  () => ({
    PenaltyTrackPaymentsComponent: ({
      data,
      complianceReportVersionId,
    }: {
      data: any;
      complianceReportVersionId: number;
    }) => (
      <div data-testid="penalty-track-payments-component">
        Mock Component - ID: {complianceReportVersionId}
        <div data-testid="component-data">{JSON.stringify(data)}</div>
      </div>
    ),
  }),
);

describe("PenaltyTrackPaymentsPayPage", () => {
  const mockPenaltyWithPaymentsData = {
    reporting_year: 2024,
    outstanding_balance: 1000.0,
    equivalent_value: 500.0,
    penalty_id: "test-penalty-id",
    payment_data: {
      data_is_fresh: true,
      rows: [
        {
          id: 1,
          amount: 1000.0,
          received_date: "Aug 5, 2025",
          payment_method: "EFT",
          transaction_type: "Payment",
          payment_object_id: "PEN123456",
        },
      ],
      row_count: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (actionHandler as ReturnType<typeof vi.fn>).mockImplementation(
      (url: string) => {
        if (url.includes("/penalty")) {
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
      await PenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 111,
      }),
    );

    // Ensure the layout and mocked component render
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Component - ID: 111")).toBeVisible();

    // Verify task list generation
    expect(generateAutomaticOverduePenaltyTaskList).toHaveBeenCalledWith(
      111,
      2024,
      ActivePage.PayPenaltyTrackPayments,
    );
  });

  it("passes correct data to the component", async () => {
    render(
      await PenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 222,
      }),
    );

    const componentData = screen.getByTestId("component-data");
    const data = JSON.parse(componentData.textContent || "{}");

    expect(data).toEqual({
      reporting_year: 2024,
      outstanding_balance: 1000.0,
      equivalent_value: 500.0,
      penalty_id: "test-penalty-id",
      payment_data: {
        data_is_fresh: true,
        rows: [
          {
            id: 1,
            amount: 1000.0,
            received_date: "Aug 5, 2025",
            payment_method: "EFT",
            transaction_type: "Payment",
            payment_object_id: "PEN123456",
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
          transaction_type: "Payment",
          payment_object_id: "PEN123456",
          payment_header: "",
        },
      ],
    });
  });

  it("passes correct compliance summary ID to the component", async () => {
    render(
      await PenaltyTrackPaymentsPayPage({
        compliance_report_version_id: 333,
      }),
    );

    expect(screen.getByText("Mock Component - ID: 333")).toBeVisible();
  });
});
