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

  return <UserOperatorDataGrid initialData={userOperatorData} />;
}
