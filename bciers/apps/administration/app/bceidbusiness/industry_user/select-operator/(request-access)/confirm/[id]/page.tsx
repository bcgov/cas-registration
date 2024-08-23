import ConfirmSelectedOperator from "@/administration/app/components/userOperators/ConfirmSelectedOperator";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
export default async function Page({
  params,
}: {
  readonly params: { id: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmSelectedOperator params={params} />
    </Suspense>
  );
}
