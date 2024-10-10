import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import { UUID } from "crypto";

export default async function Page({
  params,
}: {
  params: { version_id: number; facility_id: UUID };
}) {
  return (
    <Suspense fallback={<Loading />}>
      Test Page!! <>{params}</>
    </Suspense>
  );
}
