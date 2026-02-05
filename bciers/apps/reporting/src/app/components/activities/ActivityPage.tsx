import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import ActivityForm from "./ActivityForm";
import type { UUID } from "crypto";
import { ActivityData } from "@reporting/src/app/components/taskList/taskListPages/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getActivityFormData } from "@reporting/src/app/utils/getActivityFormData";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getAllGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { getReportingYear } from "@bciers/actions/api";

type DefaultSearchParams = Record<string, string | number | undefined>;

type ActivityInitFactoryProps = {
  version_id: string; // Next param
  facility_id: UUID; // Next param (or string)
  searchParams?: DefaultSearchParams; // from defaultPageFactory
};

export default async function ActivityPage({
  version_id,
  facility_id,
  searchParams,
}: Readonly<ActivityInitFactoryProps>) {
  const versionId = Number(version_id);
  const facilityId = facility_id;

  const activityId =
    searchParams?.activity_id !== undefined
      ? Number(searchParams.activity_id)
      : undefined;

  const step = searchParams?.step !== undefined ? Number(searchParams.step) : 0;

  const gasTypes = await getAllGasTypes();
  const orderedActivities = await getOrderedActivities(versionId, facilityId);

  const resolvedStep = step === -1 ? orderedActivities.length - 1 : step;

  let currentActivity = orderedActivities[resolvedStep];
  if (activityId) {
    currentActivity = orderedActivities.find(
      (obj: ActivityData) => obj.id === activityId,
    );
  }
  if (!currentActivity) currentActivity = orderedActivities[0];

  const activityData = await actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/initial-activity-data?activity_id=${currentActivity.id}`,
    "GET",
    "",
  );
  if (activityData.error) {
    throw new Error("We couldn't find the activity data for this facility.");
  }
  const reportingYear = await getReportingYear();

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
      orderedActivities,
      currentActivity,
    },
  );

  const sourceTypeIds: string[] = [];
  let sourceTypeQueryString = "";
  for (const [k, v] of Object.entries(activityDataObject.sourceTypeMap)) {
    if (formData[`${v}`]) {
      sourceTypeIds.push(k);
      sourceTypeQueryString += `&source_types[]=${k}`;
    }
  }

  const jsonSchema = await actionHandler(
    `reporting/build-form-schema?activity=${currentActivity.id}&report_version_id=${versionId}&facility_id=${facilityId}${sourceTypeQueryString}`,
    "GET",
    "",
  );

  return (
    <ActivityForm
      key={currentActivity.id}
      activityData={activityDataObject}
      activityFormData={formData}
      currentActivity={currentActivity}
      navigationInformation={navigationInformation}
      reportVersionId={versionId}
      facilityId={facilityId}
      initialJsonSchema={safeJsonParse(jsonSchema).schema}
      initialSelectedSourceTypeIds={sourceTypeIds}
      gasTypes={gasTypes}
      reportingYear={reportingYear.reporting_year}
    />
  );
}
