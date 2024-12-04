import ProductionDataForm from "@reporting/src/app/components/products/ProductionDataForm";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";
import { getProductionData } from "@bciers/actions/api";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import {
  ActivePage,
  getFacilitiesInformationTaskList,
} from "../taskList/2_facilitiesInformation";
import { Suspense } from "react";

interface Props {
  report_version_id: number;
  facility_id: string; // UUID
}

const ProductionDataPage: React.FC<Props> = async ({
  report_version_id,
  facility_id,
}) => {
  const response = await getProductionData(report_version_id, facility_id);

  const allowedProductNames = response.allowed_products.map((p) => p.name);
  const allowedProducts = response.allowed_products.map((p) => ({
    product_id: p.id,
    product_name: p.name,
    unit: p.unit,
  }));

  const schema: any = buildProductionDataSchema(
    "Jan 1",
    "Dec 31",
    allowedProductNames,
  );

  const orderedActivities = await getOrderedActivities(
    report_version_id,
    facility_id,
  );
  const taskListElements = await getFacilitiesInformationTaskList(
    report_version_id,
    facility_id,
    orderedActivities,
    ActivePage.ProductionData,
  );

  return (
    <Suspense fallback="Loading Production Data Form">
      <ProductionDataForm
        report_version_id={report_version_id}
        facility_id={facility_id}
        allowedProducts={allowedProducts}
        initialData={response.report_products}
        schema={schema}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
};

export default ProductionDataPage;
