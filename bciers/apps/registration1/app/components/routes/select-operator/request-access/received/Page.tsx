import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import AccessRequestReceived from "@/app/components/userOperators/AccessRequestReceived";

export default async function SelectOperatorRequestAccessReceivedPage({
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
