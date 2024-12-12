import ProductionDataForm from "./ProductionDataForm";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";
import { getProductionData } from "@bciers/actions/api";
import { getOrderedActivities } from "../../utils/getOrderedActivities";
import {
  ActivePage,
  getFacilitiesInformationTaskList,
} from "../taskList/2_facilitiesInformation";
import { Suspense } from "react";

interface Props {
  report_version_id: number;
  facility_id: string; // UUID
}

const ProductionData: React.FC<Props> = async ({
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

  // TEMP FOR DEMO: Merge allowed_products with report_products
  const mergedProducts = response.allowed_products.map((product) => {
    const match = response.report_products.find(
      (report) => report.product_id === product.id,
    );

    return match
      ? match // Include detailed report data if available
      : {
          product_id: product.id,
          product_name: product.name,
          unit: product.unit,
          annual_production: null,
          production_data_apr_dec: null,
          production_methodology: null,
        }; // Add default values for missing fields
  });

  return (
    <Suspense fallback="Loading Production Data Form">
      <ProductionDataForm
        report_version_id={report_version_id}
        facility_id={facility_id}
        allowedProducts={allowedProducts}
        initialData={mergedProducts}
        schema={schema}
        taskListElements={taskListElements}
      />
    </Suspense>
  );
};

export default ProductionData;
