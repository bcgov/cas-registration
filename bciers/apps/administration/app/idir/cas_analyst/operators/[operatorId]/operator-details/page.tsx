import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import OperatorDetailsPage from "@/administration/app/components/operators/OperatorDetailsPage";

export default async function Page({
  params: { operatorId },
}: Readonly<{
  params: { operatorId: UUID };
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <OperatorDetailsPage operatorId={operatorId} />
    </Suspense>
  );
}
