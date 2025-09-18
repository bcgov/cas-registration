"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

import { ReportData } from "../finalReview/reportTypes";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
import { FinalReviewReportSections } from "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

interface Props {
  version_id: number;
  flow: ReportingFlow;
  origin: "annual-report" | "submitted"; // restrict origin
}

const ReportForm: React.FC<Props> = ({ version_id, flow, origin }) => {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const finalReviewData = await getFinalReviewData(version_id);
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id]);

  return (
    <div className="flex flex-col gap-6">
      {!loading && data ? (
        <>
          <FinalReviewReportSections
            version_id={version_id}
            data={data}
            origin={origin}
            flow={flow}
          />
          <Button
            variant="outlined"
            onClick={() => router.push(`/reporting/reports/current-reports`)}
            sx={{ width: "fit-content" }}
          >
            Back to All Reports
          </Button>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ReportForm;
