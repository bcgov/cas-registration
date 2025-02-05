import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getFacilitiesInformationTaskList,
} from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { getAllActivities } from "@reporting/src/app/utils/getAllActivities";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const operationType = await getFacilityReport(version_id);

  const facilityData = await getFacilityReportDetails(version_id, facility_id);
  const activitiesData = await getAllActivities();
  const selectedActivities = activitiesData.filter((item: { id: any }) =>
    facilityData.activities.includes(item.id),
  );
  const taskListElements: TaskListElement[] = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    ActivePage.ReviewInformation,
    facilityData?.facility_name,
    operationType?.operation_type,
  );

  const formData = {
    ...facilityData,
    activities: selectedActivities.map(
      (activity: { name: any }) => activity.name,
    ),
  };

  return (
    <FacilityReviewForm
      version_id={version_id}
      facility_id={facility_id}
      operationType={operationType?.operation_type}
      selectedActivities={selectedActivities}
      activitiesData={activitiesData}
      taskListElements={taskListElements}
      formsData={formData}
    />
  );
}
