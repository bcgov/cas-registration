import SelectOperatorRequestAccessConfirmPage from "@/app/components/routes/select-operator/request-access/confirm/Page";

export default async function Page({
  params,
}: {
  params: Readonly<{ id: number }>;
}) {
  return <SelectOperatorRequestAccessConfirmPage params={params} />;
}
