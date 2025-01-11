import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: HasFacilityId) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const initialData = await getEmissionAllocations(version_id, facility_id);
  return (
    <FacilityEmissionAllocationForm
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
    />
  );
}
