import {
  generateRequestIssuanceTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/requestIssuanceTaskList";

describe("generateRequestIssuanceTaskList", () => {
  const mockComplianceReportVersionId = 123;
  const mockReportingYear = 2024;

  it("generates task list with correct structure", () => {
    const taskList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
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
      link: "/compliance-summaries/123/request-issuance-review-summary",
      isActive: true, // Default active page is ReviewComplianceSummary
    });

    // Check Request Issuance task
    expect(taskItems?.[1]).toEqual({
      type: "Page",
      title: "Request Issuance of Earned Credits",
      link: "/compliance-summaries/123/request-issuance-of-earned-credits",
      isActive: false,
    });

    // Check Track Status task
    expect(taskItems?.[2]).toEqual({
      type: "Page",
      title: "Track Status of Issuance",
      link: "/compliance-summaries/123/track-status-of-issuance",
      isActive: false,
    });
  });

  it("sets active page correctly for each page type", () => {
    // Test Review Summary page
    const reviewList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      ActivePage.ReviewComplianceSummary,
    );
    expect(reviewList[0].elements?.[0].isActive).toBe(true);
    expect(reviewList[0].elements?.[1].isActive).toBe(false);
    expect(reviewList[0].elements?.[2].isActive).toBe(false);

    // Test Request Issuance page
    const requestList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
    expect(requestList[0].elements?.[0].isActive).toBe(false);
    expect(requestList[0].elements?.[1].isActive).toBe(true);
    expect(requestList[0].elements?.[2].isActive).toBe(false);

    // Test Track Status page
    const trackList = generateRequestIssuanceTaskList(
      mockComplianceReportVersionId,
      mockReportingYear,
      ActivePage.TrackStatusOfIssuance,
    );
    expect(trackList[0].elements?.[0].isActive).toBe(false);
    expect(trackList[0].elements?.[1].isActive).toBe(false);
    expect(trackList[0].elements?.[2].isActive).toBe(true);
  });
});
