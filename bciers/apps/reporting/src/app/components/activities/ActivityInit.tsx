import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import ActivityForm from "./ActivityForm";
import { UUID } from "crypto";
import { ActivityData } from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getActivityFormData } from "@reporting/src/app/utils/getActivityFormData";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

interface Props {
  versionId: number;
  facilityId: UUID;
  activityId?: number;
  step: number; // Index from 0
}

// 🧩 Main component
export default async function ActivityInit({
  versionId,
  facilityId,
  activityId,
  step,
}: Readonly<Props>) {
  const orderedActivities = await getOrderedActivities(versionId, facilityId);
  if (step === -1) step = orderedActivities.length - 1; // handle last step from non-attributable emissions page
  let currentActivity = orderedActivities[step];
  if (activityId)
    currentActivity = orderedActivities.find((obj: ActivityData) => {
      return obj.id === activityId;
    });
  const activityData = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${currentActivity.id}`,
    "GET",
    "",
  );
  if (activityData.error) {
    throw new Error("We couldn't find the activity data for this facility.");
  }
  const activityDataObject = safeJsonParse(activityData);
  const reportInfoTaskListData = await getReportInformationTasklist(
    versionId,
    facilityId,
  );

  const formData = await getActivityFormData(
    versionId,
    facilityId,
    currentActivity.id,
  );

  const navigationInformation = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.Activities,
    versionId,
    facilityId,
    {
      facilityName: reportInfoTaskListData?.facilityName,
      orderedActivities: orderedActivities,
      currentActivity: currentActivity,
    },
  );

  // Determine which source types (if any) are selected in the loaded formData & fetch the jsonSchema accordingly
  const sourceTypeIds = [];
  let sourceTypeQueryString = "";
  for (const [k, v] of Object.entries(activityDataObject.sourceTypeMap)) {
    if (formData[`${v}`]) {
      sourceTypeIds.push(k);
      sourceTypeQueryString += `&source_types[]=${k}`;
    }
  }

  const fetchSchema = async () => {
    const schema = await actionHandler(
      `reporting/build-form-schema?activity=${currentActivity.id}&report_version_id=${versionId}${sourceTypeQueryString}`,
      "GET",
      "",
    );
    return schema;
  };

  const jsonSchema = await fetchSchema();
  return (
    <ActivityForm
      activityData={activityDataObject}
      activityFormData={formData}
      currentActivity={currentActivity}
      navigationInformation={navigationInformation}
      reportVersionId={versionId}
      facilityId={facilityId}
      initialJsonSchema={safeJsonParse(jsonSchema).schema}
      initialSelectedSourceTypeIds={sourceTypeIds}
    />
  );
}
