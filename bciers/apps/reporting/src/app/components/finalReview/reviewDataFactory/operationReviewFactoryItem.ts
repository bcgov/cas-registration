import {
  buildOperationReviewSchema,
  buildOperationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getOperationSchemaParameters } from "@reporting/src/app/components/operations/getOperationSchemaParameters";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const reportingOperationData = await getReportingOperation(versionId);

  const schemaData = await getOperationSchemaParameters(versionId);
  const schema: any = buildOperationReviewSchema(
    schemaData.reportOperation,
    schemaData.reportingWindowEnd,
    schemaData.allActivities,
    schemaData.allRegulatedProducts,
    schemaData.allRepresentatives,
    schemaData.reportType,
    schemaData.showRegulatedProducts,
    schemaData.showBoroId,
  );

  // Purpose note doesn't show up on the final review page
  delete schema.properties.purpose_note;

  return [
    {
      schema: schema,
      data: reportingOperationData,
      uiSchema: buildOperationReviewUiSchema(
        schemaData.reportOperation.operation_id,
      ),
    },
  ];
};

export default operationReviewFactoryItem;
