import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { OperationTypes } from "@bciers/utils/src/enums";

export default async function FinalReviewPage({
  version_id,
  children,
}: HasReportVersion & { children?: React.ReactNode }) {
  // Fetch report details
  const [isSupplementaryReport, verificationStatus, operationInfo] =
    await Promise.all([
      getIsSupplementaryReport(version_id),
      getReportVerificationStatus(version_id),
      getReportingOperation(version_id),
    ]);

  const isLFO = operationInfo?.operation_type === OperationTypes.LFO;

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.FinalReview,
    version_id,
    "",
    {
      skipVerification: !verificationStatus.show_verification_page,
      skipChangeReview: !isSupplementaryReport,
    },
  );

  return (
    <FinalReviewForm
      version_id={version_id}
      navigationInformation={navInfo}
      isOperationLFO={isLFO}
    >
      {children}
    </FinalReviewForm>
  );
}
