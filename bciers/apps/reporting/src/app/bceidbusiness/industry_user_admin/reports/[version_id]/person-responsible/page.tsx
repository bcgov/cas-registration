import PersonResponsible from "@reporting/src/app/components/operations/personResponsible/PersonResponsible";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  console.log("versionId", params.version_id);
  return (
    <Suspense fallback={<Loading />}>
      <PersonResponsible version_id={params.version_id} />
    </Suspense>
  );
}
