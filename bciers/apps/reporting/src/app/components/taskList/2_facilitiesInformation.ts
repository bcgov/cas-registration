import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export type ActivityData = { id: number; name: string; slug: string };

export enum ActivePage {
  "NonAttributableEmission" = 1,
  "EmissionSummary",
  "ProductionData",
  "AllocationOfEmissions",
}

export const getFacilitiesInformationTaskList = (
  versionId: number,
  facilityId: string,
  orderedActivities: any[],
  activeIndex?: ActivePage | number,
) => {
  const taskListData: TaskListElement[] = [
    {
      type: "Section",
      title: "Activities Information",
      isExpanded: true,
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
      link: `/reports/${versionId}/facilities/${facilityId}/production-data`,
      isActive: activeIndex === ActivePage.ProductionData,
    },
    {
      type: "Page",
      title: "Allocation of Emissions",
      isActive: activeIndex === ActivePage.AllocationOfEmissions,
    },
  ];

  return taskListData;
};
