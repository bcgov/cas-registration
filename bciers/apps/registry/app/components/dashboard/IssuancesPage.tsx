import SchemaDataGrid from "./SchemaDataGrid";
import fetchRegistryPageData from "./fetchRegistryPageData";
import type { DashboardSearchParams } from "./types";
import { issuanceSchema } from "@/registry/data/jsonSchema/issuance";

interface IssuanceRow extends Record<string, unknown> {
  id: string;
}

async function getIssuances(searchParams: DashboardSearchParams) {
  return fetchRegistryPageData<IssuanceRow>("issuances", {
    ...searchParams,
    sort_field: searchParams.sort_field ?? "account_name",
    sort_order: searchParams.sort_order ?? "asc",
  });
}

export default async function IssuancesPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const initialData = await getIssuances(searchParams);

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-xl font-semibold">Issuances</h3>
      <SchemaDataGrid
        schema={issuanceSchema}
        initialData={initialData}
        resource="issuances"
      />
    </div>
  )
}