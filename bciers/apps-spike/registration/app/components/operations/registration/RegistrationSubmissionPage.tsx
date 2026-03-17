import { UUID } from "crypto";
import RegistrationSubmissionForm from "apps/registration/app/components/operations/registration/RegistrationSubmissionForm";
import { submissionSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/submission";

const RegistrationSubmissionPage = ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  return (
    <RegistrationSubmissionForm
      operation={operation}
      schema={submissionSchema}
      step={step}
      steps={steps}
    />
  );
};

export default RegistrationSubmissionPage;
