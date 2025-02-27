import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const tasklistData = await getReportInformationTasklist(
    version_id,
    facility_id,
  );
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const initialData = await getEmissionAllocations(version_id, facility_id);
  const operationType = tasklistData?.operationType;
  // Get facility type for not applicable methodology in LFO small and medium facilities
  const facilityType = (await getFacilityReportDetails(version_id, facility_id))
    .facility_type;

  const navInfo = await getNavigationInformation(
    HeaderStep.ReportInformation,
    ReportingPage.AllocationOfEmissions,
    version_id,
    facility_id,
    {
      orderedActivities: orderedActivities,
      facilityName: tasklistData?.facilityName,
    },
  );

  return (
    <FacilityEmissionAllocationForm
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
      navigationInformation={navInfo}
      taskListElements={taskListElements}
      operationType={operationType}
      facilityType={facilityType}
    />
  );
}
