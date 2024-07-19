import { notFound } from "next/navigation";
import getContact from "./getContact";
import ContactsForm from "./ContactsForm";
import { contactsUiSchema } from "../../data/jsonSchema/contact";
import { ContactFormData, UserOperatorUser } from "./types";
import getUserOperatorUsers from "./getUserOperatorUsers";
import { createContactSchema } from "./createContactSchema";
import Note from "@bciers/components/layout/Note";

// 🧩 Main component
export default async function Contact({
  contactId,
}: Readonly<{ contactId?: string }>) {
  let contactFormData: ContactFormData | { error: string } = {};
  const isCreating: boolean = !contactId;

  if (contactId) {
    contactFormData = await getContact(contactId);
    if ("error" in contactFormData) {
      return notFound();
    }
  }
  // Retrieves the list of users associated with the operator of the current user
  const userOperatorUsers: UserOperatorUser[] | { error: string } =
    await getUserOperatorUsers("/contacts/add-contact");
  if ("error" in userOperatorUsers) {
    return notFound();
  }

  const noteMsg = isCreating
    ? "Once added, this new contact can be selected wherever needed or applicable."
    : "View or update information of this contact here.";

  return (
    <>
      <Note>
        <b>Note: </b>
        {noteMsg}
      </Note>
      <h2 className="text-bc-primary-blue">
        {isCreating ? "Add Contact" : "Contact Details"}
      </h2>
      <ContactsForm
        schema={createContactSchema(userOperatorUsers, isCreating)}
        uiSchema={contactsUiSchema}
        formData={contactFormData}
        isCreating={isCreating}
      />
    </>
  );
}
