import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createReport } from "@reporting/src/app/utils/createReport";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Button from "@mui/material/Button";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
import { ReportOperationStatus } from "@bciers/utils/src/enums";

const ReportHistoryActionCell = (params: GridRenderCellParams) => {
  console.log("params", params);
  const reportVersionId = params?.id;
  const reportStatus = params.value;
  const router = useRouter();
  const OperationId = params.row.id;
  const [responseError, setResponseError] = React.useState<string | null>(null);
  const [hasClicked, setHasClicked] = React.useState<boolean>(false);

  const handleStartReport = async (
    operationId: string,
    reportingYear: number,
  ): Promise<string> => {
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

  const handleStartClick = async () => {
    const reportingYearObj = await getReportingYear();
    const newReportId = await handleStartReport(
      OperationId,
      reportingYearObj.reporting_year,
    );
  };

  let buttonText = "";
  let buttonAction: () => Promise<void> = async () => handleStartClick();
  let buttonDisabled = hasClicked;

  if (reportVersionId) {
    if (reportStatus === ReportOperationStatus.DRAFT) {
      buttonText = "Continue";
      buttonAction = async () =>
        router.push(`/reports/${reportVersionId}/review-operation-information`);
      buttonDisabled = false;
    } else if (reportStatus === ReportOperationStatus.SUBMITTED) {
      buttonText = "View Details";
      buttonAction = async () =>
        router.push(`/reports/${reportVersionId}/review-operation-information`);
      buttonDisabled = false;
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
      }}
    >
      {buttonText}
    </Button>
  );
};

export default ReportHistoryActionCell;
