import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const getComplianceSummaryTaskList = (): TaskListElement[] => {
  return [
    {
      type: "Page",
      title: "Compliance Summary",
      isActive: true,
      elements: [],
    },
  ];
};
