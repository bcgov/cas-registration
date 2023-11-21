import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import UserOperator from "@/app/components/routes/select-operator/form/UserOperator";

export default async function SelectOperatorRequestAccessReceivedUserOperatorPage({
  params,
}: {
  params: Readonly<{ id: number }>;;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={params} />
    </Suspense>
  );
}
