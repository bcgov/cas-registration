import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createReport } from "@reporting/src/app/utils/createReport";
import { createReportVersion } from "@reporting/src/app/utils/createReportVersion";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Button from "@mui/material/Button";
import {
  BC_GOV_LINKS_COLOR,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
} from "@bciers/styles";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

interface ActionCellProps extends GridRenderCellParams {
  isReportingOpen: boolean;
}

const ActionCell: React.FC<ActionCellProps> = ({ row, isReportingOpen }) => {
  const reportId = row?.report_id;
  const [reportVersionId, setReportVersionId] = React.useState<
    string | undefined
  >(row?.report_version_id);
  const reportStatus = row?.report_status;
  const router = useRouter();
  const operationId = row.operation_id;
  const [responseError, setResponseError] = React.useState<string | null>(null);
  const [hasClicked, setHasClicked] = React.useState<boolean>(false);

  // Create a new report
  const handleStartReport = async (reportingYear: number): Promise<string> => {
    const response = await createReport(operationId, reportingYear);
    if (response?.error)
      setResponseError(
        `We couldn't create a report for operation ID '${operationId}' and reporting year '${reportingYear}': ${response?.error}.`,
      );
    return response;
  };

  if (responseError) {
    throw new Error(responseError);
  }

  // Create a new report version
  const handleNewDraftVersion = async (): Promise<string> => {
    const response = await createReportVersion(operationId, reportId);
    if (response?.error) {
      setResponseError(
        `We couldn't create a draft report version for report ID '${reportId}': ${response?.error}.`,
      );
    }
    return response;
  };

  const handleStartClick = async () => {
    if (reportId) {
      // create a new report version
      const newReportVersionId = await handleNewDraftVersion();
      setReportVersionId(newReportVersionId);
    } else {
      // create a new report
      const reportingYearObj = await getReportingYear();
      const newReportVersionId = await handleStartReport(
        reportingYearObj.reporting_year,
      );
      setReportVersionId(newReportVersionId);
    }
    if (typeof reportVersionId === "number")
      router.push(`${reportVersionId}/review-operation-information`);
  };

  // Show "Available Soon" for all actions if reporting is not open
  if (!isReportingOpen) {
    return (
      <div
        style={{
          whiteSpace: "normal",
          fontSize: "16px",
          color: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
        }}
      >
        Available Soon
      </div>
    );
  }

  let buttonText = "Start";
  let buttonAction: () => Promise<void> = async () => handleStartClick();
  const buttonDisabled = hasClicked;

  if (reportVersionId) {
    if (
      reportStatus === ReportOperationStatus.DRAFT ||
      reportStatus === ReportOperationStatus.DRAFT_SUPPLEMENTARY
    ) {
      buttonText = "Continue";
      buttonAction = async () =>
        router.push(`${reportVersionId}/review-operation-information`);
    } else if (
      reportStatus === ReportOperationStatus.SUBMITTED ||
      reportStatus === ReportOperationStatus.SUBMITTED_SUPPLEMENTARY
    ) {
      buttonText = "View Details";
      buttonAction = async () => router.push(`${reportVersionId}/submitted`);
    }
  }

  return (
    <Button
      sx={{
        width: 120,
        height: 40,
        borderRadius: "5px",
        border: `1px solid ${BC_GOV_LINKS_COLOR}`,
        cursor: buttonDisabled ? "not-allowed" : "pointer",
      }}
      color="primary"
      disabled={buttonDisabled}
      onClick={async () => {
        setHasClicked(true);
        await buttonAction();
        setHasClicked(false);
      }}
    >
      {buttonText}
    </Button>
  );
};

export default ActionCell;
