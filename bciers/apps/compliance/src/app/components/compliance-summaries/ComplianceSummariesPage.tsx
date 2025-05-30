import { ComplianceSummariesSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import Loading from "@bciers/components/loading/SkeletonForm";
import { Suspense } from "react";
import AlertNote from "@bciers/components/form/components/AlertNote";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: ComplianceSummariesSearchParams;
}>) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <div className="mb-2">
          <AlertNote>
            Your compliance obligation for the 2024 reporting year is{" "}
            <strong>due on November 30, 2025</strong>. Please pay five business
            days in advance to account for the processing time.
          </AlertNote>
        </div>
        <AlertNote>
          An automatic overdue penalty has been incurred and{" "}
          <strong>accrues at 0.38% daily</strong> since the compliance
          obligation was not paid by its due date. You may pay the penalty after
          the compliance obligation is paid.
        </AlertNote>
      </div>
      <Suspense fallback={<Loading />}>
        <ComplianceSummariesDataGrid initialData={initialData} />
      </Suspense>
    </div>
  );
}
