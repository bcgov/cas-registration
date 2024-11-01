import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import NewEntrantOperationForm from "apps/registration/app/components/operations/registration/NewEntrantOperationForm";
import { newEntrantOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import { getOperationNewEntrantApplication } from "@bciers/actions/api";
import { NewEntrantOperationFormData } from "@/registration/app/components/operations/registration/types";

const NewEntrantOperationPage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  let formData: NewEntrantOperationFormData | { error: string } | {} = {};
  if (operation && isValidUUID(operation))
    formData = await getOperationNewEntrantApplication(operation);

  if (formData && "error" in formData)
    // using dot notation for error raises a TS error
    throw new Error("Failed to fetch new entrant application");

  return (
    <NewEntrantOperationForm
      formData={formData}
      operation={operation}
      schema={newEntrantOperationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default NewEntrantOperationPage;
