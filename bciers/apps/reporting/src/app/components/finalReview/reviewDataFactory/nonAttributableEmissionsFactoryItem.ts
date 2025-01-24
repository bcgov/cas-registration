import { getAllGasTypes } from "@reporting/src/app/utils/getAllGasTypes";
import { ReviewDataFactoryItem } from "./factory";
import { generateUpdatedSchema } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { getAllEmissionCategories } from "@reporting/src/app/utils/getAllEmissionCategories";
import { getNonAttributableEmissionsData } from "@reporting/src/app/utils/getNonAttributableEmissionsData";

const nonAttributableEmissionsFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const gasTypes = await getAllGasTypes();
  const emissionCategories = await getAllEmissionCategories();

  const schema = generateUpdatedSchema(gasTypes, emissionCategories);

  const emissionFormData = await getNonAttributableEmissionsData(
    versionId,
    facilityId,
  );

  const data = {
    emissions_exceeded: emissionFormData.length > 0,
    activities: emissionFormData.map((item: any) => ({
      id: item.id,
      activity: item.activity,
      source_type: item.source_type,
      emission_category: emissionCategories.find(
        (ec: any) => ec.id === item.emission_category,
      ).category_name,
      gas_type: item.gas_type.map(
        (gasId: number) =>
          gasTypes.find((gasType: any) => gasType.id === gasId)
            .chemical_formula,
      ),
    })),
  };

  return [
    {
      schema: schema,
      data: data,
      uiSchema: "nonAttributableEmissions",
    },
  ];
};

export default nonAttributableEmissionsFactoryItem;
