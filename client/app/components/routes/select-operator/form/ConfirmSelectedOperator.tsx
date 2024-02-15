import { actionHandler } from "@/app/utils/actions";
import { Operator } from "@/app/components/routes/select-operator/form/types";
import ConfirmSelectedOperatorForm from "@/app/components/form/ConfirmSelectedOperatorForm";
import CancelIcon from "@mui/icons-material/Cancel";
import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";

export async function getOperator(id: number) {
  return actionHandler(
    `registration/operators/${id}`,
    "GET",
    `dashboard/select-operator/confirm/${id}`,
  );
}

export async function getOperatorHasAdmin(id: number) {
  return actionHandler(
    `registration/operator-has-admin/${id}`,
    "GET",
    `dashboard/select-operator/confirm/${id}`,
  );
}

export async function getOperatorAccessDeclined(id: number) {
  return actionHandler(
    `registration/operator-access-declined/${id}`,
    "GET",
    `dashboard/select-operator/confirm/${id}`,
  );
}


export default async function ConfirmSelectedOperator({
  params,
}: Readonly<{
  params: { id: number };
}>) {
  const operator: Operator | { error: string } = await getOperator(params.id);
  const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(
    params.id,
  );
  const accessDeclined: boolean | { error: string} = await getOperatorAccessDeclined(params.id);

  if (accessDeclined)
    return (
      <section className="text-center my-auto text-2xl flex flex-col gap-3">
      <span>
        <CancelIcon sx={{ color: "#FF0000", fontSize: 50 }} />
      </span>
      <p>
        Your access request to be the Administrator of{" "}
        <b>{operator.legal_name}</b> was declined.
      </p>
      <p className="text-center">
        If you believe this is an error and you should be granted access, please email us at <br />
        <a
          href="mailto:GHGRegulator@gov.bc.ca"
          className="text-black font-bold no-underline"
        >
          GHGRegulator@gov.bc.ca
        </a>
      </p>
      <span className="text-sm">
              <Link
                href="/dashboard/select-operator"
                className="underline hover:no-underline text-sm"
                style={{ color: BC_GOV_LINKS_COLOR }}
              >
                Return to select operator
              </Link>
            </span>
    </section>
    )

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
