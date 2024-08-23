import CancelIcon from "@mui/icons-material/Cancel";
import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import { Operator } from "./types";
import ConfirmSelectedOperatorForm from "./ConfirmSelectedOperatorForm";

import getOperator from "@/administration/app/components/operators/getOperator";

import getOperatorHasAdmin from "@/administration/app/components/operators/getOperatorHasAdmin";
import getOperatorAccessDeclined from "@/administration/app/components/operators/getOperatorAccessDeclined";

export default async function ConfirmSelectedOperator({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const operator: Operator | { error: string } = await getOperator(params.id);
  const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(
    params.id,
  );
  const accessDeclined: boolean | { error: string } =
    await getOperatorAccessDeclined(params.id);

  if (accessDeclined) {
    const declinedHasAdminJSX: JSX.Element = (
      <>
        <p>
          Your access request was declined by an Administrator of{" "}
          <b>{(operator as Operator).legal_name}</b>
        </p>
        <p className="text-center">
          If you believe this is an error and you should be granted access,
          please contact the administrator of{" "}
          <b>{(operator as Operator).legal_name}</b>
        </p>
      </>
    );

    const declinedNoAdminJSX: JSX.Element = (
      <>
        <p>
          Your Administrator access request to be the Operation Representative
          of <b>{(operator as Operator).legal_name}</b> was declined.
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
      </>
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
    return <div>Server Error. Please try again later.</div>;
  }

  return (
    <ConfirmSelectedOperatorForm hasAdmin={hasAdmin} operator={operator} />
  );
}
