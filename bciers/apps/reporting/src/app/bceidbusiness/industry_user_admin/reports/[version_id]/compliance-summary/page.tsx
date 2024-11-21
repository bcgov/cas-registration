import { Suspense } from "react";
import ComplianceSummaryData from "@reporting/src/app/components/complianceSummary/ComplianceSummaryData";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback="Loading Schema">
        <ComplianceSummaryData
          versionId={parseInt(router.params?.version_id)}
        />
      </Suspense>
    </>
  );
}
