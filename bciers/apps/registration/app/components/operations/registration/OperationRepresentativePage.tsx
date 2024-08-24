import { UUID } from "crypto";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { operationRepresentativeSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import { RJSFSchema } from "@rjsf/utils";
import { getContacts } from "@bciers/actions/api";
import { contactsSchema } from "@/administration/app/data/jsonSchema/contact";
import { createContactSchema } from "@/administration/app/components/contacts/createContactSchema";
import {
  ContactRow,
  UserOperatorUser,
} from "@/administration/app/components/contacts/types";
import getUserOperatorUsers from "@/administration/app/components/contacts/getUserOperatorUsers";

export const createOperationRepresentativeSchema = (
  schema: RJSFSchema,
  contactOptions: ContactRow[],
  userOperatorUsers: UserOperatorUser[],
) => {
  // set up options for contact selection dropdown
  const localSchema = JSON.parse(JSON.stringify(schema));
  if (Array.isArray(contactOptions)) {
    localSchema.properties.operation_representatives.items.enum =
      contactOptions.map((contact) => contact?.id);

    localSchema.properties.operation_representatives.items.enumNames =
      contactOptions.map(
        (contact) => `${contact?.first_name} ${contact?.last_name}`,
      );
  }

  // create add contact section
  localSchema.properties.new_operation_representatives.items =
    createContactSchema(contactsSchema, userOperatorUsers, true);

  return localSchema;
};

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
  contacts = await getContacts();
  let userOperatorUsers: UserOperatorUser[] | { error: string };
  userOperatorUsers = await getUserOperatorUsers(
    `registration/register-an-operation/${operation}/4`,
  );
  if (
    (contacts && "error" in contacts) ||
    (userOperatorUsers && "error" in userOperatorUsers)
  )
    throw new Error("Failed to Retrieve Contact or User Information");

  return (
    <OperationRepresentativeForm
      formData={{}}
      operation={operation}
      schema={createOperationRepresentativeSchema(
        operationRepresentativeSchema,
        contacts?.items,
        userOperatorUsers,
      )}
      step={step}
      steps={steps}
    />
  );
};

export default OperationRepresentativePage;
