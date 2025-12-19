import SelectOperatorConfirmPage from "@/administration/app/components/userOperators/SelectOperatorConfirmPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";
export default async function Page(
  props: Readonly<{ params: Promise<{ id: UUID }> }>,
) {
  const params = await props.params;

  const { id } = params;

  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorConfirmPage id={id} />
    </Suspense>
  );
}
