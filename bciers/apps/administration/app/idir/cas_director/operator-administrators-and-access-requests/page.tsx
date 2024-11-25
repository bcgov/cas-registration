import { Suspense } from "react";
import { OperatorsSearchParams } from "@/app/components/userOperators/types";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperatorsPage from "@/administration/app/components/userOperators/UserOperatorsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorsPage searchParams={searchParams} />
    </Suspense>
  );
}
