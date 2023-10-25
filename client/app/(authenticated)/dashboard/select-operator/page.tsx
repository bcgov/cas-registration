import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import SelectOperator from "@/app/components/routes/select-operator/form/SelectOperator";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperator />
    </Suspense>
  );
}
