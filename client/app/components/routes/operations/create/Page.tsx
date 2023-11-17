import { Suspense } from "react";
import Operation from "@/app/components/routes/operations/form/Operation";
import Loading from "@/app/components/loading/SkeletonForm";

export default function OperationsCreatePage() {
  return (
    <>
      <h1>Create a New Operation</h1>
      <Suspense fallback={<Loading />}>
        <Operation />
      </Suspense>
    </>
  );
}
