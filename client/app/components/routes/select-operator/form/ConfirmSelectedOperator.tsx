import { actionHandler } from "@/app/utils/actions";
import { Operator } from "@/app/components/routes/select-operator/form/types";
import ConfirmSelectedOperatorForm from "@/app/components/form/ConfirmSelectedOperatorForm";

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

export default async function ConfirmSelectedOperator({
  params,
}: Readonly<{
  params: { id: number };
}>) {
  const operator: Operator | { error: string } = await getOperator(params.id);
  const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(
    params.id,
  );

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
