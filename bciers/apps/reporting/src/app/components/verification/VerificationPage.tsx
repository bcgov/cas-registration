import { getReportVerification } from "@reporting/src/app/utils/getReportVerification";
import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import { verificationUiSchema } from "@reporting/src/data/verification/verification";
import VerificationForm from "@reporting/src/app/components/verification/VerificationForm";
import { getSignOffAndSubmitSteps } from "@reporting/src/app/components/taskList/5_signOffSubmit";

export default async function VerificationPage({
  version_id,
}: {
  version_id: number;
}) {
  // Fetch initial form data
  const initialData = await getReportVerification(version_id);
  // Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(version_id);
  // Create schema with dynamic facility list
  const verificationSchema = createVerificationSchema(facilityList.facilities);
  // Init the task list
  const taskListElements = getSignOffAndSubmitSteps(version_id, 0);
  // Render the verification form
  return (
    <>
      <VerificationForm
        version_id={version_id}
        verificationSchema={verificationSchema}
        verificationUiSchema={verificationUiSchema}
        initialData={initialData}
        taskListElements={taskListElements}
      />
    </>
  );
}
