import Loading from "@/app/components/loading";
import { Suspense } from "react";
import PageBar from "@/app/components/PageBar";

export default async function Page() {
  const pageBarLabel: JSX.Element = (
    <div>
      <small>Select Operator</small> {">"} <b>Request Access</b>
    </div>
  );
  return (
    <>
      <PageBar label={pageBarLabel} />
      <Suspense fallback={<Loading />}>
        <section className="text-center my-60 text-2xl flex flex-col gap-3">
          USER-OPERATOR-FORM
        </section>
      </Suspense>
    </>
  );
}
