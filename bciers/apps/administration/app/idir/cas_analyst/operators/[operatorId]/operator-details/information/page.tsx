// 🚩 flagging that for shared routes between roles, `OperatorPage` code is a component for code maintainability

import OperatorPage from "@/administration/app/components/operators/OperatorPage";
import { UUID } from "crypto";

export default async function Page({
  params: { operatorId },
}: Readonly<{ params: { operatorId: UUID } }>) {
  return <OperatorPage operatorId={operatorId} />;
}
