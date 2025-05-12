import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { extendVerificationData } from "@reporting/src/app/utils/verification/extendVerificationData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingFlow, ReportingPage } from "../taskList/types";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getFlow } from "@reporting/src/app/components/taskList/reportingFlow";

// import { verificationSchema } from "@reporting/src/data/jsonSchema/verification/verification";
export default async function VerificationPage({
  version_id,
}: HasReportVersion) {
  // Determine operationType based on reportOperation
  // 🚀 Fetch the operation associated with the specified version ID
  const reportOperation = await getReportingOperation(version_id);
  const operationType = reportOperation?.operation_type;
  const flow = await getFlow(version_id);
  const isEIO = flow === ReportingFlow.EIO;

  // 🚀 Fetch initial form data
  const initialData = (await getReportVerification(version_id)) || {};
  const transformedData = extendVerificationData(initialData);

  // 🚀 Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(version_id);
  const isSupplementaryReport = await getIsSupplementaryReport(version_id);
  // Create schema with dynamic facility list for operation type
  const verificationSchema = createVerificationSchema(
    facilityList.facilities,
    operationType,
    isSupplementaryReport.is_supplementary_report_version,
    isEIO,
  );

  //🔍 Check if reports need verification
  const { show_verification_page: showVerificationPage } =
    await getReportVerificationStatus(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Verification,
    version_id,
    "",
    { skipVerification: !showVerificationPage },
  );

  // Render the verification form
  return (
    <>
      <VerificationForm
        version_id={version_id}
        operationType={operationType}
        verificationSchema={verificationSchema}
        initialData={transformedData}
        navigationInformation={navInfo}
        isSupplementaryReport={
          isSupplementaryReport.is_supplementary_report_version
        }
      />
    </>
  );
}
