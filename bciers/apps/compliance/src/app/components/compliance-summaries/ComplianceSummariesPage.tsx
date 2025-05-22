import { ComplianceSummariesSearchParams } from "./types";
import { fetchComplianceSummariesPageData } from "./fetchComplianceSummariesPageData";
import { Alert } from "@mui/material";
import AlertIcon from "@bciers/components/icons/AlertIcon";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";

export default async function ComplianceSummariesPage({
  searchParams,
}: {
  searchParams: ComplianceSummariesSearchParams;
}) {
  const initialData = await fetchComplianceSummariesPageData(searchParams);

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <div className="mb-2">
          <Alert severity="info" icon={<AlertIcon />}>
            Your compliance obligation for the 2024 reporting year is{" "}
            <strong>due on November 30, 2025</strong>. Please pay five business
            days in advance to account for the processing time.
          </Alert>
        </div>
        <Alert severity="info" icon={<AlertIcon />}>
          An automatic overdue penalty has been incurred and{" "}
          <strong>accrues at 0.38% daily</strong> since the compliance
          obligation was not paid by its due date. You may pay the penalty after
          the compliance obligation is paid.
        </Alert>
      </div>
      <ComplianceSummariesDataGrid initialData={initialData} />;
    </div>
  );
}
