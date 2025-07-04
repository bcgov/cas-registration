import { render, screen } from "@testing-library/react";
import PaymentInstructionsDownloadPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadPage";
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
    ActivePage: { DownloadPaymentInstructions: 1 },
  }),
);

// Mock the invoice grabber
vi.mock(
  "@/compliance/src/app/utils/getInvoiceByComplianceReportVersionId",
  () => ({
    default: () => {
      return { invoiceNumber: 1 };
    },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

describe("PaymentInstructionsDownloadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await PaymentInstructionsDownloadPage({ compliance_summary_id: "123" }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Download Payment Instructions")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      2024,
      ActivePage.DownloadPaymentInstructions,
    );
  });
});
