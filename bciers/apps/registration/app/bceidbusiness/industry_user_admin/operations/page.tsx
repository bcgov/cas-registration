// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/app/components/operations/types";
import OperationsPage, {
  ExternalUserLayout,
} from "apps/registration/app/components/operations/Operations";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <>
      <ExternalUserLayout />
      <OperationsPage searchParams={searchParams} isInternalUser={false} />
    </>
  );
}
