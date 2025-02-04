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
  return [
    {
      type: "Section",
      title: `${facilityName} Information`,
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Review Information",
          isActive: activeIndex === ActivePage.ReviewInformation,
          link: `/reports/${versionId}/facilities/${facilityId}/review`,
        },

        {
          type: "Section",
          title: "Activities Information",
          isExpanded: true,
          elements: orderedActivities.map((activity, index) => ({
            type: "Page",
            title: activity.name,
            link: `/reports/${versionId}/facilities/${facilityId}/activities?activity_id=${activity.id}&step=${index}`,
          })),
        },
        {
          type: "Page",
          title: "Non-attributable Emissions",
          isActive: activeIndex === ActivePage.NonAttributableEmission,
          link: `/reports/${versionId}/facilities/${facilityId}/non-attributable`,
        },
        {
          type: "Page",
          title: "Emissions Summary",
          isActive: activeIndex === ActivePage.EmissionSummary,
          link: `/reports/${versionId}/facilities/${facilityId}/emission-summary`,
        },
        {
          type: "Page",
          title: "Production Data",
          isActive: activeIndex === ActivePage.ProductionData,
          link: `/reports/${versionId}/facilities/${facilityId}/production-data`,
        },
        {
          type: "Page",
          title: "Allocation of Emissions",
          isActive: activeIndex === ActivePage.AllocationOfEmissions,
          link: `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`,
        },
      ],
    },
  ];
};
