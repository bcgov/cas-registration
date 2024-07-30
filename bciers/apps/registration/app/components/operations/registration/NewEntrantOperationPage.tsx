import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import NewEntrantOperationForm from "apps/registration/app/components/operations/registration/NewEntrantOperationForm";
import { newEntrantOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";

const NewEntrantOperationPage = ({
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
    <NewEntrantOperationForm
      formData={{}}
      operation={operation}
      schema={newEntrantOperationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default NewEntrantOperationPage;
