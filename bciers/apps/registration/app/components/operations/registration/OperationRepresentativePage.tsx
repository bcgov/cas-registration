import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { operationRepresentativeSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";

const OperationRepresentativePage = ({
  operation,
  step,
  steps,
}: {
  operation: UUID | "create";
  step: number;
  steps: string[];
}) => {
  // Don't fetch operation if UUID is invalid or operation === "create"
  if (operation && isValidUUID(operation)) {
    // Fetch formData data here
  }

  return (
    <OperationRepresentativeForm
      formData={{}}
      operation={operation}
      schema={operationRepresentativeSchema}
      step={step}
      steps={steps}
    />
  );
};

export default OperationRepresentativePage;
