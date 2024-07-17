// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/app/components/operations/types";
import OperationDataGridPage from "@/administration/app/components/operations/OperationDataGridPage";
import { InternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <InternalUserOperationDataGridLayout>
      <OperationDataGridPage searchParams={searchParams} />
    </InternalUserOperationDataGridLayout>
  );
}
