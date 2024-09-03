import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import SelectOperatorReceivedPage from "@/administration/app/components/userOperators/SelectOperatorReceivedPage";

export default function Page({
  params: { step, id },
}: Readonly<{ params: { step: string; id: string } }>) {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorReceivedPage step={step} id={id} />
    </Suspense>
  );
}
