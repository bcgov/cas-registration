import SelectOperatorRequestAccessConfirmPage from "@/registration/app/components/operations/select-operator/request-access/confirm/OperatorRequestConfirm";
export default async function Page({
  params,
}: {
  readonly params: { id: string };
}) {
  return <SelectOperatorRequestAccessConfirmPage params={params} />;
}
