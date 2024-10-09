import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "libs/utils/safeJsonParse";
import { defaultEmtpySourceTypeMap } from "./uiSchemas/schemaMaps";
import ActivityForm from "./ActivityForm";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { UUID } from "crypto";

type ActivityData = { id: number; name: string; slug: string };
interface Props {
  versionId: number;
  facilityId: UUID;
  activityId?: number;
}

// 🧩 Main component
export default async function ActivityInit({
  versionId,
  facilityId,
  activityId,
}: Readonly<Props>) {
  const orderedActivities = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/activity-list`,
    "GET",
    "",
  );

  let currentActivity = orderedActivities[0];
  if (activityId)
    currentActivity = orderedActivities.find((obj: ActivityData) => {
      return obj.id === activityId;
    });

  const activityData = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${currentActivity.id}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  const defaultEmptySourceTypeState =
    defaultEmtpySourceTypeMap[currentActivity.slug];

  const taskListData: TaskListElement[] = [
    {
      type: "Section",
      title: "Activities Information",
      isExpanded: true,
      elements: [],
    },
  ];
  const sectionElements: TaskListElement[] = [];
  const generateTasklistItems = () => {
    orderedActivities.forEach((activity: ActivityData) => {
      sectionElements.push({
        type: "Page",
        title: activity.name,
        isActive: activity.id === currentActivity.id,
        link: `?activity_id=${activity.id}`,
      });
    });
    taskListData[0].elements = sectionElements;
  };
  const additionalPages = [
    "Non-attributable Emissions",
    "Emissions Summary",
    "Production Data",
    "Allocation of Emissions",
  ];
  additionalPages.forEach((taskListPage) => {
    taskListData.push({ type: "Page", title: taskListPage });
  });

  generateTasklistItems();
  return (
    <Suspense fallback="Loading Schema">
      <ActivityForm
        activityData={activityDataObject}
        currentActivity={currentActivity}
        taskListData={taskListData}
        reportDate="2024-04-01"
        defaultEmptySourceTypeState={defaultEmptySourceTypeState}
      />
    </Suspense>
  );
}
