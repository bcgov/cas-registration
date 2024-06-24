// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@bciers/components/operations/types";
import OperationsPage from "../components/operations/OperationsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return <OperationsPage searchParams={searchParams} />;
}
