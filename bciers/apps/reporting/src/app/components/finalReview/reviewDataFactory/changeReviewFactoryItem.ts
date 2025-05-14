import { ReviewDataFactoryItem } from "./factory";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";
import {
  changeReviewSchema,
  changeReviewUiSchema,
} from "@reporting/src/data/jsonSchema/changeReview/changeReview";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

const changeReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  // Only include this section for supplementary reports
  const isSupplementary = await getIsSupplementaryReport(versionId);
  if (!isSupplementary) {
    return [];
  }

  // Set schema so compliance note doesn't show up on the final review page
  delete changeReviewSchema.properties?.compliance_note;

  // Get the change review form data
  const reportChangeData = await getReportVersionDetails(versionId);

  return [
    {
      schema: changeReviewSchema,
      data: reportChangeData,
      uiSchema: changeReviewUiSchema,
    },
  ];
};

export default changeReviewFactoryItem;
