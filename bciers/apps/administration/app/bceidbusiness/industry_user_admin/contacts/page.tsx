// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { ContactsSearchParams } from "@/administration/app/components/contacts/types";
import ContactsPage from "@/administration/app/components/contacts/ContactsPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page(
  props: Readonly<{
    searchParams: Promise<ContactsSearchParams>;
  }>,
) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<Loading />}>
      <ContactsPage searchParams={searchParams} isExternalUser={true} />
    </Suspense>
  );
}
