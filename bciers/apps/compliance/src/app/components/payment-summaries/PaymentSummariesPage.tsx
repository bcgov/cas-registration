import { DataGridSearchParams } from "@/compliance/src/app/types";
import { getPaymentSummariesPageData } from "@/compliance/src/app/utils/getPaymentSummariesPageData";
import PaymentSummariesDataGrid from "@/compliance/src/app/components/payment-summaries/PaymentSummariesDataGrid";

export default async function PaymentSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await getPaymentSummariesPageData(searchParams);

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <PaymentSummariesDataGrid initialData={initialData} />
      </div>
    </div>
  );
}
