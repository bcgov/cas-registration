import SchemaDataGrid from "./SchemaDataGrid";
import fetchRegistryPageData from "./fetchRegistryPageData";
import type { DashboardSearchParams } from "./types";
import { accountSchema } from "@/registry/data/jsonSchema/account";

interface AccountRow extends Record<string, unknown> {
  id: number;
}

async function getAccounts(searchParams: DashboardSearchParams) {
  return fetchRegistryPageData<AccountRow>("accounts", {
    ...searchParams,
    name: searchParams.account_name,
    account_classification: searchParams.classification,
    sort_field: searchParams.sort_field ?? "name",
    sort_order: searchParams.sort_order ?? "asc",
  });
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const initialData = await getAccounts(searchParams);

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-xl font-semibold">Accounts</h3>
      <SchemaDataGrid
        schema={accountSchema}
        initialData={initialData}
        resource="accounts"
      />
    </div>
  );
}