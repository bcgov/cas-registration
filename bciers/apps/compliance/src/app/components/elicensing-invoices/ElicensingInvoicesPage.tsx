import { DataGridSearchParams } from "@/compliance/src/app/types";
import { getElicensingInvoices } from "@/compliance/src/app/utils/getElicensingInvoices";
import ElicensingInvoicesDataGrid from "./ElicensingInvoicesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

export default async function ElicensingInvoicesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const role = await getSessionRole();
  const isInternalUser = role.includes("cas_");
  const initialData = await getElicensingInvoices(searchParams);
  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <ElicensingInvoicesDataGrid
          initialData={initialData}
          isInternalUser={isInternalUser}
        />
      </div>
    </div>
  );
}
