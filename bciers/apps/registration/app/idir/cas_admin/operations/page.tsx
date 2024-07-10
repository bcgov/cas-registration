// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/app/components/operations/types";
import OperationsPage, {
  InternalUserLayout,
} from "apps/registration/app/components/operations/Operations";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <>
      <InternalUserLayout />
      <OperationsPage searchParams={searchParams} isInternalUser={true} />
    </>
  );
}
