import {
  buildOperationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getOperationSchemaParameters } from "@reporting/src/app/components/operations/getOperationSchemaParameters";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const reportingOperationData = await getReportingOperation(versionId);

  const params = await getOperationSchemaParameters(versionId);
  const schema: any = buildOperationReviewSchema(
    params.reportOperation,
    params.reportingWindowEnd,
    params.allActivities,
    params.allRegulatedProducts,
    params.allRepresentatives,
    params.reportType,
    params.showRegulatedProducts,
    params.showBoroId,
  );

  // Purpose note doesn't show up on the final review page
  delete schema.properties.purpose_note;

  return [
    {
      schema: schema,
      data: reportingOperationData,
      uiSchema: operationReviewUiSchema,
    },
  ];
};

export default operationReviewFactoryItem;
