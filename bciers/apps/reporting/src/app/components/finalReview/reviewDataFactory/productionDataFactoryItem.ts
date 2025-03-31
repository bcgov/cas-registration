import { ReviewDataFactoryItem } from "./factory";
import { getProductionData } from "@bciers/actions/api";
import { getFacilityReportDetails } from "@reporting/src/app/utils/getFacilityReportDetails";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";

const productionDataFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const productionData = await getProductionData(versionId, facilityId);

  const facilityType = (await getFacilityReportDetails(versionId, facilityId))
    .facility_type;
  const productionMethodology = ["Small Aggregate", "Medium Facility"].includes(
    facilityType,
  )
    ? ["Not Applicable", "OBPS Calculator", "other"]
    : ["OBPS Calculator", "other"];

  const schema: any = buildProductionDataSchema(
    "Jan 1",
    "Dec 31",
    productionData.allowed_products.map((p) => p.name),
    productionMethodology,
  );

  return [
    {
      schema: schema,
      data: {
        product_selection: productionData.report_products.map(
          (i) => i.product_name,
        ),
        production_data: productionData.report_products,
      },
      uiSchema: "productionData",
    },
  ];
};

export default productionDataFactoryItem;
