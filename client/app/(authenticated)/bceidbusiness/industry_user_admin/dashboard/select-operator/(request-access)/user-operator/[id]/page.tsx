import SelectOperatorRequestAccessReceivedUserOperatorPage from "@/app/components/routes/select-operator/request-access/user-operator/Page";

export default async function Page({
  params,
}: {
  params: Readonly<{ id: number }>;
}) {
  return (
    <SelectOperatorRequestAccessReceivedUserOperatorPage params={params} />
  );
}
