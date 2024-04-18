import { Suspense } from "react";
import Operation from "@/app/components/routes/operations/form/Operation";
import Loading from "@/app/components/loading/SkeletonForm";

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
