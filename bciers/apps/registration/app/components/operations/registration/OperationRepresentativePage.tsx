import { UUID } from "crypto";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { getContacts, getOperationsContacts } from "@bciers/actions/api";
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

  if (contacts && "error" in contacts)
    throw new Error("Failed to Retrieve Contact or User Information");
  if (
    existingOperationRepresentatives &&
    "error" in existingOperationRepresentatives
  )
    throw new Error("Failed to Retrieve Operation Representatives");

  // Excluding existing operation representatives from the list of contacts
  contacts.items = contacts.items.filter(
    (contact) =>
      !existingOperationRepresentatives.some(
        (opRep) => opRep.id === contact.id,
      ),
  );

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
