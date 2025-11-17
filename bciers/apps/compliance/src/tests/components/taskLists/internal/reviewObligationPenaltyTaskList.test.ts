import {
  generateReviewObligationPenaltyTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/reviewObligationPenaltyTaskList";
import { PenaltyStatus } from "@bciers/utils/src/enums";

describe("generateReviewObligationPenaltyTaskList", () => {
  const mockComplianceReportVersionId = 456;
  const mockReportingYear = 2024;

  it("generates task list with correct structure and defaults", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      { reportingYear: mockReportingYear },
    );

    expect(taskList).toHaveLength(1);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: `Review ${mockReportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-obligation-summary`,
      isActive: true,
    });
  });
  it("generates task list with correct structure when there is a penalty", () => {
    const taskList = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        outstandingBalance: 0,
        penaltyStatus: PenaltyStatus.NOT_PAID,
      },
    );

    expect(taskList).toHaveLength(2);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: `Review ${mockReportingYear} Compliance Obligation Report`,
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/review-obligation-summary`,
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
    const listReview = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      { reportingYear: mockReportingYear },
      ActivePage.ReviewComplianceObligationReport,
    );
    expect(listReview[0].isActive).toBe(true);

    const listPenalty = generateReviewObligationPenaltyTaskList(
      mockComplianceReportVersionId,
      {
        reportingYear: mockReportingYear,
        outstandingBalance: 0,
        penaltyStatus: PenaltyStatus.NOT_PAID,
      },
      ActivePage.ReviewPenaltySummary,
    );
    expect(listPenalty[0].isActive).toBe(false);
    expect(listPenalty[1].isActive).toBe(true);
  });
});
