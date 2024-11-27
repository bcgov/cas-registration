import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const getSignOffAndSubmitSteps: (
  versionId: number,
  activeIndex?: number | undefined,
) => TaskListElement[] = (versionId, activeIndex = undefined) => {
  return [
    {
      type: "Section",
      title: "Sign-off & submit",
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Verification",
          link: `/reports/${versionId}/verification`,
          isActive: activeIndex === 0,
        },
        {
          type: "Page",
          title: "Attachments",
          link: `/reports/${versionId}/attachments`,
          isActive: activeIndex === 1,
        },
        {
          type: "Page",
          title: "Final review",
          link: `/reports/${versionId}/final-review`,
          isActive: activeIndex === 3,
        },
        { type: "Page", title: "Sign-off", isActive: activeIndex === 4 },
      ],
    },
  ];
};
