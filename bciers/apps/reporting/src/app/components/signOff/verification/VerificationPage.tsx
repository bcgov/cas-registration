import { getReportFacilityList } from "@reporting/src/app/utils/getReportFacilityList";

import { createVerificationSchema } from "@reporting/src/app/components/signOff/verification/createVerificationSchema";
import { verificationUiSchema } from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import VerificationForm from "@reporting/src/app/components/signOff/verification/VerificationForm";

export default async function VerificationPage({
  versionId,
}: {
  versionId: number;
}) {
  // Fetch the list of facilities associated with the specified version ID
  const facilityList = await getReportFacilityList(versionId);

  // Create schema with dynamic facility list
  const verificationSchema = createVerificationSchema(facilityList.facilities);
  // Render the verification form
  return (
    <>
      <VerificationForm
        versionId={versionId}
        verificationSchema={verificationSchema}
        verificationUiSchema={verificationUiSchema}
      />
    </>
  );
}
