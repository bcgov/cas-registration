import { createRegistrationOperationInformationSchema } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
import { getOperationRegistration } from "@bciers/actions/api";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import { OperationInformationFormData } from "./types";

const OperationInformationPage = async ({
  step,
  steps,
  operation,
}: {
  step: number;
  steps: string[];
  operation: UUID;
}) => {
  let formData: OperationInformationFormData | { error: string } | {} = {};
  if (operation && isValidUUID(operation))
    formData = await getOperationRegistration(operation);

  if (formData && "error" in formData)
    // using dot notation for error raises a TS error
    throw new Error("Failed to fetch operation data");
  return (
    <OperationInformationForm
      rawFormData={formData}
      schema={await createRegistrationOperationInformationSchema()}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
