import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperator from "@/administration/app/components/userOperators/UserOperator";
import { UUID } from "crypto";

export default async function Page(props: {
  params: Promise<{ userOperatorId: UUID; readonly: boolean }>;
}) {
  const params = await props.params;
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={params} />
    </Suspense>
  );
}
