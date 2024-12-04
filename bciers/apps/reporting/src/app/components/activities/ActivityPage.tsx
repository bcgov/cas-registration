import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { defaultEmtpySourceTypeMap } from "./uiSchemas/schemaMaps";
import ActivityForm from "./ActivityForm";
import { UUID } from "crypto";
import Loading from "@bciers/components/loading/SkeletonForm";
import {
  ActivityData,
  getFacilitiesInformationTaskList,
} from "../taskList/2_facilitiesInformation";
import { getOrderedActivities } from "../../utils/getOrderedActivities";
import { getActivityFormData } from "../../utils/getActivityFormData";

interface Props {
  versionId: number;
  facilityId: UUID;
  activityId?: number;
}

// 🧩 Main component
export default async function ActivityPage({
  versionId,
  facilityId,
  activityId,
}: Readonly<Props>) {
  const orderedActivities = await getOrderedActivities(versionId, facilityId);

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

  const formData = await getActivityFormData(
    versionId,
    facilityId,
    currentActivity.id,
  );

  const defaultEmptySourceTypeState =
    defaultEmtpySourceTypeMap[currentActivity.slug];

  const taskListData = getFacilitiesInformationTaskList(
    versionId,
    facilityId,
    orderedActivities,
  );

  const currentActivityTaskListElement = taskListData[0]?.elements?.find(
    (e) => e.title == currentActivity.name,
  );
  if (currentActivityTaskListElement)
    currentActivityTaskListElement.isActive = true;

  return (
    <Suspense fallback={<Loading />}>
      <ActivityForm
        activityData={activityDataObject}
        activityFormData={formData}
        currentActivity={currentActivity}
        taskListData={taskListData}
        defaultEmptySourceTypeState={defaultEmptySourceTypeState}
        reportVersionId={versionId}
        facilityId={facilityId}
      />
    </Suspense>
  );
}
