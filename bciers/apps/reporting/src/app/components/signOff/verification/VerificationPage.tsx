import { verificationUiSchema } from "@reporting/src/data/jsonSchema/signOff/verification/verification";
import { createVerificationSchema } from "./createVerificationSchema";
import VerificationForm from "./VerificationForm";

export default async function VerificationPage({
  versionId,
}: {
  versionId: number;
}) {
  // Create schema with dynamic facility list
  const verificationSchema = await createVerificationSchema(versionId);
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
