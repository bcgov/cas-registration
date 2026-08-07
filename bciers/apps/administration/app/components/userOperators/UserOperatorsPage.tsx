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
  const userOperatorData: {
    rows: UserOperatorDataGridRow[];
    row_count: number;
  } = await getUserOperatorsPageData(searchParams);

  return <UserOperatorDataGrid initialData={userOperatorData} />;
}
