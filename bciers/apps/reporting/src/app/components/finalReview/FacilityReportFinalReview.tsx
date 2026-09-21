import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";
import { ReportingOrigin } from "@reporting/src/app/components/taskList/types";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import { flowHelpers } from "@reporting/src/app/components/taskList/flowHelpers";
import FacilityReportFinalReviewContent from "./FacilityReportFinalReviewContent";

export interface OriginSearchParams {
  origin?: ReportingOrigin;
}

export default async function FacilityReportFinalReview({
  version_id,
  facility_id,
  searchParams,
}: Readonly<{
  version_id: number;
  facility_id: string;
  searchParams?: OriginSearchParams;
}>) {
  const origin = searchParams?.origin;
  const backUrl = `/reporting/reports/${version_id}/${origin}#facility-grid`;

  const data = await getFacilityFinalReviewData(version_id, facility_id);
  const flow = await getFlowWithNewCases(version_id);
  const { isReportingOnly } = flowHelpers(flow);

  return (
    <FacilityReportFinalReviewContent
      data={data}
      backUrl={backUrl}
      showProductionData={!isReportingOnly}
    />
  );
}
