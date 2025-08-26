import {
  ActivePage,
  generateManageObligationTaskList,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";
import { generateAutomaticOverduePenaltyTaskList } from "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import { screen } from "@testing-library/react";

// Mock the automaticOverduePenaltyTaskList
vi.mock(
  "@/compliance/src/app/components/taskLists/automaticOverduePenaltyTaskList",
  () => ({
    generateAutomaticOverduePenaltyTaskList: vi.fn().mockReturnValue([
      {
        type: "Section",
        title: "Automatic Overdue Penalty",
        isExpanded: true,
      },
    ]),
  }),
);

describe("generateManageObligationTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const mockObligationTasklistData = {
    penaltyStatus: "NONE",
    outstandingBalance: 50,
    reportingYear: 2024,
  };

  it("generates task list with correct structure when not in Apply Units page", () => {
    const taskList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      mockObligationTasklistData,
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
      title: "Review 2024 Compliance Obligation Report",
      link: "/compliance-summaries/123/review-compliance-obligation-report",
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
      mockObligationTasklistData,
      ActivePage.ApplyComplianceUnits,
    );

    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(3);

    // Check Review Summary with Apply Units subsection
    expect(taskItems?.[0]).toEqual({
      type: "Subsection",
      title: "Review 2024 Compliance Obligation Report",
      link: "/compliance-summaries/123/review-compliance-obligation-report",
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

  it("does not add automatic penalty section when outstanding balance is > 0", () => {
    const dataWithBalance = {
      reportingYear: 2024,
      outstandingBalance: 6,
      penaltyStatus: PenaltyStatus.NOT_PAID,
    };

    // Generate task list
    const taskList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      dataWithBalance,
    );

    // Verify that the automatic penalty section was not added
    expect(taskList).toHaveLength(1);
    expect(taskList[0].title).toBe("2024 Compliance Summary");
    expect(
      screen.queryByText("Automatic Overdue Penalty"),
    ).not.toBeInTheDocument();

    // Verify that generateAutomaticOverduePenaltyTaskList was notcalled
    expect(generateAutomaticOverduePenaltyTaskList).not.toHaveBeenCalled();
  });

  it.each(["ACCRUING", "NONE"])(
    "does not add automatic penalty section when there is no confirmed penalty",
    (penaltyStatus) => {
      const dataWithZeroBalance = {
        reportingYear: 2024,
        outstandingBalance: 0,
        penaltyStatus: penaltyStatus,
      };

      // Generate task list
      const taskList = generateManageObligationTaskList(
        mockComplianceReportVersionId,
        dataWithZeroBalance,
      );

      // Verify that the automatic penalty section was not added
      expect(taskList).toHaveLength(1);
      expect(taskList[0].title).toBe("2024 Compliance Summary");
      expect(
        screen.queryByText("Automatic Overdue Penalty"),
      ).not.toBeInTheDocument();

      // Verify that generateAutomaticOverduePenaltyTaskList was notcalled
      expect(generateAutomaticOverduePenaltyTaskList).not.toHaveBeenCalled();
    },
  );
  it.each(["NOT PAID", "PAID"])(
    "adds automatic penalty section when there is a paid or unpaid penalty and outstanding balance is 0",
    (penaltyStatus) => {
      const dataWithZeroBalance = {
        reportingYear: 2024,
        outstandingBalance: 0,
        penaltyStatus: penaltyStatus,
      };

      // Generate task list
      const taskList = generateManageObligationTaskList(
        mockComplianceReportVersionId,
        dataWithZeroBalance,
      );
      // Verify that the automatic penalty section was added
      expect(taskList).toHaveLength(2);
      expect(taskList[0].title).toBe("2024 Compliance Summary");
      expect(taskList[1].title).toBe("Automatic Overdue Penalty");

      // Verify that generateAutomaticOverduePenaltyTaskList was called
      expect(generateAutomaticOverduePenaltyTaskList).toHaveBeenCalledWith(
        mockComplianceReportVersionId,
        ActivePage.ReviewComplianceSummary, // this is the default for generateManageObligationTaskList
      );
    },
  );

  it("sets active page correctly for each page type", () => {
    // Test Review Summary page
    const reviewList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      mockObligationTasklistData,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);
    expect(reviewList[0].elements?.[2].isActive).toBe(false);
    expect(reviewList[0].isExpanded).toBe(true);

    // Test Download Instructions page
    const downloadList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      mockObligationTasklistData,
      ActivePage.DownloadPaymentObligationInstructions,
    );
    expect(downloadList[0].elements?.[0].isActive).toBe(false);
    expect(downloadList[0].elements?.[1].isActive).toBe(true);
    expect(downloadList[0].elements?.[2].isActive).toBe(false);
    expect(downloadList[0].isExpanded).toBe(true);

    // Test Pay and Track page
    const payList = generateManageObligationTaskList(
      mockComplianceReportVersionId,
      mockObligationTasklistData,
      ActivePage.PayObligationTrackPayments,
    );
    expect(payList[0].elements?.[0].isActive).toBe(false);
    expect(payList[0].elements?.[1].isActive).toBe(false);
    expect(payList[0].elements?.[2].isActive).toBe(true);
    expect(payList[0].isExpanded).toBe(true);
  });
});
