import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import Form from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: {
  version_id: number;
  facility_id: string;
}) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const initialData = await getEmissionAllocations(version_id, facility_id);

  return (
    <Form
      version_id={version_id}
      facility_id={facility_id}
      orderedActivities={orderedActivities}
      initialData={initialData}
    />
  );
}
