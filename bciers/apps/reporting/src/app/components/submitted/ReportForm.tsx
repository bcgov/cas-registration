"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

import { ReportData } from "../finalReview/reportTypes";
import { FinalReviewReportSections } from "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections";
import {
  ReportingFlow,
  ReportingOrigin,
} from "@reporting/src/app/components/taskList/types";
import { ReportDownloadPdfButton } from "../finalReview/templates/ReportDownloadPdfButton";
import SubmittedAttachmentsSection from "./SubmittedAttachmentsSection";
import SubmittedVerificationStatementSection from "./SubmittedVerificationStatementSection";
import { UploadedAttachment } from "@reporting/src/app/components/attachments/types";

interface Props {
  version_id: number;
  flow: ReportingFlow;
  origin: ReportingOrigin.Submitted | ReportingOrigin.AnnualReport;
  data: ReportData;
  attachments?: UploadedAttachment[];
}

const VERIFICATION_STATEMENT_FILE_PATH =
  "/Users/awilliam/Documents/cas-registration/bc_obps/report_attachments_2026_BC-OBPS_Verification_Report__Statement_ISH_Energy_2025RY.pdf";

const ReportForm: React.FC<Props> = ({
  version_id,
  flow,
  origin,
  data,
  attachments,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <ReportDownloadPdfButton
        variant={
          data.report_operation.operation_type === "Linear Facilities Operation"
            ? "LFO"
            : "SFO"
        }
      />
      <FinalReviewReportSections
        version_id={version_id}
        data={data}
        origin={origin}
        flow={flow}
      />
      {origin === ReportingOrigin.Submitted && (
        <SubmittedAttachmentsSection
          attachments={attachments ?? []}
          version_id={version_id}
        />
      )}
      {origin === ReportingOrigin.AnnualReport && (
        <SubmittedVerificationStatementSection
          verificationStatementFilePath={VERIFICATION_STATEMENT_FILE_PATH}
        />
      )}
      <Button
        variant="outlined"
        onClick={() => router.push(`/reporting/reports/current-reports`)}
        sx={{ width: "fit-content" }}
        className="print:hidden"
      >
        Back to All Reports
      </Button>
    </div>
  );
};

export default ReportForm;
