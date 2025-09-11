import { DataGridSearchParams } from "@/compliance/src/app/types";
import PaymentSummariesDataGrid from "@/compliance/src/app/components/payment-summaries/PaymentSummariesDataGrid";
import { getElicensingInvoices } from "../../utils/getElicensingInvoices";
import ElicensingInvoicesDataGrid from "./ElicensingInvoicesDataGrid";

export default async function PaymentSummariesPage({
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
