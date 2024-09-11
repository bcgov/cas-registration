// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperatorsSearchParams } from "@/administration/app/components/operators/types";
import OperatorDataGridPage from "@/administration/app/components/operators/OperatorDataGridPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  return <OperatorDataGridPage searchParams={searchParams} />;
}
