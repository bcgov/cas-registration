import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import AccessRequestReceived from "@/app/components/routes/select-operator/form/AccessRequestReceived";

export default async function SelectOperatorRequestAccessReceivedPage({
  params,
}: {
  readonly params: { id: number; step: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AccessRequestReceived params={params} />
    </Suspense>
  );
}
