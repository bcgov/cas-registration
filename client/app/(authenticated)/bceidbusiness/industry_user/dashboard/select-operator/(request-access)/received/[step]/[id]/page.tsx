import SelectOperatorRequestAccessReceivedPage from "@/app/components/routes/select-operator/request-access/received/Page";

export default async function Page({
  params,
}: {
  readonly params: { id: number; step: string };
}) {
  return <SelectOperatorRequestAccessReceivedPage params={params} />;
}
