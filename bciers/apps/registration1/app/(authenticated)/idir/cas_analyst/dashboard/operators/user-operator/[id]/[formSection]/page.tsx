import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperator from "@/app/components/userOperators/UserOperator";

export default async function Page({
  params,
}: {
  params: { id: string; readonly: boolean };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={params} />
    </Suspense>
  );
}
