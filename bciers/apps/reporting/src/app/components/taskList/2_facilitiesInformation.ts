import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export type ActivityData = { id: number; name: string; slug: string };

export const getFacilitiesInformationTaskList = (
  versionId: number,
  facilityId: string,
  orderedActivities: any[],
) => {
  const taskListData: TaskListElement[] = [
    {
      type: "Section",
      title: "Activities Information",
      isExpanded: true,
      elements: orderedActivities.map(
        (activity: ActivityData) =>
          ({
            type: "Page",
            title: activity.name,
            link: `/reports/${versionId}/facilities/${facilityId}/activities?activity_id=${activity.id}`,
          }) as TaskListElement,
      ),
    },
    { type: "Page", title: "Non-attributable Emissions" },
    { type: "Page", title: "Emissions Summary" },
    {
      type: "Page",
      title: "Production Data",
      link: `/reports/${versionId}/facilities/${facilityId}/production-data`,
    },
    { type: "Page", title: "Allocation of Emissions" },
  ];

  return taskListData;
};
