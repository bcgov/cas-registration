import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";

describe("generateRequestIssuanceTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const mockReportingYear = 2024;

  it.each([IssuanceStatus.CREDITS_NOT_ISSUED, IssuanceStatus.CHANGES_REQUIRED])(
    "generates task list with correct structure if issuance is credits not issued or changes required",

    (status) => {
      const taskList = generateRequestIssuanceTaskList(
        mockComplianceReportVersionId,
        mockReportingYear,
        status,
      );

      // Check the outer section
      expect(taskList).toHaveLength(1);
      expect(taskList[0].type).toBe("Section");
      expect(taskList[0].title).toBe("2024 Compliance Summary");
      expect(taskList[0].isExpanded).toBe(true);

      // Check task items
      const taskItems = taskList[0].elements;
      expect(taskItems).toHaveLength(2);

      // Check Review Summary task
      expect(taskItems?.[0]).toEqual({
        type: "Page",
        title: "Review 2024 Compliance Report",
        link: "/compliance-summaries/123/review-compliance-earned-credits-report",
        isActive: true, // Default active page is ReviewComplianceSummary
      });

      // Check Request Issuance task
      expect(taskItems?.[1]).toEqual({
        type: "Page",
        title: "Request Issuance of Earned Credits",
        link: "/compliance-summaries/123/request-issuance-of-earned-credits",
        isActive: false,
      });
    },
  );
  it.each([
    IssuanceStatus.APPROVED,
    IssuanceStatus.DECLINED,
    IssuanceStatus.ISSUANCE_REQUESTED,
  ])(
    "generates task list with correct structure if issuance is approved or declined or issuance requested",
    (status) => {
      const taskList = generateRequestIssuanceTaskList(
        mockComplianceReportVersionId,
        mockReportingYear,
        status,
        ActivePage.TrackStatusOfIssuance,
      );

      // Check the outer section
      expect(taskList).toHaveLength(1);
      expect(taskList[0].type).toBe("Section");
      expect(taskList[0].title).toBe("2024 Compliance Summary");
      expect(taskList[0].isExpanded).toBe(true);

      // Check task items
      const taskItems = taskList[0].elements;
      expect(taskItems).toHaveLength(1);

      // Check Track Status task
      expect(taskItems?.[0]).toEqual({
        type: "Page",
        title: "Track Status of Issuance",
        link: "/compliance-summaries/123/track-status-of-issuance",
        isActive: true,
      });
    },
  );

  it("sets active page correctly for each page type", () => {
    // Test Review Summary page
    const reviewList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.CHANGES_REQUIRED,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);

    // Test Request Issuance page
    const requestList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.CHANGES_REQUIRED,
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
    expect(requestList[0].elements?.[0].isActive).toBe(false);
    expect(requestList[0].elements?.[1].isActive).toBe(true);

    // Test Track Status page
    const trackList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.APPROVED,
      ActivePage.TrackStatusOfIssuance,
    );
    expect(trackList[0].elements?.[0].isActive).toBe(true);
  });
});
