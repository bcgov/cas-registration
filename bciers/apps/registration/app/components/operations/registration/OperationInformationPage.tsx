import { createRegistrationOperationInformationSchemas } from "@/registration/app/data/jsonSchema/operationInformation/registrationOperationInformation";
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
  let formData: OperationInformationFormData = {};
  const schemaData = await createRegistrationOperationInformationSchemas();
  if (operation && isValidUUID(operation))
    formData = await getOperationRegistration(operation);

  return (
    <OperationInformationForm
      rawFormData={formData}
      schema={schemaData.schema}
      uiSchema={schemaData.uiSchema}
      step={step}
      steps={steps}
    />
  );
};

export default OperationInformationPage;
