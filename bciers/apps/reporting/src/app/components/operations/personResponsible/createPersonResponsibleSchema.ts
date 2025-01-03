import { RJSFSchema } from "@rjsf/utils";
import { ContactRow } from "@/administration/app/components/contacts/types";
import { Contact } from "@reporting/src/app/components/operations/types";
import { createContactDetailsProperties } from "@reporting/src/data/jsonSchema/personResponsible";

/**
 * Creates a new schema with an updated `person_responsible` field and optionally adds
 * `contact_details` if a valid `contactId` and `contact` object are provided.
 *
 * @param {RJSFSchema} schema - The original JSON schema to modify.
 * @param {ContactRow[]} contactOptions - List of available contacts with limited details (`id`, `first_name`, `last_name`, `email`) to display in `person_responsible` options.
 * @param {number | null} contactId - The selected contact's ID. If provided and valid, determines whether to add `contact_details`.
 * @param contactData
 * @returns {RJSFSchema} - The updated schema with modified `person_responsible` field and optional `contact_details`.
 */
export const createPersonResponsibleSchema = (
  schema: RJSFSchema,
  contactOptions: ContactRow[],
  contactId?: number,
  contactData?: Contact, // Renamed parameter
): RJSFSchema => {
  const localSchema = JSON.parse(JSON.stringify(schema));

  localSchema.properties.person_responsible.enum = contactOptions?.map(
    (c) => `${c.first_name} ${c.last_name}`,
  );

  if (contactId && contactData) {
    localSchema.properties.contact_details =
      createContactDetailsProperties(contactData);
  }

  return localSchema;
};
