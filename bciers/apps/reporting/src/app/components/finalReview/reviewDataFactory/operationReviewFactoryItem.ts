import {
  buildOperationReviewSchema,
  buildOperationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getReportingOperationData } from "@reporting/src/app/utils/getReportOperationData";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const schemaData = await getReportingOperationData(versionId);
  const schema: any = buildOperationReviewSchema(
    schemaData.reportOperation,
    schemaData.reportingYear,
    schemaData.allActivities,
    schemaData.allRegulatedProducts,
    schemaData.allRepresentatives,
    schemaData.reportType,
    schemaData.showRegulatedProducts,
    schemaData.showBoroId,
    schemaData.showActivities,
  );

  // Purpose note doesn't show up on the final review page
  delete schema.properties.purpose_note;
  delete schema.properties.sync_button;

  return [
    {
      schema: schema,
      data: schemaData.reportOperation,
      uiSchema: buildOperationReviewUiSchema(),
    },
  ];
};

export default operationReviewFactoryItem;
