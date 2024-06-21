import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperator from "@/registration/app/components/userOperators/UserOperator";

export default async function SelectOperatorRequestAccessReceivedUserOperatorPage({
  params,
}: {
  readonly params?: Readonly<{ id: string; formSection: number }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={params} />
    </Suspense>
  );
}
