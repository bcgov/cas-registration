import OperationReviewFormData from "../../../../../components/operations/OperationReviewFormData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <OperationReviewFormData version_id={params.version_id} />
    </Suspense>
  );
}
