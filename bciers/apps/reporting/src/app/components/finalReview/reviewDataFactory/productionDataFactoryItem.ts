import { ReviewDataFactoryItem } from "./factory";
import { getProductionData } from "@reporting/src/app/utils/getProductionData";
import { buildProductionDataSchema } from "@reporting/src/data/jsonSchema/productionData";

const productionDataFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const productionData = await getProductionData(versionId, facilityId);

  const schema: any = buildProductionDataSchema(
    "Jan 1",
    "Dec 31",
    productionData.allowed_products.map((p) => p.name),
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
