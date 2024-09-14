import { UUID } from "crypto";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import {
  createOperationRepresentativeSchema,
  operationRepresentativeSchema,
} from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  deleteOperationsContact,
  getContacts,
  getOperationsContacts,
} from "@bciers/actions/api";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { OperationsContacts } from "./types";

const OperationRepresentativePage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  let contacts: { items: ContactRow[]; count: number } | { error: string };
  let existingOperationRepresentatives:
    | OperationsContacts[]
    | {
        error: string;
      };
  contacts = await getContacts();
  existingOperationRepresentatives = await getOperationsContacts(operation);
  // existingOperationRepresentatives = [];

  // TODO:
  // 5. Update existing implementation of adding multiple contacts to the operation `register_operation_operation_representative`
  // 6. disable first name, last name and email for updating existing contact
  // 7. validate the form before submitting

  if (contacts && "error" in contacts)
    throw new Error("Failed to Retrieve Contact or User Information");
  if (
    existingOperationRepresentatives &&
    "error" in existingOperationRepresentatives
  )
    throw new Error("Failed to Retrieve Operation Representatives");

  return (
    <OperationRepresentativeForm
      formData={{
        operation_representatives: existingOperationRepresentatives.map(
          (op) => op.id,
        ),
      }}
      operation={operation}
      existingOperationRepresentatives={existingOperationRepresentatives}
      contacts={contacts.items}
      step={step}
      steps={steps}
    />
  );
};

export default OperationRepresentativePage;
