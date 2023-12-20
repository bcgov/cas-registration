// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import OperationsOperationPage from "@/app/components/routes/operations/operation/Page";

export default function Page({
  params,
}: {
  params: Readonly<{ operation: number }>;
}) {
  return <OperationsOperationPage params={params} />;
}
