import { Suspense } from "react";
import Operation from "@/components/routes/operations/form/Operation";
import Loading from "@/components/loading/SkeletonForm";

export default function Page({ params }: { params: { operation: number } }) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Operation numRow={params.operation} />
      </Suspense>
    </>
  );
}
