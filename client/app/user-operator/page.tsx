import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonGrid";
import PageBar from "@/app/components/PageBar";
import UserOperatorForm from "@/app/components/form/UserOperatorForm";
import { userOperatorSchema } from "@/app/utils/jsonSchema/userOperator";

export default async function Page() {
  const pageBarLabel: JSX.Element = (
    <div>
      <small>Select Operator {">"}</small> <b>Request Access</b>
    </div>
  );
  return (
    <>
      <PageBar label={pageBarLabel} />
      <Suspense fallback={<Loading />}>
        <section className="text-center my-10 text-2xl flex flex-col gap-3">
          <UserOperatorForm schema={userOperatorSchema} />
        </section>
      </Suspense>
    </>
  );
}
