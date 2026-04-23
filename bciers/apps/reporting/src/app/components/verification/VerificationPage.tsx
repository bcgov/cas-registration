import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingFlow, ReportingPage } from "../taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getFlow } from "@reporting/src/app/components/taskList/reportingFlows";

export default async function VerificationPage({
  version_id,
}: HasReportVersion) {
  // Determine operationType based on reportOperation
  // 🚀 Fetch the operation associated with the specified version ID
  const reportOperation = await getReportingOperation(version_id);
  const operationType = reportOperation?.operation_type;
  const flow = await getFlow(version_id);
  const isEIO = flow === ReportingFlow.EIO;

  const initialData = (await getReportVerification(version_id)) || {};

  //🔍 Check if is a supplementary report
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);

  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  const verificationSchema = createVerificationSchema(
    operationType,
    isSupplementaryReport,
    isEIO,
  );

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Verification,
    version_id,
    "",
    {
      skipVerification: !showVerificationPage,
      skipChangeReview: !isSupplementaryReport,
    },
  );

  return (
    <>
      <VerificationForm
        version_id={version_id}
        operationType={operationType}
        verificationSchema={verificationSchema}
        initialData={initialData}
        navigationInformation={navInfo}
        isSupplementaryReport={isSupplementaryReport}
        isEIO={isEIO}
      />
    </>
  );
}
