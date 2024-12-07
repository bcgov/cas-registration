import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperator from "@/administration/app/components/userOperators/UserOperator";

export default async function Page({
  params,
}: {
  params: { id: string; readonly: boolean };
}) {
  return (
    <Suspense fallback={<Loading />}>
      am i her
      <UserOperator params={params} />
    </Suspense>
  );
}
