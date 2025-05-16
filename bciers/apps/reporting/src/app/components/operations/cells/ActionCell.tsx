import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createReport } from "@reporting/src/app/utils/createReport";
import { createReportVersion } from "@reporting/src/app/utils/createReportVersion";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Button from "@mui/material/Button";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const ActionCell = (params: GridRenderCellParams) => {
  const reportId = params?.row?.report_id;
  let reportVersionId = params?.row?.report_version_id;
  const reportStatus = params?.row?.report_status;
  const router = useRouter();
  const operationId = params.row.id;
  const [responseError, setResponseError] = React.useState<string | null>(null);
  const [hasClicked, setHasClicked] = React.useState<boolean>(false);

  // Create a new report
  const handleStartReport = async (reportingYear: number): Promise<string> => {
    try {
      const response = await createReport(operationId, reportingYear);
      if (response?.error)
        setResponseError(
          `We couldn't create a report for operation ID '${operationId}' and reporting year '${reportingYear}': ${response?.error}.`,
        );
      return response;
    } catch (error) {
      throw error;
    }
  };

  if (responseError) {
    throw new Error(responseError);
  }

  // Create a new report version
  const handleNewDraftVersion = async (): Promise<string> => {
    try {
      const response = await createReportVersion(operationId, reportId);
      if (response?.error) {
        setResponseError(
          `We couldn't create a draft report version for report ID '${reportId}': ${response?.error}.`,
        );
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleStartClick = async () => {
    if (reportId) {
      // create a new report version
      reportVersionId = await handleNewDraftVersion();
    } else {
      // create a new report
      const reportingYearObj = await getReportingYear();
      reportVersionId = await handleStartReport(
        reportingYearObj.reporting_year,
      );
    }
    if (typeof reportVersionId === "number")
      router.push(`reports/${reportVersionId}/review-operation-information`);
  };

  let buttonText = "Start";
  let buttonAction: () => Promise<void> = async () => handleStartClick();
  let buttonDisabled = hasClicked;

  if (reportVersionId) {
    if (reportStatus === ReportOperationStatus.DRAFT) {
      buttonText = "Continue";
      buttonAction = async () =>
        router.push(`reports/${reportVersionId}/review-operation-information`);
    } else if (reportStatus === ReportOperationStatus.SUBMITTED) {
      buttonText = "View Details";
      buttonAction = async () =>
        router.push(`reports/${reportVersionId}/submitted`);
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
