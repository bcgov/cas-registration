// 🚩 flagging that for shared routes between roles, "*Page" code is a shared component for code maintainability
import OperatorRequestReceivedPage from "@/registration/app/components/operations/select-operator/request-access/received/OperatorRequestReceivedPage";

export default async function Page({
  params,
}: {
  readonly params: { id: string; step: string };
}) {
  return <OperatorRequestReceivedPage params={params} />;
}
