import { UUID } from "crypto";
import OptedInOperationForm from "apps/registration/app/components/operations/registration/OptedInOperationForm";
import { optedInOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/optedInOperation";

const OptedInOperationPage = ({
  operation,
  step,
  steps,
  formData,
}: {
  operation: UUID;
  step: number;
  steps: string[];
  formData: {};
}) => {
  // TODO: We need to figure out how to get the operation data(all data at once instead of individual calls)?!?!
  return (
    <OptedInOperationForm
      formData={{}}
      operation={operation}
      schema={optedInOperationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default OptedInOperationPage;
