import { getContact } from "@bciers/actions/api";
import ContactForm from "./ContactForm";
import { contactsSchema } from "@/administration/app/data/jsonSchema/contact";
import { ContactFormData, UserOperatorUser } from "./types";
import getUserOperatorUsers from "./getUserOperatorUsers";
import { createContactSchema } from "./createContactSchema";
import Note from "@bciers/components/layout/Note";
import { auth } from "@/dashboard/auth";

// 🧩 Main component
export default async function ContactPage({
  contactId,
}: Readonly<{ contactId?: string }>) {
  let contactFormData: ContactFormData | { error: string } = {};
  const isCreating: boolean = !contactId;
  let userOperatorUsers: UserOperatorUser[] | { error: string } = [];

  if (contactId) {
    contactFormData = await getContact(contactId, `/contacts/${contactId}`);
    if (contactFormData && "error" in contactFormData)
      throw new Error("Failed to retrieve contact information");
  } else {
    // Retrieves the list of users associated with the operator of the current user
    userOperatorUsers = await getUserOperatorUsers("/contacts/add-contact");
    if (userOperatorUsers && "error" in userOperatorUsers)
      throw new Error("Failed to retrieve user information");
  }

  const noteMsg = isCreating
    ? "Once added, this new contact can be selected wherever needed or applicable."
    : "View or update information of this contact here.";

  // To get the user's role from the session
  const session = await auth();
  const role = session?.user?.app_role ?? "";

  return (
    <>
      <Note>
        <b>Note: </b>
        {noteMsg}
      </Note>
      <h2 className="text-bc-primary-blue">
        {isCreating ? "Add Contact" : "Contact Details"}
      </h2>
      <ContactForm
        schema={createContactSchema(
          contactsSchema,
          userOperatorUsers,
          isCreating,
        )}
        formData={contactFormData}
        isCreating={isCreating}
        allowEdit={role.includes("industry")}
      />
    </>
  );
}
