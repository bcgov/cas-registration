import { Operator } from "@/app/components/routes/select-operator/form/types";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getOperator } from "@/app/components/routes/select-operator/form/ConfirmSelectedOperator";
import { actionHandler } from "@/app/utils/actions";

export async function getOperatorHasAdmin(id: number) {
  return actionHandler(
    `registration/operator-has-admin/${id}`,
    "GET",
    `dashboard/select-operator/confirm/${id}`,
  );
}

export default async function AccessRequestReceived({
  params,
}: {
  readonly params: { id: number; step: string };
}) {
  const operator: Operator | { error: string } = await getOperator(params.id);
  const hasAdmin: Boolean | { error: string } = await getOperatorHasAdmin(
    params.id,
  );

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
        <AccessTimeIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
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
      {hasAdmin ? (
        <>
          <p>
            Your access request for <b>{operator.legal_name}</b> is currently
            being reviewed.
            <br />
            Once approved, you will receive a confirmation email.
          </p>
          <p>
            You can then log back in using your Business BCeID with designated
            permissions.
          </p>
        </>
      ) : (
        <>
          <p>
            Your request to access <b>{operator.legal_name}</b> as its
            administrator has been received.
          </p>
          <p>
            We will review your request as soon as possible. Once approved, you
            will receive a confirmation email.
          </p>
          <p>
            You can then log back in using your Business BCeID with full
            permissions.
          </p>
        </>
      )}
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
