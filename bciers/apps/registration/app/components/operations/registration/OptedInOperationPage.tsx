import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import OptedInOperationForm from "apps/registration/app/components/operations/registration/OptedInOperationForm";
import { optedInOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";
import { getOptedInOperationDetail } from "@bciers/actions/api";

const OptedInOperationPage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  let formData;
  if (operation && isValidUUID(operation)) {
    formData = await getOptedInOperationDetail(operation);
  }

  if (formData && "error" in formData) {
    return (
      <div>
        <p>Sorry, Something went wrong. Please try again later!</p>
      </div>
    );
  }
  return (
    <OptedInOperationForm
      operation={operation}
      schema={optedInOperationSchema}
      formData={formData}
      step={step}
      steps={steps}
    />
  );
};

export default OptedInOperationPage;
