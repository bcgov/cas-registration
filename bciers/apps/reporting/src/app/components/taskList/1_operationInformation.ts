import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export enum ActivePage {
  "ReviewOperatorInfo" = 0,
  "PersonResponsible",
  "ReviewFacilities",
}

export const getOperationInformationTaskList: (
  versionId: number,
  activeIndex?: ActivePage,
  operationType?: string, // "Single Facility Operation" or "Linear Facility Operation"
) => TaskListElement[] = (
  versionId,
  activeIndex = 0,
  operationType = "Single Facility Operation",
) => {
  const facilityReviewItem: TaskListElement[] =
    operationType !== "Linear Facility Operation"
      ? []
      : [
          {
            type: "Page",
            title: "Review facilities",
            link: `/reports/${versionId}/review-facilities-list`,
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
          link: `/reports/${versionId}/review-operator-data`,
          isActive: activeIndex === ActivePage.ReviewOperatorInfo,
        },
        {
          type: "Page",
          title: "Person responsible",
          link: `/reports/${versionId}/person-responsible`,
          isActive: activeIndex === ActivePage.PersonResponsible,
        },
        ...facilityReviewItem,
      ],
    },
  ];
};
