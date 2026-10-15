import { GridRenderCellParams } from "@mui/x-data-grid";
import * as React from "react";
import { useTransition } from "react";
import { createReport } from "@reporting/src/app/utils/createReport";
import { createReportVersion } from "@reporting/src/app/utils/createReportVersion";
import { getReportingYear } from "@bciers/actions/api";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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
  const operationId = row.operation_id;

  // React Transition hook to manage loading state & catch errors in Error Boundaries
  const [pending, startTransition] = useTransition();

  // Create a new report
  const handleStartReport = async (reportingYear: number): Promise<string> => {
    const response = await createReport(operationId, reportingYear);
    if (response?.error) {
      throw new Error(
        `We couldn't create a report for operation ID '${operationId}' and reporting year '${reportingYear}': ${response?.error}.`,
      );
    }
    return response;
  };

  // Create a new report version
  const handleNewDraftVersion = async (): Promise<string> => {
    const response = await createReportVersion(operationId, reportId);
    if (response?.error) {
      throw new Error(
        `We couldn't create a draft report version for report ID '${reportId}': ${response?.error}.`,
      );
    }
    return response;
  };

  const handleStartClick = () => {
    // Wrapping the async creation sequence inside startTransition ensures
    // thrown errors propagate to the Next.js Error Boundary/Middleware layer
    startTransition(async () => {
      let newReportVersionId: string | number;
      if (reportId) {
        // create a new report version
        newReportVersionId = await handleNewDraftVersion();
      } else {
        // create a new report
        const reportingYearObj = await getReportingYear();
        newReportVersionId = await handleStartReport(
          reportingYearObj.reporting_year,
        );
      }

      if (newReportVersionId) {
        setReportVersionId(newReportVersionId);
        // Perform a hard browser navigation (instead of router.push) so Next.js Middleware
        // error responses and redirects trigger full-page error boundary
        window.location.href = `${newReportVersionId}/review-operation-information`;
      }
    });
  };

  // Show "Available Soon" for all actions if reporting is not open or row is restricted
  if (!isReportingOpen || row.restricted) {
    return (
      <div className="whitespace-normal text-[16px] text-bc-primary-blue">
        Available Soon
      </div>
    );
  }

  let buttonText = "Start";
  let buttonAction: () => void = () => handleStartClick();

  if (reportVersionId) {
    if (
      reportStatus === ReportOperationStatus.DRAFT ||
      reportStatus === ReportOperationStatus.DRAFT_SUPPLEMENTARY
    ) {
      buttonText = "Continue";
      buttonAction = () =>
        startTransition(() => {
          window.location.href = `${reportVersionId}/review-operation-information`;
        });
    } else if (
      reportStatus === ReportOperationStatus.SUBMITTED ||
      reportStatus === ReportOperationStatus.SUBMITTED_SUPPLEMENTARY
    ) {
      buttonText = "View Details";
      buttonAction = () =>
        startTransition(() => {
          window.location.href = `${reportVersionId}/submitted`;
        });
    }
  }

  return (
    <Button
      className={`w-30 h-10 rounded-[5px] border border-solid border-bc-link-blue ${
        pending ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      color="primary"
      disabled={pending}
      onClick={buttonAction}
    >
      {pending ? <CircularProgress size={20} /> : buttonText}
    </Button>
  );
};

export default ActionCell;
