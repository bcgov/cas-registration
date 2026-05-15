"use client";

import FacilityReportSection from "@reporting/src/app/components/shared/FacilityReportSection";
import { FacilityReport } from "@reporting/src/app/components/finalReview/reportTypes";
import { Box, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReportDownloadPdfButton } from "./templates/ReportDownloadPdfButton";

interface Props {
  data: FacilityReport;
  backUrl: string;
}

export default function FacilityReportFinalReviewContent({
  data,
  backUrl,
}: Props) {
  const router = useRouter();

  // Controls the PDF filename for both the Save as PDF button and Cmd/Ctrl+P.
  useEffect(() => {
    if (!data.facility_name) return;
    const originalTitle = document.title;
    document.title = `CAS OBPS_Reporting_${data.facility_name}`;
    return () => {
      document.title = originalTitle;
    };
  }, [data.facility_name]);

  const taskListElements: TaskListElement[] = [
    {
      type: "Link",
      text: "Back to previous page",
      link: backUrl,
      title: "Back to previous page",
    },
  ];

  return (
    <div className="w-full flex">
      <div className="hidden md:block print:hidden">
        <ReportingTaskList elements={taskListElements} />
      </div>
      <div className="w-full">
        <ReportDownloadPdfButton />
        <FacilityReportSection facilityData={data} />
        <Box
          display="flex"
          justifyContent="flex-start"
          mt={3}
          className="print:hidden"
        >
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
