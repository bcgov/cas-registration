import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import AccessRequestReceived from "@/app/components/routes/select-operator/form/AccessRequestReceived";

export default async function Page({
  params,
}: {
  params: Readonly<{ id: number }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <AccessRequestReceived params={params} />
    </Suspense>
  );
}
