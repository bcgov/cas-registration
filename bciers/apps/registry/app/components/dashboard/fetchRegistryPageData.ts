import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import type { DashboardSearchParams } from "./types";

export interface RegistryPageData<Row> {
  rows: Row[];
  row_count: number;
}

export type RegistryResource = "accounts" | "projects" | "transfers";

export default async function fetchRegistryPageData<Row>(
  resource: RegistryResource,
  searchParams: DashboardSearchParams,
): Promise<RegistryPageData<Row>> {
  const pageData = await actionHandler(
    `registry/${resource}${buildQueryParams(searchParams)}`,
    "GET",
    "",
  );

  return {
    rows: pageData?.items ?? [],
    row_count: pageData?.count ?? 0,
  };
}