import OperationInformationForm from "./OperationInformationForm";
import { getOperationWithDocuments } from "@bciers/actions/api";
import { createAdministrationOperationInformationSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";

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
    operation?.registration_purpose,
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
