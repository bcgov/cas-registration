import { Suspense } from "react";
import Loading from "@/app/components/loading/SkeletonField";
import SelectOperator from "@/app/components/routes/select-operator/form/SelectOperator";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function SelectOperatorPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name?.split(' ')?.[0];
  return (
    <>
      <section className="text-center my-auto text-2xl flex flex-col gap-3">
        {/* Streaming to render UI parts in a client incrementally, as soon as possible */}
        <p>
          Hi <b>{userName}</b>
        </p>
        <p>Which operator would you like to log in to?</p>
        <p>
          Please search by the business name or the Canada Revenue Agency (CRA)
          Business Number below.
        </p>
      </section>
      <section className="text-center text-2xl flex flex-col">
        {/* slow-loading components (data-fetching) can be wrapped using the <Suspense/> component boundary until they’ve been rendered on the server */}
        <Suspense fallback={<Loading />}>
          <SelectOperator />
        </Suspense>
        <p>
          Don&apos;t see the operator?{" "}
          <Link
            href="/dashboard/select-operator/user-operator/create/1"
            className="underline hover:no-underline mr-2"
            style={{ color: BC_GOV_LINKS_COLOR }}
          >
            Add Operator
          </Link>
          instead
        </p>
      </section>
    </>
  );
}
