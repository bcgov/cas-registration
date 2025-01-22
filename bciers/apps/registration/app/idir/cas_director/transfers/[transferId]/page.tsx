import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import TransferPage from "@/registration/app/components/transfers/TransferPage";

export default async function Page({
  params: { transferId },
}: Readonly<{
  params: { transferId: UUID };
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <TransferPage transferId={transferId} />
    </Suspense>
  );
}
