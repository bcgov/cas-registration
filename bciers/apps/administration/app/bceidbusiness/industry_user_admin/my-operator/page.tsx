// 🚩 flagging that for shared routes between roles, `Operator` code is a component for code maintainability

import Operator from "@/administration/app/components/operators/Operator";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Operator />
    </Suspense>
  );
}
