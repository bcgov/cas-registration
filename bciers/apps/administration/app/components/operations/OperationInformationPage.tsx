import OperationInformationForm from "./OperationInformationForm";
import NewTabBanner from "@bciers/components/layout/NewTabBanner";
import { getOperationWithDocuments } from "@bciers/actions/api";
import {
  createAdministrationOperationInformationSchema,
  createAdministrationOperationInformationUiSchema,
} from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

const OperationInformationPage = async ({
  operationId,
}: {
  operationId: UUID;
}) => {
  if (!operationId || !isValidUUID(operationId))
    throw new Error(`Invalid operation id: ${operationId}`);

  const operation = await getOperationWithDocuments(operationId);
  const formSchema = await createAdministrationOperationInformationSchema(
    operation.registration_purpose,
    operation.status,
  );
  const eioSchema = await createAdministrationOperationInformationSchema(
    RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION,
    operation.status,
  );
  const generalSchema = await createAdministrationOperationInformationSchema(
    undefined,
    operation.status,
  );

  const uiSchema = await createAdministrationOperationInformationUiSchema();

  return (
    <>
      <NewTabBanner />
      <OperationInformationForm
        formData={{
          ...operation,
          registration_purpose: operation?.registration_purpose,
        }}
        operationId={operationId}
        // this is the schema needed for the operation's existing registration purpose
        schema={formSchema}
        // these schemas are used to support changing the registration purpose
        eioSchema={eioSchema}
        generalSchema={generalSchema}
        uiSchema={uiSchema}
      />
    </>
  );
};

export default OperationInformationPage;
