import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonField";
import SelectOperator from "@/app/components/routes/select-operator/form/SelectOperator";

export default function Page() {
  return (
    <>
      <section className="text-center my-auto text-2xl flex flex-col gap-3">
        {/* Streaming to render UI parts in a client incrementally, as soon as possible */}
        <p>
          Hi <b>John!</b> {/* TODO: replace with user name */}
        </p>
        <p>Which operator would you like to log in to?</p>
        <p>
          Please search by the business name or the Canada Revenue Agency (CRA)
          Business Number below.
        </p>
      </section>
      {/* slow-loading components (data-fetching) can be wrapped using the <Suspense/> component boundary until they’ve been rendered on the server */}
      <Suspense fallback={<Loading />}>
        <SelectOperator />
      </Suspense>
    </>
  );
}
