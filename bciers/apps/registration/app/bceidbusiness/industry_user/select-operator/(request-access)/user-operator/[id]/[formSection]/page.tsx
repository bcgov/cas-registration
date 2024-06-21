import OperationsUserOperatorPage from "@/registration/app/components/operations/select-operator/request-access/user-operator/OperatorUserRequest";

export default async function Page({
  params,
}: {
  readonly params?: Readonly<{ id: string; formSection: number }>;
}) {
  return <OperationsUserOperatorPage params={params} />;
}
