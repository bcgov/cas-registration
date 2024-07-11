import { notFound } from "next/navigation";
import getContact from "./getContact";
import ContactsForm from "./ContactsForm";
import {
  contactsSchema,
  contactsUiSchema,
} from "../../data/jsonSchema/contact";
import { ContactFormData } from "./types";

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
  return (
    <ContactsForm
      schema={contactsSchema}
      uiSchema={contactsUiSchema}
      formData={contactFormData}
      isCreating={!contactId}
    />
  );
}
