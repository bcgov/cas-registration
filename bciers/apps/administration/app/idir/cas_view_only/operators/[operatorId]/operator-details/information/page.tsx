// 🚩 flagging that for shared routes between roles, `OperatorPage` code is a component for code maintainability

import OperatorPage from "@/administration/app/components/operators/OperatorPage";
import { UUID } from "crypto";

export default async function Page(
  props: Readonly<{ params: Promise<{ operatorId: UUID }> }>,
) {
  const params = await props.params;

  const { operatorId } = params;

  return <OperatorPage operatorId={operatorId} />;
}
