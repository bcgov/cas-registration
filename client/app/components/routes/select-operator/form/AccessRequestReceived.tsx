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

  const adminRequestJSX: JSX.Element = (
    <>
      <p>
        We will review your request as soon as possible. Once approved, you will
        receive a confirmation email.
      </p>
      <p>
        You can then log back in using your Business BCeID with full permissions
        as its administrator.
      </p>
    </>
  );

  const requestSubsequentAccessJSX: JSX.Element = (
    <>
      <p>
        Your access request has been sent to the administrator of{" "}
        <b>{operator.legal_name}</b> for review.
        <br />
        Once approved, you will receive a confirmation email.
      </p>
      <p>
        You can then log back in using your Business BCeID with designated
        permissions.
      </p>
    </>
  );

  return (
    <section className="text-center my-auto text-2xl flex flex-col gap-3">
      <span>
        <AccessTimeIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
      </span>
      {params.step === "add-operator" ? (
        <>
          <p>
            Your request to add operator <b>{operator.legal_name}</b> has been
            received.
          </p>
          {adminRequestJSX}
        </>
      ) : hasAdmin ? (
        requestSubsequentAccessJSX
      ) : (
        <>
          <p>
            Your request to access to operator <b>{operator.legal_name}</b> as
            its administrator has been received.
          </p>
          {adminRequestJSX}
        </>
      )}
    </section>
  );
}
