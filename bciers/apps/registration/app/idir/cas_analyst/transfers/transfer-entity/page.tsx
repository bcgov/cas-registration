import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import TransferPage from "@/registration/app/components/transfers/TransferPage";

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <TransferPage />
    </Suspense>
  );
}
