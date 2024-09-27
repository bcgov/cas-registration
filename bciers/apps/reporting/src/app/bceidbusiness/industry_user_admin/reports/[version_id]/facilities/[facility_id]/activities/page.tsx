import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "libs/utils/safeJsonParse";
import { defaultEmtpySourceTypeMap } from "../../../../../../../components/activities/uiSchemas/schemaMaps";
import ActivityForm from "../../../../../../../components/activities/ActivityForm";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

type ActivityData = { id: number; name: string; slug: string };

export default async function Page(router) {
  const orderedActivities = await actionHandler(
    `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/activity-list`,
    "GET",
    "",
  );
  let currentActivity = orderedActivities[0].id;
  if (router.searchParams?.activity_id)
    currentActivity = orderedActivities.find((obj: ActivityData) => {
      return obj.id === parseInt(router.searchParams?.activity_id);
    });

  const activityData = await actionHandler(
    `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/initial-activity-data?activity_id=${currentActivity.id}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  const defaultEmptySourceTypeState =
    defaultEmtpySourceTypeMap[currentActivity.slug];

  const urlPath = `/reports/${router.params?.version_id}/facilities/${router.params?.facility_id}/activities`;
  const taskListData: TaskListElement[] = [
    {
      type: "Section",
      title: "Activity Data",
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
        link: `${urlPath}?activity_id=${activity.id}`,
      });
    });
    taskListData[0].elements = sectionElements;
  };

  generateTasklistItems();

  return (
    <>
      <Suspense fallback="Loading Schema">
        <ActivityForm
          activityData={activityDataObject}
          currentActivity={currentActivity}
          orderedActivities={orderedActivities}
          taskListData={taskListData}
          reportDate="2024-04-01"
          defaultEmptySourceTypeState={defaultEmptySourceTypeState}
        />
      </Suspense>
    </>
  );
}
