import { Suspense } from "react";

import Loading from "@bciers/components/loading/SkeletonGrid";
import UserOperatorDataGrid from "@/app/components/userOperators/UserOperatorDataGrid";
import {
  UserOperatorDataGridRow,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";

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
