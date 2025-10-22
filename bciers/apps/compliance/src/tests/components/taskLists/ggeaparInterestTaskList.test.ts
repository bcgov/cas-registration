import { generateGgeaparInterestTaskList } from "@/compliance/src/app/components/taskLists/ggeaparInterestTaskList";

describe("generateGgeaparInterestTaskList", () => {
  const mockComplianceReportVersionId = 123;

  it("generates task list with correct structure (inactive by default)", () => {
    const taskList = generateGgeaparInterestTaskList(
      mockComplianceReportVersionId,
    );

    // Section
    expect(taskList[0].type).toBe("Section");
    expect(taskList[0].title).toBe("GGEAPAR Interest");
    expect(taskList[0].isExpanded).toBe(true);

    // Single task item
    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(1);

    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review Interest Summary",
      link: "/compliance-administration/compliance-summaries/123/review-interest-summary",
      isActive: false,
    });
  });

  it("sets page active and expands section when isActive=true", () => {
    const taskList = generateGgeaparInterestTaskList(
      mockComplianceReportVersionId,
      true,
    );

    const section = taskList[0];
    const taskItems = section.elements;

    expect(section.isExpanded).toBe(true);
    expect(taskItems?.[0].isActive).toBe(true);
  });
});
