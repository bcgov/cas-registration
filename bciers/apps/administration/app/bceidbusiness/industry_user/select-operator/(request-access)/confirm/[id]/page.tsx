import SelectOperatorConfirmPage from "@/administration/app/components/userOperators/SelectOperatorConfirmPage";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
export default function Page({
  params: { id },
}: Readonly<{ params: { id: string } }>) {
  return (
    <Suspense fallback={<Loading />}>
      <SelectOperatorConfirmPage id={id} />
    </Suspense>
  );
}
