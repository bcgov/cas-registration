import { Suspense } from "react";
import Operation from "@/app/components/routes/operations/form/Operation";
import Loading from "@/app/components/loading/SkeletonForm";

export default async function OperationsCreatePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Operation />
    </Suspense>
  );
}
