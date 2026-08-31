import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

const penaltyTypeMap: Record<string, string> = {
  automatic_overdue: "Automatic Overdue",
  ggeapar: "Late Submission",
  late_submission: "Late Submission",
  "late-submission": "Late Submission",
  latesubmission: "Late Submission",
  automaticoverdue: "Automatic Overdue",
  "automatic overdue": "Automatic Overdue",
  "late submission": "Late Submission",
};

const mapPenaltyTypeForApi = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return penaltyTypeMap[normalized] ?? value;
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

  const mappedPenaltyType = mapPenaltyTypeForApi(penalty_type);

  const mappedEndDate = normalizeEndDate(final_day_of_penalty_accrual);

  const mappedParams = {
    ...restParams,
    ...(mappedPenaltyType
      ? { requested_penalty_type: encodeURIComponent(mappedPenaltyType) }
      : {}),
    ...(mappedEndDate ? { end_date: mappedEndDate } : {}),
  };

  const queryParams = buildQueryParams(mappedParams);

  let data;
  try {
    data = await actionHandler(
      `compliance/compliance-report-versions/${complianceReportVersionId}/obligation/calculate-penalty${queryParams}`,
      "GET",
      "",
    );
  } catch (err: any) {
    return { error: err?.message ?? "Failed to fetch penalty accrual data" };
  }

  if (!data || data.error) {
    return { error: data?.error ?? "Failed to fetch penalty accrual data" };
  }

  return data;
};
