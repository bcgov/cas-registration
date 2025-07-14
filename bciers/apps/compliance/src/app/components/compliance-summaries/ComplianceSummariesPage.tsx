import { DataGridSearchParams } from "@/compliance/src/app/types";
import { fetchComplianceSummariesPageData } from "@/compliance/src/app/utils/fetchComplianceSummariesPageData";
import ComplianceSummariesDataGrid from "@/compliance/src/app/components/compliance-summaries/ComplianceSummariesDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import AlertNote from "@bciers/components/form/components/AlertNote";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { FrontEndRoles } from "@bciers/utils/src/enums";

export default async function ComplianceSummariesPage({
  searchParams,
}: Readonly<{
  searchParams: DataGridSearchParams;
}>) {
  const { reporting_year: reportingYear } = await getReportingYear();
  const initialData = await fetchComplianceSummariesPageData(searchParams);
  const frontEndRole = await getSessionRole();
  const isAllowedCas = [
    FrontEndRoles.CAS_DIRECTOR,
    FrontEndRoles.CAS_ANALYST,
    FrontEndRoles.CAS_ADMIN,
    FrontEndRoles.CAS_VIEW_ONLY,
  ].includes(frontEndRole);
  return (
    <>
      <div className="mb-5">
        <div className="mb-2">
          <AlertNote>
            Your compliance obligation for the {reportingYear} reporting year is{" "}
            <strong>due on November 30, {reportingYear + 1}</strong>. Please pay
            five business days in advance to account for the processing time.
          </AlertNote>
        </div>
        <AlertNote>
          An automatic overdue penalty has been incurred and{" "}
          <strong>accrues at 0.38% daily</strong> since the compliance
          obligation was not paid by its due date. You may pay the penalty after
          the compliance obligation is paid.
        </AlertNote>
      </div>

      <ComplianceSummariesDataGrid
        initialData={initialData}
        isAllowedCas={isAllowedCas}
      />
    </>
  );
}
