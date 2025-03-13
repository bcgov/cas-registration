import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { extendVerificationData } from "@reporting/src/app/utils/verification/extendVerificationData";
import { getNavigationInformation } from "../taskList/navigationInformation";
import { HeaderStep, ReportingPage } from "../taskList/types";

// import { verificationSchema } from "@reporting/src/data/jsonSchema/verification/verification";
export default async function VerificationPage({
  version_id,
}: HasReportVersion) {
  // Determine operationType based on reportOperation
  // 🚀 Fetch the operation associated with the specified version ID
  const reportOperation = await getReportingOperation(version_id);
  const operationType = reportOperation?.operation_type;

  // 🚀 Fetch initial form data
  const initialData = (await getReportVerification(version_id)) || {};
  const transformedData = extendVerificationData(initialData);

  // 🚀 Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(version_id);

  // Create schema with dynamic facility list for operation type
  const verificationSchema = createVerificationSchema(
    facilityList.facilities,
    operationType,
  );

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);

  const navInfo = await getNavigationInformation(
    HeaderStep.SignOffSubmit,
    ReportingPage.Verification,
    version_id,
    "",
    { skipVerification: !needsVerification },
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
      />
    </>
  );
}
