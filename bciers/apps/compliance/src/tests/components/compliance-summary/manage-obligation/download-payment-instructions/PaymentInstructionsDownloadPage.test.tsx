import { render, screen } from "@testing-library/react";
import PaymentInstructionsDownloadPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/download-payment-instructions/PaymentInstructionsDownloadPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import getOperationByComplianceSummaryId from "@/compliance/src/app/utils/getOperationByComplianceSummaryId";
import getInvoiceByComplianceSummaryId from "@/compliance/src/app/utils/getInvoiceByComplianceSummaryId";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { DownloadPaymentInstructions: 1 },
  }),
);

// Mock the layout component
// vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
//   default: ({ children }: { children: React.ReactNode }) => (
//     <div>Mock Layout {children}</div>
//   ),
// }));

describe("PaymentInstructionsDownloadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the PaymentInstructionsDownloadPage component", async () => {
    (
      getOperationByComplianceSummaryId as ReturnType<typeof vi.fn>
    ).mockReturnValueOnce({
      name: "BC-specific refinery complexity throughput test heading",
    });
    (
      getInvoiceByComplianceSummaryId as ReturnType<typeof vi.fn>
    ).mockReturnValueOnce({
      invoiceNumber: "testnum1234",
    });
    await PaymentInstructionsDownloadPage({
      compliance_summary_id: "1234",
    });
  });

  it("renders with correct content and generates task list", async () => {
    render(
      await PaymentInstructionsDownloadPage({ compliance_summary_id: "123" }),
    );

    // Check content is rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(
      screen.getByText("PaymentInstructionsDownload ...TBD"),
    ).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      "2025",
      ActivePage.DownloadPaymentInstructions,
    );
  });
});
