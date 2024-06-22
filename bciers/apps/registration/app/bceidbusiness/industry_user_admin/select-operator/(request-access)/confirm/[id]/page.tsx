// 🚩 flagging that for shared routes between roles, "*Page" code is a shared component for code maintainability
import OperatorRequestConfirmPage from "@/registration/app/components/operations/select-operator/request-access/confirm/OperatorRequestConfirmPage";

export default async function Page({
  params,
}: {
  readonly params: { id: string };
}) {
  return <OperatorRequestConfirmPage params={params} />;
}
