import { Suspense } from "react";
import Operation from "@/app/components/routes/operations/form/Operation";
import Loading from "@/app/components/loading/SkeletonForm";
import { redirectIfOperatorStatusUnauthorized } from "@/app/components/auth/helpers";

export default async function OperationsOperationPage({
  params,
}: {
  params: { operation: number };
}) {
  await redirectIfOperatorStatusUnauthorized();
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Operation numRow={params.operation} />
      </Suspense>
    </>
  );
}
