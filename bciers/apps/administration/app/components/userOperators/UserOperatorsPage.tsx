import Note from "@bciers/components/layout/Note";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import {
  UserOperatorDataGridRow,
  UserOperatorsSearchParams,
} from "@/administration/app/components/userOperators/types";
import getUserOperatorsPageData from "@/administration/app/components/userOperators/getUserOperatorsPageData";
import UserOperatorDataGrid from "@/administration/app/components/userOperators/UserOperatorDataGrid";

export default async function UserOperatorsPage({
  searchParams,
}: {
  searchParams: UserOperatorsSearchParams;
}) {
  const userOperatorData:
    | { rows: UserOperatorDataGridRow[]; row_count: number }
    | { error: string } = await getUserOperatorsPageData(searchParams);

  if (!userOperatorData || "error" in userOperatorData)
    throw new Error("Failed to retrieve admin requests.");

  return (
    <>
      <Note>
        <b>Note: </b>Once &quot;Approved&quot;, the user will have access to
        their operator dashboard with full admin permissions,and can grant
        access and designate permissions to other authorized users there.
      </Note>
      <Suspense fallback={<Loading />}>
        <UserOperatorDataGrid initialData={userOperatorData} />
      </Suspense>
    </>
  );
}
