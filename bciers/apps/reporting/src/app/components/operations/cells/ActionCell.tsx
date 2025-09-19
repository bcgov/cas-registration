import { GridRenderCellParams } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createReport } from "@reporting/src/app/utils/createReport";
import { createReportVersion } from "@reporting/src/app/utils/createReportVersion";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import Button from "@mui/material/Button";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import SimpleModal from "@bciers/components/modal/SimpleModal";

const ActionCell = (params: GridRenderCellParams) => {
  const reportId = params?.row?.report_id;
  let reportVersionId = params?.row?.report_version_id;
  const reportStatus = params?.row?.report_status;
  const router = useRouter();
  const operationId = params.row.operation_id;
  const [responseError, setResponseError] = React.useState<string | null>(null);
  const operationName = params?.row.operation_name;
  const [hasClicked, setHasClicked] = React.useState<boolean>(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalErrorMessage, setModalErrorMessage] = React.useState("");

  // Create a new report
  const handleStartReport = async (
    reportingYear: number,
  ): Promise<string | undefined> => {
    try {
      const response = await createReport(operationId, reportingYear);
      if (response?.error) {
        setModalErrorMessage(
          `We couldn't create a report for operation '${operationName}' and reporting year ${reportingYear}: ${response?.error}`,
        );
        setModalOpen(true);
        return;
      }
      return response;
    } catch (error) {
      setModalErrorMessage(
        "An unexpected error occurred while creating the report.",
      );
      setModalOpen(true);
    }
  };

  // Create a new report version
  const handleNewDraftVersion = async (): Promise<string | undefined> => {
    try {
      const response = await createReportVersion(operationId, reportId);
      if (response?.error) {
        setModalErrorMessage(
          `We couldn't create a draft report version for report ID '${reportId}': ${response?.error}.`,
        );
        setModalOpen(true);
        return;
      }
      return response;
    } catch (error) {
      setModalErrorMessage(
        "An unexpected error occurred while creating a new draft version of the report.",
      );
      setModalOpen(true);
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
      router.push(`${reportVersionId}/review-operation-information`);
  };

  let buttonText = "Start";
  let buttonAction: () => Promise<void> = async () => handleStartClick();
  let buttonDisabled = hasClicked;

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
    <>
      <SimpleModal
        open={modalOpen}
        title="Error Creating Report"
        onCancel={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        showConfirmButton={false}
      >
        {modalErrorMessage}
      </SimpleModal>
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
    </>
  );
};

export default ActionCell;
