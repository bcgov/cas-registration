import { Suspense } from "react";

import UserOperatorDataGrid from "@/app/components/datagrid/UserOperatorDataGrid";
import Loading from "@/app/components/loading/SkeletonGrid";
import {
  ExternalDashboardUsersTile,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";

const UserOperatorsPage = async () => {
  const userOperatorData: { rows: ExternalDashboardUsersTile[] } =
    await processExternalDashboardUsersTileData();
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorDataGrid initialData={userOperatorData} />
    </Suspense>
  );
};

export default UserOperatorsPage;
