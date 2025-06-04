import {
  buildOperationReviewSchema,
  buildOperationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { ReviewDataFactoryItem } from "./factory";
import { getReviewOperationInformationPageData } from "@reporting/src/app/utils/getReportOperationData";

const operationReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  const schemaData = await getReviewOperationInformationPageData(versionId);
  const schema: any = buildOperationReviewSchema(
    schemaData.report_operation,
    schemaData.reporting_year,
    schemaData.all_activities,
    schemaData.all_regulated_products,
    schemaData.all_representatives,
    schemaData.report_type,
    schemaData.show_regulated_products,
    schemaData.show_boro_id,
    schemaData.show_activities,
  );

  // Purpose note doesn't show up on the final review page
  delete schema.properties.purpose_note;
  delete schema.properties.sync_button;

  return [
    {
      schema: schema,
      data: schemaData.report_operation,
      uiSchema: buildOperationReviewUiSchema(),
    },
  ];
};

export default operationReviewFactoryItem;
