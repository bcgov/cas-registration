import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import AccessRequestReceived from "@bciers/components/userOperators/AccessRequestReceived";

export default async function OperatorRequestReceivedPage({
  params,
}: {
  readonly params: { id: string; step: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AccessRequestReceived params={params} />
    </Suspense>
  );
}