import { generateAutomaticOverduePenaltyTaskList } from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import { ActivePage } from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

describe("generateAutomaticOverduePenaltyTaskList", () => {
  const mockComplianceReportVersionId = 123;

  it("generates task list with correct structure", () => {
    const taskList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
    );

    // Check the section
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe("Automatic Overdue Penalty");
    expect(taskList[0].isExpanded).toBe(false);

    // Check task items in the automatic penalty section
    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(3);

    // Check Review Penalty Summary task
    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review Penalty Summary",
      link: "/compliance-summaries/123/review-penalty-summary",
      isActive: false,
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
  });

  it("sets active page correctly for each page type", () => {
    // Test Review Penalty Summary page
    const reviewList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      ActivePage.ReviewPenaltySummary,
    );
    const reviewItems = reviewList[0].elements;
    expect(reviewItems?.[0].isActive).toBe(true);
    expect(reviewItems?.[1].isActive).toBe(false);
    expect(reviewItems?.[2].isActive).toBe(false);

    expect(reviewList[0].isExpanded).toBe(true);

    // Test Download Payment Instructions page
    const downloadList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      ActivePage.DownloadPaymentPenaltyInstruction,
    );
    const downloadItems = downloadList[0].elements;
    expect(downloadItems?.[0].isActive).toBe(false);
    expect(downloadItems?.[1].isActive).toBe(true);
    expect(downloadItems?.[2].isActive).toBe(false);

    expect(downloadList[0].isExpanded).toBe(true);

    // Test Pay Penalty and Track Payment(s) page
    const payList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      ActivePage.PayPenaltyTrackPayments,
    );
    const payItems = payList[0].elements;
    expect(payItems?.[0].isActive).toBe(false);
    expect(payItems?.[1].isActive).toBe(false);
    expect(payItems?.[2].isActive).toBe(true);

    expect(payList[0].isExpanded).toBe(true);
  });

  it("handles null activePage parameter", () => {
    const taskList = generateAutomaticOverduePenaltyTaskList(
      mockComplianceReportVersionId,
      null,
    );

    // Check that no page is active when activePage is null
    const taskItems = taskList[0].elements;
    expect(taskItems?.[0].isActive).toBe(false);
    expect(taskItems?.[1].isActive).toBe(false);
    expect(taskItems?.[2].isActive).toBe(false);

    expect(taskList[0].isExpanded).toBe(false);
  });
});
