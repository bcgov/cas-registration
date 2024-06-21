import { Suspense } from "react";

import Loading from "@bciers/components/loading/SkeletonGrid";
import {
  processExternalDashboardUsersTileData,
  UserOperatorDataGridRow,
} from "@bciers/utils/server";
import UserOperatorDataGrid from "@bciers/components/userOperators/UserOperatorDataGrid";

const UserOperatorsPage = async () => {
  const userOperatorData: { rows: UserOperatorDataGridRow[] } =
    await processExternalDashboardUsersTileData();
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorDataGrid initialData={userOperatorData} />
    </Suspense>
  );
};

export default UserOperatorsPage;
