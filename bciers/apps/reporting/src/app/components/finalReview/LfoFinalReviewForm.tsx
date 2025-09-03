"use client";

import FacilityReportSection from "@reporting/src/app/components/shared/FacilityReportSection";
import { getLfoFinalReviewData } from "@reporting/src/app/utils/getLfoFinalReviewData";
import React, { useEffect, useState } from "react";
import { ReportData } from "@reporting/src/app/components/finalReview/reportTypes";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { Box, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

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
  const taskListElements: TaskListElement[] = [
    {
      type: "Link",
      text: "Back to final review",
      link: `reporting/reports/${version_id}/final-review`,
      title: "Back to final review",
    },
  ];

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
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id, facilityId]);

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
              router.push("/reports/" + version_id + "/final-review");
            }}
          >
            Back
          </Button>
        </Box>
      </div>
    </div>
  );
}
