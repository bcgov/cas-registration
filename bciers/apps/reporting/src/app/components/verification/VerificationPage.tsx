import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

export default async function VerificationPage({
  version_id,
}: HasReportVersion) {
  // Fetch initial form data
  const initialData = await getReportVerification(version_id);
  // Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(version_id);
  const operationType = "LFO";
  // Create schema with dynamic facility list for operation type
  const verificationSchema = createVerificationSchema(
    facilityList.facilities,
    operationType,
  );

  //🔍 Check if reports need verification
  const needsVerification = await getReportNeedsVerification(version_id);
  const taskListElements = await getSignOffAndSubmitSteps(
    version_id,
    ActivePage.Verification,
    needsVerification,
  );
  // Render the verification form
  return (
    <>
      <VerificationForm
        version_id={version_id}
        verificationSchema={verificationSchema}
        initialData={initialData}
        taskListElements={taskListElements}
      />
    </>
  );
}
