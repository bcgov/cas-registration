import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OptedInOperationForm from "apps/registration/app/components/operations/registration/OptedInOperationForm";
import { optedInOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";
import { getOptedInOperationDetail } from "@bciers/actions/api";
import { OptedInOperationFormData } from "@/registration/app/components/operations/registration/types";

const OptedInOperationPage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  if (!operation || !isValidUUID(operation))
    throw new Error(`Invalid operation id: ${operation}`);

  const formData = await getOptedInOperationDetail(operation);

  return (
    <OptedInOperationForm
      operation={operation}
      schema={optedInOperationSchema}
      formData={formData as OptedInOperationFormData}
      step={step}
      steps={steps}
    />
  );
};

export default OptedInOperationPage;
