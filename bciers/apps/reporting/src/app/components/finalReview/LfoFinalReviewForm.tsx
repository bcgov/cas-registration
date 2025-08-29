"use client";
import FacilityReportSection from "@reporting/src/app/components/shared/FacilityReportSection";
import { getLfoFinalReviewData } from "@reporting/src/app/utils/getLfoFinalReviewData";
import { useEffect, useState } from "react";
import { ReportData } from "@reporting/src/app/components/finalReview/reportTypes";
import { useSearchParams } from "next/navigation";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";

export default function FacilityReportFinalReviewPage({
  version_id,
}: {
  version_id: number;
}) {
  const [data, setData] = useState<ReportData | null>(null);
  const browserSearchParams = useSearchParams();
  const facilityId = browserSearchParams.get("facility_id");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!facilityId) {
        setLoading(false);
        setData(null);
        return;
      }
      const finalReviewData = await getLfoFinalReviewData(
        version_id,
        facilityId as string,
      );
      console.log("Final Review Data:", finalReviewData);
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id, facilityId]);
  console.log("Rendering with data:", data);

  return !loading && data ? (
    <>
      <FacilityReportSection facilityData={data} expandable={false} />
      <Box display="flex" justifyContent="flex-start" mt={3}>
        <Button
          variant="outlined"
          onClick={() => {
            router.push("/reports/" + version_id + "/final-review");
          }}
        >
          Back
        </Button>
      </Box>
    </>
  ) : (
    <Loading />
  );
}
