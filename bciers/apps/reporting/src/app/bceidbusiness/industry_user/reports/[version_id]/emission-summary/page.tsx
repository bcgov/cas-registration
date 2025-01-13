import { Suspense } from "react";
import OperationEmissionSummaryData from "@reporting/src/app/components/additionalInformation/operationEmissionSummary/OperationEmissionSummaryData";

export default async function Page(router: any) {
  return (
    <>
      <Suspense fallback="Loading Schema">
        <OperationEmissionSummaryData
          versionId={parseInt(router.params?.version_id)}
        />
      </Suspense>
    </>
  );
}
