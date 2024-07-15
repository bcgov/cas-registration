import { UUID } from "crypto";
import OperationRegistrationForm from "./OperationRegistrationForm";
import { operationRegistrationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration";

const OperationRegistration = ({ operationId }: { operationId: UUID }) => {
  if (operationId) {
    // Fetch operation data here
  }
  return (
    <OperationRegistrationForm
      schema={operationRegistrationSchema}
      formData={{}}
    />
  );
};

export default OperationRegistration;
