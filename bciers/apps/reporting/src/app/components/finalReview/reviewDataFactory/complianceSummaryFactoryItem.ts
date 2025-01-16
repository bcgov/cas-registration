import { complianceSummarySchema } from "@reporting/src/data/jsonSchema/complianceSummary";
import { ReviewDataFactoryItem } from "./factory";
import { getComplianceData } from "@reporting/src/app/utils/getComplianceData";

const complianceSummaryFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const complianceData = await getComplianceData(versionId);

  return [
    {
      schema: complianceSummarySchema,
      data: complianceData,
      uiSchema: "complianceSummary",
    },
  ];
};

export default complianceSummaryFactoryItem;
