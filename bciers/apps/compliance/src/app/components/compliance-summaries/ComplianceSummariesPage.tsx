import { ComplianceReportVersionGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { getReportingYear, getCompliancePeriod } from "@bciers/actions/api";
import {
  ComplianceSummaryStatus,
  FrontEndRoles,
  PenaltyStatus,
} from "@bciers/utils/src/enums";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: ComplianceReportVersionGridSearchParams;
}>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const currentDate = new Date(); // Current date
  const currentDatePST = new Date(
    currentDate.toLocaleString("en-US", { timeZone: "America/Vancouver" }),
  );

  // Due date alert message info
  const compliancePeriod = await getCompliancePeriod(reportingYear);
  const [year, month, date] = compliancePeriod.compliance_deadline
    .split("-")
    .map(Number);
  const dueDate = new Date(year, month - 1, date); // Date converts to local time by default hence the split
  const dueYear = dueDate.getFullYear();
  const dueMonth = new Intl.DateTimeFormat("en-CA", { month: "long" }).format(
    dueDate,
  );
  const dueDay = dueDate.getDate();

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
              Your compliance obligation for the {reportingYear} compliance
              period {currentDatePST > dueDate ? "was" : "is"}{" "}
              <strong>
                due on {dueMonth} {dueDay}, {dueYear}
              </strong>
              . Plan to make your payment at least five business days before the
              compliance obligation deadline to allow for payment processing.
            </AlertNote>
          )}
        </div>
        {isAllowedIndustryUser &&
          currentDatePST > dueDate &&
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
