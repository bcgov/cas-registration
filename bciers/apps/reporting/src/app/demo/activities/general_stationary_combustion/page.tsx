import ActivityForm from "../../../components/activities/ActivityForm";
import { Suspense } from "react";
import { actionHandler } from "@bciers/actions";

export default async function Page() {
  const reportDate = '2024-04-01' // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(`reporting/get_activity_data?activity_name=General stationary combustion&report_date=${reportDate}`, "GET", "");
  const activityDataObject = JSON.parse(activityData);
  return (
  <Suspense fallback="Loading Schema">
    <ActivityForm activityData={activityDataObject} reportDate={reportDate}/>
  </Suspense>
  )
}
