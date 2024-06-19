// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/app/components/operations/types";
import OperationsPage from "apps/registration/app/components/operations/OperationsPage";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return <OperationsPage searchParams={searchParams} />;
}
