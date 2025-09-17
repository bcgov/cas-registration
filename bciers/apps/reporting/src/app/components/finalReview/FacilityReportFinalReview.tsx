"use client";

import FacilityReportSection from "@reporting/src/app/components/shared/FacilityReportSection";
import React, { useEffect, useState } from "react";
import { ReportData } from "@reporting/src/app/components/finalReview/reportTypes";
import { useRouter } from "next/navigation";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Box, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { getFacilityFinalReviewData } from "@reporting/src/app/utils/getFacilityFinalReviewData";

export default function FacilityReportFinalReview({
  version_id,
  facility_id,
  origin,
}: {
  version_id: number;
  facility_id: string;
  origin?: "final-review" | "submitted";
}) {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const backUrl = `/reporting/reports/${version_id}/${origin}#facility-grid`;

  const taskListElements: TaskListElement[] = [
    {
      type: "Link",
      text: "Back to previous page",
      link: `${backUrl}`,
      title: "Back to previous page",
    },
  ];

  useEffect(() => {
    async function fetchData() {
      if (!facility_id) {
        setLoading(false);
        setData(null);
        return;
      }
      const finalReviewData = await getFacilityFinalReviewData(
        version_id,
        facility_id,
      );
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id, facility_id]);

  if (loading || !data) return <Loading />;

  return (
    <div className="w-full flex">
      <div className="hidden md:block">
        <ReportingTaskList elements={taskListElements} />
      </div>
      <div className="w-full">
        <FacilityReportSection facilityData={data} expandable={false} />
        <Box display="flex" justifyContent="flex-start" mt={3}>
          <Button
            variant="outlined"
            onClick={() => {
              router.push(backUrl);
            }}
          >
            Back
          </Button>
        </Box>
      </div>
    </div>
  );
}
