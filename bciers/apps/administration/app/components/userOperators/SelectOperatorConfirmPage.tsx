import CancelIcon from "@mui/icons-material/Cancel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import { Operator } from "../userOperators/types";
import SelectOperatorConfirmForm from "./SelectOperatorConfirmForm";
import getOperatorHasAdmin from "../operators/getOperatorHasAdmin";
import getOperatorAccessDeclined from "../operators/getOperatorAccessDeclined";
import { UUID } from "crypto";
import getOperatorConfirmationInfo from "../operators/getOperatorConfirmationInfo";
// 🧩 Main component
export default async function SelectOperatorConfirmPage({
  id,
}: Readonly<{ id?: UUID }>) {
  if (id) {
    const operator: Operator | { error: string } =
      await getOperatorConfirmationInfo(id, `/select-operator/confirm/${id}`);
    const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(id);
    const accessDeclined: boolean | { error: string } =
      await getOperatorAccessDeclined(id);

    if (accessDeclined) {
      const declinedHasAdminJSX: JSX.Element = (
        <div data-testid="access-declined-admin-message">
          <p>
            Your access request was declined by an Administrator of{" "}
            <b>{(operator as Operator).legal_name}</b>
          </p>
          <p className="text-center">
            If you believe this is an error and you should be granted access,
            please contact the administrator of{" "}
            <b>{(operator as Operator).legal_name}</b>
          </p>
        </div>
      );

      const declinedNoAdminJSX: JSX.Element = (
        <div data-testid="access-declined-no-admin-message">
          <p>
            Your administrator access request for{" "}
            <b>{(operator as Operator).legal_name}</b> was declined.
          </p>
          <p className="text-center">
            If you believe this is an error and you should be granted access,
            please email us at <br />
            <a
              href="mailto:GHGRegulator@gov.bc.ca"
              className="text-black font-bold no-underline"
            >
              GHGRegulator@gov.bc.ca
            </a>
          </p>
        </div>
      );
      return (
        <section className="text-center my-auto text-2xl flex flex-col gap-3">
          <span>
            <CancelIcon sx={{ color: "#FF0000", fontSize: 50 }} />
          </span>
          {hasAdmin ? declinedHasAdminJSX : declinedNoAdminJSX}
          <span className="text-sm">
            <Link
              href="/select-operator"
              className="underline hover:no-underline text-sm"
              style={{ color: BC_GOV_LINKS_COLOR }}
            >
              Select another operator
            </Link>
          </span>
        </section>
      );
    }

    if (
      "error" in operator ||
      (typeof hasAdmin !== "boolean" && "error" in hasAdmin)
    ) {
      throw new Error("Failed to retrieve operator information.");
    }

    return (
      <SelectOperatorConfirmForm hasAdmin={hasAdmin} operator={operator} />
    );
  } else {
    return notFound();
  }
}
