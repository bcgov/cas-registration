import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { notFound } from "next/navigation";
import { Operator } from "../userOperators/types";
import getOperatorHasAdmin from "../operators/getOperatorHasAdmin";
import { UUID } from "crypto";
import getOperatorConfirmationInfo from "../operators/getOperatorConfirmationInfo";
// 🧩 Main component
export default async function SelectOperatorReceivedPage({
  step,
  id,
}: Readonly<{ step: string; id?: UUID }>) {
  if (id) {
    const operator: Operator | { error: string } =
      await getOperatorConfirmationInfo(id, `/select-operator/confirm/${id}`);
    const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(id);

    if (
      "error" in operator ||
      (typeof hasAdmin !== "boolean" && "error" in hasAdmin)
    ) {
      throw new Error("Failed to retrieve operator information.");
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
      <div data-testid="add-operator-message">
        <p>
          Your request to add <b>{operator.legal_name}</b> and become its
          Operation Representative has been received and will be reviewed.
        </p>
        {adminRequestJSX}
      </div>
    );

    const requestSubsequentAccessJSX: JSX.Element = (
      <div data-testid="subsequent-access-request-message">
        <p>
          Your access request has been sent to the Administrator(s) of{" "}
          <b>{operator.legal_name}</b> for review.
        </p>
        <p>Once approved, you will receive an email.</p>
        <p>
          You can then log back in using your Business BCeID with the designated
          access type.
        </p>
      </div>
    );

    let content: JSX.Element | undefined;
    if (step === "add-operator") content = addOperatorJSX;
    else if (hasAdmin) content = requestSubsequentAccessJSX;
    else if (step === "request-access")
      content = (
        <div data-testid="access-request-message">
          <p>
            Your access request for <b>{operator.legal_name}</b> as its
            Operation Representative has been received and will be reviewed.
          </p>

          {adminRequestJSX}
        </div>
      );

    return (
      <section className="text-center my-auto text-2xl flex flex-col gap-3">
        <span>
          <AccessTimeIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
        </span>
        {content}
      </section>
    );
  } else {
    return notFound();
  }
}
