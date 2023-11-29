import { Operator } from "@/app/components/routes/select-operator/form/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getOperator } from "@/app/components/routes/select-operator/form/ConfirmSelectedOperator";

export default async function AccessRequestReceived({
  params,
}: {
  readonly params: { id: number; step: string };
}) {
  const operator: Operator | { error: string } = await getOperator(params.id);

  if ("error" in operator) {
    return <div>Server Error. Please try again later.</div>;
  }

  const requestAccessJSX: JSX.Element = (
    <p>
      Your request to access to operator <b>{operator.legal_name}</b> as its
      administrator has been received.
    </p>
  );

  const addOperatorJSX: JSX.Element = (
    <p>
      Your request to add operator <b>{operator.legal_name}</b> has been
      received.
    </p>
  );

  return (
    <section className="text-center my-auto text-2xl flex flex-col gap-3">
      <span>
        <CheckCircleIcon sx={{ color: "#2E8540", fontSize: 50 }} />
      </span>
      {params.step === "request-access" ? requestAccessJSX : addOperatorJSX}
      <p>
        We will review your request as soon as possible. Once approved, you will
        receive a confirmation email.
      </p>
      <p>
        You can then log back in using your Business BCeID with full permissions
        as its administrator.
      </p>
    </section>
  );
}
