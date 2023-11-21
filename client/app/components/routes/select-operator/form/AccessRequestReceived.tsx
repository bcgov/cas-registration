import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import { Operator } from "@/app/components/routes/select-operator/form/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getOperator } from "@/app/components/routes/select-operator/form/ConfirmSelectedOperator";

export default async function AccessRequestReceived({
  params,
}: {
  params: Readonly<{ id: number }>;;
}) {
  const operator: Operator | { error: string } = await getOperator(params.id);

  if ("error" in operator) {
    return <div>Server Error. Please try again later.</div>;
  }

  return (
    <section className="text-center my-auto text-2xl flex flex-col gap-3">
      <span>
        <CheckCircleIcon sx={{ color: "#2E8540", fontSize: 50 }} />
      </span>
      <p>
        Your request to access <b>{operator.legal_name}</b> as its administrator
        has been received.
      </p>
      <p>
        We will review your request as soon as possible. Once approved, you will
        receive a confirmation email.
      </p>
      <p>
        You can then log back in using your Business BCeID with full
        permissions.
      </p>
      <Link
        href="#"
        className="underline hover:no-underline"
        style={{ color: BC_GOV_LINKS_COLOR }}
      >
        Have not received the confirmation email yet?
      </Link>
    </section>
  );
}
