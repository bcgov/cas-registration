import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export type ActivityData = { id: number; name: string; slug: string };

export enum ActivePage {
  ReviewInformation,
  NonAttributableEmission = 1,
  EmissionSummary,
  ProductionData,
  AllocationOfEmissions,
}

export const getFacilitiesInformationTaskList = (
  versionId: number,
  facilityId: string,
  orderedActivities: ReadonlyArray<ActivityData>,
  activeIndex?: ActivePage | number,
  facilityName?: string,
  operationType = "Single Facility Operation",
): TaskListElement[] => {
  const name = facilityName ? facilityName : "Facility";

  const backToFacilitiesLink: TaskListElement[] =
    operationType === "Linear Facility Operation"
      ? [
          {
            type: "Link",
            text: "Back to facilities table",
            link: `/reporting/reports/${versionId}/facilities/report-information`,
            title: "Back to facilities table",
          },
        ]
      : [];
  const facilityItem: TaskListElement[] =
    operationType !== "Linear Facility Operation"
      ? []
      : [
          {
            type: "Page",
            title: "Review facility information",
            link: `/reports/${versionId}/facilities/${facilityId}/review-facility-information`,
            isActive: activeIndex === ActivePage.ReviewInformation,
          },
        ];
  return [
    ...backToFacilitiesLink,
    {
      type: "Section",
      title: `${name} information`,
      isExpanded: true,
      elements: [
        ...facilityItem,
        {
          type: "Section",
          title: "Activities information",
          isExpanded: false,
          elements: orderedActivities.map(
            (activity: ActivityData, index) =>
              ({
                type: "Page",
                title: activity.name,
                link: `/reports/${versionId}/facilities/${facilityId}/activities?activity_id=${activity.id}&step=${index}`,
              }) as TaskListElement,
          ),
        },
        {
          type: "Page",
          title: "Non-attributable emissions",
          isActive: activeIndex === ActivePage.NonAttributableEmission,
          link: `/reports/${versionId}/facilities/${facilityId}/non-attributable`,
        },
        {
          type: "Page",
          title: "Emissions summary",
          isActive: activeIndex === ActivePage.EmissionSummary,
          link: `/reports/${versionId}/facilities/${facilityId}/emission-summary`,
        },
        {
          type: "Page",
          title: "Production data",
          link: `/reports/${versionId}/facilities/${facilityId}/production-data`,
          isActive: activeIndex === ActivePage.ProductionData,
        },
        {
          type: "Page",
          title: "Allocation of emissions",
          isActive: activeIndex === ActivePage.AllocationOfEmissions,
          link: `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`,
        },
      ],
    },
  ];
};
