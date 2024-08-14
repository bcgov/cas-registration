import { UUID } from "crypto";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { operationRepresentativeSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";

const OperationRepresentativePage = ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
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
