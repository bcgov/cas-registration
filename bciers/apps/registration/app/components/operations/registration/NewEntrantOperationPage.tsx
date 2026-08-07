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
  let formData: NewEntrantOperationFormData | Record<string, never> = {};
  if (operation && isValidUUID(operation))
    formData = await getOperationNewEntrantApplication(operation);

  return (
    <NewEntrantOperationForm
      formData={formData as NewEntrantOperationFormData}
      operation={operation}
      schema={newEntrantOperationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default NewEntrantOperationPage;
