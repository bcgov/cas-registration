import { ReviewDataFactoryItem } from "./factory";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";
import { transformReportAdditionalData } from "../../additionalInformation/additionalReportingData/AdditionalReportingDataPage";
import {
  additionalReportingDataSchema,
  additionalReportingDataWithElectricityGeneratedSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";

const additionalReportingDataFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const isRegulatedOperation =
    (await getRegistrationPurpose(versionId))?.registration_purpose ===
    "OBPS Regulated Operation";

  const reportAdditionalData = await getReportAdditionalData(versionId);
  const transformedData = transformReportAdditionalData(reportAdditionalData);

  return [
    {
      schema: isRegulatedOperation
        ? additionalReportingDataWithElectricityGeneratedSchema
        : additionalReportingDataSchema,
      data: transformedData,
      uiSchema: "additionalReportingData",
    },
  ];
};

export default additionalReportingDataFactoryItem;
