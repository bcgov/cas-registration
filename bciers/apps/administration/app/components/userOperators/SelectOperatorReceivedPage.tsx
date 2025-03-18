import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { notFound } from "next/navigation";
import getOperatorHasAdmin from "@/administration/app/components/operators/getOperatorHasAdmin";
import { UUID } from "crypto";
import getOperatorConfirmationInfo from "@/administration/app/components/operators/getOperatorConfirmationInfo";
import CancelAccessRequest from "@/administration/app/components/buttons/CancelAccessRequest";
import getCurrentUserOperator from "@/administration/app/components/userOperators/getCurrentUserOperator";

// 🧩 Main component
export default async function SelectOperatorReceivedPage({
  step,
  id,
}: Readonly<{ step: string; id?: UUID }>) {
  if (id) {
    const operator = await getOperatorConfirmationInfo(
      id,
      `/select-operator/confirm/${id}`,
    );
    const hasAdmin = await getOperatorHasAdmin(id);
    if (
      "error" in operator ||
      (typeof hasAdmin !== "boolean" && "error" in hasAdmin)
    ) {
      throw new Error("Failed to retrieve operator information.");
    }

    const currentUserOperator = await getCurrentUserOperator();
    if (currentUserOperator && "error" in currentUserOperator)
      throw new Error("Failed to retrieve current user operator information.");

    const adminRequestJSX: JSX.Element = (
      <div data-testid="access-request-message">
        <div style={{ fontSize: "16px" }}>
          <p>
            Your access request as administrator for{" "}
            <b>{operator.legal_name}</b> has been received by ministry staff and
            will be reviewed shortly.
          </p>
          <p>
            Once approved, you will receive a confirmation email. You can then
            log back in using your Business BCeID.
          </p>
        </div>
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
    if (hasAdmin) content = requestSubsequentAccessJSX;
    else if (step === "request-access") content = adminRequestJSX;

    return (
      <section className="text-center my-auto text-2xl flex flex-col gap-3">
        <span>
          <AccessTimeFilledIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
        </span>
        {content}
        {content && (
          <CancelAccessRequest userOperatorId={currentUserOperator.id} />
        )}
      </section>
    );
  } else {
    return notFound();
  }
}
