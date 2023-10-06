import { Suspense } from "react";
import Operation from "@/components/routes/operations/form/Operation";
import Loading from "@/components/loading/SkeletonForm";

export default async function Page({
  params,
}: {
  params: { operation: number };
}) {
  return (
    <>
      <h1>Edit an Operation</h1>
      <Suspense fallback={<Loading />}>
        <Operation numRow={params.operation} />
      </Suspense>
    </>
  );
}
