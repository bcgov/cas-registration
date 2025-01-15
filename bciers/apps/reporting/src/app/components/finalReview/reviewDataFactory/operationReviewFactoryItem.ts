import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  return [
    {
      schema: operationReviewSchema,
      data: await getReportingOperation(versionId),
      uiSchema: operationReviewUiSchema,
    },
  ];
};

export default operationReviewFactoryItem;
