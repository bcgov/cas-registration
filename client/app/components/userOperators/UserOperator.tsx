import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import UserOperator from "@/app/components/routes/select-operator/form/UserOperator";

export default async function SelectOperatorRequestAccessReceivedUserOperatorPage({
  params,
}: {
  readonly params?: Readonly<{ id: string; formSection: number }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorDetail params={params} />
    </Suspense>
  );
}
