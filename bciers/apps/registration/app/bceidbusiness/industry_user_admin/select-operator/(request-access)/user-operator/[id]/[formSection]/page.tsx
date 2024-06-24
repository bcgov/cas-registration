// 🚩 flagging that for shared routes between roles, "*Page" code is a shared component for code maintainability
import OperatorUserRequestPage from "@/registration/app/components/operations/select-operator/request-access/user-operator/OperatorUserRequestPage";

export default async function Page({
  params,
}: {
  readonly params?: Readonly<{ id: string; formSection: number }>;
}) {
  return <OperatorUserRequestPage params={params} />;
}
