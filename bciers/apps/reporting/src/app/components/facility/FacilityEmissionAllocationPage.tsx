import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";
import Form from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { getFacilitiesInformationTaskList } from "@reporting/src/app/components/taskList/2_facilitiesInformation";

export default async function FacilityEmissionAllocationPage({
  version_id,
  facility_id,
}: {
  version_id: number;
  facility_id: string;
}) {
  const orderedActivities = await getOrderedActivities(version_id, facility_id);
  const taskListElements = await getFacilitiesInformationTaskList(
    version_id,
    facility_id,
    orderedActivities,
    4,
  );
  const response = await getEmissionAllocations(version_id, facility_id);
  console.log("*****************************");
  console.log(response);
  const formData = [
    {
      emission_category: "Category A",
      products: [
        { product_id: 1, product_name: "Product A", product_emission: 500 },
        { product_id: 2, product_name: "Product B", product_emission: 500 },
      ],
      emission_total: 1000,
    },
    {
      emission_category: "Category B",
      products: [
        { product_id: 3, product_name: "Product X", product_emission: 1500 },
        { product_id: 4, product_name: "Product Y", product_emission: 500 },
      ],
      emission_total: 2000,
    },
  ];
  return (
    <Form
      version_id={version_id}
      facility_id={facility_id}
      taskListElements={taskListElements}
      initialData={formData}
    />
  );
}
