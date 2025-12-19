import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import SelectOperatorReceivedPage from "@/administration/app/components/userOperators/SelectOperatorReceivedPage";
import { UUID } from "crypto";

export default async function Page(
  props: Readonly<{ params: Promise<{ step: string; id: UUID }> }>,
) {
  const params = await props.params;

  const { step, id } = params;

  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorReceivedPage step={step} id={id} />
    </Suspense>
  );
}
