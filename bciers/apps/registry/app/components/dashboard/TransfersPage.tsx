import SchemaDataGrid from "./SchemaDataGrid";
import fetchRegistryPageData from "./fetchRegistryPageData";
import type { DashboardSearchParams } from "./types";
import { transferSchema } from "@/registry/data/jsonSchema/transfer";

interface TransferRow extends Record<string, unknown> {
  id: number;
}

async function getTransfers(searchParams: DashboardSearchParams) {
  return fetchRegistryPageData<TransferRow>("transfers", {
    ...searchParams,
    project: searchParams.project_name,
    vintage: searchParams.serial_number,
    sort_field: searchParams.sort_field ?? "initiated_datetime",
    sort_order: searchParams.sort_order ?? "desc",
  });
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const initialData = await getTransfers(searchParams);

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-xl font-semibold">Transfers</h3>
      <SchemaDataGrid
        schema={transferSchema}
        initialData={initialData}
        resource="transfers"
      />
    </div>
  );
}