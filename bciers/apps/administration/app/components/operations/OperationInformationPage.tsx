import OperationInformationForm from "./OperationInformationForm";
import { getOperation } from "@bciers/actions/api";
import { createAdministrationOperationInformationSchema } from "../../data/jsonSchema/operationInformation";
import { validate as isValidUUID } from "uuid";

export const ExternalUserLayout = () => {
  return <h2 className="text-bc-link-blue">Add Operation</h2>;
};

const OperationInformationPage = async ({
  operationId,
}: {
  operationId: string;
}) => {
  let operation;

  if (operationId && isValidUUID(operationId)) {
    operation = await getOperation(operationId);
  }

  return (
    <OperationInformationForm
      formData={operation}
      schema={await createAdministrationOperationInformationSchema()}
    />
  );
};

export default OperationInformationPage;
