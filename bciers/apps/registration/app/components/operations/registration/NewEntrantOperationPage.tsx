import { UUID } from "crypto";
import NewEntrantOperationForm from "apps/registration/app/components/operations/registration/NewEntrantOperationForm";
import { newEntrantOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";

const NewEntrantOperationPage = ({
  formData,
  operation,
  step,
  steps,
}: {
  formData: { [key: string]: any };
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  return (
    <NewEntrantOperationForm
      formData={formData ?? {}}
      operation={operation}
      schema={newEntrantOperationSchema}
      step={step}
      steps={steps}
    />
  );
};

export default NewEntrantOperationPage;
