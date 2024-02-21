import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import UserOperator from "@/app/components/routes/select-operator/form/UserOperator";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loading />}>
      <UserOperator params={{ id: params.id, readonly: true }} />
    </Suspense>
  );
}
