import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformation from "@reporting/src/app/components/additionalInformation/newEntrantInformation/NewEntrantInformation";
interface PageProps {
  params: { version_id: number };
}

export default async function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformation versionId={params.version_id} />
    </Suspense>
  );
}
