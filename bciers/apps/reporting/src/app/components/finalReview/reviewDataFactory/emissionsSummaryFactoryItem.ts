import {
  facilityEmissionSummarySchema,
  emissionSummaryUiSchema,
} from "@reporting/src/data/jsonSchema/emissionSummary";
import { ReviewDataFactoryItem } from "./factory";
import { getSummaryData } from "@reporting/src/app/utils/getSummaryData";

const emissionsSummaryFactoryItem: ReviewDataFactoryItem = async (
  versionId,
  facilityId,
) => {
  const formData = await getSummaryData(versionId, facilityId);

  return [
    {
      schema: facilityEmissionSummarySchema,
      data: formData,
      uiSchema: emissionSummaryUiSchema,
    },
  ];
};

export default emissionsSummaryFactoryItem;
