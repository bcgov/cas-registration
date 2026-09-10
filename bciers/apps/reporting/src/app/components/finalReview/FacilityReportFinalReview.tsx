import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";
import { ReportingOrigin } from "@reporting/src/app/components/taskList/types";
import FacilityReportFinalReviewContent from "./FacilityReportFinalReviewContent";
import { pickupPassengers } from "../../utils/pickupPassengers";
import CommentPacificRailway from "../comments/commentPacificRailway";

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
  const threads = await pickupPassengers(version_id, facility_id);

  return (
    <>
      <FacilityReportFinalReviewContent data={data} backUrl={backUrl} />
      <CommentPacificRailway
        threads={threads}
        version_id={version_id}
        facility_id={facility_id}
      />
    </>
  );
}
