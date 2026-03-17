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

    expect(taskList).toHaveLength(2);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: `Review ${mockReportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-compliance-obligation-report`,
      isActive: true,
    });

    expect(taskList[1]).toEqual({
      type: "Page",
      title: "Review Penalty Summary",
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-penalty-summary`,
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

    const listReview = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewComplianceObligationReport,
    );
    expect(listReview).toHaveLength(3);
    expect(listReview[0].isActive).toBe(true);
    expect(listReview[1].isActive).toBe(false);
    expect(listReview[2].isActive).toBe(false);

    const listPenalty = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewPenaltySummary,
    );
    expect(listPenalty).toHaveLength(3);
    expect(listPenalty[0].isActive).toBe(false);
    expect(listPenalty[1].isActive).toBe(false);
    expect(listPenalty[2].isActive).toBe(true);

    const listInterest = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewInterestSummary,
    );
    expect(listInterest).toHaveLength(3);
    expect(listInterest[0].isActive).toBe(false);
    expect(listInterest[1].isActive).toBe(true);
    expect(listInterest[2].isActive).toBe(false);
  });

  it("does not include penalty page when outstanding balance is greater than zero", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 123,
        penaltyStatus: "NOT PAID",
      } as any,
    );

    expect(taskList).toHaveLength(1);
    expect(taskList[0].title).toBe(
      `Review ${mockReportingYear} Compliance Obligation Report`,
    );
    expect(
      taskList.some((item) => item.title === "Review Penalty Summary"),
    ).toBe(false);
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
    },
  );

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

    expect(taskList).toHaveLength(2);
    expect(taskList[0].title).toBe(
      `Review ${mockReportingYear} Compliance Obligation Report`,
    );
    expect(taskList[0].isActive).toBe(true);

    expect(taskList[1].title).toBe("Review Interest Summary");
    expect(taskList[1].isActive).toBe(false);
  });
});
