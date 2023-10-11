import Loading from "@/app/components/loading";
import { Suspense } from "react";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import Link from "next/link";
import PageBar from "@/app/components/PageBar";
import AccessRequestForm from "@/app/components/form/AccessRequestForm";
import { Operator } from "@/app/select-operator/page";

export const runtime = "edge";
export async function getOperator(id: number) {
  try {
    const operator = await fetch(
      `${process.env.API_URL}registration/operators/${id}`,
      {
        cache: "no-store",
      },
    );
    return await operator.json();
  } catch (e) {
    return null;
  }
}

export default async function Page({ params }: { params: { id: number } }) {
  const operator: Operator = await getOperator(params.id);

  if (!operator) {
    return <div>Server Error. Please try again later.</div>;
  }

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
          <p>
            Hi <b>John!</b> {/* TODO: replace with user name */}
          </p>
          <p>
            Looks like the operator <b>{operator.legal_name}</b> doesn&apos;t
            have an Administrator.
          </p>
          <p>
            Confirm below if you would like to request access to it as its
            Administrator.
          </p>
          <p>Please contact the operator directly if not sure.</p>
          <AccessRequestForm operator_id={operator.id} />
          <Link
            href="/select-operator"
            className="underline hover:no-underline"
            style={{ color: BC_GOV_LINKS_COLOR }}
          >
            Go Back
          </Link>
        </section>
      </Suspense>
    </>
  );
}
