import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

const penaltyTypeMap: Record<string, string> = {
  automatic_overdue: "Automatic Overdue",
  ggeapar: "Late Submission",
};

const normalizeEndDate = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoDateMatch?.[1]) {
    return isoDateMatch[1];
  }

  return undefined;
};

export const getPenaltyAccrualCalculationData = async (
  complianceReportVersionId: number,
  params: {
    [key: string]: any;
  },
): Promise<any> => {
  const { final_day_of_penalty_accrual, penalty_type, ...restParams } = params;

  const mappedPenaltyType = penalty_type
    ? (penaltyTypeMap[penalty_type] ?? penalty_type)
    : undefined;

  const mappedEndDate = normalizeEndDate(final_day_of_penalty_accrual);

  const mappedParams = {
    ...restParams,
    ...(mappedPenaltyType ? { penalty_type: mappedPenaltyType } : {}),
    ...(mappedEndDate ? { end_date: mappedEndDate } : {}),
  };

  const queryParams = buildQueryParams(mappedParams);

  const data = await actionHandler(
    `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/calculate-penalty${queryParams}`,
    "GET",
    "",
  );

  if (!data || data.error) {
    throw new Error(`Failed to fetch penalty accrual data`);
  }

  return data;
};
