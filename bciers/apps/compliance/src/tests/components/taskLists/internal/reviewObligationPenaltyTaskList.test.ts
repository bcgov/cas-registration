import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";

describe("generateReviewObligationPenaltyTaskList", () => {
  const mockComplianceReportVersionId = 456;
  const mockReportingYear = 2024;

  it("generates task list with correct structure while the obligation is not met and the penalty is unpaid", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 10,
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

  it("sets active page correctly for each page type once the obligation is met", () => {
    const baseTasklistData = {
      reportingYear: mockReportingYear,
      hasLateSubmissionPenalty: true,
      outstandingBalance: 0,
      hasOverduePenalty: true,
      penaltyStatus: "NOT PAID",
    } as any;

    // order should be:
    // 1. ReviewComplianceObligationReport
    // 2. ReviewInterestSummary
    // 3. ReviewPenaltySummary

    const listReview = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewComplianceObligationReport,
    );
    expect(listReview).toHaveLength(3);
    expect(listReview[0].isActive).toBe(true);
    expect(listReview[1].isActive).toBe(false);
    expect(listReview[2].isActive).toBe(false);

    const listInterest = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewInterestSummary,
    );
    expect(listInterest).toHaveLength(3);
    expect(listInterest[0].isActive).toBe(false);
    expect(listInterest[1].isActive).toBe(true);
    expect(listInterest[2].isActive).toBe(false);

    const listPenalty = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      baseTasklistData,
      ActivePage.ReviewPenaltySummary,
    );
    expect(listPenalty).toHaveLength(3);
    expect(listPenalty[0].isActive).toBe(false);
    expect(listPenalty[1].isActive).toBe(false);
    expect(listPenalty[2].isActive).toBe(true);
  });

  it("sets penalty calculator active while the obligation is not met", () => {
    const listCalculator = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 123,
        penaltyStatus: "ACCRUING",
      } as any,
      ActivePage.PenaltyCalculator,
    );
    expect(listCalculator).toHaveLength(2);
    expect(listCalculator[0].isActive).toBe(false);
    expect(listCalculator[1].title).toBe("Penalty calculator");
    expect(listCalculator[1].isActive).toBe(true);
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

  it("includes penalty page when there is zero outstanding balance and a penalty status of 'PAID'", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        hasLateSubmissionPenalty: false,
        outstandingBalance: 0,
        hasOverduePenalty: true,
        penaltyStatus: "PAID",
      } as any,
    );
    expect(taskList).toHaveLength(2);
    expect(taskList[1].title).toBe("Review Penalty Summary");
  });

  it("includes penalty page but not penalty calculator when there is zero outstanding balance and a penalty status of 'NOT PAID'", () => {
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
    expect(taskList[1].title).toBe("Review Penalty Summary");
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

    expect(taskList).toHaveLength(2);
    expect(taskList[0].title).toBe(
      `Review ${mockReportingYear} Compliance Obligation Report`,
    );
    expect(taskList[0].isActive).toBe(true);

    expect(taskList[1].title).toBe("Review Interest Summary");
    expect(taskList[1].isActive).toBe(false);
  });

  it.each(["NONE", "NOT PAID", "PAID"])(
    "does not include penalty calculator once the obligation is fully met (penalty status %s)",
    (penaltyStatus) => {
      const taskList = generateReviewObligationPenaltyTaskList(
        mockComplianceReportVersionId,
        {
          reportingYear: mockReportingYear,
          hasLateSubmissionPenalty: false,
          outstandingBalance: 0,
          hasOverduePenalty: penaltyStatus !== "NONE",
          penaltyStatus,
        } as any,
      );

      expect(taskList.some((item) => item.title === "Penalty calculator")).toBe(
        false,
      );
    },
  );
});
