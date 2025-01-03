import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "OperationInformation" = 1,
  "PersonResponsible",
  "ReviewFacilities",
}

export const getOperationInformationTaskList: (
  versionId: number,
  activeIndex?: ActivePage,
  operationType?: string, // "Single Facility Operation" or "Linear Facility Operation"
) => TaskListElement[] = (
  versionId,
  activeIndex = 1,
  operationType = "Single Facility Operation",
) => {
  const facilityReviewItem: TaskListElement[] =
    operationType !== "Linear Facility Operation"
      ? []
      : [
          {
            type: "Page",
            title: "Review facilities",
            link: `/reports/${versionId}/facilities/lfo-facilities`,
            isActive: activeIndex === ActivePage.ReviewFacilities,
          },
        ];

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
          isActive: activeIndex === ActivePage.OperationInformation,
        },
        {
          type: "Page",
          title: "Person responsible",
          link: `/reporting/reports/${versionId}/person-responsible`,
          isActive: activeIndex === ActivePage.PersonResponsible,
        },
        ...facilityReviewItem,
      ],
    },
  ];
};
