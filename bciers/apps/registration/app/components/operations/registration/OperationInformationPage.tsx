import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { operationInformationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";

const OperationInformationPage = ({
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
    <OperationInformationForm
      formData={{}}
      operation={operation}
      schema={operationInformationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
