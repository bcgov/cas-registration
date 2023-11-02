import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import AddOperator from "@/app/components/routes/select-operator/form/AddOperator";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AddOperator />
    </Suspense>
  );
}
