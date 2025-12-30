import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import ContactsPage from "@/administration/app/components/contacts/ContactsPage";
import type { ContactsSearchParams } from "@/administration/app/components/contacts/types";

const ContactsRoute: React.FC<{ searchParams?: ContactsSearchParams }> = ({
  searchParams,
}) => (
  <ContactsPage
    searchParams={(searchParams ?? {}) as ContactsSearchParams}
    isExternalUser={true}
  />
);

export default defaultPageFactory(ContactsRoute);
