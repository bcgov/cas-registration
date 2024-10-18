// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import { InternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";
import OperationsPage from "@/administration/app/components/operations/OperationsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <InternalUserOperationDataGridLayout>
      <OperationsPage searchParams={searchParams} />
    </InternalUserOperationDataGridLayout>
  );
}
