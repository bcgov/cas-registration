import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationInformationForm from "./OperationInformationForm";
import { getOperation } from "@bciers/actions/api";
import { createAdministrationOperationInformationSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";

export const ExternalUserLayout = () => {
  return <h2 className="text-bc-link-blue">Add Operation</h2>;
};

const OperationInformationPage = async ({
  operationId,
}: {
  operationId: UUID;
}) => {
  let operation;

  if (operationId && isValidUUID(operationId)) {
    operation = await getOperation(operationId);
  }

  return (
    <OperationInformationForm
      formData={operation}
      operationId={operationId}
      schema={await createAdministrationOperationInformationSchema()}
    />
  );
};

export default OperationInformationPage;
