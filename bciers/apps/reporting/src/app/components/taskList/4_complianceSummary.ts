import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const getComplianceSummaryTaskList: () => TaskListElement[] = () => [
  {
    type: "Page",
    title: "Compliance Summary",
    isActive: true,
  },
];
