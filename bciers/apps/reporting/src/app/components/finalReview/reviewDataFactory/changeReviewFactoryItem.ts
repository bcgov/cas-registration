import { ReviewDataFactoryItem } from "./factory";
import { getReportChange } from "@reporting/src/app/utils/getReportChange";
import {
  changeReviewSchema,
  changeReviewUiSchema,
} from "@reporting/src/data/jsonSchema/changeReview/changeReview";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

const changeReviewFactoryItem: ReviewDataFactoryItem = async (versionId) => {
  // 🔍 Only include this section for supplementary reports
  const isSupplementary = await getIsSupplementaryReport(versionId);
  if (!isSupplementary) {
    // return an empty array rather than null, so callers can always do `.flat()` or `.filter(Boolean)`
    return [];
  }

  const reportChangeData = await getReportChange(versionId);

  return [
    {
      schema: changeReviewSchema,
      data: reportChangeData,
      uiSchema: changeReviewUiSchema,
    },
  ];
};

export default changeReviewFactoryItem;
