import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { generateAutomaticOverduePenaltyTaskList } from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";

// Mock the automaticOverduePenaltyTaskList
vi.mock(
  "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList",
  () => ({
    generateAutomaticOverduePenaltyTaskList: vi.fn().mockReturnValue([
      { type: "Section", title: "Compliance Obligation", isExpanded: false },
      { type: "Section", title: "Automatic Overdue Penalty", isExpanded: true },
    ]),
  }),
);

describe("generateManageObligationTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const data = { reporting_year: 2024 };

  it("generates task list with correct structure when not in Apply Units page", () => {
    const taskList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      data,
    );
    // Check the outer section
    expect(taskList).toHaveLength(1);
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe("2024 Compliance Summary");
    expect(taskList[0].isExpanded).toBe(true);

    // Check task items
    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(3);

    // Check Review Summary task
    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review 2024 Compliance Summary",
      link: "/compliance-summaries/123/manage-obligation-review-summary",
      isActive: true, // Default activeIndex is 0
    });

    // Check Download Instructions task
    expect(taskItems?.[1]).toEqual({
      type: "Page",
      title: "Download Payment Instructions",
      link: "/compliance-summaries/123/download-payment-instructions",
      isActive: false,
    });

    // Check Pay and Track task
    expect(taskItems?.[2]).toEqual({
      type: "Page",
      title: "Pay Obligation and Track Payment(s)",
      link: "/compliance-summaries/123/pay-obligation-track-payments",
      isActive: false,
    });
  });

  it("generates task list with subsection when in Apply Units page", () => {
    const taskList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      data,
      ActivePage.ApplyComplianceUnits,
    );

    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(3);

    // Check Review Summary with Apply Units subsection
    expect(taskItems?.[0]).toEqual({
      type: "Subsection",
      title: "Review 2024 Compliance Summary",
      link: "/compliance-summaries/123/manage-obligation-review-summary",
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Apply Compliance Units",
          link: "/compliance-summaries/123/apply-compliance-units",
          isActive: true,
        },
      ],
    });

    // Other pages remain unchanged
    expect(taskItems?.[1].type).toBe("Page");
    expect(taskItems?.[1].title).toBe("Download Payment Instructions");
    expect(taskItems?.[2].type).toBe("Page");
    expect(taskItems?.[2].title).toBe("Pay Obligation and Track Payment(s)");
  });

  it("sets active page correctly for each page type", () => {
    // Test Review Summary page
    const reviewList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      data,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);
    expect(reviewList[0].elements?.[2].isActive).toBe(false);

    // Test Download Instructions page
    const downloadList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      data,
      ActivePage.DownloadPaymentObligationInstructions,
    );
    expect(downloadList[0].elements?.[0].isActive).toBe(false);
    expect(downloadList[0].elements?.[1].isActive).toBe(true);
    expect(downloadList[0].elements?.[2].isActive).toBe(false);

    // Test Pay and Track page
    const payList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      data,
      ActivePage.PayObligationTrackPayments,
    );
    expect(payList[0].elements?.[0].isActive).toBe(false);
    expect(payList[0].elements?.[1].isActive).toBe(false);
    expect(payList[0].elements?.[2].isActive).toBe(true);
  });

  it("adds automatic penalty section when on PayObligationTrackPayments page and outstanding balance is 0", () => {
    const dataWithZeroBalance = {
      reporting_year: 2024,
      outstanding_balance: 0,
      penalty_status: "NOT PAID",
    };

    // Generate task list with PayObligationTrackPayments active page and outstanding balance is 0
    const taskList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      dataWithZeroBalance,
      ActivePage.PayObligationTrackPayments,
    );

    // Verify that generateAutomaticOverduePenaltyTaskList was called
    expect(generateAutomaticOverduePenaltyTaskList).toHaveBeenCalledWith(
      mockComplianceReportVersionId,
      2024,
      null,
    );

    // Verify that the automatic penalty section was added
    expect(taskList).toHaveLength(2);
    expect(taskList[0].title).toBe("2024 Compliance Summary");
    expect(taskList[1].title).toBe("Automatic Overdue Penalty");
  });
});
