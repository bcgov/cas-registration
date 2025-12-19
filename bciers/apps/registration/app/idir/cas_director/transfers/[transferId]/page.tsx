import { UUID } from "crypto";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import TransferPage from "@/registration/app/components/transfers/TransferPage";

export default async function Page(
  props: Readonly<{
    params: Promise<{ transferId: UUID }>;
  }>,
) {
  const params = await props.params;

  const { transferId } = params;

  return (
    <Suspense fallback={<Loading />}>
      <TransferPage transferId={transferId} />
    </Suspense>
  );
}
