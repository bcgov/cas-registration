import { actionHandler } from "@bciers/actions";
import { Suspense } from "react";
import CarbonatesUse from "../../../../../../../../components/activities/carbonatesUse";
import safeJsonParse from "libs/utils/safeJsonParse";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=Carbonate use&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  return (
    <>
      <Suspense fallback="Loading Schema">
        <CarbonatesUse
          activityData={activityDataObject}
          reportDate={reportDate}
        />
      </Suspense>
    </>
  );
}
