import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { OperationTypes } from "@bciers/utils/src/enums";

export enum ActivePage {
  "ReviewOperatorInfo" = 0,
  "PersonResponsible",
  "ReviewFacilities",
}

export const getOperationInformationTaskList: (
  versionId: number,
  activeIndex?: ActivePage,
  operationType?: OperationTypes,
) => TaskListElement[] = (
  versionId,
  activeIndex = 0,
  operationType = OperationTypes.SFO,
) => {
  const facilityReviewItem: TaskListElement[] =
    operationType !== OperationTypes.LFO
      ? []
      : [
          {
            type: "Page",
            title: "Review facilities",
            link: `/reports/${versionId}/facilities/review-facilities`,
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
          title: "Review operation information",
          link: `/reports/${versionId}/review-operation-information`,
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
