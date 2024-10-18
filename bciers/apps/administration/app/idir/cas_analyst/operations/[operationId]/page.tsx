import OperationInformationPage from "@/administration/app/components/operations/OperationInformationPage";
import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params: { operationId },
}: Readonly<{
  params: { operationId: UUID };
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <OperationInformationPage operationId={operationId} />
    </Suspense>
  );
}
