// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import ExternalTransferPage from "@/administration/app/components/transfers/ExternalTransferPage";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ExternalTransferPage />
    </Suspense>
  );
}
