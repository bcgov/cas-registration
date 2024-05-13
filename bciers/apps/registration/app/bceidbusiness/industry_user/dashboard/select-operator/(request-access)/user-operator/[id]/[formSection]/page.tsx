import SelectOperatorRequestAccessReceivedUserOperatorPage from "@/app/components/routes/select-operator/request-access/user-operator/Page";

export default async function Page({
  params,
}: {
  readonly params?: Readonly<{ id: string; formSection: number }>;
}) {
  return (
    <SelectOperatorRequestAccessReceivedUserOperatorPage params={params} />
  );
}
