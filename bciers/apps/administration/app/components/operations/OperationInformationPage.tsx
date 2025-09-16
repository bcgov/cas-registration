import OperationInformationForm from "./OperationInformationForm";
import NewTabBanner from "@bciers/components/layout/NewTabBanner";
import { getOperationWithDocuments } from "@bciers/actions/api";
import { createAdministrationOperationInformationSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import { Alert } from "@mui/material";

const OperationInformationPage = async ({
  operationId,
}: {
  operationId: UUID;
}) => {
  let operation;
  if (operationId && isValidUUID(operationId)) {
    operation = await getOperationWithDocuments(operationId);
  } else throw new Error(`Invalid operation id: ${operationId}`);

  if (operation?.error) throw new Error("Error fetching operation information");

  const isMissingRepresentative =
    operation.status === "Registered" && (
      !operation.operation_representatives ||
      operation.operation_representatives.length === 0
    );

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
  console.log("***** Page formData ******:", operation);

  return (
    <>
      <NewTabBanner />
      {/* {isMissingRepresentative && (
        <Alert severity="info" color="warning" sx={{ ml: { xs: 0, sm: 35 } }}>
          Please select an operation representative
        </Alert>
      )} */}
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
      />
    </>
  );
};

export default OperationInformationPage;
