import {
  ActivePage,
  getRequestIssuanceTaskList,
} from "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema";

describe("getRequestIssuanceTaskList", () => {
  const complianceSummaryId = 123;
  const reportingYear = 2024;

  it("returns the correct task list structure with a section containing task items", () => {
    const taskList = getRequestIssuanceTaskList(
      complianceSummaryId,
      reportingYear,
    );

    expect(taskList).toHaveLength(1);
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe(`${reportingYear} Compliance Summary`);
    expect(taskList[0].isExpanded).toBe(true);

    const taskItems = taskList[0].elements!;
    expect(taskItems).toHaveLength(3);

    expect(taskItems[0].isActive).toBe(true);
    expect(taskItems[1].isActive).toBe(false);
    expect(taskItems[2].isActive).toBe(false);

    expect(taskItems[0].title).toBe(
      `Review ${reportingYear} Compliance Summary`,
    );
    expect(taskItems[1].title).toBe("Request Issuance of Earned Credits");
    expect(taskItems[2].title).toBe("Track Status of Issuance");

    expect(taskItems[0].link).toBe(
      `/compliance-summaries/${complianceSummaryId}/request-issuance/review-compliance-summary`,
    );
    expect(taskItems[1].link).toBe(
      `/compliance-summaries/${complianceSummaryId}/request-issuance/request-issuance-of-earned-credits`,
    );
    expect(taskItems[2].link).toBe(
      `/compliance-summaries/${complianceSummaryId}/request-issuance/track-status-of-issuance`,
    );

    expect(taskItems[0].type).toBe("Page");
    expect(taskItems[1].type).toBe("Page");
    expect(taskItems[2].type).toBe("Page");
  });

  it("sets the active page based on the activeIndex parameter", () => {
    const taskList1 = getRequestIssuanceTaskList(
      complianceSummaryId,
      reportingYear,
      ActivePage.ReviewComplianceSummary,
    );
    const taskItems1 = taskList1[0].elements!;
    expect(taskItems1[0].isActive).toBe(true);
    expect(taskItems1[1].isActive).toBe(false);
    expect(taskItems1[2].isActive).toBe(false);

    const taskList2 = getRequestIssuanceTaskList(
      complianceSummaryId,
      reportingYear,
      ActivePage.RequestIssuanceOfEarnedCredits,
    );
    const taskItems2 = taskList2[0].elements!;
    expect(taskItems2[0].isActive).toBe(false);
    expect(taskItems2[1].isActive).toBe(true);
    expect(taskItems2[2].isActive).toBe(false);

    const taskList3 = getRequestIssuanceTaskList(
      complianceSummaryId,
      reportingYear,
      ActivePage.TrackStatusOfIssuance,
    );
    const taskItems3 = taskList3[0].elements!;
    expect(taskItems3[0].isActive).toBe(false);
    expect(taskItems3[1].isActive).toBe(false);
    expect(taskItems3[2].isActive).toBe(true);
  });

  it("handles missing reporting year gracefully", () => {
    const taskList = getRequestIssuanceTaskList(complianceSummaryId);

    expect(taskList[0].title).toBe("undefined Compliance Summary");

    const taskItems = taskList[0].elements!;
    expect(taskItems[0].title).toBe("Review undefined Compliance Summary");
  });
});
