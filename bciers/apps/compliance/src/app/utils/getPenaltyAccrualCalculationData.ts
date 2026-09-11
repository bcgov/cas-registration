import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { CalculatedPenalty, PenaltyType } from "@/compliance/src/app/types";

export const getPenaltyAccrualCalculationData = async (
  complianceReportVersionId: number,
  params: { requested_penalty_type: PenaltyType; end_date: string },
): Promise<CalculatedPenalty> => {
  const queryParams = buildQueryParams({
    requested_penalty_type: encodeURIComponent(params.requested_penalty_type),
    end_date: params.end_date,
  });

  return actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/calculate-penalty${queryParams}`,
    "GET",
    "",
  );
};
