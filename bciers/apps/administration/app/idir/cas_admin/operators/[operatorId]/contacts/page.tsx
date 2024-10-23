// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { ContactsSearchParams } from "@/administration/app/components/contacts/types";
import ContactsPage from "@/administration/app/components/contacts/ContactsPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: ContactsSearchParams;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <ContactsPage searchParams={searchParams} isExternalUser={false} />
    </Suspense>
  );
}
