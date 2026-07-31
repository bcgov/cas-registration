import { UUID } from "crypto";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { getContacts, getOperationRepresentatives } from "@bciers/actions/api";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { OperationRepresentative } from "./types";

const OperationRepresentativePage = async ({
  operation,
  step,
  steps,
}: {
  operation: UUID;
  step: number;
  steps: string[];
}) => {
  const existingOperationRepresentatives: OperationRepresentative[] =
    await getOperationRepresentatives(operation);
  const contacts: { items: ContactRow[]; count: number } = await getContacts();

  // Excluding existing operation representatives from the list of contacts
  contacts.items = contacts.items?.filter(
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
