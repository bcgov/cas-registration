import { Suspense } from "react";
import { OperatorsSearchParams } from "@/administration/app/components/operators/types";
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
