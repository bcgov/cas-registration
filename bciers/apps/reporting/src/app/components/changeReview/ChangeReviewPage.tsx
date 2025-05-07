import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getReportAdditionalData } from "@reporting/src/app/utils/getReportAdditionalData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import ChangeReviewForm from "./ChangeReviewForm";

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
