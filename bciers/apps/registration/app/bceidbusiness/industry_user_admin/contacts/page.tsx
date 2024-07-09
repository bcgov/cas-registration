// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { ContactsSearchParams } from "@/registration/app/components/contacts/types";
import ContactsPage from "@/registration/app/components/contacts/Contacts";

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: ContactsSearchParams;
}>) {
  return <ContactsPage searchParams={searchParams} isExternalUser={true} />;
}
