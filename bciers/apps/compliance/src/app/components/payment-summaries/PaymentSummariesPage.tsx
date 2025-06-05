import { DataGridSearchParams } from "@/compliance/src/app/types";
import { getPaymentSummariesPageData } from "@/compliance/src/app/utils/getPaymentSummariesPageData";
import PaymentSummariesDataGrid from "@/compliance/src/app/components/payment-summaries/PaymentSummariesDataGrid";
import Loading from "@bciers/components/loading/SkeletonForm";
import { Suspense } from "react";

export default async function PaymentSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await getPaymentSummariesPageData(searchParams);

  console.log(initialData);

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Suspense fallback={<Loading />}>
          <PaymentSummariesDataGrid initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}
