import { notFound } from "next/navigation";
import getContact from "./getContact";
import ContactsForm from "./ContactsForm";
import { contactsUiSchema } from "../../data/jsonSchema/contact";
import { ContactFormData, UserOperatorUser } from "./types";
import getUserOperatorUsers from "./getUserOperatorUsers";
import { createContactSchema } from "./createContactSchema";

// 🧩 Main component
export default async function Contact({
  contactId,
}: Readonly<{ contactId?: string }>) {
  let contactFormData: ContactFormData | { error: string } = {};

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

  return (
    <ContactsForm
      schema={createContactSchema(userOperatorUsers)}
      uiSchema={contactsUiSchema}
      formData={contactFormData}
      isCreating={!contactId}
    />
  );
}
