// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { ContactsSearchParams } from "@/administration/app/components/contacts/types";
import AccessRequestsPage from "@/administration/app/components/userOperators/AccessRequestsPage";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AccessRequestsPage />
    </Suspense>
  );
}
