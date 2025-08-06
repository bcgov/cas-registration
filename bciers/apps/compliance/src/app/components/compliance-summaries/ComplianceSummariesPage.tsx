import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import {
  ComplianceSummaryStatus,
  FrontEndRoles,
  PenaltyStatus,
} from "@bciers/utils/src/enums";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const currentDate = new Date(); // Current date
  const currentDatePST = new Date(
    currentDate.toLocaleString("en-US", { timeZone: "America/Vancouver" }),
  );
  const dueDate = new Date(reportingYear + 1, 10, 30, 23, 59, 59); // November 30 of the reporting year + 1
  const dueDatePST = new Date(
    dueDate.toLocaleString("en-US", { timeZone: "America/Vancouver" }),
  );

  const isAllowedCas = [
    FrontEndRoles.CAS_DIRECTOR,
    FrontEndRoles.CAS_ANALYST,
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.CAS_VIEW_ONLY,
  ].includes(frontEndRole);
  const isAllowedIndustryUser = [
    FrontEndRoles.INDUSTRY_USER,
    FrontEndRoles.INDUSTRY_USER_ADMIN,
  ].includes(frontEndRole);
  const obligationsNotMet = initialData.rows.some(
    (row) =>
      row.obligation_id &&
      row.status === ComplianceSummaryStatus.OBLIGATION_NOT_MET,
  );
  const penaltyExists = initialData.rows.some(
    (row) =>
      row.penalty_status && row.penalty_status === PenaltyStatus.ACCRUING,
  );

  return (
    <>
      <div className="mb-5">
        <div className="mb-2">
          {isAllowedIndustryUser && obligationsNotMet && (
            <AlertNote>
              Your compliance obligation for the {reportingYear} reporting year{" "}
              {currentDatePST > dueDatePST ? "was" : "is"}{" "}
              <strong>due on November 30, {reportingYear + 1}</strong>. Please
              pay five business days in advance to account for the processing
              time.
            </AlertNote>
          )}
        </div>
        {isAllowedIndustryUser &&
          currentDatePST > dueDatePST &&
          obligationsNotMet &&
          penaltyExists && (
            <AlertNote>
              An automatic overdue penalty has been incurred and{" "}
              <strong>accrues at 0.38% daily</strong> since the compliance
              obligation was not paid by its due date. You may pay the penalty
              after the compliance obligation is paid.
            </AlertNote>
          )}
      </div>

      <ComplianceSummariesDataGrid
        initialData={initialData}
        isAllowedCas={isAllowedCas}
      />
    </>
  );
}
