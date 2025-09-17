import { DataGridSearchParams } from "@/compliance/src/app/types";
import { getElicensingInvoices } from "@/compliance/src/app/utils/getElicensingInvoices";
import ElicensingInvoicesDataGrid from "./ElicensingInvoicesDataGrid";

export default async function ElicensingInvoicesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await getElicensingInvoices(searchParams);
  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <ElicensingInvoicesDataGrid initialData={initialData} />
      </div>
    </div>
  );
}
