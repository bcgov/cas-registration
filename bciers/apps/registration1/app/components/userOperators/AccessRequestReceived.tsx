import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { actionHandler } from "@bciers/actions";
import { Operator } from "./types";
import { getOperator } from "./ConfirmSelectedOperator";

export async function getOperatorHasAdmin(id: string) {
  return actionHandler(
    `registration/v1/operators/${id}/has-admin`,
    "GET",
    `dashboard/select-operator/confirm/${id}`,
  );
}

export default async function AccessRequestReceived({
  params,
}: {
  readonly params: { id: string; step: string };
}) {
  const operatorId: string = params.id;
  const step: string = params.step;

  const operator: Operator | { error: string } = await getOperator(operatorId);
  const hasAdmin: boolean | { error: string } =
    await getOperatorHasAdmin(operatorId);

  if ("error" in operator) {
    return <div>Server Error. Please try again later.</div>;
  }

  const adminRequestJSX: JSX.Element = (
    <>
      <p>Once approved, you will receive an email.</p>
      <p>
        You can then log back in using your Business BCeID with Administrator
        access.
      </p>
    </>
  );

  const addOperatorJSX: JSX.Element = (
    <>
      <p>
        Your request to add <b>{operator.legal_name}</b> and become its
        Operation Representative has been received and will be reviewed.
      </p>
      {adminRequestJSX}
    </>
  );

  const requestSubsequentAccessJSX: JSX.Element = (
    <>
      <p>
        Your access request has been sent to the Administrator(s) of{" "}
        <b>{operator.legal_name}</b> for review.
      </p>
      <p>Once approved, you will receive an email.</p>
      <p>
        You can then log back in using your Business BCeID with the designated
        access type.
      </p>
    </>
  );

  let content: JSX.Element | undefined;
  if (step === "add-operator") content = addOperatorJSX;
  else if (hasAdmin) content = requestSubsequentAccessJSX;
  else if (step === "request-access")
    content = (
      <>
        <p>
          Your access request for <b>{operator.legal_name}</b> as its Operation
          Representative has been received and will be reviewed.
        </p>

        {adminRequestJSX}
      </>
    );

  return (
    <section className="text-center my-auto text-2xl flex flex-col gap-3">
      <span>
        <AccessTimeIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
      </span>
      {content}
    </section>
  );
}
