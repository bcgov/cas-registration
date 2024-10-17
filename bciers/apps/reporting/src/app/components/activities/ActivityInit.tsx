import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "libs/utils/safeJsonParse";
import { defaultEmtpySourceTypeMap } from "./uiSchemas/schemaMaps";
import ActivityForm from "./ActivityForm";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { UUID } from "crypto";
import Loading from "@bciers/components/loading/SkeletonForm";

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
  if (orderedActivities.error) {
    throw new Error("We couldn't find the activity list for this facility.");
  }

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
  if (activityData.error) {
    throw new Error("We couldn't find the activity data for this facility.");
  }
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
    <Suspense fallback={<Loading />}>
      <ActivityForm
        activityData={activityDataObject}
        currentActivity={currentActivity}
        taskListData={taskListData}
        reportVersionId={versionId}
        defaultEmptySourceTypeState={defaultEmptySourceTypeState}
        reportVersionId={versionId}
        facilityId={facilityId}
      />
    </Suspense>
  );
}
