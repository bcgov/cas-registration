import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import ConfirmSelectedOperator from "@/app/components/routes/select-operator/form/ConfirmSelectedOperator";

export default async function SelectOperatorRequestAccessConfirmPage({
  params,
}: {
  readonly params: { id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmSelectedOperator params={params} />
    </Suspense>
  );
}
