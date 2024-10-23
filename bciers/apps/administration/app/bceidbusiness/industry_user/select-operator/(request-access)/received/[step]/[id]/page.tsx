import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import SelectOperatorReceivedPage from "@/administration/app/components/userOperators/SelectOperatorReceivedPage";
import { UUID } from "crypto";

export default function Page({
  params: { step, id },
}: Readonly<{ params: { step: string; id: UUID } }>) {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorReceivedPage step={step} id={id} />
    </Suspense>
  );
}
