import {
  generateIssuanceRequestTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/issuanceRequestTaskList";

describe("generateIssuanceRequestTaskList", () => {
  const mockComplianceSummaryId = "123";
  const mockReportingYear = 2024;

  it("generates task list with correct structure", () => {
    const taskList = generateIssuanceRequestTaskList(
      mockComplianceSummaryId,
      mockReportingYear,
    );

    // Check the outer section
    expect(taskList).toHaveLength(1);
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe("2024 Compliance Summary");
    expect(taskList[0].isExpanded).toBe(true);

    // Check task items
    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(4);

    // Check Review Compliance Summary task
    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review 2024 Compliance Summary",
      link: "/compliance-summaries/123/request-issuance-review-summary",
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

    // Check Track Status of Issuance task
    expect(taskItems?.[3]).toEqual({
      type: "Page",
      title: "Track Status of Issuance",
      link: "/compliance-summaries/123/track-status-of-issuance",
      isActive: false,
    });
  });

  it("sets active page correctly for each page type", () => {
    // Test Review Compliance Summary page
    const reviewList = generateIssuanceRequestTaskList(
      mockComplianceSummaryId,
      mockReportingYear,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);
    expect(reviewList[0].elements?.[2].isActive).toBe(false);
    expect(reviewList[0].elements?.[3].isActive).toBe(false);

    // Test Review Credits Issuance Request page
    const requestList = generateIssuanceRequestTaskList(
      mockComplianceSummaryId,
      mockReportingYear,
      ActivePage.ReviewCreditsIssuanceRequest,
    );
    expect(requestList[0].elements?.[0].isActive).toBe(false);
    expect(requestList[0].elements?.[1].isActive).toBe(true);
    expect(requestList[0].elements?.[2].isActive).toBe(false);
    expect(requestList[0].elements?.[3].isActive).toBe(false);

    // Test Review by Director page
    const directorList = generateIssuanceRequestTaskList(
      mockComplianceSummaryId,
      mockReportingYear,
      ActivePage.ReviewByDirector,
    );
    expect(directorList[0].elements?.[0].isActive).toBe(false);
    expect(directorList[0].elements?.[1].isActive).toBe(false);
    expect(directorList[0].elements?.[2].isActive).toBe(true);
    expect(directorList[0].elements?.[3].isActive).toBe(false);

    // Test Track Status of Issuance page
    const statusList = generateIssuanceRequestTaskList(
      mockComplianceSummaryId,
      mockReportingYear,
      ActivePage.TrackStatusOfIssuance,
    );
    expect(statusList[0].elements?.[0].isActive).toBe(false);
    expect(statusList[0].elements?.[1].isActive).toBe(false);
    expect(statusList[0].elements?.[2].isActive).toBe(false);
    expect(statusList[0].elements?.[3].isActive).toBe(true);
  });
});
