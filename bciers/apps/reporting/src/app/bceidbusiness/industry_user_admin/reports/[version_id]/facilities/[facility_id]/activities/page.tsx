import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
// import safeJsonParse from "libs/utils/safeJsonParse";

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
  // const previousActivity = currentIndex === 0 ? null : currentIndex - 1;
  // const nextActivity =
  //   currentIndex === orderedActivities.length() - 1 ? null : currentIndex + 1;
  // const activityData = await actionHandler(
  //   `reporting/report-version/${router.params?.version_id}/facility-report/${router.params?.facility_id}/initial-activity-data?activity_id=${currentActivity}`,
  //   "GET",
  //   "",
  // );
  // const activityDataObject = safeJsonParse(activityData);

  return (
    <>
      <Suspense fallback="Loading Schema">
        Current Activity: {currentActivity}
      </Suspense>
    </>
  );
}
