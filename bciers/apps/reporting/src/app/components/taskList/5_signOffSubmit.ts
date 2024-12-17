import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "Verification" = 0,
  "Attachments",
  "FinalReview",
  "SignOff",
}

export const getSignOffAndSubmitSteps: (
  versionId: number,
  activeIndex?: ActivePage | number,
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
          isActive: activeIndex === ActivePage.Verification,
        },
        {
          type: "Page",
          title: "Attachments",
          link: `/reports/${versionId}/attachments`,
          isActive: activeIndex === ActivePage.Attachments,
        },
        {
          type: "Page",
          title: "Final review",
          link: `/reports/${versionId}/final-review`,
          isActive: activeIndex === ActivePage.FinalReview,
        },
        {
          type: "Page",
          title: "Sign-off",
          link: `/reports/${versionId}/sign-off`,
          isActive: activeIndex === ActivePage.SignOff,
        },
      ],
    },
  ];
};
