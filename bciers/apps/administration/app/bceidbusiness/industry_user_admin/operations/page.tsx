// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import OperationDataGridPage from "@/administration/app/components/operations/Operations";
import { ExternalUserOperationDataGridLayout } from "@/administration/app/components/operations/OperationLayouts";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <ExternalUserOperationDataGridLayout>
      <OperationDataGridPage searchParams={searchParams} />
    </ExternalUserOperationDataGridLayout>
  );
}
