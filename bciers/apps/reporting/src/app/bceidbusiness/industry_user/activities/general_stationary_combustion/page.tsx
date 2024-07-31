import GeneralStationaryCombustion from "../../../../components/activities/generalStationaryCombustion";
import { Suspense } from "react";
import { actionHandler } from "@bciers/actions";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=General stationary combustion&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = JSON.parse(activityData);

  return (
    <Suspense fallback="Loading Schema">
      <GeneralStationaryCombustion
        activityData={activityDataObject}
        reportDate={reportDate}
      />
    </Suspense>
  );
}
