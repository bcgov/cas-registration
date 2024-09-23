import { actionHandler } from "@bciers/actions";
import safeJsonParse from "libs/utils/safeJsonParse";
import PulpAndPaperProduction from "@reporting/src/app/components/activities/pulpAndPaperProduction";
import { Suspense } from "react";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=Pulp and paper production&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  return (
    <>
      <Suspense fallback="Loading Schema">
        <PulpAndPaperProduction
          activityData={activityDataObject}
          reportDate={reportDate}
        />
      </Suspense>
    </>
  );
}
