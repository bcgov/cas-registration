import {
  generateManualHandlingTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/internal/manualHandlingTaskList";

describe("generateManualHandlingTaskList", () => {
  const mockComplianceReportVersionId = 456;

  it("generates task list with correct structure and default active page", () => {
    const taskList = generateManualHandlingTaskList(
      mockComplianceReportVersionId,
    );

    expect(taskList).toHaveLength(1);

    expect(taskList[0]).toEqual({
      type: "Page",
      title: "Resolve Issue",
      link: `/compliance-administration/compliance-summaries/${mockComplianceReportVersionId}/resolve-issue`,
      isActive: true, // default is ActivePage.ResolveIssue
    });
  });

  it("sets active state correctly based on activePage argument", () => {
    // Explicitly setting ActivePage.ResolveIssue → active
    const listActive = generateManualHandlingTaskList(
      mockComplianceReportVersionId,
      ActivePage.ResolveIssue,
    );
    expect(listActive[0].isActive).toBe(true);

    // Passing null overrides the default and should make it inactive
    const listInactive = generateManualHandlingTaskList(
      mockComplianceReportVersionId,
      null,
    );
    expect(listInactive[0].isActive).toBe(false);
  });
});
