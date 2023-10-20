import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import PageBar from "@/app/components/PageBar";
import UserOperator from "@/app/components/routes/select-operator/form/UserOperator";

export default async function Page({ params }: { params: { id: number } }) {
  const pageBarLabel: JSX.Element = (
    <div>
      <small>Select Operator {">"}</small> <b>Request Access</b>
    </div>
  );
  return (
    <>
      <PageBar label={pageBarLabel} />
      <Suspense fallback={<Loading />}>
        <UserOperator params={params} />
      </Suspense>
    </>
  );
}
