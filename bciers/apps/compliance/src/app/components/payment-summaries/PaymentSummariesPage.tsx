import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import PaymentSummariesDataGrid from "@/compliance/src/app/components/payment-summaries/PaymentSummariesDataGrid";
import Loading from "@bciers/components/loading/SkeletonForm";
import { Suspense } from "react";

export default async function PaymentSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);

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
