import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const generateGgeaparInterestTaskList: (
  complianceReportVersionId: number,
  isActive?: boolean,
) => TaskListElement[] = (complianceReportVersionId, isActive = false) => {
  const taskItems = [
    {
      type: "Page" as const,
      title: `Review Interest Summary`,
      link: `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`,
      isActive,
    },
  ];

  return [
    {
      type: "Section",
      title: `GGEAPAR Interest`,
      isExpanded: isActive,
      elements: taskItems,
    },
  ];
};

export default generateGgeaparInterestTaskList;
