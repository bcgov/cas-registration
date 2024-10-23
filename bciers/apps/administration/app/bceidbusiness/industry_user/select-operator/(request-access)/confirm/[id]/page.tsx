import SelectOperatorConfirmPage from "@/administration/app/components/userOperators/SelectOperatorConfirmPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";
export default function Page({
  params: { id },
}: Readonly<{ params: { id: UUID } }>) {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorConfirmPage id={id} />
    </Suspense>
  );
}
