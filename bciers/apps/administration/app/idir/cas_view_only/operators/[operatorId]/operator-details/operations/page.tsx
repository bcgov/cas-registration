// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/administration/app/components/operations/types";
import OperationsPage from "@/administration/app/components/operations/OperationsPage";

export default async function Page(props: {
  searchParams: Promise<OperationsSearchParams>;
}) {
  const searchParams = await props.searchParams;
  return <OperationsPage searchParams={searchParams} />;
}
