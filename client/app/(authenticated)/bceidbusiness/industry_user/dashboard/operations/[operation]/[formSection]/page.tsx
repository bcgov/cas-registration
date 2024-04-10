// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import Operation from "@/app/components/operations/Operation";

export default function Page({
  params,
}: {
  params: Readonly<{ operation: string }>;
}) {
  return <Operation params={params} />;
}
