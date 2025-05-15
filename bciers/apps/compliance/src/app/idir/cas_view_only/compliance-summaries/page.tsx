import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import ComplianceSummariesPage from "../../../components/compliance-summaries/ComplianceSummariesPage";

export default function CasViewOnlyComplianceSummariesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-bc-primary-blue text-2xl mb-4">
        Compliance Summaries
      </h1>
      <Suspense fallback={<Loading />}>
        <ComplianceSummariesPage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
