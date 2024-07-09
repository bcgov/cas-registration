// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { ContactsSearchParams } from "@/registration/app/components/contacts/types";
import ContactsPage from "@/registration/app/components/routes/contacts/Page";

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: ContactsSearchParams;
}>) {
  return <ContactsPage searchParams={searchParams} isExternalUser={true} />;
}
