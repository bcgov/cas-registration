import { ComplianceSummary } from "./types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const fetchComplianceSummariesPageData = async (params: {
  [key: string]: any;
}): Promise<{
  rows: ComplianceSummary[];
  row_count: number;
}> => {
  const queryParams = buildQueryParams(params);

  const data = await actionHandler(
    `compliance/compliance-report-versions${queryParams}`,
    "GET",
    "",
  );

  if (!data || data.error) {
    throw new Error(`Failed to fetch compliance summaries: ${data.error}`);
  }

  return {
    rows: data.items,
    row_count: data.count || 0,
  };
};
