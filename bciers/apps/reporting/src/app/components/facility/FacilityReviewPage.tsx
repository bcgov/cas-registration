import FacilityReviewForm from "./FacilityReviewForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getFacilitiesInformationTaskList,
} from "@reporting/src/app/components/taskList/2_facilitiesInformation";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export default async function FacilityReviewPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const taskListElements: TaskListElement[] = getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    ActivePage.ProductionData,
  );
  return (
    <FacilityReviewForm
      version_id={version_id}
      facility_id={facility_id}
      taskListElements={taskListElements}
    />
  );
}
