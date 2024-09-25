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
  let currentActivity = orderedActivities[0];
  if (router.searchParams?.activity_id)
    currentActivity = router.searchParams?.activity_id;

  // const currentIndex = orderedActivities.indexOf(currentActivity);
  const activityData = await actionHandler(
    `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/initial-activity-data?activity_id=${currentActivity}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  const defaultEmptySourceTypeState =
    defaultEmtpySourceTypeMap[currentActivity];

  return (
    <>
      <Suspense fallback="Loading Schema">
        <ActivityForm
          activityData={activityDataObject}
          reportDate="2024-04-01"
          defaultEmptySourceTypeState={defaultEmptySourceTypeState}
        />
      </Suspense>
    </>
  );
}
