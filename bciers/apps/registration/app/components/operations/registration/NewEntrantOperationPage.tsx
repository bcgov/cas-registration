import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import NewEntrantOperationForm from "apps/registration/app/components/operations/registration/NewEntrantOperationForm";
import { newEntrantOperationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import { getNewEntrantOperationDetail } from "@bciers/actions/api";

const NewEntrantOperationPage = async ({
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
    formData = await getNewEntrantOperationDetail(operation);
    console.log("NewEntrantOperationPage")
    console.log(formData)
  }

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
