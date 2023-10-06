import { Suspense } from "react";
import Operation from "@/components/routes/operations/form/Operation";
import Loading from "@/components/loading/SkeletonForm";

export default async function Page() {
  return (
    <>
      <h1>Create a New Operation</h1>
      <Suspense fallback={<Loading />}>
        <Operation />
      </Suspense>
    </>
  );
}
