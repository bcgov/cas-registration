import SelectOperatorRequestAccessReceivedPage from "@/app/components/routes/select-operator/request-access/received/Page";

export default async function Page({
  params,
}: {
  params: Readonly<{ id: number }>;
}) {
  return <SelectOperatorRequestAccessReceivedPage params={params} />;
}
