import ProductionDataForm from "./ProductionDataForm";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";
import getProductionData from "@bciers/actions/api/getProductionData";

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
  const schema: any = buildProductionDataSchema(
    "Jan 1",
    "Dec 31",
    allowedProductNames,
  );

  return (
    <ProductionDataForm
      report_version_id={report_version_id}
      facility_id={facility_id}
      allowedProducts={response.allowed_products}
      initialData={response.report_products}
      schema={schema}
    />
  );
};

export default ProductionData;
