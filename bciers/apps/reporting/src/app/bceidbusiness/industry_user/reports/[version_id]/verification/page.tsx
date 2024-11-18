import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import VerificationPage from "@reporting/src/app/components/signOff/verification/VerificationPage";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <VerificationPage versionId={params.version_id} />
    </Suspense>
  );
}
