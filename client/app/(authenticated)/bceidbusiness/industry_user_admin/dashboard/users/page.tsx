import { Suspense } from "react";

import Loading from "@/app/components/loading/SkeletonGrid";
import {
  ExternalDashboardUsersTile,
  processExternalDashboardUsersTileData,
} from "@/app/utils/users/adminUserOperators";
import ExternalUserOperatorDataGrid from "@/app/components/userOperators/ExternalUserOperatorDataGrid";

const UserOperatorsPage = async () => {
  const userOperatorData: ExternalDashboardUsersTile[] =
    await processExternalDashboardUsersTileData();
  return (
    <Suspense fallback={<Loading />}>
      <ExternalUserOperatorDataGrid userOperatorData={userOperatorData} />
    </Suspense>
  );
};

export default UserOperatorsPage;
