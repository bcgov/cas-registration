// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import OperationPage from "@/administration/app/components/operations/OperationPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return <OperationPage searchParams={searchParams} />;
}
