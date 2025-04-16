import { ReviewDataFactoryItem } from "./factory";
import { transformNewEntrantFormData } from "@reporting/src/app/components/additionalInformation/newEntrantInformation/transformNewEntrantFormData";
import { newEntrantSchema } from "@reporting/src/data/jsonSchema/newEntrantInformation/newEntrantInformationSchema";

const newEntrantInformationFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const newEntrantFormData = await transformNewEntrantFormData(versionId);

  return [
    {
      schema: newEntrantSchema,
      data: newEntrantFormData,
      uiSchema: "newEntrantUiSchema",
      context: newEntrantFormData,
    },
  ];
};

export default newEntrantInformationFactoryItem;
