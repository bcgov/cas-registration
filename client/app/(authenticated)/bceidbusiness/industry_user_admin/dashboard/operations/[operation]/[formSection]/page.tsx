// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import OperationsOperationPage from "@/app/components/routes/operations/operation/OperationsOperationPage";

export default function Page({
  params,
}: {
  params: Readonly<{ operation: string }>;
}) {
  return <OperationsOperationPage params={params} />;
}
