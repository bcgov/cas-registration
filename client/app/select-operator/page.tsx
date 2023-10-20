import { Suspense } from "react";
import Loading from "@/components/loading/SkeletonGrid";
import PageBar from "@/app/components/PageBar";
import SelectOperator from "@/app/components/routes/select-operator/form/SelectOperator";

export default async function Page() {
  const pageBarLabel: JSX.Element = <div>Select Operator</div>;
  return (
    <>
      <PageBar label={pageBarLabel} />
      <Suspense fallback={<Loading />}>
        <SelectOperator />
      </Suspense>
    </>
  );
}
