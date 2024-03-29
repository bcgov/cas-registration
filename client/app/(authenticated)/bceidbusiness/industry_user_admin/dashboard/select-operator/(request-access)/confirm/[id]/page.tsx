import SelectOperatorRequestAccessConfirmPage from "@/app/components/routes/select-operator/request-access/confirm/Page";

export default async function Page({
  params,
}: {
  readonly params: { id: string };
}) {
  return <SelectOperatorRequestAccessConfirmPage params={params} />;
}
