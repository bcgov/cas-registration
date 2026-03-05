import { generateGgeaparInterestTaskList } from "@/compliance/src/app/components/taskLists/ggeaparInterestTaskList";
import { ActivePage } from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

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

    // Task items
    const taskItems = taskList[0].elements;
    expect(taskItems).toHaveLength(3);

    expect(taskItems?.[0]).toEqual({
      type: "Page",
      title: "Review Interest Summary",
      link: "/compliance-administration/compliance-summaries/123/review-interest-summary",
      isActive: false,
    });

    expect(taskItems?.[1]).toEqual({
      type: "Page",
      title: "Download Payment Instructions",
      link: "/compliance-administration/compliance-summaries/123/download-interest-payment-instructions",
      isActive: false,
    });

    expect(taskItems?.[2]).toEqual({
      type: "Page",
      title: "Pay Interest and Track Payment(s)",
      link: "/compliance-administration/compliance-summaries/123/pay-interest-penalty-track-payments",
      isActive: false,
    });
  });

  it("sets page active and expands section when isActive=true", () => {
    const taskList = generateGgeaparInterestTaskList(
      mockComplianceReportVersionId,
      ActivePage.ReviewInterestSummary,
    );

    const section = taskList[0];
    const taskItems = section.elements;

    expect(section.isExpanded).toBe(true);
    expect(taskItems?.[0].isActive).toBe(true);
    expect(taskItems?.[1].isActive).toBe(false);
    expect(taskItems?.[2].isActive).toBe(false);
  });
});
