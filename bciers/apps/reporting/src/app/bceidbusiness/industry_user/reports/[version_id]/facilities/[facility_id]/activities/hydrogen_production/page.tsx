import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import safeJsonParse from "libs/utils/safeJsonParse";
import HydrogenProduction from "@reporting/src/app/components/activities/hydrogenProduction";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=Hydrogen production&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  return (
    <>
      <Suspense fallback="Loading Schema">
        <HydrogenProduction
          activityData={activityDataObject}
          reportDate={reportDate}
        />
      </Suspense>
    </>
  );
}
