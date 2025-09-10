import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";
import { IssuanceStatus } from "@bciers/utils/src/enums";

describe("generateIssuanceRequestTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const mockReportingYear = 2024;

  it.each([IssuanceStatus.APPROVED, IssuanceStatus.DECLINED])(
    "generates task list with correct structure if issuance is approved or declined",
    (status) => {
      const taskList = generateIssuanceRequestTaskList(
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
      expect(taskItems).toHaveLength(1);

      // Check Track Status of Issuance task
      expect(taskItems?.[0]).toEqual({
        type: "Page",
        title: "Track Status of Issuance",
        link: "/compliance-summaries/123/track-status-of-issuance",
        isActive: false,
      });
    },
  );

  it.each([IssuanceStatus.CHANGES_REQUIRED, IssuanceStatus.ISSUANCE_REQUESTED])(
    "generates task list with correct structure if status is changes required or issuance requested",
    (status) => {
      const taskList = generateIssuanceRequestTaskList(
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
      expect(taskItems).toHaveLength(3);

      // Check Review Compliance Summary task
      expect(taskItems?.[0]).toEqual({
        type: "Page",
        title: "Review 2024 Compliance Summary",
        link: "/compliance-summaries/123/review-compliance-earned-credits-report",
        isActive: true, // Default active page is ReviewComplianceSummary
      });

      // Check Review Credits Issuance Request task
      expect(taskItems?.[1]).toEqual({
        type: "Page",
        title: "Review Credits Issuance Request",
        link: "/compliance-summaries/123/review-credits-issuance-request",
        isActive: false,
      });

      // Check Review by Director task
      expect(taskItems?.[2]).toEqual({
        type: "Page",
        title: "Review by Director",
        link: "/compliance-summaries/123/review-by-director",
        isActive: false,
      });
    },
  );
  it.each([IssuanceStatus.CREDITS_NOT_ISSUED])(
    "generates task list with correct structure if status is credits not issued",
    (status) => {
      const taskList = generateIssuanceRequestTaskList(
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
      expect(taskItems).toHaveLength(1);

      // Check Review Compliance Summary task
      expect(taskItems?.[0]).toEqual({
        type: "Page",
        title: "Review 2024 Compliance Summary",
        link: "/compliance-summaries/123/review-compliance-earned-credits-report",
        isActive: true, // Default active page is ReviewComplianceSummary
      });
    },
  );

  it("sets active page correctly for each page type", () => {
    // Test Review Compliance Summary page
    const reviewList = generateIssuanceRequestTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.CHANGES_REQUIRED,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);
    expect(reviewList[0].elements?.[2].isActive).toBe(false);

    // Test Review Credits Issuance Request page
    const requestList = generateIssuanceRequestTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.CHANGES_REQUIRED,
      ActivePage.ReviewCreditsIssuanceRequest,
    );
    expect(requestList[0].elements?.[0].isActive).toBe(false);
    expect(requestList[0].elements?.[1].isActive).toBe(true);
    expect(requestList[0].elements?.[2].isActive).toBe(false);

    // Test Review by Director page
    const directorList = generateIssuanceRequestTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.CHANGES_REQUIRED,
      ActivePage.ReviewByDirector,
    );
    expect(directorList[0].elements?.[0].isActive).toBe(false);
    expect(directorList[0].elements?.[1].isActive).toBe(false);
    expect(directorList[0].elements?.[2].isActive).toBe(true);

    // Test Track Status of Issuance page
    const statusList = generateIssuanceRequestTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      IssuanceStatus.APPROVED,
      ActivePage.TrackStatusOfIssuance,
    );

    expect(statusList[0].elements?.[0].isActive).toBe(true);
  });
});
