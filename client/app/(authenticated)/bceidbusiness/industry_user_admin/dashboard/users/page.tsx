import { Suspense } from "react";

import Loading from "@/app/components/loading/SkeletonGrid";
import {
  ExternalDashboardUsersTile,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";
import UserOperatorDataGrid from "@/app/components/datagrid/ExternalUserOperatorDataGrid";

const UserOperatorsPage = async () => {
  const userOperatorData: ExternalDashboardUsersTile[] =
    await processExternalDashboardUsersTileData();
  return (
    <Suspense fallback={<Loading />}>
      <UserOperatorDataGrid userOperatorData={userOperatorData} />
    </Suspense>
  );
};

export default UserOperatorsPage;
