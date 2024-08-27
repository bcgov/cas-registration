import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import SelectOperatorReceivedPage from "@/administration/app/components/userOperators/SelectOperatorReceivedPage";

export default function Page({
  params,
}: {
  readonly params: { id: string; step: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorReceivedPage params={params} />
    </Suspense>
  );
}
