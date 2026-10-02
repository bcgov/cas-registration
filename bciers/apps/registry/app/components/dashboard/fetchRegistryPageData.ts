import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import type { DashboardSearchParams } from "./types";

export interface RegistryPageData<Row> {
  rows: Row[];
  row_count: number;
}

export type RegistryResource = "accounts" | "projects" | "transfers" | "units" | "issuances";

const defaultSort: Record<RegistryResource, { field: string; order: string }> = {
  accounts: { field: "name", order: "asc" },
  projects: { field: "name", order: "asc" },
  transfers: { field: "initiated_datetime", order: "desc" },
  units: { field: "vintage", order: "desc" },
  issuances: { field: "account_name", order: "asc" }
};

export default async function fetchRegistryPageData<Row>(
  resource: RegistryResource,
  searchParams: DashboardSearchParams,
): Promise<RegistryPageData<Row>> {
  const defaults = defaultSort[resource];
  const pageData = await actionHandler(
    `registry/${resource}${buildQueryParams({
      ...searchParams,
      sort_field: searchParams.sort_field || defaults.field,
      sort_order: searchParams.sort_order || defaults.order,
    })}`,
    "GET",
    "",
  );

  return {
    rows: pageData?.items ?? [],
    row_count: pageData?.count ?? 0,
  };
}
