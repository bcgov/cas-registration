import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "libs/utils/safeJsonParse";
import { defaultEmtpySourceTypeMap } from "../../../../../../../components/activities/uiSchemas/schemaMaps";
import ActivityForm from "../../../../../../../components/activities/ActivityForm";

export default async function Page(router) {
  const orderedActivities = await actionHandler(
    `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/activity-list`,
    "GET",
    "",
  );
  let currentActivity = orderedActivities[0].id;
  if (router.searchParams?.activity_id)
    currentActivity = orderedActivities.find(
      (obj: { id: number; name: string; slug: string }) => {
        return obj.id === parseInt(router.searchParams?.activity_id);
      },
    );

  const activityData = await actionHandler(
    `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/initial-activity-data?activity_id=${currentActivity.id}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  const defaultEmptySourceTypeState =
    defaultEmtpySourceTypeMap[currentActivity.slug];

  return (
    <>
      <Suspense fallback="Loading Schema">
        <ActivityForm
          activityData={activityDataObject}
          currentActivity={currentActivity}
          orderedActivities={orderedActivities}
          reportDate="2024-04-01"
          defaultEmptySourceTypeState={defaultEmptySourceTypeState}
        />
      </Suspense>
    </>
  );
}
