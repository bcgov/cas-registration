import {
  ActivePage,
  generateAutomaticOverduePenaltyTaskList,
} from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import { generateManageObligationTaskList } from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the manageObligationTaskList
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi
      .fn()
      .mockReturnValue([
        { type: "Section", title: "2024 Compliance Summary", isExpanded: true },
      ]),
  }),
);

describe("generateAutomaticOverduePenaltyTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const reportingYear = 2024;

  it("generates task list with correct structure", () => {
    const taskList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      reportingYear,
    );

    // Check that we have two sections
    expect(taskList).toHaveLength(2);

    // Check the first section (compliance obligation)
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe("2024 Compliance Summary");
    expect(taskList[0].isExpanded).toBe(false);

    // Check the second section (automatic penalty)
    expect(taskList[1].type).toBe("Section");
    expect(taskList[1].title).toBe("Automatic Overdue Penalty");
    expect(taskList[1].isExpanded).toBe(true);

    // Check task items in the automatic penalty section
    const taskItems = taskList[1].elements;
    expect(taskItems).toHaveLength(3);

    // Check Review Penalty Summary task
    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review Penalty Summary",
      link: "/compliance-summaries/123/review-penalty-summary",
      isActive: true,
    });

    // Check Download Payment Instructions task
    expect(taskItems?.[1]).toEqual({
      type: "Page",
      title: "Download Payment Instructions",
      link: `/compliance-summaries/123/download-payment-penalty-instructions`,
      isActive: false,
    });

    // Check Pay Penalty and Track Payment(s) task
    expect(taskItems?.[2]).toEqual({
      type: "Page",
      title: "Pay Penalty and Track Payment(s)",
      link: `/compliance-summaries/123/pay-penalty-track-payments`,
      isActive: false,
    });

    // Verify that generateManageObligationTaskList was called with correct parameters
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      { reporting_year: reportingYear },
      null,
    );
  });

  it("sets active page correctly for each page type", () => {
    // Test Review Penalty Summary page
    const reviewList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      reportingYear,
      ActivePage.ReviewPenaltySummary,
    );
    const reviewItems = reviewList[1].elements;
    expect(reviewItems?.[0].isActive).toBe(true);
    expect(reviewItems?.[1].isActive).toBe(false);
    expect(reviewItems?.[2].isActive).toBe(false);

    // Test Download Payment Instructions page
    const downloadList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      reportingYear,
      ActivePage.DownloadPaymentPenaltyInstruction,
    );
    const downloadItems = downloadList[1].elements;
    expect(downloadItems?.[0].isActive).toBe(false);
    expect(downloadItems?.[1].isActive).toBe(true);
    expect(downloadItems?.[2].isActive).toBe(false);

    // Test Pay Penalty and Track Payment(s) page
    const payList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      reportingYear,
      ActivePage.PayPenaltyTrackPayments,
    );
    const payItems = payList[1].elements;
    expect(payItems?.[0].isActive).toBe(false);
    expect(payItems?.[1].isActive).toBe(false);
    expect(payItems?.[2].isActive).toBe(true);
  });

  it("handles null activePage parameter", () => {
    const taskList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      reportingYear,
      null,
    );

    // Check that no page is active when activePage is null
    const taskItems = taskList[1].elements;
    expect(taskItems?.[0].isActive).toBe(false);
    expect(taskItems?.[1].isActive).toBe(false);
    expect(taskItems?.[2].isActive).toBe(false);
  });
});
