import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import Loading from "@bciers/components/loading/SkeletonForm";
import { Suspense } from "react";
import getOperator from "@/administration/app/components/operators/getOperator";
import { fetchDashboardData } from "@bciers/actions";
import { OperatorRow } from "@/administration/app/components/operators/types";
import { ContentItem } from "@bciers/types/tiles";
import Tiles from "@bciers/components/navigation/Tiles";
import updateDashboardDataHref from "@bciers/utils/src/updateDashboardDataHref";

const OperatorDetailsPage = async ({ operatorId }: { operatorId: UUID }) => {
  let operator: OperatorRow | { error: string };
  let operatorDashboardData: ContentItem[] = [];

  if (operatorId && isValidUUID(operatorId)) {
    operator = await getOperator(operatorId);
    if (operator && "error" in operator)
      throw new Error("Failed to retrieve Operator details");
  } else throw new Error(`Invalid operator id: ${operatorId}`);

  operatorDashboardData = (await fetchDashboardData(
    "common/dashboard-data?dashboard=operators",
  )) as ContentItem[];
  if (!operatorDashboardData || "error" in operatorDashboardData)
    operatorDashboardData = []; //gracefully handle error

  const newOperatorDashboardData = updateDashboardDataHref(
    operatorDashboardData,
    "operator-id",
    () => `${operatorId}/operator-details`,
    () => `?operator_id=${operatorId}`,
  );

  return (
    <Suspense fallback={<Loading />}>
      <h2>{operator.legal_name} Details</h2>
      <Tiles tiles={newOperatorDashboardData} />
    </Suspense>
  );
};

export default OperatorDetailsPage;
