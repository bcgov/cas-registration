import OperationInformationForm from "./OperationInformationForm";
import { getOperationWithDocuments } from "@bciers/actions/api";
import { createAdministrationOperationInformationSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

const OperationInformationPage = async ({
  operationId,
}: {
  operationId: UUID;
}) => {
  let operation;
  if (operationId && isValidUUID(operationId)) {
    operation = await getOperationWithDocuments(operationId);
  } else throw new Error(`Invalid operation id: ${operationId}`);

  if (operation?.error) throw new Error("Error fetching operation information");

  const formSchema = await createAdministrationOperationInformationSchema(
    undefined, // we do know the registration purpose at this point, but we don't want to consider it when generating the schema
    operation.status,
  );

  return (
    <OperationInformationForm
      formData={{
        ...operation,
        registration_purpose: operation?.registration_purpose,
      }}
      operationId={operationId}
      schema={formSchema}
    />
  );
};

export default OperationInformationPage;
