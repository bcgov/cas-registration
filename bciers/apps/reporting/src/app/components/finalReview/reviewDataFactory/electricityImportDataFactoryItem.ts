import { ReviewDataFactoryItem } from "./factory";
import { eioSchema, eioUiSchema } from "@reporting/src/data/jsonSchema/eio";
import { getElectricityImportData } from "@reporting/src/app/utils/getElectricityImportData";

const electricityImportDataFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const electricityImportFormData = await getElectricityImportData(versionId);

  return [
    {
      schema: eioSchema,
      data: electricityImportFormData,
      uiSchema: eioUiSchema,
    },
  ];
};

export default electricityImportDataFactoryItem;
