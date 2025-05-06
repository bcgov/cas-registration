import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import ChangeReviewForm from "./ChangeReviewForm";
import { getReportAdditionalData } from "../../utils/getReportAdditionalData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";
import {
  TaskListContext,
  getTaskListContext,
} from "@reporting/src/app/components/taskList/taskListPages/taskListContext";

export default async function ChangeReviewPage({
  version_id,
}: HasReportVersion) {
  // 🚀 Get form data
  const initialFormData = await getReportAdditionalData(version_id);

  // 🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  //🔍 Check if needs verification
  const needsVerification = await getReportNeedsVerification(version_id);

  // Build task list
  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.ChangeReview,
    version_id,
    "",
    {
      skipChangeReview: !isSupplementaryReport,
      skipVerification: !needsVerification,
    },
  );

  return (
    <ChangeReviewForm
      versionId={version_id}
      initialFormData={initialFormData}
      navigationInformation={navInfo}
    />
  );
}
