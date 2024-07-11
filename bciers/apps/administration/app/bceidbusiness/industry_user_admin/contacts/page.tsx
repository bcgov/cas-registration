// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { ContactsSearchParams } from "@/administration/app/components/contacts/types";
import ContactsPage, {
  ExternalContactsLayout,
} from "@/administration/app/components/contacts/Contacts";

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: ContactsSearchParams;
}>) {
  return (
    <ExternalContactsLayout>
      <ContactsPage searchParams={searchParams} isExternalUser={true} />{" "}
    </ExternalContactsLayout>
  );
}
