import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import ConfirmSelectedOperator from "@/app/components/userOperators/ConfirmSelectedOperator";

export default async function SelectOperatorRequestAccessConfirmPage({
  params,
}: {
  readonly params: { id: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmSelectedOperator params={params} />
    </Suspense>
  );
}
