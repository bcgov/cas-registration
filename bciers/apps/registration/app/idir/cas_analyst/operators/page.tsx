// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import OperatorsPage from "@/registration/app/components/operators/OperatorsPage";
import { OperatorsSearchParams } from "@bciers/components/userOperators/types";

export default async function Page({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  return <OperatorsPage searchParams={searchParams} />;
}
