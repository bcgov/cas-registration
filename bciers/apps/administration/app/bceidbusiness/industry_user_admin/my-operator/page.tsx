// 🚩 flagging that for shared routes between roles, `OperatorPage` code is a component for code maintainability

import OperatorPage from "@/administration/app/components/operators/OperatorPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <OperatorPage />
    </Suspense>
  );
}
