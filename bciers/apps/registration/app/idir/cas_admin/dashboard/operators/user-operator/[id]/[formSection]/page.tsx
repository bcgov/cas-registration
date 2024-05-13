import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperator from "@/app/components/userOperators/UserOperator";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={{ id: params.id, readonly: true }} />
    </Suspense>
  );
}
