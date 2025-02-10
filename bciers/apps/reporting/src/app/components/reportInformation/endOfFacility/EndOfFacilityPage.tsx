import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getFacilitiesInformationTaskList } from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import EndOfFacilityForm from "@reporting/src/app/components/reportInformation/endOfFacility/EndOfFacilityForm";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";

export default async function EndOfFacilityPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);

  const reportInfoTaskListData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );
  const taskListElements: TaskListElement[] = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    undefined,
    reportInfoTaskListData?.facilityName,
    reportInfoTaskListData?.operationType,
    false,
  );
  // added expand Activities 'false' so that the activities list is not expanded on this page

  const facilityName = reportInfoTaskListData?.facilityName
    ? reportInfoTaskListData.facilityName
    : "Facility";

  return (
    <EndOfFacilityForm
      versionId={version_id}
      facilityId={facility_id}
      taskListElements={taskListElements}
      facilityName={facilityName}
    />
  );
}
