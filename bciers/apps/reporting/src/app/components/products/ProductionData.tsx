import { actionHandler } from "@bciers/actions";
import ProductionDataForm from "./ProductionDataForm";
import { Product } from "./types";

interface Props {
  report_version_id: number;
  facility_id: string; // UUID
}

const ProductionData: React.FC<Props> = async ({
  report_version_id,
  facility_id,
}) => {
  const endpoint = `reporting/report-version/${report_version_id}/facilities/${facility_id}/production-data`;
  const data = [{ somedata: "test" }, {}, {}];

  const response = await actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });
  console.log(response);

  const allowedProducts: Product[] = [
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
    { id: 3, name: "Chemicals: pure hydrogen peroxide" },
  ];

  return (
    <ProductionDataForm allowedProducts={allowedProducts} initialData={[]} />
  );
};

export default ProductionData;
