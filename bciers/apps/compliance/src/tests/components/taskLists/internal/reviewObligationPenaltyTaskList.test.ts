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
      mockReportingYear,
    );

    expect(taskList).toHaveLength(2);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: `Review ${mockReportingYear} Compliance Obligation Report`,
      link: `/compliance-summaries/${mockComplianceReportVersionId}/manage-obligation-review-summary`,
      isActive: true,
    });

    expect(taskList[1]).toEqual({
      type: "Page",
      title: "Review Penalty Summary",
      link: `/compliance-summaries/${mockComplianceReportVersionId}/review-penalty-summary`,
      isActive: false,
    });
  });

  it("sets active page correctly for each page type", () => {
    const listReview = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      ActivePage.ReviewComplianceObligationReport,
    );
    expect(listReview[0].isActive).toBe(true);
    expect(listReview[1].isActive).toBe(false);

    const listPenalty = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      ActivePage.ReviewPenaltySummary,
    );
    expect(listPenalty[0].isActive).toBe(false);
    expect(listPenalty[1].isActive).toBe(true);
  });
});
