import FacilityEmissionSummaryForm from "@reporting/src/app/components/facility/FacilityEmissionSummaryForm";
import {
  ActivePage,
  getFacilitiesInformationTaskList,
} from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";

import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getSummaryData } from "@reporting/src/app/utils/getSummaryData";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";

export default async function FacilityEmissionSummaryPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const summaryData = await getSummaryData(version_id, facility_id);
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const reportInfoTaskListData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );
  const taskListData = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    ActivePage.EmissionSummary,
    reportInfoTaskListData?.facilityName,
    reportInfoTaskListData?.operationType,
  );

  const emissionSummaryTaskListElement = taskListData.find(
    (e) => e.title == "Emissions Summary",
  );
  if (emissionSummaryTaskListElement)
    emissionSummaryTaskListElement.isActive = true;

  return (
    <FacilityEmissionSummaryForm
      versionId={version_id}
      facilityId={facility_id}
      summaryFormData={summaryData}
      taskListElements={taskListData}
    />
  );
}
