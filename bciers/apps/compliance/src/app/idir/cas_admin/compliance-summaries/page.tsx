import defaultPageFactory from "@bciers/components/nextPageFactory/defaultPageFactory";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import ComplianceSummariesPage from "../../../components/compliance-summaries/ComplianceSummariesPage";

function CasAdminComplianceSummariesPage({
  searchParams,
}: {
  readonly searchParams: {
    readonly [key: string]: string | string[] | undefined;
  };
}) {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<Loading />}>
        <ComplianceSummariesPage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export default defaultPageFactory(CasAdminComplianceSummariesPage);
