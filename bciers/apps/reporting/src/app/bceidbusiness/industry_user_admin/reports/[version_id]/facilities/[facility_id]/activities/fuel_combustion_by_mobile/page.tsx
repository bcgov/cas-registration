import FuelCombustionByMobile from "../../../../../../../../components/activities/fuelCombustionByMobile";
import { Suspense } from "react";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "libs/utils/safeJsonParse";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=Fuel combustion by mobile equipment&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  return (
    <Suspense fallback="Loading Schema">
      <FuelCombustionByMobile
        activityData={activityDataObject}
        reportDate={reportDate}
      />
    </Suspense>
  );
}