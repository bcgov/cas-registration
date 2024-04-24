import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonForm";
import Operation from "@/app/components/operations/Operation";

export default async function OperationsOperationPage({
  params,
}: {
  params: { operation: string };
}) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Operation numRow={params.operation} />
      </Suspense>
    </>
  );
}
