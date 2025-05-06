import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";

export interface TaskListContext {
  skipChangeReview: boolean;
  skipVerification: boolean;
}

export async function getTaskListContext(
  versionId: number,
): Promise<TaskListContext> {
  const [skipChangeReview, skipVerification] = await Promise.all([
    getIsSupplementaryReport(versionId),
    getReportNeedsVerification(versionId),
  ]);
  return { skipChangeReview, skipVerification };
}
