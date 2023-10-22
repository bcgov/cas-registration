import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import { fetchAPI } from "@/app/utils/api";
import { Operator } from "@/app/components/routes/select-operator/form/types";
import ConfirmSelectedOperatorForm from "@/app/components/form/ConfirmSelectedOperatorForm";
// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

export async function getOperator(id: number) {
  return fetchAPI(`registration/operators/${id}`);
}

export default async function ConfirmSelectedOperator({
  params,
}: {
  params: { id: number };
}) {
  const operator: Operator | { error: string } = await getOperator(params.id);

  if ("error" in operator) {
    return <div>Server Error. Please try again later.</div>;
  }

  return (
    <section className="text-center my-60 text-2xl flex flex-col gap-3">
      <p>
        Hi <b>John!</b> {/* TODO: replace with user name */}
      </p>
      <p>
        Looks like the operator <b>{operator.legal_name}</b> doesn&apos;t have
        an Administrator.
      </p>
      <p>
        Confirm below if you would like to request access to it as its
        Administrator.
      </p>
      <p>Please contact the operator directly if not sure.</p>
      <ConfirmSelectedOperatorForm operator_id={operator.id} />
      <Link
        href="/select-operator"
        className="underline hover:no-underline"
        style={{ color: BC_GOV_LINKS_COLOR }}
      >
        Go Back
      </Link>
    </section>
  );
}
