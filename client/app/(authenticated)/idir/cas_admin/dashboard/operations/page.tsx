// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import OperationsPage from "@/app/components/routes/operations/Page";
import { OperationSearchParams } from "@/app/components/routes/operations/types";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationSearchParams;
}) {
  return <OperationsPage searchParams={searchParams} />;
}
