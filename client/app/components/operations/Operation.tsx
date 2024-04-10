import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonForm";
import OperationDetail from "./OperationDetail";

export default async function Operation({
  params,
}: {
  params: { operation: string };
}) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <OperationDetail numRow={params.operation} />
      </Suspense>
    </>
  );
}
