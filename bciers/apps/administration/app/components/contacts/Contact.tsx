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
  let userOperatorUsers: UserOperatorUser[] | { error: string } = [];

  if (contactId) {
    contactFormData = await getContact(contactId);
    if ("error" in contactFormData) {
      return (
        <div>
          <h3>Contact Information Not Found</h3>
          <p>
            Sorry, we couldn&apos;t find the contact information you were
            looking for.
          </p>
        </div>
      );
    }
  } else {
    // Retrieves the list of users associated with the operator of the current user
    userOperatorUsers = await getUserOperatorUsers("/contacts/add-contact");
    if ("error" in userOperatorUsers) {
      return (
        <div>
          <h3>Failed to Retrieve User Information</h3>
        </div>
      );
    }
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
