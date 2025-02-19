import { ComplianceSummary } from "./types";
import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export const fetchComplianceSummariesPageData = async (params: {
  [key: string]: any;
}): Promise<{
  items: ComplianceSummary[];
  count: number;
}> => {
  const queryParams = buildQueryParams(params);

  const data = await actionHandler(
    `compliance/summaries${queryParams}`,
    "GET",
    "",
  );

  return {
    items: data?.items || [],
    count: data?.count || 0,
  };
};
