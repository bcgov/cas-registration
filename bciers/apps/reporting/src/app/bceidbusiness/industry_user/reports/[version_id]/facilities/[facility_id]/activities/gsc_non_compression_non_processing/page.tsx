import { Suspense } from "react";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "libs/utils/safeJsonParse";
import GSCNonCompressionNonProcessing from "@reporting/src/app/components/activities/gscNonCompressionNonProcessing";

export default async function Page() {
  const reportDate = "2024-04-01"; // This should be passed in once we have a path to this page from starting a report
  const activityData = await actionHandler(
    `reporting/initial-activity-data?activity_name=General stationary non-compression and non-processing combustion&report_date=${reportDate}`,
    "GET",
    "",
  );
  const activityDataObject = safeJsonParse(activityData);

  return (
    <Suspense fallback="Loading Schema">
      <GSCNonCompressionNonProcessing
        activityData={activityDataObject}
        reportDate={reportDate}
      />
    </Suspense>
  );
}
