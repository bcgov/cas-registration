// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { ContactsSearchParams } from "@/administration/app/components/contacts/types";
import UserOperatorsPage from "@/administration/app/components/userOperators/UserOperatorsPage";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorsPage />
    </Suspense>
  );
}
