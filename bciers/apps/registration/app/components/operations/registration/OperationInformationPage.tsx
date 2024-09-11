import { createRegistrationOperationInformationSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";

const OperationInformationPage = async ({
  step,
  steps,
}: {
  step: number;
  steps: string[];
}) => {
  return (
    <OperationInformationForm
      rawFormData={{}}
      schema={await createRegistrationOperationInformationSchema()}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
