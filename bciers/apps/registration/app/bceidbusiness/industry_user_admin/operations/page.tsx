// 🚩 flagging that for shared routes between roles, "*Page" code is a shared component for code maintainability
import { OperationsSearchParams } from "@bciers/components/operations/types";
import OperationsPage from "@/registration/app/components/operations/OperationsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return <OperationsPage searchParams={searchParams} />;
}
