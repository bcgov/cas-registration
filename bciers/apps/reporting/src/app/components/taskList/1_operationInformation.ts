import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const getOperationInformationTaskList: (
  versionId: number,
) => TaskListElement[] = (versionId) => {
  return [
    {
      type: "Section",
      title: "Operation information",
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Review Operation information",
          link: `/reporting/reports/${versionId}/review-operator-data`,
        },
        {
          type: "Page",
          title: "Person responsible",
          link: `/reporting/reports/${versionId}/person-responsible`,
        },
        { type: "Page", title: "Review facilities" },
      ],
    },
  ];
};
