import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import RegistrationSubmissionForm from "apps/registration/app/components/operations/registration/RegistrationSubmissionForm";
import { submissionSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/submission";

const RegistrationSubmissionPage = ({
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
    <RegistrationSubmissionForm
      formData={{}}
      operation={operation}
      schema={submissionSchema}
      step={step}
      steps={steps}
    />
  );
};

export default RegistrationSubmissionPage;
