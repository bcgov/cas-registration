// 🚩 flagging that for shared routes between roles, "*Page" code is a shared component for code maintainability
import OperationsOperationPage from "@/registration/app/components/operations/OperationsOperationPage";

export default function Page({
  params,
}: {
  params: Readonly<{ operation: string }>;
}) {
  return <OperationsOperationPage params={params} />;
}
