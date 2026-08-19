import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

describe("generateReviewObligationPenaltyTaskList", () => {
  const mockComplianceReportVersionId = 456;
  const mockReportingYear = 2024;

  it("generates task list with correct structure and defaults", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 0,
        hasOverduePenalty: true,
        penaltyStatus: "NOT PAID",
      } as any,
    );

    expect(taskList).toHaveLength(3);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: `Review ${mockReportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-compliance-obligation-report`,
      isActive: true,
    });

    expect(taskList[2]).toEqual({
      type: "Page",
      title: "Review Penalty Summary",
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-penalty-summary`,
      isActive: false,
    });

    expect(taskList[1]).toEqual({
      type: "Page",
      title: "Penalty calculator",
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/penalty-calculator`,
      isActive: false,
    });
  });

  it("sets active page correctly for each page type", () => {
    const baseTasklistData = {
      reportingYear: mockReportingYear,
      hasLateSubmissionPenalty: true,
      outstandingBalance: 0,
      hasOverduePenalty: true,
      penaltyStatus: "NOT PAID",
    } as any;

    // order should be:
    // 1. ReviewComplianceObligationReport
    // 2. PenaltyCalculator
    // 3. ReviewInterestSummary
    // 4. ReviewPenaltySummary

    const listReview = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewComplianceObligationReport,
    );
    expect(listReview).toHaveLength(4);
    expect(listReview[0].isActive).toBe(true);
    expect(listReview[1].isActive).toBe(false);
    expect(listReview[2].isActive).toBe(false);
    expect(listReview[3].isActive).toBe(false);

    const listCalculator = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.PenaltyCalculator,
    );
    expect(listCalculator).toHaveLength(4);
    expect(listCalculator[0].isActive).toBe(false);
    expect(listCalculator[1].isActive).toBe(true);
    expect(listCalculator[2].isActive).toBe(false);
    expect(listCalculator[3].isActive).toBe(false);

    const listInterest = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewInterestSummary,
    );
    expect(listInterest).toHaveLength(4);
    expect(listInterest[0].isActive).toBe(false);
    expect(listInterest[1].isActive).toBe(false);
    expect(listInterest[2].isActive).toBe(true);
    expect(listInterest[3].isActive).toBe(false);

    const listPenalty = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewPenaltySummary,
    );
    expect(listPenalty).toHaveLength(4);
    expect(listPenalty[0].isActive).toBe(false);
    expect(listPenalty[1].isActive).toBe(false);
    expect(listPenalty[2].isActive).toBe(false);
    expect(listPenalty[3].isActive).toBe(true);
  });

  it("does not include penalty page when no penalty has been created", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 123,
        penaltyStatus: "NOT PAID",
      } as any,
    );

    expect(taskList).toHaveLength(2);
    expect(taskList[0].title).toBe(
      `Review ${mockReportingYear} Compliance Obligation Report`,
    );
    expect(
      taskList.some((item) => item.title === "Review Penalty Summary"),
    ).toBe(false);

    expect(taskList[1].title).toBe("Penalty calculator");
    expect(taskList[1].isActive).toBe(false);
  });

  it("includes penalty page when the penalty maxed out while the obligation is still outstanding", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 123,
        penaltyStatus: "NOT PAID",
        hasOverduePenalty: true,
      } as any,
    );

    expect(
      taskList.some((item) => item.title === "Review Penalty Summary"),
    ).toBe(true);
  });

  it.each(["NOT PAID", "PAID"])(
    "includes penalty page when there is a confirmed penalty status and zero outstanding balance",
    (penaltyStatus) => {
      const taskList = generateReviewObligationPenaltyTaskList(
        mockComplianceReportVersionId,
        {
          reportingYear: mockReportingYear,
          hasLateSubmissionPenalty: false,
          outstandingBalance: 0,
          hasOverduePenalty: true,
          penaltyStatus,
        } as any,
      );

    expect(taskList).toHaveLength(2);
    expect(taskList[1].title).toBe("Review Penalty Summary");
  });

  it("includes penalty page and penalty calculator when there is zero outstanding balance and a penalty status of 'NOT PAID'", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 0,
        hasOverduePenalty: true,
        penaltyStatus: "NOT PAID",
      } as any,
    );

    expect(taskList).toHaveLength(3);
    expect(taskList[1].title).toBe("Penalty calculator");
    expect(taskList[2].title).toBe("Review Penalty Summary");
  });

  it("includes interest page when hasLateSubmissionPenalty is true (inactive by default)", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: true,
        outstandingBalance: 0,
        penaltyStatus: "NONE",
      } as any,
    );

    expect(taskList).toHaveLength(3);
    expect(taskList[0].title).toBe(
      `Review ${mockReportingYear} Compliance Obligation Report`,
    );
    expect(taskList[0].isActive).toBe(true);

    expect(taskList[1].title).toBe("Penalty calculator");
    expect(taskList[1].isActive).toBe(false);

    expect(taskList[2].title).toBe("Review Interest Summary");
    expect(taskList[2].isActive).toBe(false);
  });
});
