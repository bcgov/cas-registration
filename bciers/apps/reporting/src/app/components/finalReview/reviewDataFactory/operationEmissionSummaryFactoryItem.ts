import { ReviewDataFactoryItem } from "./factory";
import { getOperationEmissionSummaryData } from "@bciers/actions/api/getOperationEmissionSummaryData";
import { operationEmissionSummarySchema } from "@reporting/src/data/jsonSchema/emissionSummary";

const operationEmissionSummaryFactoryItem: ReviewDataFactoryItem = async (
  versionId,
) => {
  const operationEmissionSummaryData =
    await getOperationEmissionSummaryData(versionId);
  return [
    {
      schema: operationEmissionSummarySchema,
      data: operationEmissionSummaryData,
      uiSchema: "operationEmissionSummary",
    },
  ];
};

export default operationEmissionSummaryFactoryItem;
