import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { createRegistrationOperationInformationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationInformation";

const OperationInformationPage = async ({
  step,
  steps,
}: {
  step: number;
  steps: string[];
}) => {
  return (
    <OperationInformationForm
      // brianna why do we even have formdata this high up?
      formData={{}}
      schema={await createRegistrationOperationInformationSchema()}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
