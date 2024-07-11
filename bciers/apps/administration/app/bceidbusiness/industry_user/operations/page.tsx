// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability
import { OperationsSearchParams } from "@/app/components/operations/types";
import OperationsPage, {
  ExternalUserOperationsLayout,
} from "@/administration/app/components/operations/Operations";

export default async function Page({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  return (
    <ExternalUserOperationsLayout>
      <OperationsPage searchParams={searchParams} isInternalUser={false} />
    </ExternalUserOperationsLayout>
  );
}
